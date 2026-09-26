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

## Book cover requirements

When adding a book, retrieve its real front cover from the internet (for example, discover it with Google Images and use a publisher, Google Books, or library image). Verify that the title and author match. Reuse a verified existing cover for rereads.

- Use a flat, straight-on image framed exactly to the front-cover edges, with the artwork filling the entire image.
- Reject images with added borders, white margins, background scenery, drop shadows, watermarks, retailer badges, or a photographed/3D book mockup. Preserve borders that are part of the original cover artwork.
- Prefer an already tightly cropped source. If only an image with external margins is available, crop those margins without cutting off any cover artwork or text; never stretch the cover.
- Inspect the actual downloaded image before accepting it. Do not substitute generated artwork, a generic jacket, or a blank cover when a real cover is available.
- Save accepted images under `images/books/`, update the book's `cover` path in `data/books.json`, and refresh `data/book-appearance.json` using `scripts/book-cover-metadata.py`. Commit the images and data together.
- If a suitable cover cannot be retrieved, explicitly report the missing cover rather than silently treating the book entry as complete.

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
