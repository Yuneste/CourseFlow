# Load Testing with k6

This directory contains load testing scripts for CourseFlow using k6.

## Prerequisites

1. Install k6:
   ```bash
   # Windows (using Chocolatey)
   choco install k6
   
   # Windows (using winget)
   winget install k6
   
   # Or download from https://k6.io/docs/getting-started/installation/
   ```

2. Create test user accounts in your application before running tests.

## Available Tests

### 1. Basic Load Test (`k6-basic.js`)
Tests public endpoints and basic API health:
- Homepage loading
- Login page accessibility  
- API health check endpoint

Run with:
```bash
k6 run tests/load/k6-basic.js
```

### 2. Full User Flow Test (`k6-full-flow.js`)
Simulates complete user journeys:
- User authentication
- Dashboard access
- Course management
- File operations

Run with:
```bash
k6 run tests/load/k6-full-flow.js
```

## Configuration

Before running tests, update the following in each test file:
1. `BASE_URL` - Your Vercel deployment URL
2. `TEST_EMAIL` and `TEST_PASSWORD` - Valid test account credentials
3. `TEST_USERS` array in full-flow test

## Running Tests

### Basic run:
```bash
k6 run tests/load/k6-basic.js
```

### With HTML report:
```bash
k6 run --out html=report.html tests/load/k6-basic.js
```

### With real-time results:
```bash
k6 run --out cloud tests/load/k6-basic.js
```

### Custom number of users:
```bash
k6 run --vus 50 --duration 2m tests/load/k6-basic.js
```

## Understanding Results

Key metrics to watch:
- **http_req_duration**: Response time (aim for p95 < 500ms)
- **http_req_failed**: Error rate (aim for < 5%)
- **http_reqs**: Requests per second
- **vus**: Virtual users currently active

## Important Notes

1. **Rate Limits**: 
   - Vercel free tier: ~60 requests/10 seconds
   - Your API rate limiting: 30 requests/minute per endpoint
   - Supabase connection limits on free tier

2. **Test Data**: Create dedicated test accounts to avoid polluting production data

3. **Gradual Ramp-up**: Tests gradually increase users to avoid triggering DDoS protection

4. **Cost Considerations**: Heavy load testing may incur costs on Vercel/Supabase

## Analyzing Results

After running tests, look for:
- Response times increasing dramatically (indicates bottlenecks)
- Error rates spiking (indicates capacity limits)
- Specific endpoints failing (indicates weak points)

## Next Steps

1. Start with `k6-basic.js` to test infrastructure
2. Create test accounts for `k6-full-flow.js`
3. Run tests during low-traffic periods
4. Monitor Vercel and Supabase dashboards during tests
5. Adjust thresholds based on your SLAs