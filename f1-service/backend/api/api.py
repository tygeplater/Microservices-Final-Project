from fastapi import FastAPI, HTTPException
from fastapi.concurrency import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware
from .models import ScheduleResponse, SessionResponse, StandingsResponse
import uvicorn
import fastf1
import json
import time
from .utils import aggregate_weekend, usage_tracking_middleware
from .kafka_producer import kafka_producer

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("F1 Service starting up...")
    kafka_producer.__init__()

    yield
    # Shutdown
    print("F1 Service shutting down...")
    kafka_producer.close()

app = FastAPI(title="F1 Service API", version="0.1", lifespan=lifespan)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:3001", "http://127.0.0.1:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.middleware("http")(usage_tracking_middleware)
app.middleware("https")(usage_tracking_middleware)

# Routes

@app.get("/api/session-info")
async def get_session_info(year: int, round: int | str, sessionCd: str):

    try:
        start = time.perf_counter()
        # Get session info
        session = fastf1.get_session(year, round, sessionCd)

        # Minimize Data Sent
        session.load(telemetry=False, weather=False, messages=False, livedata=False)
        results = session.results
        session_json = results.to_json(orient='records', date_format='iso')
        session_data = json.loads(session_json)

        end = time.perf_counter()

        response_time = (end - start) * 1000  # In milliseconds

        kafka_producer.send_usage_event(
            endpoint="/api/session-info",
            method="GET",
            status_code=200,
            response_time=response_time,
            user_agent=None,
            query_params={"year": year, "round": round, "sessionCd": sessionCd}
        )

        return SessionResponse(status=200, session=session_data)

    except Exception as e:

        kafka_producer.send_usage_event(
            endpoint="/api/session-info",
            method="GET",
            status_code=500,
            response_time=-1,
            user_agent=None,
            query_params={"year": year, "round": round, "sessionCd": sessionCd}
        )

        raise HTTPException(status_code=500, detail=f"Error retrieving session info: {e}")
    

@app.get("/api/weekend-results")
async def get_weekend_results(year: int, round: int | str):
    """Get F1 weekend results for a specific year and round"""
    try:
        start = time.perf_counter()

        result = aggregate_weekend(year, round)
        weekend_json = result.to_json(orient='records', date_format='iso')
        weekend_data = json.loads(weekend_json)

        end = time.perf_counter()
        response_time = (end - start) * 1000  # In milliseconds

        kafka_producer.send_usage_event(
            endpoint="/api/weekend-results",
            method="GET",
            status_code=200,
            response_time=response_time,
            user_agent=None,
            query_params={"year": year, "round": round}
        )

        return StandingsResponse(status=200, standings=weekend_data)
    
    except Exception as e:

        kafka_producer.send_usage_event(
            endpoint="/api/session-info",
            method="GET",
            status_code=500,
            response_time=-1,
            user_agent=None,
            query_params={"year": year, "round": round}
        )

        raise HTTPException(status_code=500, detail=f"Error retrieving weekend results: {e}")


@app.get("/api/schedule")
async def get_schedule(year: int):
    """Get F1 schedule for a specific year"""
    try:
        start = time.perf_counter()

        schedule = fastf1.get_event_schedule(year)
        schedule_json = schedule.to_json(orient='records', date_format='iso')
        schedule_data = json.loads(schedule_json)

        end = time.perf_counter()
        response_time = (end - start) * 1000  # In milliseconds

        kafka_producer.send_usage_event(
            endpoint="/api/schedule",
            method="GET",
            status_code=200,
            response_time=response_time,
            user_agent=None,
            query_params={"year": year}
        )

        return ScheduleResponse(status=200, schedule=schedule_data)
    
    except Exception as e:

        kafka_producer.send_usage_event(
            endpoint="/api/schedule",
            method="GET",
            status_code=500,
            response_time=-1,
            user_agent=None,
            query_params={"year": year}
        )

        raise HTTPException(status_code=500, detail=f"Error retrieving schedule: {e}")

@app.get("/health")
async def health_check():

    kafka_producer.send_usage_event(
        endpoint="/api/health",
        method="GET",
        status_code=200,
        response_time=0,
        user_agent=None,
        query_params=None
    )

    return {"status": 200, "message": "f1-service is healthy"}

if __name__ == "__main__":
    uvicorn.run("api:app", host="0.0.0.0", port=8000, reload=True)
