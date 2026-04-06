from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from jose import JWTError, jwt
import httpx
import asyncio

from database import engine, Base, get_db
import models
import schemas
import auth

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Paperboxd API Segura")

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Paperboxd API Segura")

# ---  CORS ---
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
    return {"status": "ok", "message": "¡El backend seguro de Paperboxd está online!"}



#        ENDPOINTS PÚBLICOS 

@app.post("/users/", response_model=schemas.UserResponse)
def register_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="El email ya está registrado")
    
    hashed_pw = auth.get_password_hash(user.password)
    new_user = models.User(username=user.username, email=user.email, hashed_password=hashed_pw)
    
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
    
    access_token = auth.create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}



#   ENDPOINTS PROTEGIDOS

@app.post("/my-reviews/", response_model=schemas.ReviewResponse)
def create_review(
    review: schemas.ReviewCreate, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(get_current_user)
):
    new_review = models.Review(
        open_library_work_id=review.open_library_work_id,
        rating=review.rating,
        review_text=review.review_text,
        user_id=current_user.id 
    )
    db.add(new_review)
    db.commit()
    db.refresh(new_review)
    return new_review

async def fetch_book_data(work_id: str):
    url = f"https://openlibrary.org/works/{work_id}.json"
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(url)
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
    current_user: models.User = Depends(get_current_user)
):
    reviews = db.query(models.Review).filter(models.Review.user_id == current_user.id).all()
    
    if not reviews:
        return []

    tasks = [fetch_book_data(r.open_library_work_id) for r in reviews]
    books_data = await asyncio.gather(*tasks)
    
    enriched_reviews = []
    for review, book_info in zip(reviews, books_data):
        enriched_reviews.append({
            "id": review.id,
            "rating": review.rating,
            "review_text": review.review_text,
            "open_library_work_id": review.open_library_work_id,
            "book": book_info
        })
        
    return enriched_reviews