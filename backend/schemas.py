from pydantic import BaseModel
from typing import Optional

# --- Esquemas de Autenticación ---
class Token(BaseModel):
    access_token: str
    token_type: str

# --- Esquemas para el Usuario ---
class UserCreate(BaseModel):
    username: str
    email: str
    password: str

class UserResponse(BaseModel):
    id: int
    username: str
    email: str

    class Config:
        from_attributes = True

# --- Esquemas para la Reseña ---
class ReviewCreate(BaseModel):
    open_library_work_id: str
    rating: float
    review_text: Optional[str] = None

class ReviewResponse(BaseModel):
    id: int
    open_library_work_id: str
    rating: float
    review_text: Optional[str]
    user_id: int

    class Config:
        from_attributes = True