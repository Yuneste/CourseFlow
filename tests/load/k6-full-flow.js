import http from 'k6/http';
import { check, sleep, group } from 'k6';

// Test configuration
export const options = {
  stages: [
    { duration: '1m', target: 30 },   // Warm up
    { duration: '3m', target: 100 },  // Ramp to 100 users
    { duration: '5m', target: 100 },  // Maintain 100 users
    { duration: '2m', target: 0 },    // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<1000', 'p(99)<2000'], // Performance SLAs
    http_req_failed: ['rate<0.05'],                   // Error rate < 5%
    'group_duration{group:dashboard}': ['p(95)<1500'], // Dashboard specific
    'group_duration{group:courses}': ['p(95)<1500'],   // Courses specific
  },
};

// Configuration - UPDATE THESE
const BASE_URL = 'https://courseflow-seven.vercel.app';
const TEST_USERS = [
  { email: 'loadtest1@example.com', password: 'testpass123' },
  { email: 'loadtest2@example.com', password: 'testpass123' },
  // Add more test users as needed
];

// Get a random test user
function getTestUser() {
  return TEST_USERS[Math.floor(Math.random() * TEST_USERS.length)];
}

export default function () {
  const user = getTestUser();
  let authToken = null;
  
  // Login flow
  group('authentication', function () {
    const loginPayload = JSON.stringify({
      email: user.email,
      password: user.password,
    });
    
    const loginHeaders = {
      'Content-Type': 'application/json',
    };
    
    const loginResponse = http.post(
      `${BASE_URL}/api/auth/login`,
      loginPayload,
      { headers: loginHeaders }
    );
    
    check(loginResponse, {
      'login successful': (r) => r.status === 200,
      'received auth token': (r) => r.json('token') !== undefined,
    });
    
    if (loginResponse.status === 200) {
      authToken = loginResponse.json('token');
    }
  });
  
  sleep(2);
  
  // Only proceed if logged in
  if (authToken) {
    const authHeaders = {
      'Authorization': `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    };
    
    // Dashboard flow
    group('dashboard', function () {
      const dashboardResponse = http.get(`${BASE_URL}/dashboard`, {
        headers: authHeaders,
      });
      
      check(dashboardResponse, {
        'dashboard loads': (r) => r.status === 200,
        'dashboard has content': (r) => r.body.includes('Overview'),
      });
    });
    
    sleep(3);
    
    // Courses flow
    group('courses', function () {
      // List courses
      const coursesResponse = http.get(`${BASE_URL}/api/courses`, {
        headers: authHeaders,
      });
      
      check(coursesResponse, {
        'courses API works': (r) => r.status === 200,
        'returns array': (r) => Array.isArray(r.json()),
      });
      
      // View courses page
      const coursesPageResponse = http.get(`${BASE_URL}/courses`, {
        headers: authHeaders,
      });
      
      check(coursesPageResponse, {
        'courses page loads': (r) => r.status === 200,
      });
    });
    
    sleep(2);
    
    // File operations (read-only for load test)
    group('files', function () {
      const filesResponse = http.get(`${BASE_URL}/api/files`, {
        headers: authHeaders,
      });
      
      check(filesResponse, {
        'files API works': (r) => r.status === 200,
        'returns files array': (r) => Array.isArray(r.json()),
      });
    });
  }
  
  sleep(5); // Pause between user sessions
}