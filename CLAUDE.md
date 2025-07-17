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

## Deployment Instructions
When working in this directory:
1. The site auto-deploys when you push to GitHub main branch
2. Use `netlify deploy --prod` for immediate manual deployment
3. Check `netlify status` to verify site connection
4. All changes to `index.html` will automatically go live when committed and pushed

## Recent Changes
- Fixed Substack article display (removed problematic image loading)
- Moved "View all articles" link to top right of Writing section
- Added proper padding to article cards for better hover spacing
- Updated email address from ethan@textql.co to ethan@textql.com