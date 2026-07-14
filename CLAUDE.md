# Ethan Ding Personal Website (ethanding.com)

## Repository

- GitHub: `TheEthanDing/ethanding.com`
- Production branch: `main`
- Runtime: Node.js 20+

## Railway deployment

Railway builds from GitHub and starts the site with `npm start`. Configuration lives in `railway.json`; health checks use `/healthz`.

Required production variables:

- `ADMIN_PASSWORD`: password for `/admin`
- `SESSION_SECRET`: long random value used for sessions
- `GITHUB_TOKEN`: fine-grained token with Contents read/write access to this repository
- `GITHUB_REPOSITORY=TheEthanDing/ethanding.com`
- `GITHUB_BRANCH=main`

Railway supplies `PORT` automatically.

## Content ownership

- Books: `data/books.json`
- Book covers: `images/books/`
- Editable homepage copy: `data/site.json`
- Writing: Substack RSS, fetched and cached by `server.js`

The private editor is available at `/admin`. Saving commits the relevant file or image to GitHub, which triggers a Railway deployment. Without `GITHUB_TOKEN`, saves modify the local checkout only.

## Local development

```bash
ADMIN_PASSWORD=local-password npm start
npm test
```

Homepage: `http://localhost:4173`

Editor: `http://localhost:4173/admin`

## Article previews

`server.js` replaces the former Netlify Edge Function. It fetches the Substack RSS feed directly and injects social metadata into `article-preview.html` for clean `/<article-slug>` URLs.
