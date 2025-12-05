from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, JSON, Enum
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
import os
from .models import Role
DATABASE_URL = os.getenv('DATABASE_URL', 'postgresql://user:password@localhost:5432/stats_db')

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def init_db():
    Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class APIUsage(Base):
    __tablename__ = "api_usage"

    id = Column(Integer, primary_key=True, index=True)
    service = Column(String, index=True)
    endpoint = Column(String, index=True)
    method = Column(String)
    status_code = Column(Integer)
    response_time_ms = Column(Float)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    user_agent = Column(String, nullable=True)
    query_params = Column(JSON, nullable=True)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    role = Column(Enum(Role), default=Role.USER)