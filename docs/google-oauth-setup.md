# Google OAuth Setup Guide

## Fixing the Supabase Domain Display Issue

When users sign in with Google, they see "You're signing back in to jfdjidnxzlatzxuwhlrf.supabase.co" which looks unprofessional. Here's how to fix it:

### Option 1: Custom Domain (Recommended)

1. **Set up a custom domain in Supabase**:
   - Go to your Supabase project settings
   - Navigate to Authentication > URL Configuration
   - Add a custom domain (e.g., `auth.courseflow.app`)
   - Follow Supabase's instructions to verify the domain

2. **Update your environment variables**:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-custom-domain.com
   ```

### Option 2: Customize Google OAuth Consent Screen

1. **Go to Google Cloud Console**:
   - Visit https://console.cloud.google.com/
   - Select your project
   - Navigate to "APIs & Services" > "OAuth consent screen"

2. **Update Application Information**:
   - Application name: "CourseFlow"
   - Application logo: Upload your CourseFlow logo
   - Application home page: Your production URL
   - Authorized domains: Add your production domain

3. **Update the consent screen text**:
   - This will show "CourseFlow" instead of the Supabase domain
   - Users will see a more professional login experience

### Option 3: Use Supabase Auth UI Customization

In your Supabase dashboard:
1. Go to Authentication > Providers > Google
2. Update the "Site URL" to your production domain
3. Add your production domain to "Redirect URLs"

### Best Practices

1. **For Development**: The Supabase domain is fine
2. **For Production**: Always use a custom domain or properly configured OAuth
3. **Branding**: Ensure your Google OAuth consent screen matches your app's branding

### Environment Variables to Update

```env
# Production
NEXT_PUBLIC_SITE_URL=https://courseflow.app
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Testing

After making changes:
1. Clear your browser cookies
2. Try signing in with Google again
3. Verify the domain shown is your custom domain or app name