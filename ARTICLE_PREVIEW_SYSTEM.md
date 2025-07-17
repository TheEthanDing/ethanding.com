# Article Preview System for Twitter Sharing

## Overview

This system creates dedicated preview pages for each Substack article at `ethanding.com/<slug>` to avoid Twitter's de-ranking of Substack links.

## How It Works

1. **Article Fetching**: The system fetches articles from your Substack RSS feed (`https://ethanding.substack.com/feed`)
2. **Slug Generation**: Each article title is converted to a URL-friendly slug (e.g., "Hello World" → "hello-world")
3. **Preview Pages**: When someone visits `ethanding.com/<slug>`, they see a preview page with:
   - Article title and excerpt
   - Author info (your profile)
   - Featured image (if available)
   - "Read this post" button that links to the actual Substack article

## Files Modified

### 1. `article-preview.html` (NEW)
- Template for article preview pages
- Dynamically loads article content based on URL slug
- Includes proper Open Graph and Twitter Card meta tags for social sharing
- Matches the design style from your reference image

### 2. `index.html` (MODIFIED)
- Updated article links to point to preview pages (`/<slug>`) instead of direct Substack links
- Added slug generation logic in the `displayArticles` function

### 3. `netlify.toml` (MODIFIED)
- Added redirect rules to serve `article-preview.html` for any `/<slug>` URLs
- Ensures static assets (images, CSS) are served correctly

## Usage

1. **Deploy**: Push changes to your GitHub repository to deploy via Netlify
2. **Share**: Use links like `https://ethanding.com/your-article-slug` on Twitter
3. **Benefit**: Twitter won't de-rank these links since they're on your own domain

## Example URL Structure

- Original Substack: `https://ethanding.substack.com/p/hello-world`
- New preview page: `https://ethanding.com/hello-world`
- Preview page redirects to Substack when user clicks "Read this post"

## SEO Benefits

- **Open Graph tags**: Proper title, description, and image for social sharing
- **Twitter Cards**: Optimized display on Twitter
- **Own domain**: Avoids platform-specific link penalties
- **Fast loading**: Lightweight preview pages load quickly

## Technical Details

- Uses the same RSS feed as your main site
- Client-side JavaScript matches URL slugs to articles
- Fallback error handling for missing articles
- Responsive design that works on all devices
- Proper security headers maintained

## Testing

To test locally:
1. Start a local server in the project directory
2. Visit `http://localhost:8000/your-article-slug`
3. Verify the preview loads correctly
4. Click "Read this post" to ensure it redirects to Substack

## Future Enhancements

- Add analytics tracking for preview page visits
- Cache article data to improve loading speed
- Add more social sharing buttons (LinkedIn, Facebook, etc.)
- Implement server-side rendering for better SEO