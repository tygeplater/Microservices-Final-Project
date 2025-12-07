import { authService } from '../auth/auth';

export async function getUsageData(){
    try {
      const headers = {
        ...authService.getAuthHeader(),
        'Content-Type': 'application/json',
      };

      const [summaryRes, endpointRes, recentRes] = await Promise.all([
        fetch('/stats-service/api/usage/summary', { headers }),
        fetch('/stats-service/api/usage/by-endpoint', { headers }),
        fetch('/stats-service/api/usage/recent?limit=50', { headers }),
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