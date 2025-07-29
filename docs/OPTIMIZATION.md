# CourseFlow Optimization Guide

## Project Size Issues (Current: 1.2GB)

### Identified Problems

1. **node_modules**: 611MB
   - This is normal for a Next.js project with many dependencies
   - Use `npm ci` instead of `npm install` for faster, cleaner installs

2. **.next folder**: 465MB
   - Build cache accumulating over time
   - Webpack cache: 457MB (main culprit)

3. **Deployment time increase**: 40s → 90s
   - Cache buildup
   - Unnecessary files being processed

## Immediate Solutions

### 1. Clean Build Artifacts

```bash
# Quick clean (keeps node_modules)
npm run clean

# Full clean (removes everything)
npm run clean:all
npm install
```

### 2. Optimize Vercel Deployment

Update your `vercel.json`:

```json
{
  "buildCommand": "npm run clean && npm run build",
  "ignoreCommand": "git diff --quiet HEAD^ HEAD ."
}
```

### 3. Add .vercelignore

Create `.vercelignore` file:

```
# Dependencies
node_modules
.pnp
.pnp.js

# Testing
coverage
__tests__
*.test.ts
*.test.tsx
vitest.config.ts

# Development
.next
.turbo
.eslintcache
*.local
.env.local
.env.development.local

# Documentation
docs
*.md
!README.md

# Git
.git
.gitignore

# Editor
.vscode
.idea
*.swp

# OS
.DS_Store
Thumbs.db

# Scripts
scripts
.bmad-core

# Misc
.cache
tsconfig.tsbuildinfo
```

### 4. Next.js Configuration Optimizations

Update `next.config.js`:

```javascript
const nextConfig = {
  // ... existing config
  
  // Optimize build
  swcMinify: true,
  compress: true,
  
  // Reduce build cache size
  experimental: {
    // Reduce memory usage during build
    workerThreads: false,
    cpus: 1,
    
    // Optimize caching
    isrMemoryCacheSize: 0, // Disable ISR cache in development
  },
  
  // Clean webpack cache periodically
  webpack: (config, { dev, isServer }) => {
    // ... existing webpack config
    
    if (!dev && !isServer) {
      // Optimize bundle size
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          default: false,
          vendors: false,
          vendor: {
            name: 'vendor',
            chunks: 'all',
            test: /node_modules/,
            priority: 20
          },
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            priority: 10,
            reuseExistingChunk: true,
            enforce: true
          }
        }
      };
    }
    
    return config;
  }
};
```

## Long-term Solutions

### 1. Implement Dependency Optimization

Review and optimize dependencies:

```bash
# Check for unused dependencies
npx depcheck

# Analyze bundle size
npm run build:analyze
```

Consider replacing heavy dependencies:
- Use `date-fns` instead of `moment`
- Use `@radix-ui` components selectively
- Lazy load heavy components

### 2. Implement CI/CD Caching

For GitHub Actions:

```yaml
- name: Cache dependencies
  uses: actions/cache@v3
  with:
    path: |
      ~/.npm
      .next/cache
    key: ${{ runner.os }}-nextjs-${{ hashFiles('**/package-lock.json') }}
    restore-keys: |
      ${{ runner.os }}-nextjs-
```

### 3. Set Up Development Best Practices

Add to your development workflow:

```bash
# Before committing
npm run clean
npm run lint
npm run test

# Weekly maintenance
npm run clean:all
npm install
npm audit fix
```

### 4. Monitor Bundle Size

Add bundle size monitoring:

```json
// package.json
{
  "scripts": {
    "analyze": "cross-env ANALYZE=true next build",
    "size": "size-limit",
    "prepush": "npm run size"
  }
}
```

## Performance Monitoring

### 1. Add Build Time Tracking

```javascript
// next.config.js
module.exports = {
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  
  // Log build performance
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    if (!dev && !isServer) {
      console.time('Build Time');
      process.on('exit', () => {
        console.timeEnd('Build Time');
      });
    }
    return config;
  },
};
```

### 2. Regular Maintenance Schedule

Weekly:
- Run `npm run clean`
- Check for dependency updates
- Review bundle size

Monthly:
- Full clean and reinstall
- Audit dependencies
- Review and optimize imports

## Expected Results

After implementing these optimizations:
- Project size: ~400-500MB (excluding node_modules)
- Build time: 30-40% faster
- Deployment time: Back to 40-50 seconds
- Better development experience

## Troubleshooting

If issues persist:

1. **Clear all caches**:
   ```bash
   rm -rf .next node_modules package-lock.json
   npm install
   npm run build
   ```

2. **Check for large files**:
   ```bash
   find . -type f -size +10M -not -path "./node_modules/*" -not -path "./.next/*"
   ```

3. **Verify Git is not tracking large files**:
   ```bash
   git ls-files -s | sort -n -k 2 | tail -20
   ```

Remember: The `.next` folder should never be committed to Git!