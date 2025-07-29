# Module Boundaries and Architecture

This document defines the module boundaries and import rules for the CourseFlow application to maintain clean architecture and prevent circular dependencies.

## Module Hierarchy

```
┌─────────────────────────────────────────────────────┐
│                     app/                            │
│  (Next.js pages, API routes, and page components)   │
│     Can import from: components/, lib/, types/      │
└─────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────┐
│                  components/                         │
│    (Reusable UI components and features)           │
│     Can import from: lib/, types/, other components │
└─────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────┐
│                     lib/                            │
│   (Business logic, utilities, and services)        │
│        Can import from: types/ only                │
└─────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────┐
│                    types/                           │
│      (TypeScript type definitions only)            │
│         Cannot import from anywhere                 │
└─────────────────────────────────────────────────────┘
```

## Import Rules

### 1. **app/** Directory
- ✅ CAN import from: `components/`, `lib/`, `types/`, `hooks/`
- ❌ CANNOT import from: other `app/` subdirectories (except shared layouts)
- **Purpose**: Contains Next.js pages, API routes, and page-specific components

### 2. **components/** Directory
- ✅ CAN import from: `lib/`, `types/`, `hooks/`, other `components/`
- ❌ CANNOT import from: `app/`
- **Purpose**: Reusable UI components that are framework-agnostic

### 3. **lib/** Directory
- ✅ CAN import from: `types/` only
- ❌ CANNOT import from: `app/`, `components/`, `hooks/`
- **Purpose**: Business logic, utilities, and services with no UI dependencies

### 4. **hooks/** Directory
- ✅ CAN import from: `lib/`, `types/`
- ❌ CANNOT import from: `app/`, `components/`
- **Purpose**: Custom React hooks for shared logic

### 5. **types/** Directory
- ❌ CANNOT import from anywhere (pure type definitions only)
- **Purpose**: Shared TypeScript interfaces and types

## Module Organization

### lib/ Structure
```
lib/
├── api/           # API client and utilities
├── constants/     # Application constants
├── services/      # Business logic services
├── supabase/      # Database client configuration
├── utils/         # Pure utility functions
└── env.ts         # Environment configuration
```

### components/ Structure
```
components/
├── ui/            # Base UI components (buttons, cards, etc.)
├── layout/        # Layout components (header, sidebar, etc.)
├── features/      # Feature-specific components
├── providers/     # React context providers
├── feedback/      # User feedback components
├── security/      # Security-related components
├── accessibility/ # Accessibility components
├── performance/   # Performance optimization components
├── seo/          # SEO components
└── monitoring/   # Monitoring and analytics components
```

## Best Practices

### 1. **Service Layer Pattern**
All business logic should be in `lib/services/`:
```typescript
// ✅ Good: Business logic in service
// lib/services/courses.service.ts
export class CoursesService {
  static async createCourse(data: CourseFormData) {
    // Business logic here
  }
}

// ❌ Bad: Business logic in component
// components/features/courses/CourseForm.tsx
async function handleSubmit() {
  // Don't put business logic here
}
```

### 2. **Type Definitions**
All shared types go in `types/`:
```typescript
// ✅ Good: Shared types in types/
// types/index.ts
export interface Course {
  id: string;
  name: string;
}

// ❌ Bad: Types in component files
// components/CourseCard.tsx
interface Course { // Don't define shared types here
}
```

### 3. **Constants**
All constants go in `lib/constants/`:
```typescript
// ✅ Good: Constants centralized
// lib/constants/index.ts
export const FILE_UPLOAD = {
  MAX_SIZE: 50 * 1024 * 1024
};

// ❌ Bad: Magic numbers in code
// components/FileUpload.tsx
if (file.size > 50 * 1024 * 1024) { // Don't use magic numbers
}
```

### 4. **Component Exports**
Use the centralized `components/index.ts`:
```typescript
// ✅ Good: Import from index
import { CourseCard, FileUpload } from '@/components';

// ❌ Bad: Deep imports
import CourseCard from '@/components/features/courses/CourseCard';
```

## Enforcing Boundaries

### 1. **ESLint Rules**
Configure ESLint to enforce import boundaries:
```json
{
  "rules": {
    "no-restricted-imports": ["error", {
      "patterns": [
        {
          "group": ["@/app/*"],
          "message": "Components cannot import from app directory"
        }
      ]
    }]
  }
}
```

### 2. **TypeScript Path Aliases**
Use path aliases to make imports cleaner:
```json
{
  "compilerOptions": {
    "paths": {
      "@/components": ["./components"],
      "@/lib/*": ["./lib/*"],
      "@/types": ["./types"],
      "@/hooks/*": ["./hooks/*"]
    }
  }
}
```

### 3. **Code Review Checklist**
- [ ] No imports from `app/` in `components/` or `lib/`
- [ ] No imports from `components/` in `lib/`
- [ ] All shared types are in `types/`
- [ ] All constants are in `lib/constants/`
- [ ] Business logic is in `lib/services/`
- [ ] No circular dependencies

## Benefits

1. **Clear Dependencies**: Easy to understand what depends on what
2. **Better Testing**: Can test `lib/` without UI dependencies
3. **Reusability**: Components and lib can be used in other projects
4. **Maintainability**: Changes in one module don't cascade everywhere
5. **Type Safety**: Centralized types ensure consistency
6. **Performance**: Clear boundaries enable better code splitting