import asyncio
import httpx
import os
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
import models
from cache import cache_get, cache_set
from routers.deps import get_current_user

router = APIRouter()

GOOGLE_BOOKS_API_KEY = os.getenv("GOOGLE_BOOKS_API_KEY")

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
    "ficción":         "literary fiction",
    "no ficción":      "nonfiction bestseller",
    "fantasía":        "subject:fantasy",
    "ciencia ficción": "subject:science fiction",
    "romance":         "subject:romance",
    "thriller":        "thriller crime fiction",
    "historia":        "subject:history",
    "poesía":          "subject:poetry",
    "terror":          "subject:horror",
    "autoayuda":       "self help personal development",
    "ensayo":          "essays nonfiction",
    "clásicos":        "subject:classics",
}


async def gb_search(query: str, max_results: int = 8) -> list[dict]:
    params = {"q": query, "maxResults": max_results, "printType": "books", "orderBy": "relevance"}
    if GOOGLE_BOOKS_API_KEY:
        params["key"] = GOOGLE_BOOKS_API_KEY
    async with httpx.AsyncClient(timeout=6) as c:
        try:
            r = await c.get("https://www.googleapis.com/books/v1/volumes", params=params)
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
            "key": f"/works/{item['id']}", "google_books_id": item["id"],
            "title": info.get("title", ""), "author_name": info.get("authors", []),
            "cover_url": cover,
            "first_publish_year": int(pub_date[:4]) if pub_date and pub_date[:4].isdigit() else None,
            "description": (info.get("description") or "")[:300],
            "categories": info.get("categories", []),
            "page_count": info.get("pageCount", 0),
            "average_rating": info.get("averageRating"),
            "ratings_count": info.get("ratingsCount", 0),
        })
    return result


@router.get("/stats/")
def get_stats(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    reviews  = db.query(models.Review).filter(models.Review.user_id == current_user.id).all()
    dnf      = db.query(models.DNFBook).filter(models.DNFBook.user_id == current_user.id).all()
    finished = db.query(models.ReadingProgress).filter(
        models.ReadingProgress.user_id == current_user.id,
        models.ReadingProgress.status == "finished",
    ).count()

    genres, mood_counts, rating_dist, monthly = {}, {}, {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}, {}
    for r in reviews:
        if r.genre:
            genres[r.genre] = genres.get(r.genre, 0) + 1
        if r.mood_tags:
            for t in r.mood_tags.split(","):
                t = t.strip()
                if t:
                    mood_counts[t] = mood_counts.get(t, 0) + 1
        star = min(5, max(1, round(r.rating)))
        rating_dist[star] = rating_dist.get(star, 0) + 1
        if r.created_at:
            key = f"{r.created_at.year}-{r.created_at.month:02d}"
            monthly[key] = monthly.get(key, 0) + 1

    followers_count = db.query(models.Follower).filter(models.Follower.following_id == current_user.id).count()
    following_count = db.query(models.Follower).filter(models.Follower.follower_id == current_user.id).count()

    return {
        "total_reviews": len(reviews), "total_finished": finished + len(reviews),
        "total_dnf": len(dnf),
        "avg_rating": round(sum(r.rating for r in reviews) / len(reviews), 2) if reviews else 0,
        "genres": genres, "mood_counts": mood_counts,
        "rating_dist": rating_dist, "monthly_books": monthly,
        "reading_goal": current_user.reading_goal,
        "followers_count": followers_count, "following_count": following_count,
    }


@router.get("/recommendations/")
async def get_recommendations(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    cache_key = f"recs_{current_user.id}"
    cached = cache_get(cache_key, ttl=300)
    if cached is not None:
        return cached

    reviews = db.query(models.Review).filter(models.Review.user_id == current_user.id)\
               .order_by(models.Review.id.desc()).limit(50).all()
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

    for g in (current_user.favorite_genres or "").split(","):
        g = g.strip()
        if g: genre_scores[g] = genre_scores.get(g, 0) + 1.0
    for m in (current_user.favorite_moods or "").split(","):
        m = m.strip()
        if m: mood_scores[m] = mood_scores.get(m, 0) + 1.0

    queries: list[str] = []
    for g in sorted(genre_scores, key=genre_scores.get, reverse=True)[:2]:
        if g in GENRE_QUERIES: queries.append(GENRE_QUERIES[g])
    for m in sorted(mood_scores, key=mood_scores.get, reverse=True)[:2]:
        if m in MOOD_QUERIES: queries.append(MOOD_QUERIES[m])
    if not queries:
        queries = ["bestseller fiction"]

    seen_gids: set[str] = set()
    results: list[dict] = []
    all_books = await asyncio.gather(*[gb_search(q, max_results=8) for q in queries[:4]])

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