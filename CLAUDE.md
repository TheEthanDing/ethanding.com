# Ethan Ding Personal Website (ethanding.com)

## GitHub Repository
- **Repository**: `TheEthanDing/ethanding.com`
- **URL**: https://github.com/TheEthanDing/ethanding.com
- **Branch**: `main`

## Netlify Deployment
- **Site Name**: `rad-biscuit-608c06`
- **Production URL**: https://ethanding.com
- **Site ID**: `335b9cdc-79f1-4730-95e5-e6417147092d`
- **Admin Panel**: https://app.netlify.com/projects/rad-biscuit-608c06

## Auto-Deployment Setup
The site is configured for automatic deployment:
- **Source**: Connected to GitHub repository `TheEthanDing/ethanding.com`
- **Branch**: `main` (auto-deploys on push)
- **Build Command**: `echo 'No build step required for static site'`
- **Publish Directory**: `.` (root directory)

## Manual Deployment Commands
```bash
# Check site status
netlify status

# Deploy to production
netlify deploy --prod

# Deploy preview (staging)
netlify deploy
```

## Site Configuration
- **Config File**: `netlify.toml` (in project root)
- **Features**: Security headers, cache optimization
- **Type**: Static HTML site with JavaScript

## Content Management
- **Reading Data**: Airtable API (books/reading activity)
- **Writing Data**: Substack RSS feed (articles)
- **Email**: ethan@textql.com

## Deployment Best Practices

### Method 1: Manual Deploy (Recommended)
If auto-deployment fails or you want immediate deployment:
```bash
cd /Users/ethanding/projects/misc/ethanding.com
git add .
git commit -m "Your commit message"
git push origin main
npx netlify-cli deploy --prod --dir=.
```

### Method 2: GitHub Auto-Deploy
For normal workflow:
```bash
git add .
git commit -m "Your commit message"
git push origin main
# Netlify will auto-deploy from GitHub webhook
```

### Troubleshooting Deployment Issues
1. **Repository access errors**: Use manual deploy with `npx netlify-cli deploy --prod --dir=.`
2. **Build failures**: Check `netlify.toml` syntax and ensure no complex dependencies
3. **Cache issues**: Clear Netlify cache or use manual deploy to bypass
4. **Missing files**: Ensure all files are committed and pushed to GitHub

### Pre-deployment Checklist
- [ ] Test changes locally
- [ ] Commit all files including new assets
- [ ] Push to GitHub main branch
- [ ] If auto-deploy fails, use manual deploy
- [ ] Verify site loads correctly at https://ethanding.com
- [ ] Test article preview pages work properly

## Deployment Instructions
When working in this directory:
1. The site auto-deploys when you push to GitHub main branch
2. Use `netlify deploy --prod` for immediate manual deployment
3. Check `netlify status` to verify site connection
4. All changes to `index.html` will automatically go live when committed and pushed

## Article Preview System for Twitter

### How It Works
- **Homepage**: Links directly to Substack articles (normal user experience)
- **Twitter Sharing**: Manually use `https://ethanding.com/article-slug` URLs
- **Article Slugs**: Generated from article titles (e.g., "Hello World" → "hello-world")
- **Server-Side Meta Tags**: Netlify Edge Function injects proper Open Graph and Twitter Card meta tags
- **Bypass De-ranking**: Twitter sees your domain instead of Substack, avoiding platform penalties

### Usage Workflow
1. **Regular Users**: Click articles on homepage → go directly to Substack
2. **Twitter Sharing**: 
   - Find article title (e.g., "windsurf gets margin called")
   - Convert to slug: `windsurf-gets-margin-called`
   - Share: `https://ethanding.com/windsurf-gets-margin-called`
   - Twitter shows rich preview with your domain

### Technical Implementation
- **Netlify Edge Function**: Fetches RSS feed and injects meta tags server-side
- **Client-Side Fallback**: JavaScript handles article display and redirects
- **Automatic Routing**: Any `/:slug` URL serves the preview system
- **SEO Optimized**: Proper meta tags for all social media platforms

## Recent Changes
- Added article preview system for Twitter sharing with clean design
- Implemented dynamic routing for article slugs with server-side meta tag injection
- Made article preview cards fully clickable with hover effects
- Fixed homepage to link directly to Substack (not preview pages)
- Fixed Substack article display (removed problematic image loading)
- Moved "View all articles" link to top right of Writing section
- Added proper padding to article cards for better hover spacing
- Updated email address from ethan@textql.co to ethan@textql.com