const { SitemapStream, streamToPromise } = require('sitemap');
const axios = require('axios');
const fs = require('fs/promises');
const path = require('path');

const SITE_URL = 'https://easyhomess.com';
const PUBLIC_SITEMAP_PATH = path.resolve(__dirname, '../public/sitemap.xml');
const PROPERTIES_DATA_PATH = path.resolve(__dirname, '../../backend/data/properties.json');
const PROPERTY_API_TIMEOUT_MS = 15000;

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
    if (Array.isArray(parsed)) {
      console.log(`Sitemap generation: loaded ${parsed.length} properties from local data file.`);
      return parsed;
    }
  } catch (err) {
    console.warn(`Sitemap generation: unable to read property data from ${PROPERTIES_DATA_PATH}.`, err.message);
  }

  const propertiesFromApi = await loadPropertiesFromApi();
  if (propertiesFromApi.length > 0) {
    return propertiesFromApi;
  }

  console.warn('Sitemap generation: no property data available, continuing with static routes only.');
  return [];
}

function cleanEnv(value) {
  return typeof value === 'string' ? value.trim().replace(/\/+$/, '') : '';
}

function buildPropertyApiCandidates() {
  const explicitPropertiesUrl = cleanEnv(process.env.SITEMAP_PROPERTIES_URL);
  const apiBaseUrls = [
    cleanEnv(process.env.SITEMAP_API_URL),
    cleanEnv(process.env.REACT_APP_API_URL),
  ].filter(Boolean);

  const candidates = [];

  if (explicitPropertiesUrl) {
    candidates.push(explicitPropertiesUrl);
  }

  apiBaseUrls.forEach((baseUrl) => {
    candidates.push(`${baseUrl}/api/properties`);
  });

  return Array.from(new Set(candidates));
}

async function loadPropertiesFromApi() {
  const candidates = buildPropertyApiCandidates();

  if (candidates.length === 0) {
    console.warn(
      'Sitemap generation: no property API URL configured. Set REACT_APP_API_URL, SITEMAP_API_URL, or SITEMAP_PROPERTIES_URL for frontend-only builds.',
    );
    return [];
  }

  for (const url of candidates) {
    try {
      const response = await axios.get(url, {
        timeout: PROPERTY_API_TIMEOUT_MS,
        headers: {
          Accept: 'application/json',
        },
      });

      const properties = Array.isArray(response.data?.data)
        ? response.data.data
        : Array.isArray(response.data)
          ? response.data
          : null;

      if (!properties) {
        console.warn(`Sitemap generation: property API returned an unexpected payload for ${url}.`);
        continue;
      }

      console.log(`Sitemap generation: loaded ${properties.length} properties from ${url}.`);
      return properties;
    } catch (err) {
      console.warn(`Sitemap generation: unable to load properties from ${url}.`, err.message);
    }
  }

  return [];
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
