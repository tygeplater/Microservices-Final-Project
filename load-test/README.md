# Load Testing with k6

This ReadMe contains load testing scripts for the F1 Service to demonstrate scalability and measure response latency under load.

## Prerequisites

### Installing k6

**Windows:**
```powershell
choco install k6
```

**macOS:**
```bash
brew install k6
```


## Running Load Tests

### Basic Usage

Test against local service (default):
```bash
k6 run load-test/load-test.js
```

### Test Configuration

The script uses a ramp-up pattern to gradually increase load:
- **0-30s**: Ramp up to 5 virtual users
- **30s-1m30s**: Ramp up to 10 virtual users
- **1m30s-3m30s**: Ramp up to 20 virtual users
- **3m30s-5m30s**: Ramp up to 30 virtual users
- **5m30s-7m30s**: Ramp up to 40 virtual users
- **7m30s-9m30s**: Ramp up to 50 virtual users
- **9m30s-10m30s**: Ramp down to 0 users

Total test duration: ~10.5 minutes


## Understanding Results

### Console Output

k6 displays real-time metrics during the test:
- **http_req_duration**: Response time statistics (avg, min, max, p50, p95, p99)
- **http_reqs**: Total requests and requests per second (RPS)
- **http_req_failed**: Error rate percentage
- **vus**: Virtual users (current and max)