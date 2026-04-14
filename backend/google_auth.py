"""
Google OAuth via ID Token verification.
The frontend uses Google Identity Services (One Tap / popup),
gets an id_token, and sends it here for verification.

Required env vars:
  GOOGLE_CLIENT_ID  – tu OAuth 2.0 client ID de Google Cloud Console

Steps to get GOOGLE_CLIENT_ID:
  1. console.cloud.google.com → APIs & Services → Credentials
  2. Create OAuth 2.0 Client ID (Web application)
  3. Add your frontend URL to Authorized JavaScript origins
  4. Copy the Client ID (ends in .apps.googleusercontent.com)
"""

import os
import httpx
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database import get_db
import models
import auth as auth_utils

router = APIRouter()

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "")


async def verify_google_token(token: str) -> dict:
    """Verify Google ID token via Google's tokeninfo endpoint."""
    async with httpx.AsyncClient(timeout=10) as client:
        r = await client.get(
            "https://oauth2.googleapis.com/tokeninfo",
            params={"id_token": token}
        )
        if r.status_code != 200:
            raise HTTPException(401, "Token de Google inválido")
        data = r.json()

    # Verify it's for our app
    if GOOGLE_CLIENT_ID and data.get("aud") != GOOGLE_CLIENT_ID:
        raise HTTPException(401, "Token no corresponde a esta aplicación")

    if data.get("email_verified") != "true":
        raise HTTPException(401, "Email de Google no verificado")

    return data


class GoogleLoginRequest(BaseModel):
    id_token: str


@router.post("/auth/google")
async def google_login(body: GoogleLoginRequest, db: Session = Depends(get_db)):
    """
    Verify Google ID token, create or find user, return our JWT.
    """
    payload = await verify_google_token(body.id_token)

    email    = payload.get("email", "").lower().strip()
    name     = payload.get("name", "")
    picture  = payload.get("picture", "")
    given    = payload.get("given_name", "")

    if not email:
        raise HTTPException(400, "No se pudo obtener el email de Google")

    # Find or create user
    user = db.query(models.User).filter(models.User.email == email).first()

    if not user:
        # Generate a unique username from the email or name
        base_username = (given or email.split("@")[0]).lower()
        base_username = "".join(c for c in base_username if c.isalnum() or c == "_")[:30]
        username = base_username
        counter = 1
        while db.query(models.User).filter(models.User.username == username).first():
            username = f"{base_username}{counter}"
            counter += 1

        user = models.User(
            username=username,
            email=email,
            hashed_password=auth_utils.get_password_hash(os.urandom(32).hex()),
            is_verified=True,  # Google already verified the email
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    # Always mark as verified since Google verified it
    if not user.is_verified:
        user.is_verified = True
        db.commit()

    access_token = auth_utils.create_access_token({"sub": user.email})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "username": user.username,
        "is_new_user": True,
    }