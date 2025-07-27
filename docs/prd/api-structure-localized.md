# API Structure (Localized)

All APIs are Next.js API routes under `/[locale]/api/`:

```
/[locale]/api/auth/* - Handled by Supabase with locale context
/[locale]/api/courses - CRUD for courses with regional terms
/[locale]/api/files/upload - File upload handling
/[locale]/api/files/categorize - AI categorization with language detection
/[locale]/api/files/[id] - File operations
/[locale]/api/study/summary - Generate summaries in user's language
/[locale]/api/study/flashcards - Generate flashcards with translations
/[locale]/api/groups/* - Group operations
/[locale]/api/analytics/* - Study analytics with local grade systems
/[locale]/api/billing/create-checkout - Create checkout with local currency
/[locale]/api/billing/webhook - Stripe webhook handler
/[locale]/api/billing/portal - Customer billing portal
/[locale]/api/billing/usage - Check usage limits
/[locale]/api/grades/convert - Convert between grading systems
/[locale]/api/locale/preferences - Get/set user locale preferences
```
