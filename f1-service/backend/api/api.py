from fastapi import FastAPI
from fastapi.concurrency import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware
from models import ScheduleResponse, SessionResponse, StandingsResponse
import uvicorn
import fastf1
import json
from utils import aggregate_weekend, usage_tracking_middleware
from kafka_producer import kafka_producer

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("F1 Service starting up...")
    yield
    # Shutdown
    print("F1 Service shutting down...")
    kafka_producer.close()

app = FastAPI(title="F1 Service API", version="0.1", lifespan=lifespan)

app.middleware("http")(usage_tracking_middleware)
app.middleware("https")(usage_tracking_middleware)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
@app.get("/")
async def root():
    return {"message": "F1 Service API", "status": "running"}

@app.get("/api/session-info")
async def get_session_info(year: int, round: int | str, sessionCd: str):
    # Get session info
    session = fastf1.get_session(year, round, sessionCd)

    # Minimize Data Sent
    session.load(telemetry=False, weather=False, messages=False, livedata=False)
    results = session.results
    session_json = results.to_json(orient='records', date_format='iso')
    session_data = json.loads(session_json)
    return SessionResponse(status=200, session=session_data)

@app.get("/api/weekend-results")
async def get_weekend_results(year: int, round: int | str):
    """Get F1 weekend results for a specific year and round"""
    result = aggregate_weekend(year, round)
    weekend_json = result.to_json(orient='records', date_format='iso')
    weekend_data = json.loads(weekend_json)
    return StandingsResponse(status=200, standings=weekend_data)


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
