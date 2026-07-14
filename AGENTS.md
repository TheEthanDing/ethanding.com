# Ethan Ding Personal Website (ethanding.com)

## Repository

- GitHub: `TheEthanDing/ethanding.com`
- Production branch: `main`
- Runtime: Node.js 20+

## Hosting

The site is deployed to Railway from GitHub. Railway starts it with `npm start`, supplies `PORT`, and checks `/healthz`.

Configuration:

- `railway.json`: Railway build, start, restart, and health-check settings
- `.env.example`: required environment variable names
- `server.js`: static serving, admin API, Substack RSS cache, and social-preview rendering

Required production variables:

- `ADMIN_PASSWORD`
- `SESSION_SECRET`
- `GITHUB_TOKEN` with Contents read/write access to `TheEthanDing/ethanding.com`
- `GITHUB_REPOSITORY=TheEthanDing/ethanding.com`
- `GITHUB_BRANCH=main`

## Content

- Books: `data/books.json`
- Book covers: `images/books/`
- Homepage copy and links: `data/site.json`
- Articles: `https://ethanding.substack.com/feed`, fetched server-side

Use `/admin` to add or edit books, upload covers, and update homepage copy. Production saves commit repository files through GitHub, triggering a Railway deployment.

## Local development

```bash
ADMIN_PASSWORD=local-password npm start
npm test
```

- Site: `http://localhost:4173`
- Editor: `http://localhost:4173/admin`

## Deployment workflow

1. Test locally with `npm test` and verify `/`, `/admin`, `/api/articles`, and a current article slug.
2. Commit all content files and new images.
3. Push to GitHub.
4. Verify the Railway deployment and health check.
5. Verify `https://ethanding.com`, article preview metadata, and editor login before retiring any previous hosting or data service.

## Article previews

The homepage links directly to Substack. For social sharing, use `https://ethanding.com/<title-slug>`. `server.js` injects Open Graph and Twitter metadata into `article-preview.html` before responding.
