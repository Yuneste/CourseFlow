# Epic 1: Foundation & Academic Setup (Simplified)

**Epic Goal:** Launch core web platform with user authentication, academic course setup, and file upload capabilities using minimal tech stack.

**Duration:** 2 weeks
**Priority:** P0 - Critical Path

## Story 1.1: Next.js Project Setup & Authentication

**As a developer**, I want to set up the Next.js project with Supabase authentication, so that users can create accounts and log in securely.

### Acceptance Criteria
1. Next.js 14 project created with App Router and TypeScript
2. Supabase project configured with authentication
3. Sign up with email/password 
4. Email verification flow
5. Sign in/out functionality
6. Password reset capability
7. Protected routes middleware
8. Session persistence

### Technical Implementation
```typescript
// Simple auth with Supabase
- app/(auth)/login/page.tsx
- app/(auth)/register/page.tsx  
- app/(auth)/reset-password/page.tsx
- middleware.ts for route protection
- lib/supabase/client.ts
- lib/supabase/server.ts
```

**Estimated Hours:** 16 hours

---

## Story 1.2: Course Management System

**As a student**, I want to set up my courses/modules during onboarding, so the AI can organize my files correctly.

### Acceptance Criteria
1. Onboarding wizard with welcome screen
2. Add courses with: name, code, professor, term, color
3. Visual course grid on dashboard
4. Edit/delete courses functionality
5. Term/semester management (Fall 2024, Spring 2025, etc.)
6. Data persisted to Supabase

### UI/UX Requirements
- Animated onboarding flow with progress indicator
- Course cards with emoji/color customization
- Smooth transitions between steps
- Skip option for quick start

### Technical Implementation
```typescript
// Course management
- app/onboarding/page.tsx
- app/dashboard/page.tsx
- components/CourseCard.tsx
- components/CourseForm.tsx
- api/courses/route.ts
```

**Estimated Hours:** 20 hours

---

## Story 1.3: File Upload Infrastructure

**As a student**, I want to upload files from my computer and have them automatically stored and organized.

### Acceptance Criteria
1. Drag-and-drop file upload zone
2. Folder selection using browser File API
3. Multiple file selection
4. Upload progress indicators
5. File storage in Supabase Storage
6. Basic file metadata saved to database
7. Support for common formats (PDF, DOCX, PPTX, images)

### Technical Implementation
```typescript
// File upload system
- components/FileUpload.tsx
- components/UploadProgress.tsx
- app/api/files/upload/route.ts
- lib/storage/upload.ts
- lib/utils/file-validation.ts
```

### Key Features
- Show preview of selected files
- Validate file types and sizes
- Chunk large uploads
- Handle errors gracefully

**Estimated Hours:** 24 hours

---

## Story 1.4: Basic UI Components & Design System

**As a user**, I want a beautiful, consistent interface that makes studying enjoyable.

### Acceptance Criteria
1. Tailwind CSS configured with custom theme
2. Shadcn/ui components installed and customized
3. Dark mode support
4. Loading states and skeletons
5. Toast notifications
6. Error boundaries
7. Responsive design (desktop-first)

### Components Needed
- Navigation bar with user menu
- Sidebar for course filtering
- Card components for files/courses
- Modal/dialog system
- Form components with validation
- Empty states with helpful messages

**Estimated Hours:** 16 hours

---

## Story 1.5: Dashboard & File Gallery

**As a student**, I want to see all my uploaded files organized by course with search and filters.

### Acceptance Criteria
1. Dashboard shows course overview cards
2. File gallery with grid/list view toggle
3. Search by filename
4. Filter by course, file type, date
5. Sort options (name, date, size)
6. Quick actions (download, delete, move)
7. Empty states for new users

### UI/UX Requirements
- Smooth animations on filter changes
- Hover states showing file details
- Bulk selection mode
- Responsive grid layout

**Estimated Hours:** 20 hours

---

## Story 1.6: Payment Integration & Subscription Management

**As a platform owner**, I want to integrate Stripe payment processing so users can upgrade to paid tiers.

### Acceptance Criteria
1. Stripe integration via Supabase
2. Pricing page with tier comparison
3. Checkout flow for upgrades
4. Subscription management portal
5. Usage tracking implementation
6. Free trial activation (7 days)
7. Student discount verification
8. Webhook handling for subscription events

### Technical Implementation
```typescript
// Payment system
- app/pricing/page.tsx
- app/api/billing/[...routes]/route.ts
- lib/stripe/client.ts
- lib/subscriptions/limits.ts
- components/UpgradePrompt.tsx
- components/UsageIndicator.tsx
```

### Key Features
- Secure checkout with Stripe
- Real-time subscription updates
- Usage limit enforcement
- Billing portal access

**Estimated Hours:** 24 hours

---

## Epic Success Criteria

1. **Users can complete full flow:** Sign up → Set up courses → Upload files → View organized files
2. **Performance:** All pages load in <2 seconds
3. **Quality:** No critical bugs, smooth user experience
4. **Developer Experience:** Clean code structure, easy to extend

## Technical Decisions

### Why These Choices
- **Next.js App Router:** Modern React with built-in optimizations
- **Supabase:** Eliminates backend complexity
- **Tailwind + Shadcn:** Beautiful UI without design debt
- **TypeScript:** Catch errors early, better DX

### What We're NOT Building Yet
- AI categorization (Epic 2)
- Study tools (Epic 3)  
- Collaboration features (Epic 4)
- Desktop app (not needed)
- Mobile app (not needed for MVP)

## Risk Mitigation

1. **File Upload Limits:** Start with 50MB max, optimize later
2. **Browser Compatibility:** Test File API on all major browsers
3. **User Confusion:** Clear onboarding with example courses

## Definition of Done

- [ ] All stories complete and tested
- [ ] Deployed to Vercel production
- [ ] Basic analytics tracking setup
- [ ] User documentation written
- [ ] Code reviewed and cleaned up
- [ ] Performance benchmarks met

## Next Epic Preview

Epic 2 will add AI intelligence to automatically categorize and organize uploaded files, generate summaries, and create smart file relationships. The foundation from Epic 1 makes this seamless to implement.