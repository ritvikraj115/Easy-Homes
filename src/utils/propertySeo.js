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

export function getPropertyImageUrls(property) {
  return Array.isArray(property?.media?.images)
    ? property.media.images.map((image) => cleanText(image)).filter(Boolean)
    : [];
}

export function getPrimaryPropertyImage(property) {
  return getPropertyImageUrls(property)[0] || FALLBACK_OG_IMAGE;
}

export function hasPropertyImage(property) {
  return getPropertyImageUrls(property).length > 0;
}

export function buildRobotsContent({ indexable = true } = {}) {
  return `${indexable ? 'index,follow' : 'noindex,follow'},max-image-preview:large`;
}

function cleanDisplayText(value) {
  return cleanText(value)
    .replace(/Â/g, '')
    .replace(/â‚¹|₹/g, 'Rs. ')
    .replace(/_/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function dedupeValues(values) {
  const seen = new Set();
  const deduped = [];

  values.forEach((value) => {
    const cleaned = cleanDisplayText(value);
    const key = cleaned.toLowerCase();

    if (!cleaned || seen.has(key)) {
      return;
    }

    seen.add(key);
    deduped.push(cleaned);
  });

  return deduped;
}

function joinList(values) {
  if (values.length === 0) {
    return '';
  }

  if (values.length === 1) {
    return values[0];
  }

  if (values.length === 2) {
    return `${values[0]} and ${values[1]}`;
  }

  return `${values.slice(0, -1).join(', ')}, and ${values[values.length - 1]}`;
}

function capitalize(value) {
  return value ? value.charAt(0).toUpperCase() + value.slice(1) : '';
}

function truncateText(value, maxLength) {
  if (!value || value.length <= maxLength) {
    return value;
  }

  const shortened = value.slice(0, maxLength - 1);
  const boundary = shortened.lastIndexOf(' ');
  const trimmed = boundary > maxLength * 0.6 ? shortened.slice(0, boundary) : shortened;

  return `${trimmed.replace(/[,\s;:-]+$/, '')}.`;
}

function normalizePropertyDescription(description) {
  return cleanDisplayText(description).replace(/[.]+$/, '');
}

function isWeakPropertyDescription(description) {
  const normalized = normalizePropertyDescription(description).toLowerCase();

  if (!normalized) {
    return true;
  }

  return new Set([
    'villa',
    'plot',
    'villa project',
    'villa projects',
    'plot project',
    'plot projects',
    'resale only',
    'resale 20k',
    'old layout no maintenance',
  ]).has(normalized);
}

function getLocationSummary(property) {
  const locationParts = splitLocation(property?.location);

  return {
    locality:
      cleanDisplayText(property?.neighborhoodDetails?.district) ||
      cleanDisplayText(locationParts.locality),
    region:
      cleanDisplayText(property?.neighborhoodDetails?.state) ||
      cleanDisplayText(locationParts.region),
  };
}

function getAreaRange(property) {
  return cleanDisplayText(property?.areaRange) || cleanDisplayText(property?.basicInformation?.lotSize);
}

function getPriceText(property) {
  return cleanDisplayText(property?.priceRange) || cleanDisplayText(property?.marketValue?.pricePerSqYd);
}

function getPropertyHighlights(property) {
  const combinedFeatures = [
    ...(Array.isArray(property?.keyFeatures) ? property.keyFeatures : []),
    ...(Array.isArray(property?.additionalInfo?.amenities) ? property.additionalInfo.amenities : []),
    ...(Array.isArray(property?.exteriorFeatures) ? property.exteriorFeatures : []),
  ];

  return dedupeValues(combinedFeatures)
    .filter((item) => item.length > 2 && !/^\d+$/.test(item))
    .slice(0, 3);
}

function getApprovalSummary(property) {
  const approvals = cleanDisplayText(property?.constructionDetails?.approvals);
  const permissions = cleanText(property?.constructionDetails?.permissions).toLowerCase();

  if (permissions === 'yes' && approvals) {
    return `approval reference ${approvals}`;
  }

  if (permissions === 'yes') {
    return 'available approval details';
  }

  if (permissions === 'no' && approvals) {
    return `approval reference ${approvals} to review`;
  }

  if (permissions === 'no') {
    return 'approval details to review';
  }

  return approvals ? `approval reference ${approvals}` : '';
}

export function buildPropertyTitle(property) {
  const name = cleanDisplayText(property?.name) || 'Property';
  const propertyType = cleanDisplayText(property?.propertyType);
  const { locality } = getLocationSummary(property);

  const titleParts = [
    name,
    propertyType ? `${propertyType} in ${locality || 'Andhra Pradesh'}` : locality,
    'Easy Homes',
  ].filter(Boolean);

  return titleParts.join(' | ');
}

export function buildPropertyOverview(property) {
  const name = cleanDisplayText(property?.name) || 'This property';
  const propertyType = cleanDisplayText(property?.propertyType) || 'Property';
  const { locality, region } = getLocationSummary(property);
  const areaRange = getAreaRange(property);
  const status = cleanDisplayText(property?.status).toLowerCase();
  const price = getPriceText(property);
  const description = normalizePropertyDescription(property?.propertyDescription);
  const highlights = getPropertyHighlights(property);
  const company = cleanDisplayText(property?.ownerAgent?.company);
  const approvalSummary = getApprovalSummary(property);
  const isGated = Boolean(property?.additionalInfo?.gated);
  const sentences = [];

  let baseSentence = `${name} is a ${propertyType.toLowerCase()} listing`;

  if (locality) {
    baseSentence += ` in ${locality}`;
  }

  if (region && !baseSentence.toLowerCase().includes(region.toLowerCase())) {
    baseSentence += `, ${region}`;
  }

  if (areaRange) {
    baseSentence += ` with ${areaRange}`;
  }

  if (price) {
    baseSentence += ` and pricing around ${price}`;
  }

  if (status) {
    baseSentence += `, currently marked ${status}`;
  }

  sentences.push(`${baseSentence}.`);

  if (description && !isWeakPropertyDescription(description)) {
    sentences.push(`${description}.`);
  }

  const supportingDetails = [];

  if (highlights.length > 0) {
    supportingDetails.push(`highlights include ${joinList(highlights)}`);
  }

  if (isGated) {
    supportingDetails.push('set within a gated community');
  }

  if (company) {
    supportingDetails.push(`listed by ${company}`);
  }

  if (approvalSummary) {
    supportingDetails.push(`with ${approvalSummary}`);
  }

  if (supportingDetails.length > 0) {
    sentences.push(`${capitalize(supportingDetails.join(', '))}.`);
  }

  sentences.push('View photos, features, approvals, and neighbourhood details on Easy Homes.');

  return sentences.join(' ');
}

export function buildPropertyDescription(property) {
  const name = cleanDisplayText(property?.name) || 'This property';
  const propertyType = cleanDisplayText(property?.propertyType) || 'Property';
  const { locality, region } = getLocationSummary(property);
  const areaRange = getAreaRange(property);
  const price = getPriceText(property);
  const highlights = getPropertyHighlights(property).slice(0, 2);
  const sentences = [];

  let baseSentence = `${name} is a ${propertyType.toLowerCase()} listing`;

  if (locality) {
    baseSentence += ` in ${locality}`;
  }

  if (region && !baseSentence.toLowerCase().includes(region.toLowerCase())) {
    baseSentence += `, ${region}`;
  }

  if (areaRange) {
    baseSentence += ` with ${areaRange}`;
  }

  if (price) {
    baseSentence += ` and pricing around ${price}`;
  }

  sentences.push(`${baseSentence}.`);

  if (highlights.length > 0) {
    sentences.push(`Highlights include ${joinList(highlights)}.`);
  }

  sentences.push('View photos and details on Easy Homes.');

  let description = '';

  sentences.forEach((sentence) => {
    const candidate = description ? `${description} ${sentence}` : sentence;
    if (candidate.length <= 220) {
      description = candidate;
    }
  });

  return description || truncateText(sentences.join(' '), 220);
}

export function buildPropertyKeywords(property) {
  const { locality, region } = getLocationSummary(property);
  const highlights = getPropertyHighlights(property);

  return dedupeValues([
    property?.name,
    property?.mlsNumber,
    property?.propertyType,
    locality,
    region,
    property?.ownerAgent?.company,
    property?.constructionDetails?.approvals,
    property?.additionalInfo?.gated ? 'gated community' : '',
    ...highlights,
    'Easy Homes',
    'property listing',
  ])
    .slice(0, 12)
    .join(', ');
}

export function buildPropertySchema(property) {
  const images = getPropertyImageUrls(property).slice(0, 8);
  const locationParts = splitLocation(property?.location);
  const { locality, region } = getLocationSummary(property);
  const addressCountry = locationParts.country || 'India';
  const areaRange = getAreaRange(property);
  const pricePerSqYd = getPriceText({ marketValue: property?.marketValue });
  const priceRange = cleanDisplayText(property?.priceRange);
  const status = cleanDisplayText(property?.status).toLowerCase();

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: cleanDisplayText(property?.name),
    description: buildPropertyOverview(property),
    url: buildPropertyCanonical(property),
    image: images.length > 0 ? images : [getPrimaryPropertyImage(property)],
    thumbnailUrl: getPrimaryPropertyImage(property),
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

export function buildPropertyImageSchema(property) {
  if (!hasPropertyImage(property)) {
    return null;
  }

  const primaryImage = getPrimaryPropertyImage(property);

  return {
    '@context': 'https://schema.org',
    '@type': 'ImageObject',
    '@id': `${buildPropertyCanonical(property)}#primaryimage`,
    url: primaryImage,
    contentUrl: primaryImage,
    name: `${cleanDisplayText(property?.name) || 'Property'} image`,
    caption: `${cleanDisplayText(property?.name) || 'Property'} on Easy Homes`,
  };
}

export function buildPropertyWebPageSchema(property) {
  const canonicalUrl = buildPropertyCanonical(property);
  const imageSchema = buildPropertyImageSchema(property);

  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${canonicalUrl}#webpage`,
    url: canonicalUrl,
    name: buildPropertyTitle(property),
    description: buildPropertyDescription(property),
    primaryImageOfPage: imageSchema ? { '@id': imageSchema['@id'] } : undefined,
    mainEntity: { '@id': `${canonicalUrl}#listing` },
    breadcrumb: { '@id': `${canonicalUrl}#breadcrumb` },
    isPartOf: {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: `${SITE_URL}/`,
      name: 'Easy Homes',
    },
  };
}

export function buildPropertyBreadcrumbSchema(property) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    '@id': `${buildPropertyCanonical(property)}#breadcrumb`,
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
        name: cleanDisplayText(property?.name) || 'Property',
        item: buildPropertyCanonical(property),
      },
    ],
  };
}
