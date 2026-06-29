from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status

from app.auth.schemas import AdminUser, LoginRequest, TokenResponse
from app.auth.service import login_admin
from app.core.security import require_admin

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=TokenResponse)
def login(credentials: LoginRequest) -> TokenResponse:
    token = login_admin(credentials)
    if token is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return token


@router.get("/me", response_model=AdminUser)
def me(current_user: Annotated[AdminUser, Depends(require_admin)]) -> AdminUser:
    return current_user
