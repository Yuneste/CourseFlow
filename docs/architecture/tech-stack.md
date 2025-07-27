# Tech Stack

This is the DEFINITIVE technology selection. All development must use these exact versions.

## Technology Stack Table
| Category | Technology | Version | Purpose | Rationale |
|----------|------------|---------|---------|-----------|
| Frontend Language | TypeScript | 5.3+ | Type-safe development | Catch errors early, better DX |
| Frontend Framework | Next.js | 14.1+ | Full-stack React framework | Single framework for entire app |
| UI Component Library | Shadcn/ui | Latest | Beautiful, accessible components | Rapid UI development |
| State Management | Zustand | 4.5+ | Lightweight state management | Simple, no boilerplate |
| Backend Language | TypeScript | 5.3+ | Unified language | Same as frontend |
| Backend Framework | Next.js API Routes | 14.1+ | Serverless API endpoints | Built into Next.js |
| API Style | REST | - | Simple HTTP APIs | No GraphQL complexity |
| Database | PostgreSQL | 15+ | Relational data | Via Supabase |
| Cache | Vercel Edge Cache | - | CDN caching | Automatic with Vercel |
| File Storage | Supabase Storage | - | User file storage | Integrated with auth |
| Authentication | Supabase Auth | 2.0+ | Complete auth solution | Email, OAuth, magic links |
| Frontend Testing | Vitest | 1.2+ | Unit testing | Fast, Jest-compatible |
| Backend Testing | Vitest | 1.2+ | API testing | Same as frontend |
| E2E Testing | Playwright | 1.41+ | Browser automation | Reliable, fast |
| Build Tool | Next.js | 14.1+ | Built-in build system | Zero config |
| Bundler | Webpack/Turbopack | Built-in | Via Next.js | Automatic optimization |
| IaC Tool | N/A | - | Not needed | Vercel handles infra |
| CI/CD | GitHub Actions | - | Automated deployment | Free for public repos |
| Monitoring | Vercel Analytics | - | Performance monitoring | Built into platform |
| Logging | Vercel Logs | - | Centralized logging | Automatic with Vercel |
| CSS Framework | Tailwind CSS | 3.4+ | Utility-first CSS | Rapid styling |
| i18n Framework | next-intl | 3.0+ | Internationalization | Type-safe translations |
| Payment Processing | Stripe | Latest | Multi-currency billing | Global payment support |
