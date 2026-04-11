from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from jose import JWTError, jwt

from database import get_db
import models
import auth as auth_utils

oauth2_scheme          = OAuth2PasswordBearer(tokenUrl="login")
oauth2_scheme_optional = OAuth2PasswordBearer(tokenUrl="login", auto_error=False)


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> models.User:
    exc = HTTPException(
        status_code=401,
        detail="Token inválido o expirado",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, auth_utils.SECRET_KEY, algorithms=[auth_utils.ALGORITHM])
        email = payload.get("sub")
        if not email:
            raise exc
    except JWTError:
        raise exc
    user = db.query(models.User).filter(models.User.email == email).first()
    if not user:
        raise exc
    return user


def get_optional_user(
    token: str = Depends(oauth2_scheme_optional),
    db: Session = Depends(get_db),
):
    if not token:
        return None
    try:
        payload = jwt.decode(token, auth_utils.SECRET_KEY, algorithms=[auth_utils.ALGORITHM])
        email = payload.get("sub")
        if not email:
            return None
        return db.query(models.User).filter(models.User.email == email).first()
    except Exception:
        return None