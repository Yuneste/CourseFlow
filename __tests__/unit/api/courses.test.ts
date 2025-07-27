import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/courses/route';

// Mock Supabase
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}));

// Mock rate limiting
vi.mock('@/lib/rate-limit', () => ({
  checkRateLimit: vi.fn(() => Promise.resolve({
    allowed: true,
    remaining: 9,
    resetTime: Date.now() + 60000,
  })),
  getRateLimitHeaders: vi.fn(() => ({})),
}));

describe('/api/courses', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/courses', () => {
    it('should return 401 if user is not authenticated', async () => {
      const { createClient } = await import('@/lib/supabase/server');
      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: null },
            error: new Error('Not authenticated'),
          }),
        },
      };
      vi.mocked(createClient).mockResolvedValue(mockSupabase as any);

      const request = new NextRequest('http://localhost:3000/api/courses');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should return courses for authenticated user', async () => {
      const { createClient } = await import('@/lib/supabase/server');
      const mockCourses = [
        {
          id: '1',
          user_id: 'user123',
          name: 'Test Course',
          term: 'Fall 2024',
          created_at: new Date().toISOString(),
        },
      ];

      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: 'user123' } },
            error: null,
          }),
        },
        from: vi.fn(() => ({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              order: vi.fn().mockResolvedValue({
                data: mockCourses,
                error: null,
              }),
            })),
          })),
        })),
      };
      vi.mocked(createClient).mockResolvedValue(mockSupabase as any);

      const request = new NextRequest('http://localhost:3000/api/courses');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual(mockCourses);
    });

    it('should filter courses by term when term parameter is provided', async () => {
      const { createClient } = await import('@/lib/supabase/server');
      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: 'user123' } },
            error: null,
          }),
        },
        from: vi.fn(() => ({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              eq: vi.fn(() => ({
                order: vi.fn().mockResolvedValue({
                  data: [],
                  error: null,
                }),
              })),
            })),
          })),
        })),
      };
      vi.mocked(createClient).mockResolvedValue(mockSupabase as any);

      const request = new NextRequest('http://localhost:3000/api/courses?term=Fall%202024');
      await GET(request);

      expect(mockSupabase.from).toHaveBeenCalledWith('courses');
    });
  });

  describe('POST /api/courses', () => {
    it('should return 401 if user is not authenticated', async () => {
      const { createClient } = await import('@/lib/supabase/server');
      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: null },
            error: new Error('Not authenticated'),
          }),
        },
      };
      vi.mocked(createClient).mockResolvedValue(mockSupabase as any);

      const request = new NextRequest('http://localhost:3000/api/courses', {
        method: 'POST',
        body: JSON.stringify({ name: 'Test Course', term: 'Fall 2024' }),
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should return 400 if required fields are missing', async () => {
      const { createClient } = await import('@/lib/supabase/server');
      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: 'user123' } },
            error: null,
          }),
        },
      };
      vi.mocked(createClient).mockResolvedValue(mockSupabase as any);

      const request = new NextRequest('http://localhost:3000/api/courses', {
        method: 'POST',
        body: JSON.stringify({ name: 'Test Course' }), // Missing term
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Course name and term are required');
    });

    it('should create a course successfully', async () => {
      const { createClient } = await import('@/lib/supabase/server');
      const newCourse = {
        id: '1',
        user_id: 'user123',
        name: 'Test Course',
        term: 'Fall 2024',
        color: '#3B82F6',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: 'user123' } },
            error: null,
          }),
        },
        from: vi.fn(() => ({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              count: 0,
            })),
          })),
          insert: vi.fn(() => ({
            select: vi.fn(() => ({
              single: vi.fn().mockResolvedValue({
                data: newCourse,
                error: null,
              }),
            })),
          })),
        })),
      };
      vi.mocked(createClient).mockResolvedValue(mockSupabase as any);

      const request = new NextRequest('http://localhost:3000/api/courses', {
        method: 'POST',
        body: JSON.stringify({ name: 'Test Course', term: 'Fall 2024' }),
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data).toEqual(newCourse);
    });

    it('should enforce rate limiting', async () => {
      const { checkRateLimit } = await import('@/lib/rate-limit');
      vi.mocked(checkRateLimit).mockResolvedValue({
        allowed: false,
        remaining: 0,
        resetTime: Date.now() + 60000,
      });

      const { createClient } = await import('@/lib/supabase/server');
      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: 'user123' } },
            error: null,
          }),
        },
      };
      vi.mocked(createClient).mockResolvedValue(mockSupabase as any);

      const request = new NextRequest('http://localhost:3000/api/courses', {
        method: 'POST',
        body: JSON.stringify({ name: 'Test Course', term: 'Fall 2024' }),
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(429);
      expect(data.error).toBe('Too many requests. Please try again later.');
    });

    it('should return 400 for duplicate course in same term', async () => {
      const { createClient } = await import('@/lib/supabase/server');
      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: 'user123' } },
            error: null,
          }),
        },
        from: vi.fn(() => ({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              count: 5, // Under limit
            })),
          })),
          insert: vi.fn(() => ({
            select: vi.fn(() => ({
              single: vi.fn().mockResolvedValue({
                data: null,
                error: {
                  code: '23505',
                  message: 'duplicate key value violates unique constraint "unique_user_course_term"',
                },
              }),
            })),
          })),
        })),
      };
      vi.mocked(createClient).mockResolvedValue(mockSupabase as any);

      const request = new NextRequest('http://localhost:3000/api/courses', {
        method: 'POST',
        body: JSON.stringify({ name: 'Existing Course', term: 'Fall 2024' }),
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('A course with this name already exists in the selected term');
    });

    it('should validate course name length', async () => {
      const { createClient } = await import('@/lib/supabase/server');
      const mockSupabase = {
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: { id: 'user123' } },
            error: null,
          }),
        },
      };
      vi.mocked(createClient).mockResolvedValue(mockSupabase as any);

      const request = new NextRequest('http://localhost:3000/api/courses', {
        method: 'POST',
        body: JSON.stringify({ name: 'A', term: 'Fall 2024' }), // Too short
      });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Course name must be between 2 and 100 characters');
    });
  });
});