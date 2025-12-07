import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend, Rate, Counter } from 'k6/metrics';

const responseTime = new Trend('response_time_ms');
const errorRate = new Rate('errors');
const requestCounter = new Counter('total_requests');
const BASE_URL = __ENV.BASE_URL || 'https://microservices-final-project-2rwld.ondigitalocean.app';

// Test data - valid F1 data for testing
const testData = {
  year: 2024,
  rounds: [1, 2, 3, 4, 5], 
  sessions: ['R', 'Q', 'FP3', 'FP2', 'FP1'] 
};

export const options = {
  stages: [
    { duration: '30s', target: 5 }, 
    { duration: '1m', target: 10 }, 
    { duration: '2m', target: 20 }, 
    { duration: '2m', target: 30 }, 
    { duration: '2m', target: 40 }, 
    { duration: '2m', target: 50 }, 
    { duration: '1m', target: 0 }, 
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000', 'p(99)<5000'],
    http_req_failed: ['rate<0.05'],
    errors: ['rate<0.05'],
  },
};

export default function () {
  const endpoints = [
    {
      name: 'health',
      url: `${BASE_URL}/api/health`,
      params: {},
    },
    {
      name: 'schedule',
      url: `${BASE_URL}/api/schedule`,
      params: { year: testData.year },
    },
    {
      name: 'weekend-results',
      url: `${BASE_URL}/api/weekend-results`,
      params: { 
        year: testData.year, 
        round: testData.rounds[Math.floor(Math.random() * testData.rounds.length)]
      },
    },
    {
      name: 'session-info',
      url: `${BASE_URL}/api/session-info`,
      params: { 
        year: testData.year, 
        round: testData.rounds[Math.floor(Math.random() * testData.rounds.length)],
        sessionCd: testData.sessions[Math.floor(Math.random() * testData.sessions.length)]
      },
    },
  ];

  const endpointWeights = [0.1, 0.3, 0.3, 0.3];
  const random = Math.random();
  let selectedIndex = 0;
  let cumulative = 0;
  for (let i = 0; i < endpointWeights.length; i++) {
    cumulative += endpointWeights[i];
    if (random < cumulative) {
      selectedIndex = i;
      break;
    }
  }

  const endpoint = endpoints[selectedIndex];
  const queryString = Object.keys(endpoint.params)
    .map(key => `${key}=${endpoint.params[key]}`)
    .join('&');
  const fullUrl = queryString ? `${endpoint.url}?${queryString}` : endpoint.url;

  const startTime = Date.now();
  const response = http.get(fullUrl, {
    tags: { endpoint: endpoint.name },
  });
  const duration = Date.now() - startTime;

  responseTime.add(duration, { endpoint: endpoint.name });
  requestCounter.add(1, { endpoint: endpoint.name });

  const success = check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 5000ms': (r) => r.timings.duration < 5000,
  });

  if (!success) {
    errorRate.add(1, { endpoint: endpoint.name });
  }

  sleep(Math.random() * 2 + 0.5);
}
