const { SitemapStream, streamToPromise } = require('sitemap');
const fs = require('fs/promises');
const path = require('path');

const SITE_URL = 'https://easyhomess.com';
const PUBLIC_SITEMAP_PATH = path.resolve(__dirname, '../public/sitemap.xml');
const PROPERTIES_DATA_PATH = path.resolve(__dirname, '../../backend/data/properties.json');

function cleanText(value) {
  return typeof value === 'string' ? value.replace(/\s+/g, ' ').trim() : '';
}

function slugifyPropertyName(name) {
  const slug = cleanText(name)
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return slug || 'property';
}

function buildPropertyPath(property) {
  const mlsNumber = cleanText(property?.mlsNumber);
  if (!mlsNumber) {
    return null;
  }

  return `/property/${encodeURIComponent(mlsNumber)}/${slugifyPropertyName(property?.name || mlsNumber)}`;
}

async function loadProperties() {
  try {
    const raw = await fs.readFile(PROPERTIES_DATA_PATH, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.warn(`Sitemap generation: unable to read property data from ${PROPERTIES_DATA_PATH}.`, err.message);
    return [];
  }
}

async function generateSitemap() {
  const staticRoutes = [
    { url: '/', changefreq: 'daily', priority: 1.0 },
    { url: '/kalpavruksha', changefreq: 'weekly', priority: 0.9 },
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
