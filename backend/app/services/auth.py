from datetime import datetime, timedelta, timezone
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import (
    create_access_token,
    generate_refresh_token,
    hash_password,
    hash_token,
    verify_password,
    verify_token_hash,
)
from app.models.auth_token import AuthToken
from app.models.user import User

REFRESH_TOKEN_TYPE = "refresh"


def register_user(db: Session, email: str, password: str, full_name: str) -> User:
    existing_user = db.scalar(select(User).where(User.email == email))
    if existing_user is not None:
        raise ValueError("User with this email already exists")

    user = User(
        email=email,
        password_hash=hash_password(password),
        full_name=full_name,
        is_active=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def authenticate_user(db: Session, email: str, password: str) -> User | None:
    user = db.scalar(select(User).where(User.email == email))
    if user is None or not verify_password(password, user.password_hash):
        return None
    return user


def create_auth_tokens(db: Session, user: User) -> tuple[str, str]:
    access_token = create_access_token(user.id)
    refresh_token = _issue_refresh_token(db, user.id)
    return access_token, refresh_token


def refresh_auth_tokens(db: Session, refresh_token: str) -> tuple[str, str, User]:
    token_record = _find_valid_refresh_token(db, refresh_token)
    if token_record is None:
        raise ValueError("Invalid or expired refresh token")

    token_record.revoked_at = datetime.now(timezone.utc)
    db.add(token_record)

    user = db.get(User, token_record.user_id)
    if user is None or not user.is_active:
        raise ValueError("User not found or inactive")

    access_token = create_access_token(user.id)
    new_refresh_token = _issue_refresh_token(db, user.id)
    db.commit()
    return access_token, new_refresh_token, user


def revoke_refresh_token(db: Session, refresh_token: str) -> None:
    token_record = _find_valid_refresh_token(db, refresh_token)
    if token_record is None:
        return

    token_record.revoked_at = datetime.now(timezone.utc)
    db.add(token_record)
    db.commit()


def _issue_refresh_token(db: Session, user_id: UUID) -> str:
    refresh_token = generate_refresh_token()
    token_record = AuthToken(
        user_id=user_id,
        token_hash=hash_token(refresh_token),
        token_type=REFRESH_TOKEN_TYPE,
        expires_at=datetime.now(timezone.utc)
        + timedelta(days=settings.jwt_refresh_token_expire_days),
    )
    db.add(token_record)
    return refresh_token


def _find_valid_refresh_token(db: Session, refresh_token: str) -> AuthToken | None:
    now = datetime.now(timezone.utc)
    tokens = db.scalars(
        select(AuthToken).where(
            AuthToken.token_type == REFRESH_TOKEN_TYPE,
            AuthToken.revoked_at.is_(None),
            AuthToken.expires_at > now,
        )
    ).all()

    for token in tokens:
        if verify_token_hash(refresh_token, token.token_hash):
            return token

    return None
