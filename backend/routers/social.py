from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
import models, schemas
from routers.deps import get_current_user, get_optional_user

router = APIRouter()


@router.get("/users/search")
def search_users(q: str, db: Session = Depends(get_db)):
    users = db.query(models.User).filter(models.User.username.ilike(f"%{q}%")).limit(20).all()
    return [
        {"id": u.id, "username": u.username, "avatar_color": u.avatar_color,
         "bio": u.bio, "reviews_count": len(u.reviews)}
        for u in users
    ]


@router.get("/users/{username}", response_model=schemas.PublicProfile)
def get_profile(
    username: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_optional_user),
):
    user = db.query(models.User).filter(models.User.username == username).first()
    if not user:
        raise HTTPException(404, "Usuario no encontrado")

    followers_count = db.query(models.Follower).filter(models.Follower.following_id == user.id).count()
    following_count = db.query(models.Follower).filter(models.Follower.follower_id == user.id).count()
    reviews_count   = db.query(models.Review).filter(models.Review.user_id == user.id).count()
    is_following    = bool(
        current_user and db.query(models.Follower).filter(
            models.Follower.follower_id == current_user.id,
            models.Follower.following_id == user.id,
        ).first()
    )

    return schemas.PublicProfile(
        id=user.id, username=user.username, bio=user.bio or "",
        avatar_color=user.avatar_color or "#388bfd",
        favorite_genres=user.favorite_genres or "",
        favorite_moods=user.favorite_moods or "",
        location=user.location or "", website=user.website or "",
        joined_at=user.joined_at,
        followers_count=followers_count, following_count=following_count,
        reviews_count=reviews_count, is_following=is_following,
    )


@router.get("/users/{username}/reviews")
def get_user_reviews(username: str, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.username == username).first()
    if not user:
        raise HTTPException(404)
    reviews = db.query(models.Review).filter(models.Review.user_id == user.id)\
                .order_by(models.Review.id.desc()).all()
    return [
        {"id": r.id, "open_library_work_id": r.open_library_work_id, "rating": r.rating,
         "review_text": r.review_text, "mood_tags": r.mood_tags, "pace_tag": r.pace_tag,
         "genre": r.genre, "created_at": r.created_at.isoformat() if r.created_at else None}
        for r in reviews
    ]


@router.post("/users/{username}/follow")
def toggle_follow(
    username: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    target = db.query(models.User).filter(models.User.username == username).first()
    if not target:
        raise HTTPException(404)
    if target.id == current_user.id:
        raise HTTPException(400, "No podés seguirte a vos mismo")

    existing = db.query(models.Follower).filter(
        models.Follower.follower_id == current_user.id,
        models.Follower.following_id == target.id,
    ).first()

    if existing:
        db.delete(existing); db.commit()
        return {"following": False}

    db.add(models.Follower(follower_id=current_user.id, following_id=target.id))
    db.commit()
    return {"following": True}


@router.get("/users/{username}/followers")
def get_followers(username: str, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.username == username).first()
    if not user:
        raise HTTPException(404)
    result = []
    for f in db.query(models.Follower).filter(models.Follower.following_id == user.id).all():
        u = db.query(models.User).filter(models.User.id == f.follower_id).first()
        if u:
            result.append({"id": u.id, "username": u.username, "avatar_color": u.avatar_color, "bio": u.bio})
    return result


@router.get("/users/{username}/following")
def get_following(username: str, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.username == username).first()
    if not user:
        raise HTTPException(404)
    result = []
    for f in db.query(models.Follower).filter(models.Follower.follower_id == user.id).all():
        u = db.query(models.User).filter(models.User.id == f.following_id).first()
        if u:
            result.append({"id": u.id, "username": u.username, "avatar_color": u.avatar_color, "bio": u.bio})
    return result


@router.get("/feed/")
def get_feed(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    following_ids = [
        f.following_id for f in
        db.query(models.Follower).filter(models.Follower.follower_id == current_user.id).all()
    ]
    if not following_ids:
        return []
    reviews = db.query(models.Review).filter(
        models.Review.user_id.in_(following_ids)
    ).order_by(models.Review.id.desc()).limit(40).all()

    result = []
    for r in reviews:
        user = db.query(models.User).filter(models.User.id == r.user_id).first()
        result.append({
            "id": r.id,
            "username": user.username if user else "?",
            "avatar_color": user.avatar_color if user else "#388bfd",
            "open_library_work_id": r.open_library_work_id,
            "rating": r.rating, "review_text": r.review_text,
            "mood_tags": r.mood_tags, "genre": r.genre,
            "created_at": r.created_at.isoformat() if r.created_at else None,
        })
    return result