from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from config.settings import settings
from dependencies.services import get_user_service, UserService
from services.jwt import decode_access_token
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

async def get_current_user(
    token: str = Depends(oauth2_scheme),
    user_service: UserService = Depends(get_user_service)
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    github_id = None
    try:
        payload = decode_access_token(token)
        github_id = payload.get("sub")
        if github_id is None:
            raise credentials_exception
        if github_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = await user_service.get_user_by_github_id(github_id)
    
    if user is None:
        raise credentials_exception
    user.access_token = payload.get("access_key")
    return user

async def get_access_key_from_token_payload(token: str ) -> str:
    """
    Extract the access key from the JWT token payload.
    """
    try:
        # get the current token 
        
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        access_key = payload.get("access_key")
        if access_key is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return access_key
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    




