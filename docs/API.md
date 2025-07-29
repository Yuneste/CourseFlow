# CourseFlow API Documentation

## Overview

The CourseFlow API provides programmatic access to course management functionality. All API endpoints are RESTful and return JSON responses.

## Base URL

```
https://courseflow.app/api
```

## Authentication

All API requests require authentication using Supabase Auth. Include the authorization header:

```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

## Rate Limiting

API requests are rate limited to prevent abuse:
- Default: 100 requests per 15 minutes
- Rate limit headers are included in responses:
  - `X-RateLimit-Limit`: Maximum requests allowed
  - `X-RateLimit-Remaining`: Requests remaining
  - `X-RateLimit-Reset`: Time when limit resets

## Endpoints

### Courses

#### List Courses
```
GET /api/courses
```

Returns all courses for the authenticated user.

**Response:**
```json
{
  "courses": [
    {
      "id": "uuid",
      "name": "Course Name",
      "code": "CS101",
      "term": "Fall 2024",
      "professor": "Dr. Smith",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### Get Course
```
GET /api/courses/:id
```

Returns a specific course by ID.

#### Create Course
```
POST /api/courses
```

**Request Body:**
```json
{
  "name": "Course Name",
  "code": "CS101",
  "term": "Fall 2024",
  "professor": "Dr. Smith",
  "credits": 3
}
```

#### Update Course
```
PUT /api/courses/:id
```

Updates course information.

#### Delete Course
```
DELETE /api/courses/:id
```

Deletes a course and all associated data.

### Files

#### Upload File
```
POST /api/files/upload
```

Uploads a file for a specific course.

**Request:**
- Method: `multipart/form-data`
- Fields:
  - `file`: The file to upload
  - `courseId`: UUID of the course
  - `folderId`: (optional) UUID of the folder

**Response:**
```json
{
  "file": {
    "id": "uuid",
    "original_name": "document.pdf",
    "display_name": "document.pdf",
    "file_size": 1024000,
    "file_type": "application/pdf",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

#### List Files
```
GET /api/files?courseId=uuid
```

Returns all files for a specific course.

#### Download File
```
GET /api/files/:id/download
```

Returns a download URL for the file.

### User Profile

#### Get Profile
```
GET /api/profile
```

Returns the current user's profile.

#### Update Profile
```
PUT /api/profile
```

Updates user profile information.

**Request Body:**
```json
{
  "full_name": "John Doe",
  "university": "University Name",
  "study_program": "Computer Science",
  "country": "US"
}
```

## Error Responses

All errors follow a consistent format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": {}
  }
}
```

### Common Error Codes

- `UNAUTHORIZED`: Missing or invalid authentication
- `FORBIDDEN`: Insufficient permissions
- `NOT_FOUND`: Resource not found
- `VALIDATION_ERROR`: Invalid request data
- `RATE_LIMITED`: Too many requests
- `INTERNAL_ERROR`: Server error

## Webhooks

CourseFlow can send webhooks for certain events:

- `course.created`
- `course.updated`
- `course.deleted`
- `file.uploaded`
- `file.deleted`

Configure webhooks in your account settings.

## SDK

Official SDKs are planned for:
- JavaScript/TypeScript
- Python
- Go

## Support

For API support, contact: api@courseflow.app