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
    # Strictly for local development only
    DATABASE_URL = "sqlite:///./cv_screening.db"
    print("WARNING: Using SQLite. Data will not persist on Vercel.")

# If using PostgreSQL via SQLAlchemy 2.0+, 'postgres://' must be 'postgresql://'
if DATABASE_URL and DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# Configuration for different database engines
connect_args = {}
if DATABASE_URL and DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}
elif DATABASE_URL and "postgresql" in DATABASE_URL:
    # Ensure optimal connection settings for cloud databases
    connect_args = {
        "sslmode": "prefer"
    }

engine = create_engine(
    DATABASE_URL,
    connect_args=connect_args,
    pool_pre_ping=True,
    pool_recycle=300
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

