# Database Schema (Localized)

```sql
-- Core tables managed by Supabase
users (via Supabase Auth)
├── id, email, created_at, metadata
├── preferred_locale, country, timezone
├── academic_system (us_gpa, uk_honours, ects, etc)

courses
├── id, user_id, name, term, color, emoji
├── credits (nullable), ects_credits (nullable)
├── academic_period_type (semester, term, trimester)
├── created_at, updated_at

files  
├── id, user_id, course_id, original_name, display_name
├── storage_url, file_type, file_size
├── ai_category, ai_summary, ai_confidence
├── created_at, processed_at

study_sessions
├── id, user_id, file_id, duration, notes
├── started_at, ended_at

flashcards
├── id, file_id, question, answer
├── times_studied, confidence_score
├── language (for multi-language flashcards)

grades
├── id, user_id, course_id, grade_value
├── grade_type (letter, percentage, gpa_points, ects_grade)
├── academic_period, date_recorded

groups
├── id, name, created_by, settings
├── primary_language, allowed_languages[]
├── created_at

group_members
├── group_id, user_id, role, joined_at

shared_files
├── id, file_id, group_id, shared_by
├── shared_at

subscriptions
├── id, user_id, tier, status
├── stripe_subscription_id, stripe_customer_id
├── currency, country_code
├── current_period_start, current_period_end
├── created_at, updated_at

usage_tracking
├── id, user_id, feature, count
├── period_start, period_end
├── created_at

academic_terms
├── id, country, institution_type
├── term_name, start_month, end_month
├── is_primary_term

translations
├── id, key, locale, value
├── context (ui, academic, email)
├── updated_at
```
