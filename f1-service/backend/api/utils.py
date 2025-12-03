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
    
    sprint_sessions = ['S', 'SS', 'SQ']
    weekend_data_df = pd.DataFrame()

    # Load race results first
    session = fastf1.get_session(year, eventName, 'R')
    session.load(laps=False, telemetry=False, weather=False, messages=False, livedata=False)
    results = session.results
    weekend_data_df = results.copy()

    # Load sprint sessions and add points to existing drivers
    for session_id in sprint_sessions:
        try:
            session = fastf1.get_session(year, eventName, session_id)
            session.load(laps=False, telemetry=False, weather=False, messages=False, livedata=False)
            sprint_results = session.results
            
            # Add sprint points to the corresponding drivers in weekend_data_df
            for idx, sprint_row in sprint_results.iterrows():
                driver_id = sprint_row['DriverId']
                sprint_points = sprint_row['Points']
                
                # Find the driver in weekend_data_df and add points
                driver_mask = weekend_data_df['DriverId'] == driver_id
                if driver_mask.any():
                    weekend_data_df.loc[driver_mask, 'Points'] += sprint_points
                    
        except Exception as e:
            print(f"Could not load session {session_id}: {e}")

    if weekend_data_df.empty:
        return pd.DataFrame()  # Return empty DataFrame if no data

    # Sort by points descending
    weekend_data_df = weekend_data_df.sort_values(by='Points', ascending=False).reset_index(drop=True)

    return weekend_data_df