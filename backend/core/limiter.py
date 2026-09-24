# backend/core/limiter.py
from slowapi import Limiter
from slowapi.util import get_remote_address

# Shared rate limiter instance for API endpoints
limiter = Limiter(key_func=get_remote_address)
