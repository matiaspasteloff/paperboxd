from sqlalchemy import Column, Integer, String, Float, Text, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True)
    email = Column(String(100), unique=True, index=True)
    hashed_password = Column(String(255))
    
    reviews = relationship("Review", back_populates="owner")

class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    open_library_work_id = Column(String(50), index=True) 
    rating = Column(Float)
    review_text = Column(Text)
    user_id = Column(Integer, ForeignKey("users.id"))

    owner = relationship("User", back_populates="reviews")