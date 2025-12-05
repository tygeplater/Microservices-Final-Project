export interface UsageSummary {
    total_requests: number;
    average_response_time_ms: number;
}

export interface EndpointUsage {
    endpoint: string;
    request_count: number;
    avg_response_time_ms: number;
}

export interface RecentUsage {
    service: string;
    endpoint: string;
    method: string;
    status_code: number;
    response_time_ms: number;
    timestamp: string;
}