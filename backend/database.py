import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

load_dotenv()

# Use Postgres/remote DB if provided, else fallback to local SQLite
DATABASE_URL = os.getenv("DATABASE_URL")

# Check if we are running on Vercel or locally
IS_VERCEL = os.getenv("VERCEL") == "1"

if not DATABASE_URL:
    if IS_VERCEL:
        # Use /tmp on Vercel because the root directory is read-only
        DATABASE_URL = "sqlite:////tmp/cv_screening.db"
        print("CRITICAL WARNING: No DATABASE_URL provided. Using transient SQLite in /tmp.")
        print("Data WILL NOT persist between requests or deployments.")
    else:
        # Local development
        DATABASE_URL = "sqlite:///./cv_screening.db"
        print("WARNING: Using local SQLite database.")

# If using PostgreSQL via SQLAlchemy 2.0+, 'postgres://' must be 'postgresql://'
if DATABASE_URL and DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# Configuration for different database engines
connect_args = {}
if DATABASE_URL and DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}
elif DATABASE_URL and ("postgresql" in DATABASE_URL or "postgres" in DATABASE_URL):
    # Ensure SSL is used for managed databases like Neon/Supabase
    # Some providers require 'sslmode=require' in the URL, but we can also set it here
    connect_args = {
        "sslmode": "require",
        "connect_timeout": 10
    }

# For serverless (Vercel), we want to avoid connection exhaustion.
# We'll use a small pool size or null pool if needed, but 
# SQLAlchemy's QueuePool with a small size is usually okay for low traffic.
engine = create_engine(
    DATABASE_URL,
    connect_args=connect_args,
    pool_pre_ping=True,
    pool_recycle=300,
    pool_size=5,
    max_overflow=10
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

