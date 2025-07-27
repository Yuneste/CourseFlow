# Non-Functional Requirements (Simplified)

## Performance
- File processing: <30 seconds for most files
- Page load: <2 seconds
- Real-time features: <100ms latency
- Payment processing: <3 seconds

## Scale
- Support 10,000 concurrent users on Vercel
- Storage limits per tier (Free: 50MB, Student: 5GB, Premium: 50GB)

## Security
- Supabase Auth handles all authentication
- Row-level security for data isolation
- HTTPS everywhere via Vercel
- PCI compliance via Stripe
- Subscription status verification on all premium features

## Availability
- 99.9% uptime (Vercel + Supabase SLA)
- Automatic backups via Supabase
