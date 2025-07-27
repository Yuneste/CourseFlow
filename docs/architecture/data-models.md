# Data Models

## User
**Purpose:** Core user account and profile information with regional preferences

**Key Attributes:**
- id: UUID - Unique identifier from Supabase Auth
- email: string - User's email address
- full_name: string - Display name
- university: string - Institution name
- preferred_locale: string - User's language preference (en-US, fr-CA, etc.)
- country: string - User's country code
- timezone: string - User's timezone
- academic_system: enum - Grading system (gpa, ects, uk_honours)
- created_at: timestamp - Account creation
- avatar_url: string - Profile picture URL

**TypeScript Interface:**
```typescript
interface User {
  id: string;
  email: string;
  full_name: string;
  university?: string;
  preferred_locale: string;
  country: string;
  timezone: string;
  academic_system: 'gpa' | 'ects' | 'uk_honours' | 'percentage';
  created_at: Date;
  avatar_url?: string;
}
```

**Relationships:**
- Has many Courses
- Has many Files
- Has many StudySessions
- Belongs to many Groups

## Course
**Purpose:** Academic course/module organization with regional adaptations

**Key Attributes:**
- id: UUID - Unique identifier
- user_id: UUID - Owner of the course
- name: string - Course name (localized)
- code: string - Course code
- professor: string - Instructor name
- term: string - Academic period (semester/term/trimester)
- academic_period_type: enum - Period type by region
- credits: number - US/Canada credit hours
- ects_credits: number - European ECTS credits
- color: string - UI color for visual organization
- emoji: string - Visual identifier

**TypeScript Interface:**
```typescript
interface Course {
  id: string;
  user_id: string;
  name: string;
  code?: string;
  professor?: string;
  term: string;
  academic_period_type: 'semester' | 'term' | 'trimester';
  credits?: number;
  ects_credits?: number;
  color: string;
  emoji?: string;
  created_at: Date;
  updated_at: Date;
}
```

**Relationships:**
- Belongs to User
- Has many Files

## File
**Purpose:** Uploaded academic files with AI-enhanced multilingual metadata

**Key Attributes:**
- id: UUID - Unique identifier
- user_id: UUID - File owner
- course_id: UUID - Associated course
- original_name: string - Original filename
- display_name: string - AI-improved name
- storage_url: string - Supabase Storage URL
- file_type: string - MIME type
- file_size: bigint - Size in bytes
- detected_language: string - Content language
- ai_category: string - AI-determined category
- ai_summary: text - AI-generated summary (in user's language)
- ai_summary_translations: jsonb - Translations of summary
- ai_confidence: float - Categorization confidence

**TypeScript Interface:**
```typescript
interface File {
  id: string;
  user_id: string;
  course_id?: string;
  original_name: string;
  display_name: string;
  storage_url: string;
  file_type: string;
  file_size: number;
  detected_language?: string;
  ai_category?: 'lecture' | 'assignment' | 'notes' | 'exam' | 'other';
  ai_summary?: string;
  ai_summary_translations?: Record<string, string>;
  ai_confidence?: number;
  created_at: Date;
  processed_at?: Date;
}
```

**Relationships:**
- Belongs to User
- Belongs to Course
- Has many Annotations
- Has many Flashcards

## StudySession
**Purpose:** Track study time and progress

**Key Attributes:**
- id: UUID - Unique identifier
- user_id: UUID - Student
- file_id: UUID - File being studied
- course_id: UUID - Related course
- duration: integer - Minutes studied
- notes: text - Session notes
- started_at: timestamp - Session start
- ended_at: timestamp - Session end

**TypeScript Interface:**
```typescript
interface StudySession {
  id: string;
  user_id: string;
  file_id?: string;
  course_id?: string;
  duration: number;
  notes?: string;
  started_at: Date;
  ended_at?: Date;
}
```

**Relationships:**
- Belongs to User
- Belongs to File (optional)
- Belongs to Course (optional)

## Group
**Purpose:** Collaborative study groups with language preferences

**Key Attributes:**
- id: UUID - Unique identifier
- name: string - Group name
- description: text - Group purpose
- created_by: UUID - Creator user ID
- is_public: boolean - Public/private flag
- max_members: integer - Member limit
- primary_language: string - Main group language
- allowed_languages: array - Supported languages
- settings: jsonb - Group preferences

**TypeScript Interface:**
```typescript
interface Group {
  id: string;
  name: string;
  description?: string;
  created_by: string;
  is_public: boolean;
  max_members: number;
  primary_language: string;
  allowed_languages: string[];
  settings: {
    allow_file_sharing: boolean;
    allow_chat: boolean;
    require_approval: boolean;
  };
  created_at: Date;
}
```

**Relationships:**
- Has many GroupMembers
- Has many SharedFiles
- Has many ChatMessages

## Subscription
**Purpose:** Track user subscription status and multi-currency billing

**Key Attributes:**
- id: UUID - Unique identifier
- user_id: UUID - Subscriber
- tier: enum - Subscription level (free, student, premium)
- status: enum - Status (trialing, active, canceled, past_due)
- currency: string - Billing currency (USD, CAD, EUR, GBP)
- country_code: string - Billing country
- stripe_subscription_id: string - Stripe reference
- stripe_customer_id: string - Stripe customer
- current_period_start: timestamp - Billing period start
- current_period_end: timestamp - Billing period end

**TypeScript Interface:**
```typescript
interface Subscription {
  id: string;
  user_id: string;
  tier: 'free' | 'student' | 'premium';
  status: 'trialing' | 'active' | 'canceled' | 'past_due';
  currency: 'USD' | 'CAD' | 'EUR' | 'GBP';
  country_code: string;
  stripe_subscription_id?: string;
  stripe_customer_id: string;
  current_period_start: Date;
  current_period_end: Date;
  created_at: Date;
  updated_at: Date;
}
```

**Relationships:**
- Belongs to User
- Has many UsageTracking records
