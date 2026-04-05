from fastapi_users.authentication import JWTStrategy, AuthenticationBackend, BearerTransport
from src.config.settings import settings

SECRET = settings.secret_key

bearer_transport = BearerTransport(tokenUrl="auth/jwt/login")

def get_jwt_strategy() -> JWTStrategy:
    return JWTStrategy(secret=SECRET, lifetime_seconds=3600*24) # 24h

auth_backend = AuthenticationBackend(
    name="jwt",
    transport=bearer_transport,
    get_strategy=get_jwt_strategy,
)
