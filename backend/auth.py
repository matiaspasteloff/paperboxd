import os
from datetime import datetime, timedelta
from jose import jwt
from passlib.context import CryptContext
from dotenv import load_dotenv

load_dotenv()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

SECRET_KEY = os.getenv("SECRET_KEY", "clave_de_respaldo_por_las_dudas")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

def verify_password(plain_password, hashed_password):
    """Compara la contraseña en texto plano con la encriptada en la BD."""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    """Encripta la contraseña para guardarla en la BD."""
    return pwd_context.hash(password)

def create_access_token(data: dict):
    """Genera el Token JWT que el frontend usará como llave."""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt