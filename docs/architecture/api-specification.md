# API Specification

## REST API Specification
```yaml
openapi: 3.0.0
info:
  title: CourseFlow API
  version: 1.0.0
  description: REST API for CourseFlow academic file organization
servers:
  - url: https://api.CourseFlow.app/{locale}
    description: Production API
    variables:
      locale:
        default: en-US
        enum: [en-US, en-GB, fr-CA, fr, de, es]

paths:
  # Auth handled by Supabase directly
  
  /{locale}/api/courses:
    get:
      summary: Get user's courses
      security:
        - BearerAuth: []
      responses:
        200:
          description: List of courses
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Course'
    
    post:
      summary: Create new course
      security:
        - BearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CourseInput'
      responses:
        201:
          description: Created course
          
  /{locale}/api/files/upload:
    post:
      summary: Upload files
      security:
        - BearerAuth: []
      requestBody:
        required: true
        content:
          multipart/form-data:
            schema:
              type: object
              properties:
                files:
                  type: array
                  items:
                    type: string
                    format: binary
                course_id:
                  type: string
      responses:
        201:
          description: Upload results
          
  /api/files/categorize:
    post:
      summary: AI categorization
      security:
        - BearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                file_ids:
                  type: array
                  items:
                    type: string
      responses:
        200:
          description: Categorization results
          
  /{locale}/api/study/summary:
    post:
      summary: Generate AI summary in user's language
      security:
        - BearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                file_id:
                  type: string
                length:
                  type: string
                  enum: [brief, standard, detailed]
      responses:
        200:
          description: Generated summary
          
  /api/groups:
    get:
      summary: Get user's groups
      security:
        - BearerAuth: []
      responses:
        200:
          description: List of groups
    
    post:
      summary: Create study group
      security:
        - BearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/GroupInput'
      responses:
        201:
          description: Created group
          
  /{locale}/api/billing/create-checkout:
    post:
      summary: Create Stripe checkout session with local currency
      security:
        - BearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                tier:
                  type: string
                  enum: [student, premium]
                annual:
                  type: boolean
                currency:
                  type: string
                  enum: [USD, CAD, EUR, GBP]
      responses:
        200:
          description: Checkout session URL
          
  /{locale}/api/grades/convert:
    post:
      summary: Convert grades between academic systems
      security:
        - BearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                grade:
                  type: string
                from_system:
                  type: string
                  enum: [gpa, ects, uk_honours, percentage]
                to_system:
                  type: string
                  enum: [gpa, ects, uk_honours, percentage]
      responses:
        200:
          description: Converted grade
          
  /{locale}/api/locale/preferences:
    get:
      summary: Get user locale preferences
      security:
        - BearerAuth: []
      responses:
        200:
          description: User preferences
    put:
      summary: Update user locale preferences
      security:
        - BearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                preferred_locale:
                  type: string
                timezone:
                  type: string
                academic_system:
                  type: string
      responses:
        200:
          description: Updated preferences
          
  /api/billing/portal:
    post:
      summary: Create customer portal session
      security:
        - BearerAuth: []
      responses:
        200:
          description: Portal URL
          
  /api/billing/usage:
    get:
      summary: Get current usage and limits
      security:
        - BearerAuth: []
      responses:
        200:
          description: Usage data

components:
  securitySchemes:
    BearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
```
