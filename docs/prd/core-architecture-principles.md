# Core Architecture Principles

## Simplicity First
- No microservices - monolithic Next.js app with clear module separation
- No message queues - synchronous processing is fine for MVP
- No caching layers - Vercel edge caching handles this
- No separate services - everything runs in Next.js API routes

## User Experience Focus
- Every feature must provide immediate, visible value
- Interactive feedback for all actions (progress bars, animations)
- Gamification elements throughout (streaks, achievements, progress tracking)
- Mobile-responsive but desktop-optimized

## Development Velocity
- Ship features in days, not weeks
- Use Supabase for all backend needs
- Leverage UI component libraries
- Focus on core value, not infrastructure
