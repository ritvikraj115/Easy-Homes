const { SitemapStream, streamToPromise } = require('sitemap');
const fs = require('fs/promises');
const path = require('path');
const { SITE_URL, buildPropertyPath, loadProperties } = require('./property-build-utils');

const PUBLIC_SITEMAP_PATH = path.resolve(__dirname, '../public/sitemap.xml');

async function generateSitemap() {
  const staticRoutes = [
    { url: '/', changefreq: 'daily', priority: 1.0 },
    { url: '/kalpavruksha/', changefreq: 'weekly', priority: 0.9 },
    { url: '/about', changefreq: 'monthly', priority: 0.6 },
    { url: '/contact', changefreq: 'monthly', priority: 0.6 },
  ];

  const properties = await loadProperties();
  const propertyRoutes = properties
    .map((property) => buildPropertyPath(property))
    .filter(Boolean)
    .map((url) => ({
      url,
      changefreq: 'weekly',
      priority: 0.7,
    }));

  const dedupedRoutes = Array.from(
    new Map([...staticRoutes, ...propertyRoutes].map((route) => [route.url, route])).values(),
  );

  const stream = new SitemapStream({ hostname: SITE_URL });
  dedupedRoutes.forEach((route) => stream.write(route));
  stream.end();

  const sitemapXml = await streamToPromise(stream);
  await fs.writeFile(PUBLIC_SITEMAP_PATH, sitemapXml.toString(), 'utf8');
}

generateSitemap().catch((err) => {
  console.error('Failed to generate sitemap:', err);
  process.exitCode = 1;
});
