import { authService } from '../auth/auth';

// Get base path from environment variable, default to empty string for local dev
const basePath = import.meta.env.VITE_BASE_PATH || '';

export async function getUsageData(){
    try {
      const headers = {
        ...authService.getAuthHeader(),
        'Content-Type': 'application/json',
      };

      // Fetch all usage data in parallel
      const [summaryRes, endpointRes, recentRes] = await Promise.all([
        fetch(`${basePath}/api/usage/summary`, { headers }),
        fetch(`${basePath}/api/usage/by-endpoint`, { headers }),
        fetch(`${basePath}/api/usage/recent?limit=50`, { headers }),
      ]);

      if (!summaryRes.ok || !endpointRes.ok || !recentRes.ok) {
        if (summaryRes.status === 403 || endpointRes.status === 403 || recentRes.status === 403) {
          throw new Error('Access denied. Admin privileges required.');
        }
        throw new Error('Failed to fetch usage data');
      }

      const [summaryData, endpointData, recentData] = await Promise.all([
        summaryRes.json(),
        endpointRes.json(),
        recentRes.json(),
      ]);

      return { summaryData, endpointData, recentData };
    } catch (err) {
      throw new Error('Failed to fetch usage data');
    }
}