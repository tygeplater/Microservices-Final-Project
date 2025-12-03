import pandas as pd
import fastf1

def aggregate_weekend(year: int, round: int) -> pd.DataFrame:
    """Sum the total points gained by each driver over a race weekend"""

    # Get the schedule and find the event by round number
    schedule = fastf1.get_event_schedule(year)
    
    # Ensure both sides are the same type for comparison
    event_row = schedule[schedule['RoundNumber'] == int(round)]
    
    if event_row.empty:
        return pd.DataFrame()
    
    eventName = event_row.iloc[0]['EventName']
    
    points_sessions = ['S', 'SS', 'SQ', 'R']
    weekend_data = []

    for session_id in points_sessions:
        try:
            session = fastf1.get_session(year, eventName, session_id)
            session.load(laps=False, telemetry=False, weather=False, messages=False, livedata=False)
            results = session.results
            weekend_data.append(results)
        except Exception as e:
            print(f"Could not load session {session_id}: {e}")

    if not weekend_data:
        return pd.DataFrame()  # Return empty DataFrame if no data

    # Combine all session data
    all_data = pd.concat(weekend_data)
    
    # Only sum the Points column, keep first value for driver info
    aggregated = all_data.groupby('DriverId', as_index=False).agg({
        'Points': 'sum',
        'DriverNumber': 'first',
        'BroadcastName': 'first',
        'Abbreviation': 'first',
        'TeamName': 'first',
        'TeamColor': 'first',
        'TeamId': 'first',
        'FirstName': 'first',
        'LastName': 'first',
        'FullName': 'first',
        'HeadshotUrl': 'first',
        'CountryCode': 'first'
    })
    
    aggregated = aggregated.sort_values(by='Points', ascending=False).reset_index(drop=True)

    return aggregated