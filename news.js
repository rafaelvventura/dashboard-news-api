cat > api/news.js << 'EOF'
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const apiKey = process.env.NEWSAPI_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'NEWSAPI_KEY not configured' });
  }

  try {
    const response = await fetch(
      `https://newsapi.org/v2/everything?q=solar+energy&sortBy=publishedAt&language=en&pageSize=8&apiKey=${apiKey}`,
      {
        method: 'GET',
        headers: {
          'User-Agent': 'NewsAPI-Proxy/1.0'
        }
      }
    );

    const data = await response.json();

    if (data.status === 'ok' && data.articles) {
      const articles = data.articles.map(article => ({
        title: article.title,
        url: article.url,
        source: article.source.name,
        description: article.description,
        image: article.urlToImage,
        publishedAt: article.publishedAt
      }));

      res.status(200).json({ success: true, articles });
    } else {
      res.status(200).json({ success: false, error: data.message || 'No articles found' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
EOF
