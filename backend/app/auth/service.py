from app.auth.schemas import LoginRequest, TokenResponse
from app.core.config import settings
from app.core.security import create_access_token


def login_admin(credentials: LoginRequest) -> TokenResponse | None:
    if (
        credentials.username != settings.admin_username
        or credentials.password != settings.admin_password
    ):
        return None

    return TokenResponse(access_token=create_access_token(subject=settings.admin_username))
