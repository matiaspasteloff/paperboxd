from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
import models, schemas
from cache import cache_get, cache_set, cache_invalidate
from routers.deps import get_current_user

router = APIRouter()


# ── DNF ───────────────────────────────────────────────────────────────────────

@router.post("/dnf/")
def add_dnf(data: schemas.DNFCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    new = models.DNFBook(**data.dict(), user_id=current_user.id)
    db.add(new); db.commit(); db.refresh(new)
    return new

@router.get("/dnf/")
def get_dnf(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return db.query(models.DNFBook).filter(models.DNFBook.user_id == current_user.id).all()

@router.delete("/dnf/{did}")
def delete_dnf(did: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    d = db.query(models.DNFBook).filter(models.DNFBook.id == did, models.DNFBook.user_id == current_user.id).first()
    if not d: raise HTTPException(404)
    db.delete(d); db.commit()
    return {"ok": True}


# ── Quotes ────────────────────────────────────────────────────────────────────

@router.post("/quotes/")
def add_quote(data: schemas.QuoteCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    new = models.Quote(**data.dict(), user_id=current_user.id)
    db.add(new); db.commit(); db.refresh(new)
    return new

@router.get("/quotes/")
def get_quotes(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return db.query(models.Quote).filter(models.Quote.user_id == current_user.id).order_by(models.Quote.id.desc()).all()

@router.delete("/quotes/{qid}")
def delete_quote(qid: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    q = db.query(models.Quote).filter(models.Quote.id == qid, models.Quote.user_id == current_user.id).first()
    if not q: raise HTTPException(404)
    db.delete(q); db.commit()
    return {"ok": True}


# ── Lists ─────────────────────────────────────────────────────────────────────

@router.get("/lists/")
def get_public_lists(db: Session = Depends(get_db)):
    cached = cache_get("public_lists", ttl=30)
    if cached is not None:
        return cached
    lists = db.query(models.BookList).filter(models.BookList.is_public == True).order_by(models.BookList.id.desc()).all()
    result = []
    for bl in lists:
        owner = db.query(models.User).filter(models.User.id == bl.user_id).first()
        result.append({
            "id": bl.id, "title": bl.title, "description": bl.description,
            "is_public": bl.is_public, "user_id": bl.user_id,
            "owner_name": owner.username if owner else "?",
            "likes_count": len(bl.likes), "books_count": len(bl.items),
            "items": [{"open_library_work_id": i.open_library_work_id, "book_title": i.book_title, "cover_url": i.cover_url} for i in bl.items[:4]],
        })
    cache_set("public_lists", result)
    return result

@router.get("/lists/my")
def get_my_lists(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    lists = db.query(models.BookList).filter(models.BookList.user_id == current_user.id).all()
    return [{"id": bl.id, "title": bl.title, "description": bl.description, "is_public": bl.is_public, "likes_count": len(bl.likes), "books_count": len(bl.items), "items": [{"open_library_work_id": i.open_library_work_id, "book_title": i.book_title, "cover_url": i.cover_url} for i in bl.items]} for bl in lists]

@router.post("/lists/")
def create_list(data: schemas.BookListCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    new = models.BookList(**data.dict(), user_id=current_user.id)
    db.add(new); db.commit(); db.refresh(new)
    cache_invalidate("public_lists")
    return {"id": new.id, "title": new.title}

@router.post("/lists/{list_id}/items")
def add_to_list(list_id: int, item: schemas.ListItemCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    bl = db.query(models.BookList).filter(models.BookList.id == list_id, models.BookList.user_id == current_user.id).first()
    if not bl: raise HTTPException(404)
    db.add(models.ListItem(**item.dict(), list_id=list_id)); db.commit()
    cache_invalidate("public_lists")
    return {"ok": True}

@router.post("/lists/{list_id}/like")
def toggle_like(list_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    like = db.query(models.ListLike).filter(models.ListLike.list_id == list_id, models.ListLike.user_id == current_user.id).first()
    if like:
        db.delete(like); db.commit()
        cache_invalidate("public_lists")
        return {"liked": False}
    db.add(models.ListLike(list_id=list_id, user_id=current_user.id)); db.commit()
    cache_invalidate("public_lists")
    return {"liked": True}


# ── Clubs ─────────────────────────────────────────────────────────────────────

@router.get("/clubs/")
def get_clubs(db: Session = Depends(get_db)):
    clubs = db.query(models.BookClub).order_by(models.BookClub.id.desc()).all()
    return [{"id": c.id, "name": c.name, "description": c.description, "open_library_work_id": c.open_library_work_id, "book_title": c.book_title, "cover_url": c.cover_url, "current_chapter": c.current_chapter, "messages_count": len(c.messages)} for c in clubs]

@router.post("/clubs/")
def create_club(data: schemas.BookClubCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    new = models.BookClub(**data.dict(), created_by=current_user.id)
    db.add(new); db.commit(); db.refresh(new)
    return {"id": new.id, "name": new.name}

@router.get("/clubs/{club_id}/messages")
def get_messages(club_id: int, chapter: Optional[int] = None, db: Session = Depends(get_db)):
    q = db.query(models.ClubMessage).filter(models.ClubMessage.club_id == club_id)
    if chapter:
        q = q.filter(models.ClubMessage.chapter == chapter)
    msgs = q.order_by(models.ClubMessage.created_at.asc()).all()
    result = []
    for m in msgs:
        user = db.query(models.User).filter(models.User.id == m.user_id).first()
        result.append({"id": m.id, "content": m.content, "chapter": m.chapter, "username": user.username if user else "?", "avatar_color": user.avatar_color if user else "#388bfd", "created_at": m.created_at.isoformat() if m.created_at else None})
    return result

@router.post("/clubs/{club_id}/messages")
def post_message(club_id: int, data: schemas.ClubMessageCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    club = db.query(models.BookClub).filter(models.BookClub.id == club_id).first()
    if not club: raise HTTPException(404)
    new = models.ClubMessage(club_id=club_id, user_id=current_user.id, content=data.content, chapter=data.chapter)
    db.add(new); db.commit(); db.refresh(new)
    return {"id": new.id, "content": new.content, "chapter": new.chapter, "username": current_user.username, "avatar_color": current_user.avatar_color, "created_at": new.created_at.isoformat() if new.created_at else None}