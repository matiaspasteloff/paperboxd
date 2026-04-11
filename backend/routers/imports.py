from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List

from database import get_db
import models
from cache import cache_invalidate
from routers.deps import get_current_user

router = APIRouter()


class GoodreadsBook(BaseModel):
    gr_book_id: str
    title: str
    author: Optional[str] = ""
    isbn13: Optional[str] = ""
    my_rating: int = 0          # 0–5
    my_review: Optional[str] = ""
    exclusive_shelf: str = ""   # read / to-read / currently-reading
    num_pages: int = 0
    date_read: Optional[str] = ""
    bookshelves: Optional[str] = ""
    cover_url: Optional[str] = None


class GoodreadsImportPayload(BaseModel):
    books: List[GoodreadsBook]


class ImportResult(BaseModel):
    imported_reviews: int
    imported_progress: int
    skipped: int
    errors: List[str]


@router.post("/import/goodreads", response_model=ImportResult)
def import_goodreads(
    payload: GoodreadsImportPayload,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    imported_reviews = 0
    imported_progress = 0
    skipped = 0
    errors: List[str] = []

    for book in payload.books:
        # Build a stable work_id: prefer isbn13, fall back to gr_ prefix
        isbn = (book.isbn13 or "").strip()
        work_id = f"isbn_{isbn}" if isbn else f"gr_{book.gr_book_id}"

        # --- Review (only if rated) ---
        if book.my_rating > 0:
            existing_review = db.query(models.Review).filter(
                models.Review.user_id == current_user.id,
                models.Review.open_library_work_id == work_id,
            ).first()

            if not existing_review:
                review = models.Review(
                    user_id=current_user.id,
                    open_library_work_id=work_id,
                    rating=float(book.my_rating),
                    review_text=(book.my_review or "").strip() or None,
                    mood_tags="",
                    pace_tag="",
                    genre="",
                )
                db.add(review)
                imported_reviews += 1
            else:
                skipped += 1

        # --- Reading progress ---
        shelf = (book.exclusive_shelf or "").strip().lower()
        status_map = {
            "read":              "finished",
            "currently-reading": "reading",
            "to-read":           "want",
        }
        status = status_map.get(shelf)

        if status:
            existing_prog = db.query(models.ReadingProgress).filter(
                models.ReadingProgress.user_id == current_user.id,
                models.ReadingProgress.open_library_work_id == work_id,
            ).first()

            if not existing_prog:
                prog = models.ReadingProgress(
                    user_id=current_user.id,
                    open_library_work_id=work_id,
                    book_title=book.title,
                    cover_url=book.cover_url,
                    total_pages=book.num_pages or 0,
                    current_page=book.num_pages if status == "finished" else 0,
                    status=status,
                )
                db.add(prog)
                imported_progress += 1

    try:
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(500, f"Error guardando datos: {str(e)}")

    # Bust recommendations cache
    cache_invalidate(f"recs_{current_user.id}")

    return ImportResult(
        imported_reviews=imported_reviews,
        imported_progress=imported_progress,
        skipped=skipped,
        errors=errors,
    )