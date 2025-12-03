from fastapi import FastAPI, HTTPException
from fastapi.concurrency import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from models import Statistics, StatsResponse
import uvicorn
from kafka_consumer import kafka_consumer
from database import get_db, APIUsage, init_db
from sqlalchemy.orm import Session
from fastapi import Depends
from datetime import datetime, timedelta
from sqlalchemy import func

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("Stats Service starting up...")
    init_db()
    kafka_consumer.start()
    yield
    # Shutdown
    print("Stats Service shutting down...")
    kafka_consumer.stop()

app = FastAPI(title="Stats Service API", version="1.0.0", lifespan=lifespan)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3001", "http://127.0.0.1:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Sample data
sample_stats = [
    Statistics(metric="Average Speed", value=215.5, unit="km/h"),
    Statistics(metric="Top Speed", value=352.0, unit="km/h"),
    Statistics(metric="Lap Time", value=78.5, unit="seconds"),
    Statistics(metric="Pit Stop Time", value=2.1, unit="seconds"),
]

# Routes
@app.get("/")
async def root():
    return {"message": "Stats Service API", "status": "running"}


@app.get("/api/stats", response_model=StatsResponse)
async def get_stats():
    """Get statistics data"""
    return StatsResponse(
        message="Statistics retrieved successfully",
        stats=sample_stats
    )


@app.get("/api/stats/{metric}")
async def get_stat_by_metric(metric: str):
    """Get specific statistic by metric name"""
    for stat in sample_stats:
        if stat.metric.lower().replace(" ", "-") == metric.lower():
            return stat
    raise HTTPException(status_code=404, detail="Metric not found")


@app.get("/api/stats/summary")
async def get_stats_summary():
    """Get summary of all statistics"""
    return {
        "total_metrics": len(sample_stats),
        "metrics": [stat.metric for stat in sample_stats]
    }

@app.get("/api/usage/summary")
async def get_usage_summary(db: Session = Depends(get_db)):
    """Get summary of API usage"""
    total_requests = db.query(func.count(APIUsage.id)).scalar()
    avg_response_time = db.query(func.avg(APIUsage.response_time_ms)).scalar()
    
    return {
        "total_requests": total_requests,
        "average_response_time_ms": round(avg_response_time, 2) if avg_response_time else 0
    }

@app.get("/api/usage/by-endpoint")
async def get_usage_by_endpoint(db: Session = Depends(get_db)):
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
async def get_recent_usage(limit: int = 100, db: Session = Depends(get_db)):
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
