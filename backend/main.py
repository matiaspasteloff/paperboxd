from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import or_
from jose import JWTError, jwt
from typing import Optional
import httpx, asyncio, time, os

from database import engine, Base, get_db
import models, schemas, auth

Base.metadata.create_all(bind=engine)

app = FastAPI(title="PaperBoxd API v3")

# ── CORS ──────────────────────────────────────────────────────────────────────
# Allow your Vercel domain + localhost for development.
# Add any custom domain here too.
ALLOWED_ORIGINS = [
    "https://paperboxd.vercel.app",
    "https://paperboxd.com",
    "https://www.paperboxd.com",
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
]

# Also allow any *.vercel.app preview deployments
class AllowVercelMiddleware:
    pass

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")
oauth2_optional = OAuth2PasswordBearer(tokenUrl="login", auto_error=False)

GOOGLE_BOOKS_API_KEY = os.getenv("GOOGLE_BOOKS_API_KEY")

# ── SIMPLE IN-MEMORY CACHE ────────────────────────────────────────────────────
_cache: dict = {}

def cache_get(key: str, ttl: int = 300):
    entry = _cache.get(key)
    if entry and (time.time() - entry[0]) < ttl:
        return entry[1]
    return None

def cache_set(key: str, data):
    _cache[key] = (time.time(), data)

def cache_invalidate(prefix: str):
    for k in list(_cache.keys()):
        if k.startswith(prefix):
            del _cache[k]


# ── AUTH HELPERS ──────────────────────────────────────────────────────────────

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    exc = HTTPException(status_code=401, detail="Token inválido o expirado", headers={"WWW-Authenticate": "Bearer"})
    try:
        payload = jwt.decode(token, auth.SECRET_KEY, algorithms=[auth.ALGORITHM])
        email = payload.get("sub")
        if not email: raise exc
    except JWTError:
        raise exc
    user = db.query(models.User).filter(models.User.email == email).first()
    if not user: raise exc
    return user


def get_optional_user(token: str = Depends(oauth2_optional), db: Session = Depends(get_db)):
    if not token: return None
    try:
        payload = jwt.decode(token, auth.SECRET_KEY, algorithms=[auth.ALGORITHM])
        email = payload.get("sub")
        if not email: return None
        return db.query(models.User).filter(models.User.email == email).first()
    except Exception:
        return None


# ── GOOGLE BOOKS HELPERS ──────────────────────────────────────────────────────

async def gb_search(query: str, max_results: int = 8) -> list[dict]:
    params = {
        "q": query,
        "maxResults": max_results,
        "printType": "books",
        "orderBy": "relevance"
    }
    if GOOGLE_BOOKS_API_KEY:
        params["key"] = GOOGLE_BOOKS_API_KEY

    async with httpx.AsyncClient(timeout=6) as c:
        try:
            r = await c.get(
                "https://www.googleapis.com/books/v1/volumes",
                params=params,
            )
            if r.status_code != 200:
                return []
            items = r.json().get("items", [])
        except Exception:
            return []

    result = []
    for item in items:
        info = item.get("volumeInfo", {})
        raw_cover = (info.get("imageLinks") or {}).get("thumbnail", "")
        cover = raw_cover.replace("http://", "https://").replace("zoom=1", "zoom=2") if raw_cover else None
        if not cover:
            continue
        pub_date = info.get("publishedDate", "")
        result.append({
            "key":                f"/works/{item['id']}",
            "google_books_id":    item["id"],
            "title":              info.get("title", ""),
            "author_name":        info.get("authors", []),
            "cover_url":          cover,
            "first_publish_year": int(pub_date[:4]) if pub_date and pub_date[:4].isdigit() else None,
            "description":        (info.get("description") or "")[:300],
            "categories":         info.get("categories", []),
            "page_count":         info.get("pageCount", 0),
            "average_rating":     info.get("averageRating"),
            "ratings_count":      info.get("ratingsCount", 0),
        })
    return result


MOOD_QUERIES = {
    "oscuro":      "dark literary fiction depression",
    "emotivo":     "emotional drama grief family",
    "relajante":   "cozy gentle feel-good fiction",
    "épico":       "epic adventure fantasy war",
    "misterioso":  "mystery thriller detective suspense",
    "filosófico":  "philosophy ethics meaning of life",
    "romántico":   "romance love relationship",
    "humorístico": "humor comedy satire fiction",
}

GENRE_QUERIES = {
    "ficción":          "literary fiction",
    "no ficción":       "nonfiction bestseller",
    "fantasía":         "subject:fantasy",
    "ciencia ficción":  "subject:science fiction",
    "romance":          "subject:romance",
    "thriller":         "thriller crime fiction",
    "historia":         "subject:history",
    "poesía":           "subject:poetry",
    "terror":           "subject:horror",
    "autoayuda":        "self help personal development",
    "ensayo":           "essays nonfiction",
    "clásicos":         "subject:classics",
}


# ── HEALTH CHECK ─────────────────────────────────────────────────────────────

@app.get("/")
def root():
    return {"status": "ok"}

@app.get("/health")
def health():
    """Lightweight ping to wake up Render's free tier."""
    return {"status": "ok"}


# ── AUTH ENDPOINTS ────────────────────────────────────────────────────────────

@app.post("/users/", response_model=schemas.UserResponse)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    if db.query(models.User).filter(models.User.email == user.email).first():
        raise HTTPException(400, "Email ya registrado")
    if db.query(models.User).filter(models.User.username == user.username).first():
        raise HTTPException(400, "Username ya en uso")
    new = models.User(username=user.username, email=user.email,
                      hashed_password=auth.get_password_hash(user.password))
    db.add(new); db.commit(); db.refresh(new)
    return new


@app.post("/login", response_model=schemas.Token)
def login(form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == form.username).first()
    if not user or not auth.verify_password(form.password, user.hashed_password):
        raise HTTPException(401, "Credenciales incorrectas")
    return {"access_token": auth.create_access_token({"sub": user.email}), "token_type": "bearer"}


@app.get("/me", response_model=schemas.UserResponse)
def get_me(current_user: models.User = Depends(get_current_user)):
    return current_user


@app.patch("/me", response_model=schemas.UserResponse)
def update_me(data: schemas.UserUpdate, db: Session = Depends(get_db),
              current_user: models.User = Depends(get_current_user)):
    for field, value in data.dict(exclude_none=True).items():
        setattr(current_user, field, value)
    db.commit(); db.refresh(current_user)
    cache_invalidate(f"recs_{current_user.id}")
    return current_user


# ── SOCIAL: PROFILES & FOLLOWERS ──────────────────────────────────────────────

@app.get("/users/search")
def search_users(q: str, db: Session = Depends(get_db)):
    users = db.query(models.User).filter(
        models.User.username.ilike(f"%{q}%")
    ).limit(20).all()
    return [{"id": u.id, "username": u.username, "avatar_color": u.avatar_color, "bio": u.bio, "reviews_count": len(u.reviews)} for u in users]


@app.get("/users/{username}", response_model=schemas.PublicProfile)
def get_profile(username: str, db: Session = Depends(get_db),
                current_user: models.User = Depends(get_optional_user)):
    user = db.query(models.User).filter(models.User.username == username).first()
    if not user: raise HTTPException(404, "Usuario no encontrado")

    followers_count = db.query(models.Follower).filter(models.Follower.following_id == user.id).count()
    following_count = db.query(models.Follower).filter(models.Follower.follower_id == user.id).count()
    reviews_count   = db.query(models.Review).filter(models.Review.user_id == user.id).count()
    is_following    = False
    if current_user:
        is_following = db.query(models.Follower).filter(
            models.Follower.follower_id == current_user.id,
            models.Follower.following_id == user.id
        ).first() is not None

    return schemas.PublicProfile(
        id=user.id, username=user.username, bio=user.bio or "",
        avatar_color=user.avatar_color or "#388bfd",
        favorite_genres=user.favorite_genres or "",
        favorite_moods=user.favorite_moods or "",
        location=user.location or "", website=user.website or "",
        joined_at=user.joined_at,
        followers_count=followers_count,
        following_count=following_count,
        reviews_count=reviews_count,
        is_following=is_following,
    )


@app.get("/users/{username}/reviews")
def get_user_reviews(username: str, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.username == username).first()
    if not user: raise HTTPException(404)
    reviews = db.query(models.Review).filter(models.Review.user_id == user.id)\
                .order_by(models.Review.id.desc()).all()
    return [{"id": r.id, "open_library_work_id": r.open_library_work_id, "rating": r.rating,
             "review_text": r.review_text, "mood_tags": r.mood_tags, "pace_tag": r.pace_tag,
             "genre": r.genre, "created_at": r.created_at.isoformat() if r.created_at else None} for r in reviews]


@app.post("/users/{username}/follow")
def toggle_follow(username: str, db: Session = Depends(get_db),
                  current_user: models.User = Depends(get_current_user)):
    target = db.query(models.User).filter(models.User.username == username).first()
    if not target: raise HTTPException(404)
    if target.id == current_user.id: raise HTTPException(400, "No podés seguirte a vos mismo")

    existing = db.query(models.Follower).filter(
        models.Follower.follower_id == current_user.id,
        models.Follower.following_id == target.id
    ).first()

    if existing:
        db.delete(existing); db.commit()
        return {"following": False}
    new = models.Follower(follower_id=current_user.id, following_id=target.id)
    db.add(new); db.commit()
    return {"following": True}


@app.get("/users/{username}/followers")
def get_followers(username: str, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.username == username).first()
    if not user: raise HTTPException(404)
    follows = db.query(models.Follower).filter(models.Follower.following_id == user.id).all()
    result = []
    for f in follows:
        u = db.query(models.User).filter(models.User.id == f.follower_id).first()
        if u: result.append({"id": u.id, "username": u.username, "avatar_color": u.avatar_color, "bio": u.bio})
    return result


@app.get("/users/{username}/following")
def get_following(username: str, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.username == username).first()
    if not user: raise HTTPException(404)
    follows = db.query(models.Follower).filter(models.Follower.follower_id == user.id).all()
    result = []
    for f in follows:
        u = db.query(models.User).filter(models.User.id == f.following_id).first()
        if u: result.append({"id": u.id, "username": u.username, "avatar_color": u.avatar_color, "bio": u.bio})
    return result


@app.get("/feed/")
def get_feed(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    following_ids = [f.following_id for f in db.query(models.Follower).filter(models.Follower.follower_id == current_user.id).all()]
    if not following_ids:
        return []
    reviews = db.query(models.Review).filter(
        models.Review.user_id.in_(following_ids)
    ).order_by(models.Review.id.desc()).limit(40).all()

    result = []
    for r in reviews:
        user = db.query(models.User).filter(models.User.id == r.user_id).first()
        result.append({
            "id": r.id, "username": user.username if user else "?",
            "avatar_color": user.avatar_color if user else "#388bfd",
            "open_library_work_id": r.open_library_work_id,
            "rating": r.rating, "review_text": r.review_text,
            "mood_tags": r.mood_tags, "genre": r.genre,
            "created_at": r.created_at.isoformat() if r.created_at else None,
        })
    return result


# ── REVIEWS ───────────────────────────────────────────────────────────────────

@app.get("/books/{work_id}/reviews")
def get_book_reviews(work_id: str, db: Session = Depends(get_db)):
    cache_key = f"book_reviews_{work_id}"
    cached = cache_get(cache_key, ttl=60)
    if cached is not None:
        return cached

    reviews = db.query(models.Review).filter(models.Review.open_library_work_id == work_id)\
                .order_by(models.Review.id.desc()).all()
    result = []
    for r in reviews:
        user = db.query(models.User).filter(models.User.id == r.user_id).first()
        result.append({"id": r.id, "rating": r.rating, "review_text": r.review_text,
                       "username": user.username if user else "?",
                       "avatar_color": user.avatar_color if user else "#388bfd",
                       "mood_tags": r.mood_tags, "pace_tag": r.pace_tag, "genre": r.genre,
                       "open_library_work_id": r.open_library_work_id,
                       "created_at": r.created_at.isoformat() if r.created_at else None})
    cache_set(cache_key, result)
    return result


@app.post("/my-reviews/", response_model=schemas.ReviewResponse)
def create_review(review: schemas.ReviewCreate, db: Session = Depends(get_db),
                  current_user: models.User = Depends(get_current_user)):
    existing = db.query(models.Review).filter(
        models.Review.user_id == current_user.id,
        models.Review.open_library_work_id == review.open_library_work_id
    ).first()
    if existing:
        existing.rating = review.rating; existing.review_text = review.review_text
        existing.mood_tags = review.mood_tags; existing.pace_tag = review.pace_tag
        existing.genre = review.genre
        db.commit(); db.refresh(existing)
    else:
        existing = models.Review(**review.dict(), user_id=current_user.id)
        db.add(existing); db.commit(); db.refresh(existing)

    cache_invalidate(f"book_reviews_{review.open_library_work_id}")
    cache_invalidate(f"recs_{current_user.id}")
    return existing


async def fetch_book_data(work_id: str):
    async with httpx.AsyncClient() as c:
        try:
            r = await c.get(f"https://openlibrary.org/works/{work_id}.json", timeout=5)
            if r.status_code == 200:
                d = r.json(); covers = d.get("covers", [])
                cover_url = f"https://covers.openlibrary.org/b/id/{covers[0]}-M.jpg" if covers else None
                return {"title": d.get("title", "Desconocido"), "cover_url": cover_url}
        except Exception: pass
    return {"title": "No encontrado", "cover_url": None}


@app.get("/my-reviews/")
async def get_my_reviews(db: Session = Depends(get_db),
                         current_user: models.User = Depends(get_current_user)):
    reviews = db.query(models.Review).filter(models.Review.user_id == current_user.id).all()
    if not reviews: return []
    books_data = await asyncio.gather(*[fetch_book_data(r.open_library_work_id) for r in reviews])
    return [{"id": r.id, "rating": r.rating, "review_text": r.review_text,
             "open_library_work_id": r.open_library_work_id, "book": b,
             "mood_tags": r.mood_tags, "pace_tag": r.pace_tag, "genre": r.genre,
             "created_at": r.created_at.isoformat() if r.created_at else None}
            for r, b in zip(reviews, books_data)]


# ── RECOMMENDATIONS ───────────────────────────────────────────────────────────

@app.get("/recommendations/")
async def get_recommendations(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    cache_key = f"recs_{current_user.id}"
    cached = cache_get(cache_key, ttl=300)
    if cached is not None:
        return cached

    reviews = (
        db.query(models.Review)
        .filter(models.Review.user_id == current_user.id)
        .order_by(models.Review.id.desc())
        .limit(50)
        .all()
    )

    already_read = {r.open_library_work_id for r in reviews}

    if not reviews:
        books = await gb_search("bestseller fiction popular 2024", max_results=16)
        result = [b for b in books if b["google_books_id"] not in already_read][:12]
        cache_set(cache_key, result)
        return result

    genre_scores: dict[str, float] = {}
    mood_scores:  dict[str, float] = {}

    for r in reviews:
        weight = r.rating / 5.0
        if r.genre:
            genre_scores[r.genre] = genre_scores.get(r.genre, 0) + weight
        if r.mood_tags:
            for tag in r.mood_tags.split(","):
                tag = tag.strip()
                if tag:
                    mood_scores[tag] = mood_scores.get(tag, 0) + weight

    if current_user.favorite_genres:
        for g in current_user.favorite_genres.split(","):
            g = g.strip()
            if g:
                genre_scores[g] = genre_scores.get(g, 0) + 1.0
    if current_user.favorite_moods:
        for m in current_user.favorite_moods.split(","):
            m = m.strip()
            if m:
                mood_scores[m] = mood_scores.get(m, 0) + 1.0

    queries: list[str] = []

    if genre_scores:
        for g in sorted(genre_scores, key=genre_scores.get, reverse=True)[:2]:
            if g in GENRE_QUERIES:
                queries.append(GENRE_QUERIES[g])

    if mood_scores:
        for m in sorted(mood_scores, key=mood_scores.get, reverse=True)[:2]:
            if m in MOOD_QUERIES:
                queries.append(MOOD_QUERIES[m])

    if not queries:
        queries = ["bestseller fiction"]

    seen_gids: set[str] = set()
    results: list[dict] = []

    fetch_tasks = [gb_search(q, max_results=8) for q in queries[:4]]
    all_books = await asyncio.gather(*fetch_tasks)

    for batch in all_books:
        for book in batch:
            gid = book.get("google_books_id", "")
            wid = book.get("key", "").replace("/works/", "")
            if gid not in seen_gids and wid not in already_read:
                seen_gids.add(gid)
                results.append(book)

    final = results[:20]
    cache_set(cache_key, final)
    return final


# ── PROGRESS ──────────────────────────────────────────────────────────────────

@app.post("/progress/")
def add_progress(data: schemas.ProgressCreate, db: Session = Depends(get_db),
                 current_user: models.User = Depends(get_current_user)):
    existing = db.query(models.ReadingProgress).filter(
        models.ReadingProgress.user_id == current_user.id,
        models.ReadingProgress.open_library_work_id == data.open_library_work_id
    ).first()
    if existing:
        existing.current_page = data.current_page; existing.total_pages = data.total_pages
        existing.status = data.status; db.commit(); db.refresh(existing); return existing
    new = models.ReadingProgress(**data.dict(), user_id=current_user.id)
    db.add(new); db.commit(); db.refresh(new); return new


@app.get("/progress/")
def get_progress(db: Session = Depends(get_db),
                 current_user: models.User = Depends(get_current_user)):
    return db.query(models.ReadingProgress).filter(models.ReadingProgress.user_id == current_user.id).all()


@app.patch("/progress/{pid}")
def update_progress(pid: int, data: schemas.ProgressUpdate, db: Session = Depends(get_db),
                    current_user: models.User = Depends(get_current_user)):
    p = db.query(models.ReadingProgress).filter(models.ReadingProgress.id == pid, models.ReadingProgress.user_id == current_user.id).first()
    if not p: raise HTTPException(404)
    if data.current_page is not None: p.current_page = data.current_page
    if data.total_pages is not None:  p.total_pages  = data.total_pages
    if data.status is not None:       p.status       = data.status
    db.commit(); db.refresh(p); return p


@app.delete("/progress/{pid}")
def delete_progress(pid: int, db: Session = Depends(get_db),
                    current_user: models.User = Depends(get_current_user)):
    p = db.query(models.ReadingProgress).filter(models.ReadingProgress.id == pid, models.ReadingProgress.user_id == current_user.id).first()
    if not p: raise HTTPException(404)
    db.delete(p); db.commit(); return {"ok": True}


# ── DNF ───────────────────────────────────────────────────────────────────────

@app.post("/dnf/")
def add_dnf(data: schemas.DNFCreate, db: Session = Depends(get_db),
            current_user: models.User = Depends(get_current_user)):
    new = models.DNFBook(**data.dict(), user_id=current_user.id)
    db.add(new); db.commit(); db.refresh(new); return new


@app.get("/dnf/")
def get_dnf(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return db.query(models.DNFBook).filter(models.DNFBook.user_id == current_user.id).all()


@app.delete("/dnf/{did}")
def delete_dnf(did: int, db: Session = Depends(get_db),
               current_user: models.User = Depends(get_current_user)):
    d = db.query(models.DNFBook).filter(models.DNFBook.id == did, models.DNFBook.user_id == current_user.id).first()
    if not d: raise HTTPException(404)
    db.delete(d); db.commit(); return {"ok": True}


# ── QUOTES ────────────────────────────────────────────────────────────────────

@app.post("/quotes/")
def add_quote(data: schemas.QuoteCreate, db: Session = Depends(get_db),
              current_user: models.User = Depends(get_current_user)):
    new = models.Quote(**data.dict(), user_id=current_user.id)
    db.add(new); db.commit(); db.refresh(new); return new


@app.get("/quotes/")
def get_quotes(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return db.query(models.Quote).filter(models.Quote.user_id == current_user.id).order_by(models.Quote.id.desc()).all()


@app.delete("/quotes/{qid}")
def delete_quote(qid: int, db: Session = Depends(get_db),
                 current_user: models.User = Depends(get_current_user)):
    q = db.query(models.Quote).filter(models.Quote.id == qid, models.Quote.user_id == current_user.id).first()
    if not q: raise HTTPException(404)
    db.delete(q); db.commit(); return {"ok": True}


# ── LISTS ─────────────────────────────────────────────────────────────────────

@app.get("/lists/")
def get_public_lists(db: Session = Depends(get_db)):
    cached = cache_get("public_lists", ttl=30)
    if cached is not None:
        return cached

    lists = db.query(models.BookList).filter(models.BookList.is_public == True).order_by(models.BookList.id.desc()).all()
    result = []
    for bl in lists:
        owner = db.query(models.User).filter(models.User.id == bl.user_id).first()
        result.append({"id": bl.id, "title": bl.title, "description": bl.description,
                       "is_public": bl.is_public, "user_id": bl.user_id,
                       "owner_name": owner.username if owner else "?",
                       "likes_count": len(bl.likes), "books_count": len(bl.items),
                       "items": [{"open_library_work_id": i.open_library_work_id, "book_title": i.book_title, "cover_url": i.cover_url} for i in bl.items[:4]]})
    cache_set("public_lists", result)
    return result


@app.get("/lists/my")
def get_my_lists(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    lists = db.query(models.BookList).filter(models.BookList.user_id == current_user.id).all()
    return [{"id": bl.id, "title": bl.title, "description": bl.description, "is_public": bl.is_public,
             "likes_count": len(bl.likes), "books_count": len(bl.items),
             "items": [{"open_library_work_id": i.open_library_work_id, "book_title": i.book_title, "cover_url": i.cover_url} for i in bl.items]} for bl in lists]


@app.post("/lists/")
def create_list(data: schemas.BookListCreate, db: Session = Depends(get_db),
                current_user: models.User = Depends(get_current_user)):
    new = models.BookList(**data.dict(), user_id=current_user.id)
    db.add(new); db.commit(); db.refresh(new)
    cache_invalidate("public_lists")
    return {"id": new.id, "title": new.title}


@app.post("/lists/{list_id}/items")
def add_to_list(list_id: int, item: schemas.ListItemCreate, db: Session = Depends(get_db),
                current_user: models.User = Depends(get_current_user)):
    bl = db.query(models.BookList).filter(models.BookList.id == list_id, models.BookList.user_id == current_user.id).first()
    if not bl: raise HTTPException(404)
    new = models.ListItem(**item.dict(), list_id=list_id)
    db.add(new); db.commit()
    cache_invalidate("public_lists")
    return {"ok": True}


@app.post("/lists/{list_id}/like")
def toggle_like(list_id: int, db: Session = Depends(get_db),
                current_user: models.User = Depends(get_current_user)):
    like = db.query(models.ListLike).filter(models.ListLike.list_id == list_id, models.ListLike.user_id == current_user.id).first()
    if like:
        db.delete(like); db.commit()
        cache_invalidate("public_lists")
        return {"liked": False}
    new = models.ListLike(list_id=list_id, user_id=current_user.id)
    db.add(new); db.commit()
    cache_invalidate("public_lists")
    return {"liked": True}


# ── CLUBS ─────────────────────────────────────────────────────────────────────

@app.get("/clubs/")
def get_clubs(db: Session = Depends(get_db)):
    clubs = db.query(models.BookClub).order_by(models.BookClub.id.desc()).all()
    return [{"id": c.id, "name": c.name, "description": c.description,
             "open_library_work_id": c.open_library_work_id,
             "book_title": c.book_title, "cover_url": c.cover_url,
             "current_chapter": c.current_chapter, "messages_count": len(c.messages)} for c in clubs]


@app.post("/clubs/")
def create_club(data: schemas.BookClubCreate, db: Session = Depends(get_db),
                current_user: models.User = Depends(get_current_user)):
    new = models.BookClub(**data.dict(), created_by=current_user.id)
    db.add(new); db.commit(); db.refresh(new); return {"id": new.id, "name": new.name}


@app.get("/clubs/{club_id}/messages")
def get_messages(club_id: int, chapter: Optional[int] = None, db: Session = Depends(get_db)):
    q = db.query(models.ClubMessage).filter(models.ClubMessage.club_id == club_id)
    if chapter: q = q.filter(models.ClubMessage.chapter == chapter)
    msgs = q.order_by(models.ClubMessage.created_at.asc()).all()
    result = []
    for m in msgs:
        user = db.query(models.User).filter(models.User.id == m.user_id).first()
        result.append({"id": m.id, "content": m.content, "chapter": m.chapter,
                       "username": user.username if user else "?",
                       "avatar_color": user.avatar_color if user else "#388bfd",
                       "created_at": m.created_at.isoformat() if m.created_at else None})
    return result


@app.post("/clubs/{club_id}/messages")
def post_message(club_id: int, data: schemas.ClubMessageCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    club = db.query(models.BookClub).filter(models.BookClub.id == club_id).first()
    if not club: raise HTTPException(404)
    new = models.ClubMessage(club_id=club_id, user_id=current_user.id, content=data.content, chapter=data.chapter)
    db.add(new); db.commit(); db.refresh(new)
    return {"id": new.id, "content": new.content, "chapter": new.chapter,
            "username": current_user.username, "avatar_color": current_user.avatar_color,
            "created_at": new.created_at.isoformat() if new.created_at else None}


# ── STATS ─────────────────────────────────────────────────────────────────────

@app.get("/stats/")
def get_stats(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    reviews  = db.query(models.Review).filter(models.Review.user_id == current_user.id).all()
    dnf      = db.query(models.DNFBook).filter(models.DNFBook.user_id == current_user.id).all()
    finished = db.query(models.ReadingProgress).filter(
        models.ReadingProgress.user_id == current_user.id,
        models.ReadingProgress.status == "finished"
    ).count()

    genres, mood_counts, rating_dist, monthly = {}, {}, {1:0,2:0,3:0,4:0,5:0}, {}
    for r in reviews:
        if r.genre: genres[r.genre] = genres.get(r.genre, 0) + 1
        if r.mood_tags:
            for t in r.mood_tags.split(","):
                t = t.strip()
                if t: mood_counts[t] = mood_counts.get(t, 0) + 1
        star = min(5, max(1, round(r.rating)))
        rating_dist[star] = rating_dist.get(star, 0) + 1
        if r.created_at:
            key = f"{r.created_at.year}-{r.created_at.month:02d}"
            monthly[key] = monthly.get(key, 0) + 1

    followers_count = db.query(models.Follower).filter(models.Follower.following_id == current_user.id).count()
    following_count = db.query(models.Follower).filter(models.Follower.follower_id == current_user.id).count()

    return {
        "total_reviews": len(reviews), "total_finished": finished + len(reviews),
        "total_dnf": len(dnf), "avg_rating": round(sum(r.rating for r in reviews) / len(reviews), 2) if reviews else 0,
        "genres": genres, "mood_counts": mood_counts, "rating_dist": rating_dist, "monthly_books": monthly,
        "reading_goal": current_user.reading_goal,
        "followers_count": followers_count, "following_count": following_count,
    }