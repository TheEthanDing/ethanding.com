# Bookshelf maintenance

The homepage uses `assets/bookshelf.js` and `assets/bookshelf.css`. The shelf has no runtime dependencies. It searches the full reading log locally, initially renders three shelves, and fetches only face-out covers until another book is hovered, focused, or opened. The existing reading chart loads its library only when expanded.

- `data/books.json` remains the editable source of truth. The editor continues to save it normally.
- `data/book-metadata.json` caches public Open Library work IDs, authors, first publication years, categories, and median page counts across editions. Every matched book links back to its catalog source.
- `data/book-appearance.json` contains the aspect ratio and dominant edge color of each existing local cover. These are measured from the cover images, not claimed physical dimensions.
- `data/book-lookup-aliases.json` records corrected lookup spellings without rewriting the reading log. Only a sufficiently close title and matching author are accepted.

Run `npm run books:enrich` after adding books. It requests only new or renamed titles. Use `npm run books:enrich -- --retry-missing` to retry missing page counts, or `--refresh` to refresh the collection. The script uses batches of ten titles, requests only needed fields, spaces requests by at least a second, retries transient errors, and checkpoints results. It requires Node 20+ and network access, with no API key or package installation.

Run `python3 scripts/book-cover-metadata.py` in a Python environment with Pillow after changing covers. This only analyzes existing covers; it does not alter image files.

Spine thickness is estimated from the catalog page count and clamped for readability. Height/width are guided by cover proportions. Unknown books receive a neutral fallback size and a visible explanation in their detail view. These sizes are visual approximations, not exact dimensions of the owner's edition. A new or changed cover/title ignores its stale cached enrichment until refreshed.

Commit the data files alongside the UI. No external metadata request runs on a page visit. To change the JS or CSS, update the asset version in `index.html` so the site's one-hour static cache cannot retain old code.

Reference: https://openlibrary.org/dev/docs/api/search and https://openlibrary.org/developers/api
