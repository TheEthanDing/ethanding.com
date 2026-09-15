# Healthcare landscape editorial data

The public route remains `/health-plan-landscape`. The September 15, 2026 edition has 332 companies/brands, 97 functional categories and 498 placements. This is a US-focused, representative landscape, not a complete vendor census, product evaluation or clinical recommendation.

## Source files

- `healthcare-expansion.json`: added companies, official websites and primary-source links.
- `healthcare-profiles.json`: researched descriptions for original and added brands.
- `healthcare-sections.json` and `healthcare-workflows.json`: category definitions, buyers and specific placements.
- `healthcare-logo-overrides.json`: reviewed asset choices and display treatments. Icon-only or heavily padded assets include a visible company name.
- `../assets/health-plan-logos/provider-sources.json`: exact image URLs, provenance and review dates. Most images are official; a few use public brand archives or cached site icons.
- The original payer companies/placements remain in `../health-plan-landscape.js`; original notes and source links remain in the HTML.

Run `npm run healthcare:build` after editorial changes, then `npm test`. Commit the JSON, generated `assets/healthcare-data.js` and all referenced local images together. Bump the page's asset query versions when changing cached scripts or styles.

## Editorial rules

Every placement opens one card. A parent/operating-brand pair is one button, not two company links. Repeated companies retain different functional context and unique share URLs. Company profiles describe the organization; category descriptions explain its role in that part of the map. Official source links live on every card.

Keep care delivery, insurance, administration, software and outsourced services distinct. Do not infer common ownership from a commercial partnership, or downside risk from VBC marketing. Regulatory status, contracts and product availability require product-specific verification. The map makes no clinical-outcome, performance, market-share or investment-return claims.

`scripts/research-healthcare.cjs` collects public pages into a temporary research cache. `scripts/prepare-healthcare-assets.cjs` downloads assets and records provenance. These helpers do not validate editorial facts or logo identity automatically: review the source text and visually inspect each mark before publishing. A customer logo on a vendor homepage is not the vendor's logo. Refreshes retain reviewed URLs unless explicitly overridden.

## Verification

The test suite verifies every placement's profile, role, buyers and sources; all added logo files; unique entry keys; single-button paired entries; repeated-company context; search and scope behavior; generated-data freshness; and the existing site's routes and protections. Browser QA additionally covers whole-window fit, mobile cards, filtering, source links, category cards and deep links.
