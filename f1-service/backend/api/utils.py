from fastapi import Request
import time
from .kafka_producer import kafka_producer
import pandas as pd
import fastf1

async def usage_tracking_middleware(request: Request, call_next):
    """Middleware to track API usage and send to Kafka"""
    start_time = time.time()
    
    response = await call_next(request)
    
    response_time = (time.time() - start_time) * 1000
    query_params = dict(request.query_params)
    
    kafka_producer.send_usage_event(
        endpoint=request.url.path,
        method=request.method,
        status_code=response.status_code,
        response_time=response_time,
        user_agent=request.headers.get('user-agent'),
        query_params=query_params
    )
    
    return response

def aggregate_weekend(year: int, round: int) -> pd.DataFrame:
    """Sum the total points gained by each driver over a race weekend"""

    schedule = fastf1.get_event_schedule(year)
    event_row = schedule[schedule['RoundNumber'] == int(round)]
    
    if event_row.empty:
        return pd.DataFrame()
    
    eventName = event_row.iloc[0]['EventName']
    
    sprint_sessions = ['S', 'SS', 'SQ']
    weekend_data_df = pd.DataFrame()

    session = fastf1.get_session(year, eventName, 'R')
    session.load(laps=False, telemetry=False, weather=False, messages=False, livedata=False)
    results = session.results
    weekend_data_df = results.copy()

    for session_id in sprint_sessions:
        try:
            session = fastf1.get_session(year, eventName, session_id)
            session.load(laps=False, telemetry=False, weather=False, messages=False, livedata=False)
            sprint_results = session.results
            
            for idx, sprint_row in sprint_results.iterrows():
                driver_id = sprint_row['DriverId']
                sprint_points = sprint_row['Points']
                
                driver_mask = weekend_data_df['DriverId'] == driver_id
                if driver_mask.any():
                    weekend_data_df.loc[driver_mask, 'Points'] += sprint_points
                    
        except Exception as e:
            print(f"Could not load session {session_id}: {e}")

    if weekend_data_df.empty:
        return pd.DataFrame()

    weekend_data_df = weekend_data_df.sort_values(by='Points', ascending=False).reset_index(drop=True)

    return weekend_data_df