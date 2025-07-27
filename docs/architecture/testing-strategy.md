# Testing Strategy

## Testing Pyramid
```text
          E2E Tests
         /        \
    Integration Tests
       /            \
  Frontend Unit  Backend Unit
```

## Test Organization

### Frontend Tests
```text
__tests__/
├── unit/
│   ├── components/
│   │   ├── FileCard.test.tsx
│   │   └── CourseForm.test.tsx
│   └── hooks/
│       └── useAuth.test.ts
├── integration/
│   ├── pages/
│   │   └── dashboard.test.tsx
│   └── services/
│       └── files.service.test.ts
└── setup.ts
```

### Backend Tests
```text
__tests__/
├── unit/
│   ├── api/
│   │   ├── courses.test.ts
│   │   └── files.test.ts
│   └── lib/
│       └── ai.service.test.ts
└── integration/
    └── workflows/
        └── file-upload.test.ts
```

### E2E Tests
```text
e2e/
├── auth.spec.ts
├── file-upload.spec.ts
├── study-session.spec.ts
└── fixtures/
    └── test-files/
```

## Test Examples

### Frontend Component Test
```typescript
// __tests__/unit/components/FileCard.test.tsx
import { render, screen } from '@testing-library/react';
import { FileCard } from '@/components/features/files/FileCard';

describe('FileCard', () => {
  it('displays file information correctly', () => {
    const file = {
      id: '1',
      display_name: 'CS101 Lecture Notes',
      ai_category: 'lecture',
    };
    
    render(<FileCard file={file} />);
    
    expect(screen.getByText('CS101 Lecture Notes')).toBeInTheDocument();
    expect(screen.getByText(/lecture/i)).toBeInTheDocument();
  });
});
```

### Backend API Test
```typescript
// __tests__/unit/api/courses.test.ts
import { GET } from '@/app/api/courses/route';
import { createMockRequest } from '@/tests/utils';

describe('GET /api/courses', () => {
  it('returns user courses', async () => {
    const req = createMockRequest();
    const res = await GET(req);
    const data = await res.json();
    
    expect(res.status).toBe(200);
    expect(Array.isArray(data)).toBe(true);
  });
});
```

### E2E Test
```typescript
// e2e/file-upload.spec.ts
import { test, expect } from '@playwright/test';

test('user can upload and categorize files', async ({ page }) => {
  // Login
  await page.goto('/login');
  await page.fill('[name="email"]', 'test@example.com');
  await page.fill('[name="password"]', 'password');
  await page.click('button[type="submit"]');
  
  // Upload file
  await page.goto('/files');
  const fileInput = await page.locator('input[type="file"]');
  await fileInput.setInputFiles('fixtures/test-files/lecture.pdf');
  
  // Wait for processing
  await expect(page.locator('.upload-progress')).toHaveText('100%');
  
  // Verify categorization
  await expect(page.locator('.file-category')).toContainText('lecture');
});
```
