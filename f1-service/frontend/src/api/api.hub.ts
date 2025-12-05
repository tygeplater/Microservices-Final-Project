import { authService } from '../auth/auth';

// Helper function to get headers with auth token
function getHeaders(): HeadersInit {
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
    };
    const authHeader = authService.getAuthHeader();
    return { ...headers, ...authHeader };
}

// Fetch the Schedule for a Given Year
export async function fetchSchedule(year: number): Promise<any> {
    // TODO: Update the URL to switch between local and deployed backend api
    const response = await fetch(`http://localhost:8000/api/schedule?year=${year}`, {
        headers: getHeaders(),
    });
    if (!response.ok) {
        if (response.status === 401) {
            authService.removeToken();
            throw new Error('Authentication required. Please log in.');
        }
        throw new Error(`Error fetching schedule for year ${year}: ${response.statusText}`);
    } else {
        const schedule = (await response.json()).schedule;
        return schedule;
    }
}

// Fetch Weekend Results for a Given Year and Round
export async function fetchWeekendResults(year: number, round: number | string): Promise<any> {
    const response = await fetch(`http://localhost:8000/api/weekend-results?year=${year}&round=${round}`, {
        headers: getHeaders(),
    });
    if (!response.ok) {
        if (response.status === 401) {
            authService.removeToken();
            throw new Error('Authentication required. Please log in.');
        }
        throw new Error(`Error fetching weekend results for year ${year}, round ${round}: ${response.statusText}`);
    } else {
        const data = await response.json();
        return data.standings;
    }
}

// Fetch Session Info
export async function fetchSessionInfo(year: number, round: number | string, sessionCd: string): Promise<any> {
    const response = await fetch(`http://localhost:8000/api/session-info?year=${year}&round=${round}&sessionCd=${sessionCd}`, {
        headers: getHeaders(),
    });
    if (!response.ok) {
        if (response.status === 401) {
            authService.removeToken();
            throw new Error('Authentication required. Please log in.');
        }
        throw new Error(`Error fetching session info: ${response.statusText}`);
    } else {
        const data = await response.json();
        return data.session;
    }
}