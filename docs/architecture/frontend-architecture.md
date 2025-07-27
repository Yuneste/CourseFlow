# Frontend Architecture

## Component Architecture

### Component Organization
```text
app/
├── [locale]/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── register/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   ├── (dashboard)/
│   ├── dashboard/
│   │   └── page.tsx
│   ├── files/
│   │   ├── page.tsx
│   │   └── [id]/
│   │       └── page.tsx
│   ├── study/
│   │   └── page.tsx
│   ├── groups/
│   │   └── [id]/
│   │       └── page.tsx
│   └── layout.tsx
├── api/
│   ├── courses/
│   ├── files/
│   └── study/
├── layout.tsx
└── page.tsx

components/
├── ui/              # Shadcn/ui components
├── features/
│   ├── auth/
│   ├── courses/
│   ├── files/
│   └── study/
└── layouts/
```

### Component Template
```typescript
// components/features/files/FileCard.tsx
import { Card } from '@/components/ui/card';
import { File } from '@/types';

interface FileCardProps {
  file: File;
  onSelect?: (file: File) => void;
}

export function FileCard({ file, onSelect }: FileCardProps) {
  return (
    <Card 
      className="p-4 hover:shadow-lg transition-shadow cursor-pointer"
      onClick={() => onSelect?.(file)}
    >
      <h3 className="font-semibold">{file.display_name}</h3>
      <p className="text-sm text-muted-foreground">
        {file.ai_category} • {file.course?.name}
      </p>
    </Card>
  );
}
```

## State Management Architecture

### State Structure
```typescript
// stores/useAppStore.ts
import { create } from 'zustand';

interface AppState {
  // User state
  user: User | null;
  
  // Courses state
  courses: Course[];
  selectedCourse: Course | null;
  
  // Files state
  files: File[];
  uploadProgress: Record<string, number>;
  
  // UI state
  sidebarOpen: boolean;
  
  // Actions
  setCourses: (courses: Course[]) => void;
  addFile: (file: File) => void;
  updateUploadProgress: (fileId: string, progress: number) => void;
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  courses: [],
  selectedCourse: null,
  files: [],
  uploadProgress: {},
  sidebarOpen: true,
  
  setCourses: (courses) => set({ courses }),
  addFile: (file) => set((state) => ({ 
    files: [...state.files, file] 
  })),
  updateUploadProgress: (fileId, progress) => set((state) => ({
    uploadProgress: { ...state.uploadProgress, [fileId]: progress }
  })),
}));
```

### State Management Patterns
- Use Zustand stores for global state (user, courses, files)
- Use React Query for server state and caching
- Use local component state for UI-only state
- Implement optimistic updates for better UX
- Persist critical state to localStorage

## Routing Architecture

### Locale-Aware Route Organization
```text
Route Structure:
/[locale]                       # Locale root
  /                            # Landing page
  /(auth)
    /login                     # Sign in page
    /register                  # Sign up page  
    /reset-password            # Password reset
  /(dashboard)
    /dashboard                 # Main dashboard
    /onboarding               # First-time setup
    /files                    # File gallery
    /files/[id]               # File viewer
    /study                    # Study mode
    /study/session            # Active session
    /groups                   # Study groups
    /groups/[id]              # Group workspace
    /analytics                # Performance tracking
    /settings                 # User settings
    /pricing                  # Pricing page

Supported locales:
- en-US (English - United States)
- en-GB (English - United Kingdom)
- fr-CA (French - Canada)
- fr (French - France)
- de (German)
- es (Spanish)
```

### i18n Configuration
```typescript
// i18n.config.ts
export const locales = ['en-US', 'en-GB', 'fr-CA', 'fr', 'de', 'es'] as const;
export type Locale = typeof locales[number];

export const defaultLocale: Locale = 'en-US';

export const localeNames: Record<Locale, string> = {
  'en-US': 'English (US)',
  'en-GB': 'English (UK)',
  'fr-CA': 'Français (Canada)',
  'fr': 'Français',
  'de': 'Deutsch',
  'es': 'Español'
};

export const localeCurrencies: Record<Locale, string> = {
  'en-US': 'USD',
  'en-GB': 'GBP',
  'fr-CA': 'CAD',
  'fr': 'EUR',
  'de': 'EUR',
  'es': 'EUR'
};
```

### Protected Route Pattern
```typescript
// middleware.ts
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  
  // Get locale from path or detect from headers
  const pathname = req.nextUrl.pathname;
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );
  
  // Redirect if no locale
  if (!pathnameHasLocale) {
    const locale = getLocale(req);
    const newUrl = new URL(`/${locale}${pathname}`, req.url);
    return NextResponse.redirect(newUrl);
  }
  
  const { data: { session } } = await supabase.auth.getSession();
  
  // Protect dashboard routes
  const isDashboardRoute = pathname.includes('/(dashboard)');
  if (isDashboardRoute && !session) {
    const locale = pathname.split('/')[1];
    return NextResponse.redirect(new URL(`/${locale}/login`, req.url));
  }
  
  return res;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ]
};
```

## Frontend Services Layer

### API Client Setup
```typescript
// lib/api/client.ts
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

class ApiClient {
  private supabase = createClientComponentClient();
  
  private async getAuthHeader() {
    const { data: { session } } = await this.supabase.auth.getSession();
    return session ? { Authorization: `Bearer ${session.access_token}` } : {};
  }
  
  async get<T>(path: string): Promise<T> {
    const headers = await this.getAuthHeader();
    const res = await fetch(`/api${path}`, { headers });
    if (!res.ok) throw new Error(res.statusText);
    return res.json();
  }
  
  async post<T>(path: string, body: any): Promise<T> {
    const headers = await this.getAuthHeader();
    const res = await fetch(`/api${path}`, {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(res.statusText);
    return res.json();
  }
}

export const api = new ApiClient();
```

### Service Example
```typescript
// lib/services/files.service.ts
import { api } from '@/lib/api/client';

export const filesService = {
  async upload(files: File[], courseId?: string) {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    if (courseId) formData.append('course_id', courseId);
    
    return api.post<UploadResult>('/files/upload', formData);
  },
  
  async categorize(fileIds: string[]) {
    return api.post('/files/categorize', { file_ids: fileIds });
  },
  
  async getFiles(courseId?: string) {
    const query = courseId ? `?course_id=${courseId}` : '';
    return api.get<File[]>(`/files${query}`);
  },
};
```
