from fastapi import FastAPI, HTTPException, Depends
from fastapi.concurrency import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware
from .models import Role, UserRegister, UserLogin, Token, UserResponse
from .auth import get_current_user, require_role, get_password_hash, verify_password, create_access_token
import uvicorn
import os
from .kafka_consumer import kafka_consumer
from .database import get_db, APIUsage, init_db, User
from sqlalchemy.orm import Session
from sqlalchemy import func

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("Stats Service starting up...")
    init_db()

    # Create admin user from environment variables if configured
    admin_username = os.getenv("ADMIN_USERNAME")
    admin_password = os.getenv("ADMIN_PASSWORD")
    
    if admin_username and admin_password:
        db_gen = get_db()
        db = next(db_gen)
        try:
            admin_user = db.query(User).filter(User.username == admin_username).first()
            if not admin_user:
                admin_user = User(
                    username=admin_username,
                    hashed_password=get_password_hash(admin_password),
                    role=Role.ADMIN
                )
                db.add(admin_user)
                db.commit()
                print(f"Admin user created from environment variables")
            else:
                print(f"Admin user already exists")
        finally:
            db.close()
    else:
        print("Skipping admin user creation.")
    
    kafka_consumer.start()
    yield

    # Shutdown
    print("Stats Service shutting down...")
    kafka_consumer.stop()

app = FastAPI(title="Stats Service API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True, 
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
@app.get("/")
async def root():
    return {"message": "Stats Service API", "status": "running"}

# Authentication endpoints
@app.post("/api/auth/register", response_model=UserResponse)
async def register(user_data: UserRegister, db: Session = Depends(get_db)):
    """Register a new user"""
    # Check if user already exists
    existing_user = db.query(User).filter(User.username == user_data.username).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    
    # Create new user (all registered users are regular users by default)
    hashed_password = get_password_hash(user_data.password)
    new_user = User(
        username=user_data.username,
        hashed_password=hashed_password,
        role=Role.USER
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return UserResponse(
        id=new_user.id,
        username=new_user.username,
        role=new_user.role
    )

@app.post("/api/auth/login", response_model=Token)
async def login(user_data: UserLogin, db: Session = Depends(get_db)):
    """Login and get JWT token"""
    user = db.query(User).filter(User.username == user_data.username).first()
    if not user or not verify_password(user_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect username or password")
    
    access_token = create_access_token(
        data={"sub": user.username, "role": user.role.value}
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/api/auth/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Get current user information"""
    return UserResponse(
        id=current_user.id,
        username=current_user.username,
        role=current_user.role
    )

# Stats Endpoints
@app.get("/api/usage/summary")
async def get_usage_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([Role.ADMIN]))
):
    """Get summary of API usage"""
    total_requests = db.query(func.count(APIUsage.id)).scalar()
    avg_response_time = db.query(func.avg(APIUsage.response_time_ms)).scalar()
    
    return {
        "total_requests": total_requests,
        "average_response_time_ms": round(avg_response_time, 2) if avg_response_time else 0
    }

@app.get("/api/usage/by-endpoint")
async def get_usage_by_endpoint(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([Role.ADMIN]))
):
    """Get usage statistics grouped by endpoint"""
    results = db.query(
        APIUsage.endpoint,
        func.count(APIUsage.id).label('count'),
        func.avg(APIUsage.response_time_ms).label('avg_response_time')
    ).group_by(APIUsage.endpoint).all()
    
    return [
        {
            "endpoint": r.endpoint,
            "request_count": r.count,
            "avg_response_time_ms": round(r.avg_response_time, 2)
        }
        for r in results
    ]

@app.get("/api/usage/recent")
async def get_recent_usage(
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([Role.ADMIN]))
):
    """Get recent API usage events"""
    usages = db.query(APIUsage).order_by(APIUsage.timestamp.desc()).limit(limit).all()
    
    return [
        {
            "service": u.service,
            "endpoint": u.endpoint,
            "method": u.method,
            "status_code": u.status_code,
            "response_time_ms": u.response_time_ms,
            "timestamp": u.timestamp.isoformat()
        }
        for u in usages
    ]

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "stats-service"}


if __name__ == "__main__":
    uvicorn.run("api:app", host="0.0.0.0", port=8001, reload=True)
