import http from 'k6/http';
import { check, sleep } from 'k6';

// Test configuration
export const options = {
  stages: [
    { duration: '30s', target: 20 },  // Ramp up to 20 users over 30 seconds
    { duration: '1m', target: 50 },   // Ramp up to 50 users over 1 minute
    { duration: '2m', target: 100 },  // Ramp up to 100 users over 2 minutes
    { duration: '3m', target: 100 },  // Stay at 100 users for 3 minutes
    { duration: '1m', target: 0 },    // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests must complete below 500ms
    http_req_failed: ['rate<0.1'],    // Error rate must be below 10%
  },
};

// Test configuration - UPDATE THESE
const BASE_URL = 'https://courseflow-seven.vercel.app'; // Update with your actual URL
const TEST_EMAIL = 'test@example.com'; // Create test accounts first
const TEST_PASSWORD = 'testpassword123';

export default function () {
  // Test 1: Homepage
  let response = http.get(`${BASE_URL}/`);
  check(response, {
    'homepage status is 200': (r) => r.status === 200,
    'homepage loads quickly': (r) => r.timings.duration < 1000,
  });
  
  sleep(1);
  
  // Test 2: Login page
  response = http.get(`${BASE_URL}/login`);
  check(response, {
    'login page status is 200': (r) => r.status === 200,
  });
  
  sleep(1);
  
  // Test 3: API Health check
  response = http.get(`${BASE_URL}/api/health`);
  check(response, {
    'API health check passes': (r) => r.status === 200,
    'API responds quickly': (r) => r.timings.duration < 200,
  });
  
  sleep(2); // Pause between iterations
}