const axios = require('axios');
const fs = require('fs/promises');
const path = require('path');

const SITE_URL = 'https://easyhomess.com';
const FALLBACK_OG_IMAGE = `${SITE_URL}/logo.png`;
const PROPERTIES_DATA_PATH = path.resolve(__dirname, '../../backend/data/properties.json');
const PROPERTY_API_TIMEOUT_MS = 15000;

function cleanText(value) {
  return typeof value === 'string' ? value.replace(/\s+/g, ' ').trim() : '';
}

function cleanEnv(value) {
  return typeof value === 'string' ? value.trim().replace(/\/+$/, '') : '';
}

function splitLocation(location) {
  const parts = cleanText(location)
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);

  return {
    locality: parts[parts.length - 3] || parts[parts.length - 2] || '',
    region: parts[parts.length - 2] || '',
    country: parts[parts.length - 1] || 'India',
  };
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

  return `/property/${encodeURIComponent(mlsNumber)}/${slugifyPropertyName(property?.name || mlsNumber)}/`;
}

function buildLegacyPropertyPath(property) {
  const mlsNumber = cleanText(property?.mlsNumber);
  if (!mlsNumber) {
    return null;
  }

  return `/property/${encodeURIComponent(mlsNumber)}/`;
}

function buildPropertyCanonical(property) {
  const propertyPath = buildPropertyPath(property);
  return propertyPath ? `${SITE_URL}${propertyPath}` : SITE_URL;
}

function getPrimaryPropertyImage(property) {
  const firstImage = Array.isArray(property?.media?.images) ? property.media.images[0] : '';
  return cleanText(firstImage) || FALLBACK_OG_IMAGE;
}

function buildPropertyTitle(property) {
  const name = cleanText(property?.name) || 'Property';
  const propertyType = cleanText(property?.propertyType);
  const locality =
    cleanText(property?.neighborhoodDetails?.district) ||
    splitLocation(property?.location).locality;

  const titleParts = [
    name,
    propertyType ? `${propertyType} in ${locality || 'Andhra Pradesh'}` : locality,
    'Easy Homes',
  ].filter(Boolean);

  return titleParts.join(' | ');
}

function buildPropertyDescription(property) {
  const name = cleanText(property?.name) || 'property';
  const propertyType = cleanText(property?.propertyType) || 'property';
  const location = cleanText(property?.location);
  const areaRange = cleanText(property?.areaRange);
  const status = cleanText(property?.status);
  const price = cleanText(property?.priceRange) || cleanText(property?.marketValue?.pricePerSqYd);
  const description = cleanText(property?.propertyDescription);

  if (description) {
    return `${description} Explore ${name}${location ? ` in ${location}` : ''}${price ? ` with pricing details starting from ${price}` : ''}.`;
  }

  const segments = [
    `Explore ${name}`,
    propertyType ? `${propertyType.toLowerCase()} listing` : '',
    location ? `in ${location}` : '',
    areaRange ? `with ${areaRange} area range` : '',
    price ? `and ${price} pricing` : '',
    status ? `currently ${status.toLowerCase()}` : '',
  ].filter(Boolean);

  return `${segments.join(' ')}. View photos, features, approvals, and neighbourhood details on Easy Homes.`;
}

function buildPropertyKeywords(property) {
  const name = cleanText(property?.name);
  const propertyType = cleanText(property?.propertyType);
  const locality = cleanText(property?.neighborhoodDetails?.district);
  const state = cleanText(property?.neighborhoodDetails?.state);

  return [name, propertyType, locality, state, 'Easy Homes', 'property listing']
    .filter(Boolean)
    .join(', ');
}

function buildPropertySchema(property) {
  const images = Array.isArray(property?.media?.images)
    ? property.media.images.filter(Boolean).slice(0, 8)
    : [];
  const locationParts = splitLocation(property?.location);
  const locality = cleanText(property?.neighborhoodDetails?.district) || locationParts.locality;
  const region = cleanText(property?.neighborhoodDetails?.state) || locationParts.region;
  const addressCountry = locationParts.country || 'India';
  const areaRange = cleanText(property?.areaRange);
  const pricePerSqYd = cleanText(property?.marketValue?.pricePerSqYd);
  const priceRange = cleanText(property?.priceRange);
  const status = cleanText(property?.status).toLowerCase();

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: cleanText(property?.name),
    description: buildPropertyDescription(property),
    url: buildPropertyCanonical(property),
    image: images.length > 0 ? images : [getPrimaryPropertyImage(property)],
    identifier: cleanText(property?.mlsNumber),
    address: {
      '@type': 'PostalAddress',
      addressLocality: locality,
      addressRegion: region,
      addressCountry,
    },
    additionalProperty: [
      areaRange
        ? {
            '@type': 'PropertyValue',
            name: 'Area Range',
            value: areaRange,
          }
        : null,
      pricePerSqYd
        ? {
            '@type': 'PropertyValue',
            name: 'Price Per Sq.Yd',
            value: pricePerSqYd,
          }
        : null,
      cleanText(property?.propertyType)
        ? {
            '@type': 'PropertyValue',
            name: 'Property Type',
            value: cleanText(property.propertyType),
          }
        : null,
    ].filter(Boolean),
  };

  if (priceRange || pricePerSqYd || status) {
    schema.offers = {
      '@type': 'Offer',
      priceCurrency: 'INR',
      availability:
        status === 'available'
          ? 'https://schema.org/InStock'
          : status
            ? 'https://schema.org/LimitedAvailability'
            : undefined,
      description: priceRange || pricePerSqYd || undefined,
    };
  }

  return schema;
}

function buildPropertyBreadcrumbSchema(property) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: SITE_URL,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Properties',
        item: `${SITE_URL}/searchProperties`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: cleanText(property?.name) || 'Property',
        item: buildPropertyCanonical(property),
      },
    ],
  };
}

function buildPropertyApiCandidates() {
  const explicitPropertiesUrls = [
    cleanEnv(process.env.SITEMAP_PROPERTIES_URL),
    cleanEnv(process.env.PRERENDER_PROPERTIES_URL),
    cleanEnv(process.env.PROPERTY_DATA_URL),
  ].filter(Boolean);
  const apiBaseUrls = [
    cleanEnv(process.env.SITEMAP_API_URL),
    cleanEnv(process.env.PRERENDER_API_URL),
    cleanEnv(process.env.REACT_APP_API_URL),
  ].filter(Boolean);

  const candidates = [...explicitPropertiesUrls];

  apiBaseUrls.forEach((baseUrl) => {
    candidates.push(`${baseUrl}/api/properties`);
  });

  return Array.from(new Set(candidates));
}

async function loadPropertiesFromApi() {
  const candidates = buildPropertyApiCandidates();

  if (candidates.length === 0) {
    console.warn(
      'Build data: no property API URL configured. Set REACT_APP_API_URL, SITEMAP_API_URL, PRERENDER_API_URL, or PROPERTY_DATA_URL for frontend-only builds.',
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
        console.warn(`Build data: property API returned an unexpected payload for ${url}.`);
        continue;
      }

      console.log(`Build data: loaded ${properties.length} properties from ${url}.`);
      return properties;
    } catch (err) {
      console.warn(`Build data: unable to load properties from ${url}.`, err.message);
    }
  }

  return [];
}

async function loadProperties() {
  try {
    const raw = await fs.readFile(PROPERTIES_DATA_PATH, 'utf8');
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      console.log(`Build data: loaded ${parsed.length} properties from local data file.`);
      return parsed;
    }
  } catch (err) {
    console.warn(`Build data: unable to read property data from ${PROPERTIES_DATA_PATH}.`, err.message);
  }

  const propertiesFromApi = await loadPropertiesFromApi();
  if (propertiesFromApi.length > 0) {
    return propertiesFromApi;
  }

  console.warn('Build data: no property data available, continuing without property records.');
  return [];
}

module.exports = {
  SITE_URL,
  cleanText,
  splitLocation,
  slugifyPropertyName,
  buildPropertyPath,
  buildLegacyPropertyPath,
  buildPropertyCanonical,
  getPrimaryPropertyImage,
  buildPropertyTitle,
  buildPropertyDescription,
  buildPropertyKeywords,
  buildPropertySchema,
  buildPropertyBreadcrumbSchema,
  loadProperties,
};
