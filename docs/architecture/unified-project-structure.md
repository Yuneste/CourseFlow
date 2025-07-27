# Unified Project Structure

```plaintext
CourseFlow/
├── .github/                    # CI/CD workflows
│   └── workflows/
│       ├── ci.yaml
│       └── deploy.yaml
├── app/                        # Next.js App Router
│   ├── (auth)/                 # Auth group
│   │   ├── login/
│   │   ├── register/
│   │   └── layout.tsx
│   ├── (dashboard)/            # Protected routes
│   │   ├── dashboard/
│   │   ├── files/
│   │   ├── study/
│   │   ├── groups/
│   │   └── layout.tsx
│   ├── api/                    # API routes
│   │   ├── courses/
│   │   ├── files/
│   │   ├── study/
│   │   └── groups/
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Landing page
│   └── globals.css             # Global styles
├── components/                 # React components
│   ├── ui/                     # Shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   └── ...
│   ├── features/               # Feature components
│   │   ├── auth/
│   │   ├── courses/
│   │   ├── files/
│   │   └── study/
│   └── layouts/                # Layout components
│       ├── Sidebar.tsx
│       └── Header.tsx
├── lib/                        # Utilities
│   ├── supabase/              # Supabase clients
│   │   ├── client.ts
│   │   └── server.ts
│   ├── api/                    # API utilities
│   │   └── client.ts
│   ├── services/               # Service layer
│   │   ├── files.service.ts
│   │   ├── courses.service.ts
│   │   └── ai.service.ts
│   ├── hooks/                  # Custom hooks
│   │   ├── useAuth.ts
│   │   └── useFiles.ts
│   └── utils/                  # Helpers
│       ├── cn.ts
│       └── file-parser.ts
├── stores/                     # Zustand stores
│   └── useAppStore.ts
├── types/                      # TypeScript types
│   ├── index.ts
│   └── supabase.ts
├── public/                     # Static files
│   └── images/
├── .env.example                # Environment template
├── .eslintrc.json             # ESLint config
├── .gitignore
├── middleware.ts               # Next.js middleware
├── next.config.js              # Next.js config
├── package.json
├── tailwind.config.ts          # Tailwind config
├── tsconfig.json               # TypeScript config
└── README.md
```
