export default {
  async fetch(request, env, ctx) {
    // Allow CORS from your website
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=300' // Cache for 5 minutes
    };

    // Parse URL to get offset parameter
    const url = new URL(request.url);
    const offset = url.searchParams.get('offset');

    // Check cache first
    const cache = caches.default;
    const cacheKey = new Request(request.url, request);
    const cachedResponse = await cache.match(cacheKey);
    
    if (cachedResponse) {
      return cachedResponse;
    }

    try {
      // Build Airtable URL with offset if provided
      const baseId = 'appp0rlDg8bs8FlVB';
      const tableId = 'tblLzVsk6YxiQ0xxE';
      const viewId = 'viw7ZSeTTduvLSsKX';
      const airtableUrl = offset 
        ? `https://api.airtable.com/v0/${baseId}/${tableId}?view=${viewId}&offset=${offset}`
        : `https://api.airtable.com/v0/${baseId}/${tableId}?view=${viewId}`;
      
      // Fetch from Airtable
      const response = await fetch(airtableUrl, {
        headers: {
          'Authorization': `Bearer ${env.AIRTABLE_API_KEY}`
        }
      });

      const data = await response.json();
      
      // Process image URLs to use Cloudflare Image Resizing if available
      if (data.records) {
        data.records.forEach(record => {
          if (record.fields?.cover?.[0]) {
            const cover = record.fields.cover[0];
            // Add optimized image URLs
            if (cover.url) {
              // Create optimized thumbnail URLs
              cover.optimized = {
                tiny: `${cover.url}?w=50&h=75&fit=cover&q=60`,
                small: `${cover.url}?w=100&h=150&fit=cover&q=70`,
                medium: `${cover.url}?w=200&h=300&fit=cover&q=80`,
                large: `${cover.url}?w=400&h=600&fit=cover&q=85`
              };
            }
          }
        });
      }
      
      // Create response
      const apiResponse = new Response(JSON.stringify(data), { headers });
      
      // Cache it
      ctx.waitUntil(cache.put(cacheKey, apiResponse.clone()));
      
      return apiResponse;
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers
      });
    }
  }
};