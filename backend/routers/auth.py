from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from database import get_db
import models, schemas, auth as auth_utils
from routers.deps import get_current_user

router = APIRouter()


@router.post("/users/", response_model=schemas.UserResponse)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    if db.query(models.User).filter(models.User.email == user.email).first():
        raise HTTPException(400, "Email ya registrado")
    if db.query(models.User).filter(models.User.username == user.username).first():
        raise HTTPException(400, "Username ya en uso")
    new = models.User(
        username=user.username,
        email=user.email,
        hashed_password=auth_utils.get_password_hash(user.password),
    )
    db.add(new)
    db.commit()
    db.refresh(new)
    return new


@router.post("/login", response_model=schemas.Token)
def login(form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == form.username).first()
    if not user or not auth_utils.verify_password(form.password, user.hashed_password):
        raise HTTPException(401, "Credenciales incorrectas")
    return {
        "access_token": auth_utils.create_access_token({"sub": user.email}),
        "token_type": "bearer",
    }


@router.get("/me", response_model=schemas.UserResponse)
def get_me(current_user: models.User = Depends(get_current_user)):
    return current_user


@router.patch("/me", response_model=schemas.UserResponse)
def update_me(
    data: schemas.UserUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    for field, value in data.dict(exclude_none=True).items():
        setattr(current_user, field, value)
    db.commit()
    db.refresh(current_user)
    from cache import cache_invalidate
    cache_invalidate(f"recs_{current_user.id}")
    return current_user