from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from models import F1Data, F1Response, ScheduleResponse
from typing import List, Optional
import uvicorn
import fastf1
import pandas as pd
import json

app = FastAPI(title="F1 Service API", version="0.1")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Sample data
sample_data = [
    F1Data(id=1, name="Lewis Hamilton", description="7-time World Champion"),
    F1Data(id=2, name="Max Verstappen", description="3-time World Champion"),
    F1Data(id=3, name="Fernando Alonso", description="2-time World Champion"),
]


# Routes
@app.get("/")
async def root():
    return {"message": "F1 Service API", "status": "running"}


@app.get("/api/data", response_model=F1Response)
async def get_data():
    """Get F1 data"""
    return F1Response(
        message="F1 data retrieved successfully",
        data=sample_data
    )


@app.get("/api/data/{item_id}", response_model=F1Data)
async def get_data_by_id(item_id: int):
    """Get F1 data by ID"""
    for item in sample_data:
        if item.id == item_id:
            return item
    raise HTTPException(status_code=404, detail="Item not found")

@app.get("/api/session-info")
async def get_session_info():
    # Get 
    return {"message": "Session information retrieved successfully"}

@app.get("/api/schedule")
async def get_schedule(year: int):
    """Get F1 schedule for a specific year"""

    schedule = fastf1.get_event_schedule(year)
    schedule_json = schedule.to_json(orient='records', date_format='iso')
    schedule_data = json.loads(schedule_json)
    return ScheduleResponse(status=200, schedule=schedule_data)

@app.get("/health")
async def health_check():
    return {"status": 200, "message": "f1-service is healthy"}


if __name__ == "__main__":
    uvicorn.run("api:app", host="0.0.0.0", port=8000, reload=True)
