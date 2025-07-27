# Coding Standards

## Critical Fullstack Rules
- **Type Sharing:** All shared types must be defined in the types/ directory and imported from there
- **API Calls:** Never make direct fetch calls from components - always use the service layer
- **Environment Variables:** Access only through validated config objects, never process.env directly
- **Error Handling:** All API routes must return consistent error format with proper status codes
- **State Updates:** Always use immutable updates with Zustand, never mutate state directly
- **File Uploads:** Always validate file type and size on both client and server
- **Auth Checks:** Every API route must verify authentication before processing
- **Database Queries:** Always use Supabase client, never raw SQL

## Naming Conventions
| Element | Frontend | Backend | Example |
|---------|----------|---------|---------|
| Components | PascalCase | - | `FileCard.tsx` |
| Hooks | camelCase with 'use' | - | `useAuth.ts` |
| API Routes | - | kebab-case | `/api/user-profile` |
| Database Tables | - | snake_case | `user_profiles` |
