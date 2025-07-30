# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## CourseFlow Overview

CourseFlow is a production-ready AI-powered academic file management platform built with Next.js 14.2.30, TypeScript, and Supabase. It helps students organize, categorize, and enhance their study materials with comprehensive features including AI summaries, collaborative study tools, and multi-regional support.

## Essential Commands

```bash
# Development
npm run dev           # Start development server on http://localhost:3000

# Building & Production
npm run build         # Build for production with optimization
npm run build:analyze # Build with bundle analyzer
npm run start         # Start production server
npm run start:prod    # Start with production environment

# Testing & Quality
npm run lint          # Run ESLint
npm run test          # Run Vitest tests
npm run test:watch    # Run tests in watch mode
npm run test:coverage # Run tests with coverage report

# Database Operations
npm run db:migrate    # Run database migrations
npm run db:rollback   # Rollback last migration
npm run db:backup     # Create database backup
npm run db:status     # Check migration status

# Production Health Monitoring
npm run health:check  # Check application health endpoints

# Running a single test
npm test -- path/to/test.spec.ts
```

## Architecture Overview

### Tech Stack (Production Ready)
- **Frontend**: Next.js 14.2.30+ with TypeScript 5.3+, React 18
- **Styling**: Tailwind CSS 3.4+ with Shadcn/ui components  
- **State Management**: Zustand 4.5+
- **Backend**: Next.js API Routes with comprehensive error handling
- **Database**: PostgreSQL 15+ via Supabase with migration system
- **Auth**: Supabase Auth 2.0+ (email/password, OAuth providers)
- **File Storage**: Supabase Storage with validation and categorization
- **AI Integration**: OpenAI API for file processing and summaries
- **Testing**: Vitest for unit tests with comprehensive test suite
- **Deployment**: Docker containerized with CI/CD pipeline
- **Monitoring**: Health checks, metrics, and graceful shutdown

### Project Structure
```
app/                         # Next.js App Router
├── (auth)/                 # Authentication pages (login, signup, etc.)
├── dashboard/              # Protected app pages (main application)
├── api/                    # API routes with comprehensive endpoints
│   ├── health/            # Health check endpoint
│   ├── metrics/           # Application metrics
│   ├── ready/             # Kubernetes readiness probe
│   ├── courses/           # Course management APIs
│   └── files/             # File upload and management APIs
├── actions/               # Server actions for form handling
├── globals.css           # Global styles
└── instrumentation.ts    # Production monitoring setup

components/                
├── ui/                   # Shadcn/ui base components
├── features/             # Feature-specific components organized by domain
├── performance/          # Performance optimization components
├── security/             # Security-related components
└── seo/                  # SEO optimization components

lib/                      
├── supabase/            # Supabase client configurations
├── services/            # Business logic layer (courses, files)
├── utils/               # Utility functions with validation
├── env.ts               # Environment variable validation
├── rate-limit.ts        # API rate limiting
├── logger.ts            # Structured logging
├── performance.ts       # Performance monitoring
└── graceful-shutdown.ts # Production shutdown handling

scripts/                 # Production management scripts
├── backup-database.js   # Automated database backup
└── migrate-database.js  # Database migration management

types/                   # Shared TypeScript type definitions
```

### Critical Development Rules

1. **Environment Variables**: Always use `lib/env.ts` for environment access - never `process.env` directly
2. **API Security**: Every API route MUST verify authentication and implement rate limiting  
3. **Type Safety**: All types must be defined in `types/` directory with proper exports
4. **Service Layer**: Use `lib/services/` for business logic - never direct database calls from components
5. **Error Handling**: All functions must handle errors gracefully with proper logging
6. **File Processing**: All file uploads must use validation pipeline in `lib/utils/file-validation.ts`
7. **Database Access**: Use Supabase client exclusively - no raw SQL queries
8. **Performance**: Implement lazy loading for large components and optimize bundle sizes

### Production Features

**Monitoring & Health**:
- `/api/health` - Comprehensive health checks (database, memory, environment)
- `/api/ready` - Kubernetes readiness probe
- `/api/metrics` - Application performance metrics
- Structured logging with request correlation IDs
- Graceful shutdown handling for zero-downtime deployments

**Security**:
- Rate limiting on all API endpoints
- Comprehensive input validation and sanitization
- Security headers configured in `next.config.js`
- Environment variable validation at startup

**Performance**:
- Request/response compression enabled
- Static asset optimization with proper caching headers
- Bundle analysis with `npm run build:analyze`
- Web Vitals monitoring with reporting

**Database**:
- Migration system with rollback capability
- Automated backup scripts with cleanup
- Connection pooling and query optimization

### Environment Setup

Copy `.env.example` to `.env.local` and configure:
```env
# Required - Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Required - App Configuration  
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Optional - External Services
OPENAI_API_KEY=your_openai_key
STRIPE_SECRET_KEY=your_stripe_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_public_key
```

### Test Configuration

- **Framework**: Vitest with React Testing Library
- **Setup**: `__tests__/setup.ts` configures test environment
- **Coverage**: Comprehensive test coverage with reports
- **API Testing**: Full API route testing with mocked dependencies
- **Component Testing**: React component testing with user interactions

### BMad Method Integration

This project uses the BMad brownfield development methodology:
- **Core Config**: `.bmad-core/` contains BMad workflows and configurations
- **Agent Commands**: `.claude/commands/BMad/` contains BMad-specific Claude commands
- **Architecture**: `docs/architecture/` contains sharded technical documentation
- **Standards**: Follow coding standards defined in `docs/architecture/coding-standards.md`
- **User Stories**: Located in `docs/stories/` with acceptance criteria

### Key Application Features

1. **File Management**: AI-powered file organization with automatic categorization
2. **Course Management**: Complete academic course lifecycle management  
3. **Multi-Regional**: Support for US, Canada, UK, and EU academic systems
4. **Subscription Tiers**: Free (€0), Pro (€10/mo or €8/mo yearly), Team (€25/mo or €20/mo yearly)
5. **Collaboration**: Real-time study groups with chat and shared resources
6. **Performance Tracking**: Comprehensive analytics and progress monitoring
7. **Security**: Enterprise-grade security with OAuth and secure file handling

### Design System

CourseFlow follows a strict design system for consistency. See `docs/design-system.md` for full guidelines.

**Color Palette**:
- Primary Teal: `#8CC2BE` - buttons, primary actions, hover states
- Section Headers: `#7AFFCA` - main section titles (Overview, Quick Actions, My Courses)
- Card Titles: `#FFC194` - card/component titles within sections
- Term/Status: `#FF7878` - current term text, status indicators

**Key Patterns**:
- Use `text-courseflow-*` Tailwind classes for design system colors
- Apply consistent shadows: `shadow-lg hover:shadow-xl transition-all duration-300`
- Use Framer Motion with standard animations (see `hooks/use-courseflow-animations.ts`)
- Maintain spacing consistency: sections `mb-6`, cards `p-4`, grids `gap-3 sm:gap-4`
- All interactive elements need hover states with smooth transitions

**Typography Hierarchy**:
- Page titles: `text-4xl font-bold text-courseflow-sectionHeader`
- Section headers: `text-base font-semibold text-courseflow-sectionHeader`
- Card titles: `text-xs font-medium text-courseflow-cardTitle`
- Term text: `text-xs text-courseflow-termStatus`
- Body text: `text-sm text-muted-foreground`

**Component Examples**:
- See `components/examples/DesignSystemExample.tsx` for reference implementations
- Use `lib/constants/colors.ts` for color constants
- Apply animations from `hooks/use-courseflow-animations.ts`

### Deployment

**Docker**: Containerized application with multi-stage builds
**CI/CD**: GitHub Actions pipeline with automated testing and deployment
**Health Monitoring**: Production-ready health checks and monitoring endpoints
**Documentation**: Comprehensive deployment guide in `DEPLOYMENT.md`