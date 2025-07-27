# CourseFlow - Simplified Product Requirements Document (PRD)

## Executive Summary

CourseFlow is a web-based academic file organization platform that uses AI to automatically organize, categorize, and enhance study materials. This simplified PRD focuses on delivering all features through a minimal tech stack without desktop applications, prioritizing rapid development and exceptional user experience.

**Key Simplification:** All file discovery happens through web browser file selection instead of desktop scanning, maintaining the same user value with drastically reduced complexity.

## Goals and Background Context

### Goals
- Eliminate student file organization chaos through AI-powered categorization via web uploads
- Reduce time spent searching for study materials by 70% through smart organization
- Deliver measurable academic performance improvement through intelligent study guidance
- Transform individual study tool into collaborative learning platform
- Enable enhanced study experiences through AI-generated summaries and flashcards
- Solve the "download folder black hole" problem through intuitive web-based file selection

### Background Context

Students face digital file chaos with cryptic naming conventions and disorganized folders. While competitors like Notion require complex manual setup and Google Drive lacks intelligent organization, CourseFlow combines automatic AI-powered organization with collaborative learning in one simple web platform.

**Key Insight:** Students don't need desktop apps - they need their files organized quickly and intelligently. Modern browsers can access local folders, eliminating the need for complex desktop integration.

## Target Markets & Localization Strategy

### Geographic Coverage
**Primary Markets:** North America (US, Canada) and Europe (EU, UK)

#### North America
- **Countries:** United States, Canada
- **Languages:** English, French (Quebec)
- **Academic Systems:** 
  - US: Semester system (Fall/Spring), Quarter system
  - Canada: Term system (Fall/Winter/Summer)
- **Grading:** GPA (4.0 scale), Letter grades (A-F)
- **Currency:** USD (US), CAD (Canada)

#### Europe
- **Countries:** EU member states, United Kingdom
- **Languages:** English, German, French, Spanish, Italian (MVP languages)
- **Academic Systems:**
  - ECTS (European Credit Transfer System)
  - UK: Terms (Michaelmas/Hilary/Trinity) or Semesters
  - EU: Varied by country (Semesters/Trimesters)
- **Grading:** ECTS grades (A-F), UK (First/2:1/2:2/Third), Percentages
- **Currency:** EUR (EU), GBP (UK)

### Localization Requirements

#### Language Support
- **MVP Languages:** English, French, German, Spanish
- **Phase 2:** Italian, Dutch, Polish, Portuguese
- **Implementation:** i18n with region-specific translations
- **AI Responses:** Localized to user's language

#### Regional Adaptations
1. **Academic Terminology**
   - US: "GPA", "Credits", "Major/Minor"
   - UK: "Marks", "Modules", "Course/Programme" 
   - EU: "ECTS", "Semester", "Faculty"

2. **Date/Time Formats**
   - US: MM/DD/YYYY, 12-hour clock
   - EU/UK: DD/MM/YYYY, 24-hour clock

3. **File Size Units**
   - Configurable: MB/GB vs MiB/GiB

## Technical Stack (6 Components + i18n)

### 1. Next.js 14 (App Router)
- **Purpose:** Full-stack web framework handling both frontend and backend
- **Covers:** Server-side rendering, API routes, file upload handling, authentication flows, **i18n routing**
- **Why:** Single framework reduces complexity while providing enterprise-grade capabilities

### 2. Supabase
- **Purpose:** Backend-as-a-Service providing multiple integrated services
- **Covers:** PostgreSQL database, authentication, file storage, real-time subscriptions, row-level security
- **Why:** Eliminates need for separate auth, database, storage, and real-time services

### 3. OpenAI API
- **Purpose:** AI-powered intelligence for all cognitive features
- **Covers:** File categorization, content analysis, summary generation, flashcard creation, study recommendations
- **Why:** Best-in-class AI without managing ML infrastructure

### 4. Tailwind CSS + Shadcn/ui
- **Purpose:** Rapid UI development with beautiful, accessible components
- **Covers:** Responsive design, animations, dark mode, consistent design system
- **Why:** Professional UI without custom CSS complexity

### 5. Vercel
- **Purpose:** Deployment and hosting platform optimized for Next.js
- **Covers:** Global CDN, edge functions, analytics, automatic scaling, **edge middleware for geo-routing**
- **Why:** Zero-config deployment with built-in performance optimization

### 6. next-intl
- **Purpose:** Internationalization framework for Next.js
- **Covers:** Translations, locale routing, number/date formatting, pluralization
- **Why:** Type-safe i18n with excellent Next.js integration

## Core Architecture Principles

### Simplicity First
- No microservices - monolithic Next.js app with clear module separation
- No message queues - synchronous processing is fine for MVP
- No caching layers - Vercel edge caching handles this
- No separate services - everything runs in Next.js API routes

### User Experience Focus
- Every feature must provide immediate, visible value
- Interactive feedback for all actions (progress bars, animations)
- Gamification elements throughout (streaks, achievements, progress tracking)
- Mobile-responsive but desktop-optimized

### Development Velocity
- Ship features in days, not weeks
- Use Supabase for all backend needs
- Leverage UI component libraries
- Focus on core value, not infrastructure

## Functional Requirements (Simplified)

### FR1: Academic Setup
- Region-aware onboarding wizard adapting to local academic systems
- Course/module input with regional terminology (Credits/ECTS/Marks)
- Visual course organization preview
- Academic period management (Semesters/Terms/Trimesters by region)
- Grade scale configuration (GPA/ECTS/UK Honours)
- **Implementation:** Next.js pages with Supabase data storage, locale detection

### FR2: File Discovery & Upload
- **SIMPLIFIED:** Browser-based folder selection using File API
- Drag-and-drop file upload interface
- Bulk file selection from user's computer
- **Implementation:** HTML5 File API + Next.js upload handling

### FR3: AI Categorization
- Automatic file categorization by course/subject with regional awareness
- Smart file renaming following local naming conventions
- Multi-language content analysis (MVP: EN, FR, DE, ES)
- Duplicate detection and handling
- **Implementation:** OpenAI API with language detection, localized prompts

### FR4: File Organization
- Hierarchical folder structure by course/topic
- File relationship mapping
- Quick search and filters
- **Implementation:** PostgreSQL with Supabase

### FR5: Study Tools
- In-browser PDF/document viewer
- AI-generated summaries and flashcards
- Study session tracking
- **Implementation:** Next.js pages with OpenAI integration

### FR6: Collaboration
- Group workspaces for shared learning
- Real-time chat and file sharing
- Shared whiteboards
- **Implementation:** Supabase Realtime subscriptions

### FR7: Performance Tracking
- Study analytics and insights
- Grade tracking with regional systems (GPA/ECTS/UK Honours/Percentages)
- Grade conversion between systems for exchange students
- Personalized recommendations based on local academic standards
- **Implementation:** PostgreSQL analytics with chart libraries, grade conversion logic

### FR8: Content Discovery
- University library marketplace
- Peer-shared study materials
- Quality ratings and reviews
- **Implementation:** Supabase database with search

## Monetization Strategy

### Pricing Tiers

#### Free Tier - "Explorer"
- **Price:** Free
- **Target:** Casual students testing the platform
- **Limits:**
  - 10 files per month upload
  - 50MB storage limit
  - Basic AI categorization
  - 5 AI summaries per month
  - No flashcard generation
  - View-only collaboration

#### Student Tier - "Scholar"
- **Price:** 
  - US: $4.99/month
  - Canada: $6.99 CAD/month
  - UK: £3.99/month
  - EU: €4.99/month
  - 20% off with academic email verification (.edu/.ac.uk/.edu.eu)
- **Target:** Individual students needing full features
- **Features:**
  - Unlimited file uploads
  - 5GB storage
  - Full AI categorization & smart naming
  - Unlimited AI summaries
  - Unlimited flashcard generation
  - Basic study analytics
  - Join up to 3 study groups
  - Priority processing

#### Premium Tier - "Master"
- **Price:**
  - US: $9.99/month
  - Canada: $12.99 CAD/month
  - UK: £7.99/month
  - EU: €9.99/month
- **Target:** Power users and study group leaders
- **Features:**
  - Everything in Student tier
  - 50GB storage
  - Advanced AI features (GPT-4)
  - Create unlimited study groups
  - Advanced analytics & insights
  - Export to Anki/Quizlet
  - API access
  - White-label options for universities

### Revenue Streams

1. **Subscription Revenue** - Primary recurring income
2. **University Partnerships** - B2B bulk licenses at $2/student/month
3. **Content Marketplace** - 20% commission on premium content sales
4. **Storage Upgrades** - $2/month per additional 10GB
5. **API Usage** - Usage-based pricing for developers

### Payment Implementation
- **Provider:** Stripe (supports all target countries)
- **Multi-Currency:** Automatic local currency billing
- **Billing:** Monthly or annual (2 months free)
- **Student Verification:** 
  - US/Canada: .edu email or SheerID
  - UK: .ac.uk email or UCAS verification
  - EU: .edu.eu or national academic domains
- **Trial Period:** 14-day free trial with full features
- **Payment Methods:** 
  - All regions: Credit/debit cards, PayPal
  - EU: SEPA Direct Debit, iDEAL (Netherlands)
  - UK: Direct Debit
- **Tax Handling:** Automatic VAT/GST calculation

## Non-Functional Requirements (Simplified)

### Performance
- File processing: <30 seconds for most files
- Page load: <2 seconds
- Real-time features: <100ms latency
- Payment processing: <3 seconds

### Scale
- Support 10,000 concurrent users on Vercel
- Storage limits per tier (Free: 50MB, Student: 5GB, Premium: 50GB)

### Security
- Supabase Auth handles all authentication
- Row-level security for data isolation
- HTTPS everywhere via Vercel
- PCI compliance via Stripe
- Subscription status verification on all premium features

### Availability
- 99.9% uptime (Vercel + Supabase SLA)
- Automatic backups via Supabase

## User Interface Design

### Design Philosophy
- **Clean & Focused:** Minimal UI that doesn't distract from studying
- **Instant Gratification:** Every action provides immediate visual feedback
- **Delightful Details:** Confetti on achievements, smooth transitions, micro-interactions
- **Academic Aesthetic:** Professional yet approachable, optimized for long study sessions
- **Culturally Aware:** UI adapts to regional preferences (date formats, color meanings)

### Localization UI/UX
- **Language Switcher:** Prominent in header, persists selection
- **RTL Support:** Ready for future Arabic/Hebrew expansion
- **Regional Icons:** Academic icons that resonate locally
- **Number Formatting:** Locale-specific (1,000 vs 1.000)
- **Academic Terms:** Dynamic labels ("GPA" vs "Marks" vs "Notes")

### Key Screens

1. **Dashboard**
   - Course cards with file counts
   - Recent files carousel
   - Study streak tracker
   - Quick actions (upload, create flashcards)

2. **File Upload Interface**
   - Drag-and-drop zone with folder selection
   - Real-time categorization preview
   - Bulk editing capabilities
   - Progress visualization

3. **Study Mode**
   - Distraction-free document viewer
   - Floating AI assistant for summaries
   - Integrated flashcard generator
   - Pomodoro timer

4. **Collaboration Hub**
   - Group workspace switcher
   - Shared file gallery
   - Live chat sidebar
   - Active user presence

5. **Pricing & Upgrade**
   - Clear tier comparison table
   - Current usage indicators
   - Upgrade prompts at limit points
   - Student discount verification
   - Billing management portal

## Implementation Approach

### Phase 1: Core Foundation (Week 1-2)
1. Next.js project setup with TypeScript and next-intl
2. Supabase integration (auth, database, storage)
3. Basic UI components with Tailwind/Shadcn
4. Locale detection and routing setup
5. File upload and storage functionality
6. Translation infrastructure for MVP languages

### Phase 2: AI Intelligence (Week 3-4)
1. OpenAI integration for categorization
2. Smart file organization logic
3. Summary and flashcard generation
4. Basic study tools

### Phase 3: Collaboration (Week 5-6)
1. Group workspaces
2. Real-time features with Supabase
3. File sharing mechanics
4. Chat implementation

### Phase 4: Analytics & Discovery (Week 7-8)
1. Study tracking and analytics
2. Performance insights
3. Content marketplace
4. Peer sharing features

### Phase 5: Polish & Launch (Week 9-10)
1. UI/UX refinements
2. Performance optimization
3. User testing
4. Marketing site

## Database Schema (Localized)

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

## API Structure (Localized)

All APIs are Next.js API routes under `/[locale]/api/`:

```
/[locale]/api/auth/* - Handled by Supabase with locale context
/[locale]/api/courses - CRUD for courses with regional terms
/[locale]/api/files/upload - File upload handling
/[locale]/api/files/categorize - AI categorization with language detection
/[locale]/api/files/[id] - File operations
/[locale]/api/study/summary - Generate summaries in user's language
/[locale]/api/study/flashcards - Generate flashcards with translations
/[locale]/api/groups/* - Group operations
/[locale]/api/analytics/* - Study analytics with local grade systems
/[locale]/api/billing/create-checkout - Create checkout with local currency
/[locale]/api/billing/webhook - Stripe webhook handler
/[locale]/api/billing/portal - Customer billing portal
/[locale]/api/billing/usage - Check usage limits
/[locale]/api/grades/convert - Convert between grading systems
/[locale]/api/locale/preferences - Get/set user locale preferences
```

## Success Metrics

### User Engagement
- 70% of users upload files in first session
- Average 5+ study sessions per week
- 50% join or create a study group
- 30% free-to-paid conversion within 14 days

### Academic Impact  
- Users report 30% time savings
- 15% average grade improvement (measured in local grading system)
- 80% user retention after 3 months
- 90% successful adaptation to local academic systems

### Business Metrics
- 30% free trial to paid conversion
- <5% monthly churn rate
- $20 average revenue per user (ARPU)
- 60% of revenue from Student tier
- 10% from university partnerships by Year 2

### Technical Performance
- <2% error rate
- <30s average file processing
- 99.9% uptime
- <3% payment failure rate

## Risk Mitigation

### Technical Risks
- **OpenAI API limits:** Implement smart caching and batching
- **Large file handling:** Stream uploads, process async
- **Scaling issues:** Vercel auto-scales, monitor usage
- **Multi-language complexity:** Start with MVP languages, expand gradually

### User Risks
- **Privacy concerns:** GDPR compliance for EU, clear data policies
- **AI accuracy:** Allow easy corrections, learn from feedback
- **Adoption friction:** Localized onboarding for each region
- **Academic system confusion:** Clear explanations and examples

### Localization Risks
- **Translation quality:** Professional translators for academic terms
- **Cultural misunderstandings:** Local student advisors for each market
- **Payment friction:** Local payment methods where critical

## Future Enhancements (Post-MVP)

1. Mobile app (React Native)
2. Browser extension for auto-capture
3. University LMS integrations  
4. Advanced AI tutoring
5. Offline mode with sync
6. Video lecture transcription
7. Exam prediction algorithms

## Conclusion

This comprehensive PRD delivers the full vision of CourseFlow as a multi-regional academic platform serving students across North America and Europe. By leveraging a minimal tech stack with strategic localization, we can:

- **Serve 4 distinct academic systems** (US, Canada, UK, EU) with appropriate adaptations
- **Support 4+ languages at launch** ensuring accessibility across target markets
- **Handle multi-currency payments** with local pricing strategies
- **Respect regional privacy laws** (GDPR, PIPEDA) from day one

The key insight remains: Students don't care about the technology stack - they care about their grades improving and stress reducing. This localized architecture delivers both while respecting the unique academic traditions and requirements of each region.

**Total addressable market**: ~50 million higher education students across target regions, with differentiated pricing and features for each market's unique needs.