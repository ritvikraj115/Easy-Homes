const SITE_URL = 'https://easyhomess.com';
const FALLBACK_OG_IMAGE = `${SITE_URL}/logo.png`;

function cleanText(value) {
  return typeof value === 'string' ? value.replace(/\s+/g, ' ').trim() : '';
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

export function slugifyPropertyName(name) {
  const slug = cleanText(name)
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return slug || 'property';
}

export function buildPropertyPath(property) {
  const mlsNumber = cleanText(property?.mlsNumber);
  if (!mlsNumber) {
    return '/searchProperties';
  }

  return `/property/${encodeURIComponent(mlsNumber)}/${slugifyPropertyName(property?.name || mlsNumber)}/`;
}

export function buildPropertyCanonical(property) {
  return `${SITE_URL}${buildPropertyPath(property)}`;
}

export function getPrimaryPropertyImage(property) {
  const firstImage = Array.isArray(property?.media?.images) ? property.media.images[0] : '';
  return cleanText(firstImage) || FALLBACK_OG_IMAGE;
}

export function buildPropertyTitle(property) {
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

export function buildPropertyDescription(property) {
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

export function buildPropertyKeywords(property) {
  const name = cleanText(property?.name);
  const propertyType = cleanText(property?.propertyType);
  const locality = cleanText(property?.neighborhoodDetails?.district);
  const state = cleanText(property?.neighborhoodDetails?.state);

  return [name, propertyType, locality, state, 'Easy Homes', 'property listing']
    .filter(Boolean)
    .join(', ');
}

export function buildPropertySchema(property) {
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

export function buildPropertyBreadcrumbSchema(property) {
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
