# Article preview system

The Railway Node server serves `ethanding.com/<slug>` article-preview pages.

## How it works

1. `server.js` fetches `https://ethanding.substack.com/feed` directly and caches it for five minutes.
2. Article titles are converted to URL slugs.
3. Requests to `/<slug>` receive `article-preview.html` with server-rendered Open Graph and Twitter metadata.
4. The browser loads the same cached data from `/api/articles` to render the clickable preview card.

The homepage continues to link directly to Substack. Clean `ethanding.com/<slug>` URLs are intended for social sharing.

## Local testing

```bash
npm start
```

Open the homepage at `http://localhost:4173`, then open a slug returned by `http://localhost:4173/api/articles`.

## Production

Railway starts the service with `npm start` and checks `/healthz`. No Netlify function or RSS-to-JSON proxy is required.
