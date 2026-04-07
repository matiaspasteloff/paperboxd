from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class Token(BaseModel):
    access_token: str
    token_type: str


class UserCreate(BaseModel):
    username: str
    email: str
    password: str


class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    bio: Optional[str] = ""
    avatar_color: Optional[str] = "#388bfd"
    favorite_genres: Optional[str] = ""
    favorite_moods: Optional[str] = ""
    location: Optional[str] = ""
    website: Optional[str] = ""
    theme: str
    reading_goal: int
    is_private: bool
    joined_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    bio: Optional[str] = None
    avatar_color: Optional[str] = None
    favorite_genres: Optional[str] = None
    favorite_moods: Optional[str] = None
    location: Optional[str] = None
    website: Optional[str] = None
    theme: Optional[str] = None
    reading_goal: Optional[int] = None
    is_private: Optional[bool] = None


class PublicProfile(BaseModel):
    id: int
    username: str
    bio: Optional[str] = ""
    avatar_color: Optional[str] = "#388bfd"
    favorite_genres: Optional[str] = ""
    favorite_moods: Optional[str] = ""
    location: Optional[str] = ""
    website: Optional[str] = ""
    joined_at: Optional[datetime] = None
    followers_count: int = 0
    following_count: int = 0
    reviews_count: int = 0
    is_following: bool = False


class ReviewCreate(BaseModel):
    open_library_work_id: str
    rating: float
    review_text: Optional[str] = None
    mood_tags: Optional[str] = ""
    pace_tag: Optional[str] = ""
    genre: Optional[str] = ""


class ReviewResponse(BaseModel):
    id: int
    open_library_work_id: str
    rating: float
    review_text: Optional[str]
    user_id: int
    mood_tags: Optional[str]
    pace_tag: Optional[str]
    genre: Optional[str]

    class Config:
        from_attributes = True


class ProgressCreate(BaseModel):
    open_library_work_id: str
    book_title: str
    cover_url: Optional[str] = None
    total_pages: int
    current_page: int
    status: str = "reading"


class ProgressUpdate(BaseModel):
    current_page: Optional[int] = None
    total_pages: Optional[int] = None
    status: Optional[str] = None


class DNFCreate(BaseModel):
    open_library_work_id: str
    book_title: str
    cover_url: Optional[str] = None
    reason: Optional[str] = None


class QuoteCreate(BaseModel):
    open_library_work_id: str
    book_title: str
    author_name: str
    quote_text: str


class BookListCreate(BaseModel):
    title: str
    description: Optional[str] = ""
    is_public: bool = True


class ListItemCreate(BaseModel):
    open_library_work_id: str
    book_title: str
    cover_url: Optional[str] = None


class BookClubCreate(BaseModel):
    name: str
    description: Optional[str] = ""
    open_library_work_id: str
    book_title: str
    cover_url: Optional[str] = None


class ClubMessageCreate(BaseModel):
    content: str
    chapter: int = 1