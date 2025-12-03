
// Fetch the Schedule for a Given Year
export async function fetchSchedule(year: number): Promise<any> {

    // TODO: Update the URL to switch between local and deployed backend api
    const response = await fetch(`http://localhost:8000/api/schedule?year=${year}`);
    if (!response.ok) {
        throw new Error(`Error fetching schedule for year ${year}: ${response.statusText}`);
    } else {
        const schedule = (await response.json()).schedule;
        return schedule;
    }
}

// Fetch Weekend Results for a Given Year and Round
export async function fetchWeekendResults(year: number, round: number | string): Promise<any> {
    const response = await fetch(`http://localhost:8000/api/weekend-results?year=${year}&round=${round}`);
    if (!response.ok) {
        throw new Error(`Error fetching weekend results for year ${year}, round ${round}: ${response.statusText}`);
    } else {
        const data = await response.json();
        return data.standings;
    }
}