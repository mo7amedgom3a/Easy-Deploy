from datetime import datetime, timedelta
from jose import jwt
from config.settings import settings

def create_access_token(data: dict):
    expire = datetime.utcnow() + timedelta(days=30)
    to_encode = data.copy()
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
def decode_access_token(token: str):
    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        return payload
    except jwt.JWTError:
        return None
def verify_access_token(token: str):
    try:
        payload = decode_access_token(token)
        if payload is None:
            return False
        return True
    except jwt.JWTError:
        return False
def get_current_user(token: str):
    try:
        payload = decode_access_token(token)
        if payload is None:
            return None
        return payload
    except jwt.JWTError:
        return None
def get_current_user_id(token: str):
    try:
        payload = decode_access_token(token)
        if payload is None:
            return None
        return payload.get("sub")
    except jwt.JWTError:
        return None