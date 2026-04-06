from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from jose import JWTError, jwt
import httpx
import asyncio

from database import engine, Base, get_db
import models
import schemas
import auth

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Paperboxd API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No se pudieron validar las credenciales o el token expiró",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, auth.SECRET_KEY, algorithms=[auth.ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = db.query(models.User).filter(models.User.email == email).first()
    if user is None:
        raise credentials_exception
    return user


@app.get("/")
def read_root():
    return {"status": "ok", "message": "Paperboxd API online"}


# ── ENDPOINTS PÚBLICOS ──────────────────────────────────────────────────────

@app.post("/users/", response_model=schemas.UserResponse)
def register_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    if db.query(models.User).filter(models.User.email == user.email).first():
        raise HTTPException(status_code=400, detail="El email ya está registrado")
    if db.query(models.User).filter(models.User.username == user.username).first():
        raise HTTPException(status_code=400, detail="El nombre de usuario ya está en uso")

    new_user = models.User(
        username=user.username,
        email=user.email,
        hashed_password=auth.get_password_hash(user.password),
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


@app.post("/login", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email o contraseña incorrectos",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return {"access_token": auth.create_access_token({"sub": user.email}), "token_type": "bearer"}


@app.get("/books/{work_id}/reviews")
def get_book_reviews(work_id: str, db: Session = Depends(get_db)):
    """Devuelve todas las reseñas públicas de un libro, con el nombre de usuario."""
    reviews = (
        db.query(models.Review)
        .filter(models.Review.open_library_work_id == work_id)
        .order_by(models.Review.id.desc())
        .all()
    )
    result = []
    for review in reviews:
        user = db.query(models.User).filter(models.User.id == review.user_id).first()
        result.append({
            "id": review.id,
            "rating": review.rating,
            "review_text": review.review_text,
            "username": user.username if user else "Anónimo",
            "open_library_work_id": review.open_library_work_id,
        })
    return result


# ── ENDPOINTS PROTEGIDOS ────────────────────────────────────────────────────

@app.post("/my-reviews/", response_model=schemas.ReviewResponse)
def create_review(
    review: schemas.ReviewCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    # Evitar duplicados del mismo usuario para el mismo libro
    existing = (
        db.query(models.Review)
        .filter(
            models.Review.user_id == current_user.id,
            models.Review.open_library_work_id == review.open_library_work_id,
        )
        .first()
    )
    if existing:
        existing.rating = review.rating
        existing.review_text = review.review_text
        db.commit()
        db.refresh(existing)
        return existing

    new_review = models.Review(
        open_library_work_id=review.open_library_work_id,
        rating=review.rating,
        review_text=review.review_text,
        user_id=current_user.id,
    )
    db.add(new_review)
    db.commit()
    db.refresh(new_review)
    return new_review


async def fetch_book_data(work_id: str):
    url = f"https://openlibrary.org/works/{work_id}.json"
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(url, timeout=5)
            if response.status_code == 200:
                data = response.json()
                covers = data.get("covers", [])
                cover_id = covers[0] if covers else None
                cover_url = f"https://covers.openlibrary.org/b/id/{cover_id}-M.jpg" if cover_id else None
                return {"title": data.get("title", "Título desconocido"), "cover_url": cover_url}
        except Exception:
            pass
    return {"title": "Libro no encontrado", "cover_url": None}


@app.get("/my-reviews/")
async def get_my_reviews(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    reviews = db.query(models.Review).filter(models.Review.user_id == current_user.id).all()
    if not reviews:
        return []

    tasks = [fetch_book_data(r.open_library_work_id) for r in reviews]
    books_data = await asyncio.gather(*tasks)

    return [
        {
            "id": r.id,
            "rating": r.rating,
            "review_text": r.review_text,
            "open_library_work_id": r.open_library_work_id,
            "book": book_info,
        }
        for r, book_info in zip(reviews, books_data)
    ]