# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## CourseFlow Overview

CourseFlow is an AI-powered academic file management platform built with Next.js 14, TypeScript, and Supabase. It helps students organize, categorize, and enhance their study materials with features like AI summaries, flashcard generation, and collaborative study groups.

## Essential Commands

```bash
# Development
npm run dev           # Start development server on http://localhost:3000

# Building & Production
npm run build         # Build for production
npm run build:analyze # Build with bundle analyzer
npm start            # Start production server

# Testing & Quality
npm run lint         # Run ESLint
npm test            # Run Vitest tests
npm run test:watch  # Run tests in watch mode

# Running a single test
npm test -- path/to/test.spec.ts
```

## Architecture Overview

### Tech Stack
- **Frontend**: Next.js 14.1+ with TypeScript 5.3+, React 18
- **Styling**: Tailwind CSS 3.4+ with Shadcn/ui components
- **State Management**: Zustand 4.5+
- **Backend**: Next.js API Routes (serverless)
- **Database**: PostgreSQL 15+ via Supabase
- **Auth**: Supabase Auth 2.0+ (email/password, Google OAuth, Microsoft OAuth)
- **File Storage**: Supabase Storage
- **AI Integration**: OpenAI API for categorization and summaries
- **Payments**: Stripe for multi-currency subscriptions
- **Testing**: Vitest for unit tests, Playwright for E2E
- **Deployment**: Vercel

### Project Structure
```
app/                    # Next.js App Router
├── (auth)/            # Authentication pages (login, signup, etc.)
├── (dashboard)/       # Protected app pages (main application)
├── api/               # API routes for backend logic
└── [locale]/          # Internationalized routes (en, fr, de, es)

components/            
├── ui/               # Shadcn/ui base components
└── features/         # Feature-specific components

lib/                   
├── supabase/         # Supabase client configurations
├── services/         # Business logic and API integrations
└── utils/            # Helper functions and utilities

types/                # Shared TypeScript type definitions
```

### Critical Development Rules

1. **Type Safety**: All shared types must be defined in `types/` directory
2. **API Calls**: Never make direct fetch calls from components - use the service layer in `lib/services/`
3. **Environment Variables**: Access only through validated config objects, never `process.env` directly
4. **Auth Checks**: Every API route must verify authentication before processing
5. **Database Queries**: Always use Supabase client, never raw SQL
6. **File Uploads**: Validate file type and size on both client and server
7. **State Updates**: Use immutable updates with Zustand, never mutate state directly

### Naming Conventions
- **Components**: PascalCase (e.g., `FileCard.tsx`)
- **Hooks**: camelCase with 'use' prefix (e.g., `useAuth.ts`)
- **API Routes**: kebab-case (e.g., `/api/user-profile`)
- **Database Tables**: snake_case (e.g., `user_profiles`)

### BMad Method Integration

This project uses the BMad brownfield development methodology. Key BMad files are located in:
- `.bmad-core/` - Core BMad configuration and workflows
- `.claude/commands/BMad/` - BMad agent commands

When working with BMad:
- Development standards are in `docs/architecture/coding-standards.md` and `docs/architecture/tech-stack.md`
- User stories are in `docs/stories/`
- Architecture documentation is sharded in `docs/architecture/`

### Environment Setup Requirements

Required environment variables (create `.env.local`):
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# OpenAI
OPENAI_API_KEY=

# Stripe
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=
```

### Test Configuration

Tests use Vitest with React Testing Library. Test setup file is at `__tests__/setup.ts`. The `@` alias resolves to the project root.

### Key Features to Understand

1. **Multi-Regional Support**: Supports US, Canada, UK, and EU academic systems with localized grading
2. **Subscription Tiers**: Explorer (free), Scholar ($4.99/mo), Master ($9.99/mo) with regional pricing
3. **AI Features**: File categorization, document summaries, flashcard generation
4. **Collaboration**: Study groups with real-time chat and shared whiteboards
5. **Gamification**: Study streaks, achievements, and progress tracking