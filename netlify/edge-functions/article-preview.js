export default async (request, context) => {
  const url = new URL(request.url);
  const slug = url.pathname.substring(1); // Remove leading slash
  
  // Skip if it's a static file or root page
  if (slug.includes('.') || slug === '' || slug.startsWith('_') || slug.startsWith('assets') || slug.startsWith('images')) {
    return;
  }
  
  try {
    // Fetch articles from Substack RSS
    const rssUrl = 'https://ethanding.substack.com/feed';
    const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`;
    
    const response = await fetch(apiUrl);
    if (!response.ok) {
      return; // Let the client handle the error
    }
    
    const data = await response.json();
    const articles = data.items || [];
    
    // Find article matching slug
    const article = articles.find((item) => {
      const itemSlug = item.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      return itemSlug === slug;
    });
    
    if (!article) {
      return; // Let the client handle 404
    }
    
    // Clean excerpt
    const tempDiv = article.description || '';
    const excerpt = tempDiv.replace(/<[^>]*>/g, '').substring(0, 200);
    
    // Extract image
    const imageMatch = (article.content || article.description || '').match(/<img[^>]+src="([^"]+)"/);
    const imageUrl = imageMatch ? imageMatch[1] : 'https://ethanding.com/images/profile.png';
    
    // Escape HTML
    const escapeHtml = (text) => {
      return text.replace(/&/g, '&amp;')
                 .replace(/</g, '&lt;')
                 .replace(/>/g, '&gt;')
                 .replace(/"/g, '&quot;')
                 .replace(/'/g, '&#39;');
    };
    
    const title = escapeHtml(article.title);
    const description = escapeHtml(excerpt + '...');
    const currentUrl = request.url;
    
    // Get the template HTML
    const templateResponse = await context.next();
    const html = await templateResponse.text();
    
    // Replace the meta tags with populated ones
    const modifiedHtml = html
      .replace(/<title id="page-title">[^<]*<\/title>/, `<title>${title}</title>`)
      .replace(/<meta id="og-title"[^>]*>/, `<meta property="og:title" content="${title}">`)
      .replace(/<meta id="og-description"[^>]*>/, `<meta property="og:description" content="${description}">`)
      .replace(/<meta id="og-image"[^>]*>/, `<meta property="og:image" content="${imageUrl}">`)
      .replace(/<meta id="og-url"[^>]*>/, `<meta property="og:url" content="${currentUrl}">`)
      .replace(/<meta id="twitter-title"[^>]*>/, `<meta name="twitter:title" content="${title}">`)
      .replace(/<meta id="twitter-description"[^>]*>/, `<meta name="twitter:description" content="${description}">`)
      .replace(/<meta id="twitter-image"[^>]*>/, `<meta name="twitter:image" content="${imageUrl}">`);
    
    return new Response(modifiedHtml, {
      headers: {
        'content-type': 'text/html',
        'cache-control': 'public, max-age=300', // Cache for 5 minutes
      },
    });
    
  } catch (error) {
    console.error('Error in edge function:', error);
    return; // Let the client handle the error
  }
};

export const config = {
  path: "/*",
};