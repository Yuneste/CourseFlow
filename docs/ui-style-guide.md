# CourseFlow UI/UX Style Guide

## Clean Code Principles for UI Components

### 1. Component Structure

#### Single Responsibility Principle
Each component should have one clear purpose:
- ❌ `UserDashboardWithSettingsAndAnalytics.tsx`
- ✅ `UserDashboard.tsx`, `UserSettings.tsx`, `Analytics.tsx`

#### File Organization
```
components/
├── ui/                    # Base UI components (buttons, cards, etc.)
├── features/             # Feature-specific components
│   ├── courses/
│   ├── files/
│   └── users/
├── layouts/              # Layout components
└── compositions/         # Composite components
```

### 2. Naming Conventions

#### Components
- **PascalCase** for component names: `CourseCard`, `FileUpload`
- **Descriptive names**: `LoadingSpinner` not `Spinner`
- **Action prefixes** for handlers: `onClick`, `onSubmit`, `onChange`

#### Props Interfaces
```typescript
// ✅ Good - Clear and specific
interface CourseCardProps {
  course: Course;
  onEdit?: (course: Course) => void;
  onDelete?: (course: Course) => void;
}

// ❌ Bad - Too generic
interface Props {
  data: any;
  callback: Function;
}
```

#### Files
- Component files: `ComponentName.tsx`
- Hook files: `useHookName.ts`
- Utility files: `utility-name.ts`
- Constant files: `constants-name.ts`

### 3. Component Patterns

#### Composition Over Configuration
```typescript
// ✅ Good - Composable
<PageLayout>
  <PageLayout.Header title="Dashboard" />
  <PageLayout.Content>
    {/* content */}
  </PageLayout.Content>
</PageLayout>

// ❌ Bad - Configuration heavy
<Page 
  headerTitle="Dashboard"
  headerSubtitle="Welcome"
  showFooter={true}
  footerContent="..."
/>
```

#### Props Destructuring
```typescript
// ✅ Good
export function Button({ 
  children, 
  variant = 'default', 
  size = 'md',
  ...props 
}: ButtonProps) {
  // implementation
}

// ❌ Bad
export function Button(props: ButtonProps) {
  const variant = props.variant || 'default';
  // etc.
}
```

### 4. State Management

#### Keep State Local When Possible
```typescript
// ✅ Good - Local state for UI
function Dropdown() {
  const [isOpen, setIsOpen] = useState(false);
  // ...
}

// ❌ Bad - Global state for local UI
// Don't put isDropdownOpen in global store
```

#### Custom Hooks for Complex Logic
```typescript
// ✅ Good
function CourseList() {
  const { courses, loading, error, refetch } = useCourses();
  // Clean component logic
}

// ❌ Bad
function CourseList() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  // Lots of fetch logic in component
}
```

### 5. Styling Best Practices

#### Use Design Tokens
```typescript
// ✅ Good
import { SPACING, COLORS } from '@/lib/constants/ui.constants';

style={{ padding: SPACING.MD }}

// ❌ Bad
style={{ padding: 16 }} // Magic number
```

#### Consistent Class Naming
```typescript
// ✅ Good - Using cn() utility
className={cn(
  "base-classes",
  variant && variantClasses[variant],
  isActive && "active-classes",
  className // Allow override
)}

// ❌ Bad - String concatenation
className={`button ${variant} ${isActive ? 'active' : ''}`}
```

### 6. Performance Optimization

#### Memoization
```typescript
// ✅ Good - Memoize expensive computations
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(data);
}, [data]);

// ✅ Good - Memoize callbacks
const handleClick = useCallback(() => {
  doSomething(id);
}, [id]);
```

#### Lazy Loading
```typescript
// ✅ Good
const HeavyComponent = lazy(() => import('./HeavyComponent'));

function App() {
  return (
    <Suspense fallback={<LoadingState />}>
      <HeavyComponent />
    </Suspense>
  );
}
```

### 7. Accessibility

#### ARIA Labels
```typescript
// ✅ Good
<button
  aria-label="Delete course"
  aria-describedby="delete-warning"
  onClick={handleDelete}
>
  <Trash2 className="h-4 w-4" />
</button>

// ❌ Bad - No context for screen readers
<button onClick={handleDelete}>
  <Trash2 className="h-4 w-4" />
</button>
```

#### Keyboard Navigation
```typescript
// ✅ Good
onKeyDown={(e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    handleSelect();
  }
  if (e.key === 'Escape') {
    handleClose();
  }
}}
```

### 8. Error Handling

#### User-Friendly Error States
```typescript
// ✅ Good
<EmptyState
  icon={AlertCircle}
  title="Unable to load courses"
  description="Please check your connection and try again"
  action={{
    label: "Retry",
    onClick: refetch
  }}
/>

// ❌ Bad
<div>Error: {error.message}</div>
```

### 9. Documentation

#### Component Documentation
```typescript
/**
 * CourseCard displays course information in a card format
 * 
 * @example
 * <CourseCard
 *   course={courseData}
 *   onEdit={handleEdit}
 *   onDelete={handleDelete}
 * />
 */
export function CourseCard({ ... }: CourseCardProps) {
  // ...
}
```

#### Props Documentation
```typescript
interface CourseCardProps {
  /** The course data to display */
  course: Course;
  /** Callback when edit button is clicked */
  onEdit?: (course: Course) => void;
  /** Callback when delete button is clicked */
  onDelete?: (course: Course) => void;
  /** Additional CSS classes */
  className?: string;
}
```

### 10. Testing Considerations

#### Data Attributes for Testing
```typescript
// ✅ Good
<button
  data-testid="submit-button"
  onClick={handleSubmit}
>
  Submit
</button>

// Use in tests:
// screen.getByTestId('submit-button')
```

## Color Palette Usage

### Primary Colors
- **Primary**: Salmon/Coral (#FA8072, #FF6B6B)
- **Background**: Subtle gradients with primary accents
- **Text**: High contrast for accessibility

### Semantic Colors
- **Success**: Green tones for positive actions
- **Warning**: Amber for cautions
- **Destructive**: Red for dangerous actions
- **Muted**: Gray tones for secondary content

## Animation Guidelines

### Duration Constants
```typescript
ANIMATION.FAST    // 150ms - Micro interactions
ANIMATION.NORMAL  // 300ms - Standard transitions
ANIMATION.SLOW    // 500ms - Page transitions
```

### Motion Principles
1. **Purpose**: Every animation should have a clear purpose
2. **Performance**: Use CSS transforms over position changes
3. **Accessibility**: Respect `prefers-reduced-motion`
4. **Consistency**: Use the same easing functions throughout

## Component Examples

### Clean Loading State
```typescript
<LoadingState variant="card" count={6} />
```

### Clean Empty State
```typescript
<EmptyState
  icon={BookOpen}
  title="No courses yet"
  description="Start by adding your first course"
  action={{
    label: "Add Course",
    onClick: () => router.push('/courses/new')
  }}
/>
```

### Clean Error Boundary
```typescript
<ErrorBoundary
  fallback={<ErrorFallback />}
  onError={(error) => logError(error)}
>
  <YourComponent />
</ErrorBoundary>
```

## File Size and Bundle Optimization

1. **Lazy load** heavy components
2. **Tree shake** unused imports
3. **Optimize images** with next/image
4. **Split code** by routes
5. **Minimize** third-party dependencies

## Conclusion

Following these clean code principles will result in:
- 🎯 More maintainable code
- 🚀 Better performance
- ♿ Improved accessibility
- 🧪 Easier testing
- 👥 Better team collaboration

Remember: Clean code is not just about following rules, but about writing code that clearly expresses its intent and is a pleasure to work with.