import asyncio
import os
import httpx
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
import models, schemas
from cache import cache_get, cache_set, cache_invalidate
from routers.deps import get_current_user

router = APIRouter()

GOOGLE_BOOKS_API_KEY = os.getenv("GOOGLE_BOOKS_API_KEY", "")


async def fetch_book_data(work_id: str) -> dict:
    """
    Fetch title + cover for a work ID.
    - Handles Google Books IDs (default for new reviews)
    - Falls back to OpenLibrary for OL-prefixed IDs
    - Returns a safe default so callers never get None
    """
    if work_id.startswith("isbn_") or work_id.startswith("gr_"):
        return {"title": "Libro importado", "cover_url": None}

    # Google Books ID (anything that doesn't start with OL)
    if not work_id.startswith("OL"):
        try:
            params = {"key": GOOGLE_BOOKS_API_KEY} if GOOGLE_BOOKS_API_KEY else {}
            async with httpx.AsyncClient(timeout=5) as c:
                r = await c.get(
                    f"https://www.googleapis.com/books/v1/volumes/{work_id}",
                    params=params,
                )
            if r.status_code == 200:
                info = r.json().get("volumeInfo", {})
                raw = (info.get("imageLinks") or {}).get("thumbnail", "")
                cover = raw.replace("http://", "https://").replace("zoom=1", "zoom=2") if raw else None
                return {"title": info.get("title") or "Desconocido", "cover_url": cover}
        except Exception:
            pass
        return {"title": "Desconocido", "cover_url": None}

    # OpenLibrary
    try:
        async with httpx.AsyncClient(timeout=5) as c:
            r = await c.get(f"https://openlibrary.org/works/{work_id}.json")
        if r.status_code == 200:
            d = r.json()
            covers = d.get("covers", [])
            cover_url = f"https://covers.openlibrary.org/b/id/{covers[0]}-M.jpg" if covers else None
            return {"title": d.get("title") or "Desconocido", "cover_url": cover_url}
    except Exception:
        pass
    return {"title": "No encontrado", "cover_url": None}


# ── Book reviews (public) ─────────────────────────────────────────────────────

@router.get("/books/{work_id}/reviews")
def get_book_reviews(work_id: str, db: Session = Depends(get_db)):
    cache_key = f"book_reviews_{work_id}"
    cached = cache_get(cache_key, ttl=60)
    if cached is not None:
        return cached

    reviews = (
        db.query(models.Review)
        .filter(models.Review.open_library_work_id == work_id)
        .order_by(models.Review.id.desc())
        .all()
    )
    result = []
    for r in reviews:
        user = db.query(models.User).filter(models.User.id == r.user_id).first()
        result.append({
            "id": r.id,
            "rating": r.rating,
            "review_text": r.review_text,
            "username": user.username if user else "?",
            "avatar_color": user.avatar_color if user else "#c8943a",
            "mood_tags": r.mood_tags,
            "pace_tag": r.pace_tag,
            "genre": r.genre,
            "open_library_work_id": r.open_library_work_id,
            "created_at": r.created_at.isoformat() if r.created_at else None,
        })
    cache_set(cache_key, result)
    return result


@router.get("/reviews/latest")
def get_latest_reviews(db: Session = Depends(get_db)):
    """Returns the 20 most recent community reviews for the home page feed."""
    cache_key = "reviews_latest"
    cached = cache_get(cache_key, ttl=30)
    if cached is not None:
        return cached

    reviews = (
        db.query(models.Review)
        .order_by(models.Review.id.desc())
        .limit(20)
        .all()
    )
    result = []
    for r in reviews:
        user = db.query(models.User).filter(models.User.id == r.user_id).first()
        result.append({
            "id": r.id,
            "open_library_work_id": r.open_library_work_id,
            "book_title": r.book_title or "Libro",
            "cover_url": r.cover_url,
            "rating": r.rating,
            "review_text": r.review_text,
            "username": user.username if user else "?",
            "avatar_color": user.avatar_color if user else "#c8943a",
            "mood_tags": r.mood_tags,
            "genre": r.genre,
            "created_at": r.created_at.isoformat() if r.created_at else None,
        })
    cache_set(cache_key, result)
    return result


# ── My reviews (authenticated) ────────────────────────────────────────────────

@router.post("/my-reviews/", response_model=schemas.ReviewResponse)
def create_review(
    review: schemas.ReviewCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    existing = db.query(models.Review).filter(
        models.Review.user_id == current_user.id,
        models.Review.open_library_work_id == review.open_library_work_id,
    ).first()

    if existing:
        existing.rating      = review.rating
        existing.review_text = review.review_text
        existing.mood_tags   = review.mood_tags
        existing.pace_tag    = review.pace_tag
        existing.genre       = review.genre
        if review.book_title:
            existing.book_title = review.book_title
        if review.cover_url:
            existing.cover_url = review.cover_url
        db.commit()
        db.refresh(existing)
    else:
        existing = models.Review(
            open_library_work_id=review.open_library_work_id,
            rating=review.rating,
            review_text=review.review_text,
            mood_tags=review.mood_tags,
            pace_tag=review.pace_tag,
            genre=review.genre,
            book_title=review.book_title,
            cover_url=review.cover_url,
            user_id=current_user.id,
        )
        db.add(existing)
        db.commit()
        db.refresh(existing)

    cache_invalidate(f"book_reviews_{review.open_library_work_id}")
    cache_invalidate(f"recs_{current_user.id}")
    cache_invalidate("reviews_latest")
    return existing


@router.get("/my-reviews/")
async def get_my_reviews(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    reviews = (
        db.query(models.Review)
        .filter(models.Review.user_id == current_user.id)
        .all()
    )
    if not reviews:
        return []

    # Use stored data when available; only hit external API for legacy rows
    legacy = [r for r in reviews if not r.book_title]
    if legacy:
        fetched = await asyncio.gather(*[fetch_book_data(r.open_library_work_id) for r in legacy])
        fetched_map = {r.id: b for r, b in zip(legacy, fetched)}
    else:
        fetched_map = {}

    result = []
    for r in reviews:
        if r.book_title:
            book = {"title": r.book_title, "cover_url": r.cover_url}
        else:
            book = fetched_map.get(r.id, {"title": "Desconocido", "cover_url": None})
        result.append({
            "id": r.id,
            "rating": r.rating,
            "review_text": r.review_text,
            "open_library_work_id": r.open_library_work_id,
            "book": book,
            "mood_tags": r.mood_tags,
            "pace_tag": r.pace_tag,
            "genre": r.genre,
            "created_at": r.created_at.isoformat() if r.created_at else None,
        })
    return result