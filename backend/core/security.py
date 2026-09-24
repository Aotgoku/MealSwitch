# backend/core/security.py
#
# Handles password hashing (bcrypt), JWT token creation, and token decoding.

import os
import sys
from datetime import datetime, timedelta, timezone
from typing import Optional, Any
import bcrypt
import jwt

# Fail loudly at startup if JWT_SECRET_KEY is not set.
# A missing secret key must NEVER silently fall back to a hardcoded value —
# that would allow anyone with source code access to forge valid tokens.
SECRET_KEY = os.getenv("JWT_SECRET_KEY")
if not SECRET_KEY:
    sys.exit(
        "FATAL: JWT_SECRET_KEY environment variable is not set. "
        "Add it to your .env file before starting the server. "
        "Example: JWT_SECRET_KEY=<generate with: python -c \"import secrets; print(secrets.token_hex(32))\">"
    )

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days


def hash_password(password: str) -> str:
    """Hash a plain-text password with bcrypt."""
    pwd_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(pwd_bytes, salt)
    return hashed.decode('utf-8')


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Return True if plain_password matches the stored bcrypt hash."""
    try:
        return bcrypt.checkpw(
            plain_password.encode('utf-8'),
            hashed_password.encode('utf-8')
        )
    except Exception:
        return False


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create a signed JWT access token from the provided payload dict."""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (
        expires_delta if expires_delta else timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def decode_access_token(token: str) -> Optional[dict]:
    """Verify the JWT and return its payload dict, or None if invalid/expired."""
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except jwt.PyJWTError:
        return None
