
// Fetch the Schedule for a Given Year
export async function fetchSchedule(year: number): Promise<any> {
    const response = await fetch(`/api/schedule/${year}`);
    if (!response.ok) {
        throw new Error(`Error fetching schedule for year ${year}: ${response.statusText}`);
    } else {
        const schedule = (await response.json()).schedule;
        console.log(`Fetched schedule for year ${year}:`, schedule);
        return schedule;
    }
}