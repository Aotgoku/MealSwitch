# backend/core/database.py
"""
Database session management and engine configuration for PostgreSQL.
Uses SQLAlchemy 2.0 declarative base and session factory with connection pooling.
"""

import os
import logging
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv

logger = logging.getLogger(__name__)

base_dir = os.path.dirname(os.path.abspath(__file__))
dotenv_path = os.path.join(base_dir, '..', '.env')
load_dotenv(dotenv_path=dotenv_path)

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("DATABASE_URL environment variable is not set. Check your .env file.")

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    echo=False
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()


def get_db():
    """FastAPI dependency for yielding database sessions per request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def test_db_connection() -> bool:
    """Verifies that the database engine can successfully connect and execute queries."""
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
            logger.info("PostgreSQL database connection verified.")
            return True
    except Exception as e:
        logger.error(f"Database connection error: {e}")
        return False
