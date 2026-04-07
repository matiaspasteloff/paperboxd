from sqlalchemy import Column, Integer, String, Float, Text, ForeignKey, Boolean, DateTime, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base


class User(Base):
    __tablename__ = "users"
    id              = Column(Integer, primary_key=True, index=True)
    username        = Column(String(50), unique=True, index=True)
    email           = Column(String(100), unique=True, index=True)
    hashed_password = Column(String(255))
    # Profile
    bio             = Column(Text, default="")
    avatar_color    = Column(String(20), default="#388bfd")
    favorite_genres = Column(String(300), default="")   # comma-separated
    favorite_moods  = Column(String(300), default="")   # comma-separated
    location        = Column(String(100), default="")
    website         = Column(String(200), default="")
    # Settings
    theme           = Column(String(20), default="dark-blue")
    reading_goal    = Column(Integer, default=0)
    is_private      = Column(Boolean, default=False)
    joined_at       = Column(DateTime(timezone=True), server_default=func.now())

    reviews          = relationship("Review", back_populates="owner")
    reading_progress = relationship("ReadingProgress", back_populates="user")
    quotes           = relationship("Quote", back_populates="user")
    club_messages    = relationship("ClubMessage", back_populates="user")
    list_likes       = relationship("ListLike", back_populates="user")
    dnf_books        = relationship("DNFBook", back_populates="user")
    # Social
    following = relationship("Follower", foreign_keys="Follower.follower_id", back_populates="follower_user")
    followers = relationship("Follower", foreign_keys="Follower.following_id", back_populates="following_user")


class Follower(Base):
    __tablename__ = "followers"
    id           = Column(Integer, primary_key=True, index=True)
    follower_id  = Column(Integer, ForeignKey("users.id"))   # who follows
    following_id = Column(Integer, ForeignKey("users.id"))   # who is followed
    created_at   = Column(DateTime(timezone=True), server_default=func.now())

    __table_args__ = (UniqueConstraint("follower_id", "following_id", name="unique_follow"),)

    follower_user  = relationship("User", foreign_keys=[follower_id],  back_populates="following")
    following_user = relationship("User", foreign_keys=[following_id], back_populates="followers")


class Review(Base):
    __tablename__ = "reviews"
    id                   = Column(Integer, primary_key=True, index=True)
    open_library_work_id = Column(String(50), index=True)
    rating               = Column(Float)
    review_text          = Column(Text)
    user_id              = Column(Integer, ForeignKey("users.id"))
    created_at           = Column(DateTime(timezone=True), server_default=func.now())
    mood_tags            = Column(String(200), default="")
    pace_tag             = Column(String(20), default="")
    genre                = Column(String(50), default="")
    owner = relationship("User", back_populates="reviews")


class ReadingProgress(Base):
    __tablename__ = "reading_progress"
    id                   = Column(Integer, primary_key=True, index=True)
    user_id              = Column(Integer, ForeignKey("users.id"))
    open_library_work_id = Column(String(50), index=True)
    book_title           = Column(String(300))
    cover_url            = Column(String(500))
    total_pages          = Column(Integer, default=0)
    current_page         = Column(Integer, default=0)
    status               = Column(String(20), default="reading")
    started_at           = Column(DateTime(timezone=True), server_default=func.now())
    updated_at           = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    user = relationship("User", back_populates="reading_progress")


class DNFBook(Base):
    __tablename__ = "dnf_books"
    id                   = Column(Integer, primary_key=True, index=True)
    user_id              = Column(Integer, ForeignKey("users.id"))
    open_library_work_id = Column(String(50))
    book_title           = Column(String(300))
    cover_url            = Column(String(500))
    reason               = Column(Text)
    abandoned_at         = Column(DateTime(timezone=True), server_default=func.now())
    user = relationship("User", back_populates="dnf_books")


class Quote(Base):
    __tablename__ = "quotes"
    id                   = Column(Integer, primary_key=True, index=True)
    user_id              = Column(Integer, ForeignKey("users.id"))
    open_library_work_id = Column(String(50))
    book_title           = Column(String(300))
    author_name          = Column(String(200))
    quote_text           = Column(Text)
    created_at           = Column(DateTime(timezone=True), server_default=func.now())
    user = relationship("User", back_populates="quotes")


class BookList(Base):
    __tablename__ = "book_lists"
    id          = Column(Integer, primary_key=True, index=True)
    user_id     = Column(Integer, ForeignKey("users.id"))
    title       = Column(String(200))
    description = Column(Text)
    is_public   = Column(Boolean, default=True)
    created_at  = Column(DateTime(timezone=True), server_default=func.now())
    items = relationship("ListItem", back_populates="book_list", cascade="all, delete-orphan")
    likes = relationship("ListLike", back_populates="book_list", cascade="all, delete-orphan")


class ListItem(Base):
    __tablename__ = "list_items"
    id                   = Column(Integer, primary_key=True, index=True)
    list_id              = Column(Integer, ForeignKey("book_lists.id"))
    open_library_work_id = Column(String(50))
    book_title           = Column(String(300))
    cover_url            = Column(String(500))
    position             = Column(Integer, default=0)
    book_list = relationship("BookList", back_populates="items")


class ListLike(Base):
    __tablename__ = "list_likes"
    id      = Column(Integer, primary_key=True, index=True)
    list_id = Column(Integer, ForeignKey("book_lists.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    book_list = relationship("BookList", back_populates="likes")
    user      = relationship("User", back_populates="list_likes")


class BookClub(Base):
    __tablename__ = "book_clubs"
    id                   = Column(Integer, primary_key=True, index=True)
    name                 = Column(String(200))
    description          = Column(Text)
    open_library_work_id = Column(String(50))
    book_title           = Column(String(300))
    cover_url            = Column(String(500))
    created_by           = Column(Integer, ForeignKey("users.id"))
    created_at           = Column(DateTime(timezone=True), server_default=func.now())
    current_chapter      = Column(Integer, default=1)
    messages = relationship("ClubMessage", back_populates="club", cascade="all, delete-orphan")


class ClubMessage(Base):
    __tablename__ = "club_messages"
    id         = Column(Integer, primary_key=True, index=True)
    club_id    = Column(Integer, ForeignKey("book_clubs.id"))
    user_id    = Column(Integer, ForeignKey("users.id"))
    content    = Column(Text)
    chapter    = Column(Integer, default=1)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    club = relationship("BookClub", back_populates="messages")
    user = relationship("User", back_populates="club_messages")