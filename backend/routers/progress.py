import asyncio
import httpx
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
import models, schemas
from cache import cache_get, cache_set, cache_invalidate
from routers.deps import get_current_user

router = APIRouter()


async def fetch_book_data(work_id: str) -> dict:
    async with httpx.AsyncClient() as c:
        try:
            r = await c.get(f"https://openlibrary.org/works/{work_id}.json", timeout=5)
            if r.status_code == 200:
                d = r.json()
                covers = d.get("covers", [])
                cover_url = f"https://covers.openlibrary.org/b/id/{covers[0]}-M.jpg" if covers else None
                return {"title": d.get("title", "Desconocido"), "cover_url": cover_url}
        except Exception:
            pass
    return {"title": "No encontrado", "cover_url": None}


@router.get("/books/{work_id}/reviews")
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
        result.append({
            "id": r.id, "rating": r.rating, "review_text": r.review_text,
            "username": user.username if user else "?",
            "avatar_color": user.avatar_color if user else "#388bfd",
            "mood_tags": r.mood_tags, "pace_tag": r.pace_tag, "genre": r.genre,
            "open_library_work_id": r.open_library_work_id,
            "created_at": r.created_at.isoformat() if r.created_at else None,
        })
    cache_set(cache_key, result)
    return result


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
        existing.rating = review.rating
        existing.review_text = review.review_text
        existing.mood_tags = review.mood_tags
        existing.pace_tag = review.pace_tag
        existing.genre = review.genre
        db.commit(); db.refresh(existing)
    else:
        existing = models.Review(**review.dict(), user_id=current_user.id)
        db.add(existing); db.commit(); db.refresh(existing)

    cache_invalidate(f"book_reviews_{review.open_library_work_id}")
    cache_invalidate(f"recs_{current_user.id}")
    return existing


@router.get("/my-reviews/")
async def get_my_reviews(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    reviews = db.query(models.Review).filter(models.Review.user_id == current_user.id).all()
    if not reviews:
        return []
    books_data = await asyncio.gather(*[fetch_book_data(r.open_library_work_id) for r in reviews])
    return [
        {"id": r.id, "rating": r.rating, "review_text": r.review_text,
         "open_library_work_id": r.open_library_work_id, "book": b,
         "mood_tags": r.mood_tags, "pace_tag": r.pace_tag, "genre": r.genre,
         "created_at": r.created_at.isoformat() if r.created_at else None}
        for r, b in zip(reviews, books_data)
    ]