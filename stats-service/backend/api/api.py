from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict
import uvicorn

app = FastAPI(title="Stats Service API", version="1.0.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3001", "http://127.0.0.1:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Models
class Statistics(BaseModel):
    metric: str
    value: float
    unit: str


class StatsResponse(BaseModel):
    message: str
    stats: List[Statistics]


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


@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "stats-service"}


if __name__ == "__main__":
    uvicorn.run("api:app", host="0.0.0.0", port=8001, reload=True)
