const fs = require('fs/promises');
const path = require('path');
const {
  SITE_URL,
  cleanText,
  splitLocation,
  buildLegacyPropertyPath,
  buildPropertyPath,
  buildPropertyCanonical,
  getPrimaryPropertyImage,
  buildPropertyTitle,
  buildPropertyDescription,
  buildPropertyKeywords,
  buildPropertySchema,
  buildPropertyBreadcrumbSchema,
  loadProperties,
} = require('./property-build-utils');

const BUILD_DIR = path.resolve(__dirname, '../build');
const BUILD_INDEX_PATH = path.join(BUILD_DIR, 'index.html');
const SEARCH_PROPERTIES_URL = `${SITE_URL}/searchProperties`;
const KALPAVRUKSHA_PATH = '/kalpavruksha/';
const KALPAVRUKSHA_CANONICAL_URL = `${SITE_URL}${KALPAVRUKSHA_PATH}`;
const KALPAVRUKSHA_IMAGE_URL = `${SITE_URL}/kalpPcImg.webp`;
const KALPAVRUKSHA_SEO = {
  title: 'Kalpavruksha Open Plots in Vijayawada | CRDA Approved Plots Near Amaravati | Easy Homes',
  description:
    'Explore Kalpavruksha by Easy Homes, a CRDA-approved residential plotted community with 105 open plots across 9.03 acres near Vijayawada and Amaravati, with plot sizes from 174 to 525 square yards, premium infrastructure, and clubhouse amenities.',
  keywords:
    'Kalpavruksha, Kalpavruksha plots, CRDA approved plots Vijayawada, open plots near Amaravati, Easy Homes projects, residential plots Andhra Pradesh',
  shareTitle: 'Kalpavruksha Open Plots in Vijayawada | Easy Homes',
  shareDescription:
    'CRDA-approved plotted development near Vijayawada and Amaravati with 105 residential plots across 9.03 acres, plot sizes from 174 to 525 square yards, premium amenities, and strong connectivity.',
  locationTitle: 'Kalpavruksha, near Vijayawada Nagpur Greenfield Highway, Vemavaram',
  locationAddress:
    'Kalpavruksha, near Vijayawada Nagpur Greenfield Highway, Vemavaram, Vijayawada, Andhra Pradesh',
  stats: [
    { label: 'Project Units', value: '105', unit: 'Units', detail: 'Registered residential plot inventory.' },
    { label: 'Project Area', value: '9.03', unit: 'Acres', detail: 'Overall layout spread across the project site.' },
    { label: 'Sizes', value: '174-525', unit: 'Sq.yd.', detail: 'Available plot-size range.' },
  ],
  highlights: [
    'CRDA-approved project with 5 years of developer maintenance.',
    'Near Vijayawada-Nagpur Greenfield Highway with connectivity to Vijayawada and Amaravati.',
    "60', 40', and 33' internal CC roads with walkways, avenue plantations, and stormwater drains.",
    'Underground power, water, fiber, and sewage networks for future-ready infrastructure.',
    'Clubhouse with pool, yoga room, gym, party lawn, private theatre, and guest rooms.',
    "Gated community security with CCTV, solar lighting, compound wall, and solar fencing.",
  ],
  faqs: [
    {
      question: 'Is Kalpavruksha a CRDA-approved project?',
      answer:
        'Yes. Kalpavruksha is presented as a CRDA-approved plotted development by Easy Homes. Buyers should still review the latest approvals, layout documents, and registration details during the booking process.',
    },
    {
      question: 'What is the total size of the project?',
      answer: 'The project spans 9.03 acres and is planned as a gated residential plotted community.',
    },
    {
      question: 'How many plots are available in Kalpavruksha?',
      answer: 'Kalpavruksha has 105 residential plot units in the current project overview.',
    },
    {
      question: 'What plot sizes are available?',
      answer:
        'The current plot size range is 174 to 525 square yards, covering both compact and larger residential plot requirements.',
    },
    {
      question: 'Where is Kalpavruksha located?',
      answer:
        'The project is near the Vijayawada Nagpur Greenfield Highway in Vemavaram, with connectivity to Vijayawada, Western Bypass, Hyderabad Highway (NH 65), and Amaravati-side destinations.',
    },
  ],
};

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function escapeJsonForHtml(value) {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}

function upsertTag(html, regex, replacement) {
  if (regex.test(html)) {
    return html.replace(regex, replacement);
  }

  return html.replace('</head>', `${replacement}</head>`);
}

function upsertMetaByName(html, name, content) {
  const safeName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`<meta\\s+name="${safeName}"\\s+content="[^"]*"\\s*\\/?>`, 'i');
  return upsertTag(
    html,
    regex,
    `<meta name="${escapeHtml(name)}" content="${escapeHtml(content)}"/>`,
  );
}

function upsertMetaByProperty(html, property, content) {
  const safeProperty = property.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`<meta\\s+property="${safeProperty}"\\s+content="[^"]*"\\s*\\/?>`, 'i');
  return upsertTag(
    html,
    regex,
    `<meta property="${escapeHtml(property)}" content="${escapeHtml(content)}"/>`,
  );
}

function upsertCanonicalLink(html, href) {
  return upsertTag(
    html,
    /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/i,
    `<link rel="canonical" href="${escapeHtml(href)}"/>`,
  );
}

function upsertTitle(html, title) {
  return upsertTag(html, /<title>.*?<\/title>/i, `<title>${escapeHtml(title)}</title>`);
}

function appendToHead(html, snippet) {
  return html.replace('</head>', `${snippet}</head>`);
}

function injectRootContent(html, content) {
  return html.replace(/<div id="root"><\/div>/i, `<div id="root">${content}</div>`);
}

function fact(label, value) {
  const safeValue = cleanText(value);
  if (!safeValue) {
    return '';
  }

  return `
    <div style="flex:1 1 180px;min-width:180px;border:1px solid #d9e2ec;border-radius:16px;padding:16px;background:#fff;">
      <div style="font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:#64748b;margin-bottom:6px;">${escapeHtml(label)}</div>
      <div style="font-size:16px;font-weight:700;color:#0f172a;">${escapeHtml(safeValue)}</div>
    </div>
  `;
}

function renderList(items) {
  if (!Array.isArray(items) || items.length === 0) {
    return '<p style="margin:0;color:#475569;">Details will appear on the live interactive page.</p>';
  }

  return `
    <ul style="margin:0;padding-left:20px;color:#334155;">
      ${items
        .slice(0, 8)
        .map((item) => `<li style="margin:0 0 8px;">${escapeHtml(cleanText(item))}</li>`)
        .join('')}
    </ul>
  `;
}

function buildKalpavrukshaSchemas() {
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    '@id': `${KALPAVRUKSHA_CANONICAL_URL}#breadcrumb`,
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: `${SITE_URL}/`,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Kalpavruksha',
        item: KALPAVRUKSHA_CANONICAL_URL,
      },
    ],
  };

  const realEstateAgentSchema = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateAgent',
    '@id': `${KALPAVRUKSHA_CANONICAL_URL}#agent`,
    name: 'Easy Homes',
    image: `${SITE_URL}/logo.png`,
    telephone: '+918988896666',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '4th Floor, adjacent to GIG International School, Gollapudi',
      addressLocality: 'Vijayawada',
      addressRegion: 'Andhra Pradesh',
      postalCode: '521225',
      addressCountry: 'IN',
    },
    url: `${SITE_URL}/`,
    areaServed: ['Vijayawada', 'Amaravati'],
  };

  const webPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${KALPAVRUKSHA_CANONICAL_URL}#webpage`,
    url: KALPAVRUKSHA_CANONICAL_URL,
    name: KALPAVRUKSHA_SEO.title,
    description: KALPAVRUKSHA_SEO.description,
    inLanguage: 'en-IN',
    breadcrumb: { '@id': `${KALPAVRUKSHA_CANONICAL_URL}#breadcrumb` },
    mainEntity: { '@id': `${KALPAVRUKSHA_CANONICAL_URL}#listing` },
    primaryImageOfPage: {
      '@type': 'ImageObject',
      url: KALPAVRUKSHA_IMAGE_URL,
    },
    isPartOf: {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: `${SITE_URL}/`,
      name: 'Easy Homes',
    },
  };

  const projectSchema = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    '@id': `${KALPAVRUKSHA_CANONICAL_URL}#listing`,
    name: 'Kalpavruksha Open Plots',
    description: KALPAVRUKSHA_SEO.description,
    url: KALPAVRUKSHA_CANONICAL_URL,
    mainEntityOfPage: { '@id': `${KALPAVRUKSHA_CANONICAL_URL}#webpage` },
    image: [KALPAVRUKSHA_IMAGE_URL],
    identifier: 'P06160035909',
    category: 'Residential Plots',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Vijayawada',
      addressRegion: 'Andhra Pradesh',
      addressCountry: 'IN',
    },
    provider: { '@id': `${KALPAVRUKSHA_CANONICAL_URL}#agent` },
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: KALPAVRUKSHA_SEO.faqs.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };

  return [breadcrumbSchema, realEstateAgentSchema, webPageSchema, projectSchema, faqSchema];
}

function buildKalpavrukshaPreviewMarkup() {
  const statsMarkup = KALPAVRUKSHA_SEO.stats
    .map(
      (stat) => `
        <div style="flex:1 1 180px;min-width:180px;border:1px solid #d9e2ec;border-radius:16px;padding:16px;background:#fff;">
          <div style="font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:#64748b;margin-bottom:6px;">${escapeHtml(stat.label)}</div>
          <div style="font-size:24px;font-weight:800;color:#0f172a;">${escapeHtml(stat.value)}</div>
          <div style="font-size:14px;font-weight:700;color:#0f766e;">${escapeHtml(stat.unit)}</div>
          <p style="margin:8px 0 0;color:#475569;">${escapeHtml(stat.detail)}</p>
        </div>
      `,
    )
    .join('');

  const faqMarkup = KALPAVRUKSHA_SEO.faqs
    .map(
      (item) => `
        <article style="padding:18px 20px;border:1px solid #d9e2ec;border-radius:16px;background:#fff;">
          <h3 style="margin:0 0 8px;font-size:18px;color:#0f172a;">${escapeHtml(item.question)}</h3>
          <p style="margin:0;color:#475569;">${escapeHtml(item.answer)}</p>
        </article>
      `,
    )
    .join('');

  return `
    <main style="max-width:1080px;margin:0 auto;padding:40px 20px 88px;font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#0f172a;line-height:1.65;background:#f8fafc;">
      <section style="background:linear-gradient(135deg,#ecfeff 0%,#f8fafc 55%,#ffffff 100%);border:1px solid #dbeafe;border-radius:28px;padding:32px;box-shadow:0 20px 50px rgba(15,23,42,0.08);">
        <p style="margin:0 0 10px;font-size:12px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:#0f766e;">Easy Homes Featured Project</p>
        <h1 style="margin:0 0 14px;font-size:clamp(32px,4vw,50px);line-height:1.1;color:#0f172a;">Kalpavruksha Open Plots in Vijayawada</h1>
        <p style="margin:0 0 18px;font-size:18px;color:#334155;">${escapeHtml(KALPAVRUKSHA_SEO.description)}</p>
        <p style="margin:0;color:#475569;"><strong>Location:</strong> ${escapeHtml(KALPAVRUKSHA_SEO.locationAddress)}</p>
        <div style="display:flex;flex-wrap:wrap;gap:12px;margin-top:24px;">${statsMarkup}</div>
      </section>

      <section style="margin-top:28px;">
        <img
          src="${escapeHtml(KALPAVRUKSHA_IMAGE_URL)}"
          alt="Kalpavruksha open plots by Easy Homes in Vijayawada"
          style="display:block;width:100%;max-height:460px;object-fit:cover;border-radius:24px;border:1px solid #dbeafe;background:#fff;box-shadow:0 18px 40px rgba(15,23,42,0.08);"
        />
      </section>

      <section style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:20px;margin-top:28px;">
        <article style="background:#fff;border:1px solid #e2e8f0;border-radius:20px;padding:24px;box-shadow:0 14px 32px rgba(15,23,42,0.05);">
          <h2 style="margin:0 0 14px;font-size:24px;color:#0f172a;">Project Highlights</h2>
          ${renderList(KALPAVRUKSHA_SEO.highlights)}
        </article>
        <article style="background:#fff;border:1px solid #e2e8f0;border-radius:20px;padding:24px;box-shadow:0 14px 32px rgba(15,23,42,0.05);">
          <h2 style="margin:0 0 14px;font-size:24px;color:#0f172a;">Why It Stands Out</h2>
          <p style="margin:0 0 12px;color:#334155;">${escapeHtml(KALPAVRUKSHA_SEO.shareDescription)}</p>
          <p style="margin:0 0 10px;color:#475569;"><strong>Project zone:</strong> ${escapeHtml(KALPAVRUKSHA_SEO.locationTitle)}</p>
          <p style="margin:0 0 10px;"><a href="${escapeHtml(KALPAVRUKSHA_CANONICAL_URL)}" style="color:#0f766e;font-weight:700;text-decoration:none;">Open full Kalpavruksha project page</a></p>
          <p style="margin:0;"><a href="${escapeHtml(SEARCH_PROPERTIES_URL)}" style="color:#0f766e;font-weight:700;text-decoration:none;">Browse all Easy Homes property listings</a></p>
        </article>
      </section>

      <section style="margin-top:28px;">
        <div style="background:#fff;border:1px solid #e2e8f0;border-radius:20px;padding:24px;box-shadow:0 14px 32px rgba(15,23,42,0.05);">
          <h2 style="margin:0 0 18px;font-size:24px;color:#0f172a;">Frequently Asked Questions</h2>
          <div style="display:grid;gap:14px;">${faqMarkup}</div>
        </div>
      </section>
    </main>
  `;
}

function buildPropertyPreviewMarkup(property, canonicalUrl, legacyUrl, isIndexable) {
  const propertyName = cleanText(property?.name) || 'Property';
  const propertyDescription = buildPropertyDescription(property);
  const locationParts = splitLocation(property?.location);
  const primaryImage = getPrimaryPropertyImage(property);
  const overview = cleanText(property?.propertyDescription) || propertyDescription;
  const features = Array.isArray(property?.keyFeatures) ? property.keyFeatures.filter(Boolean) : [];
  const nearbyLandmarks = Array.isArray(property?.neighborhoodDetails?.nearbyLandmarks)
    ? property.neighborhoodDetails.nearbyLandmarks.filter(Boolean)
    : [];
  const heroLabel = isIndexable ? 'Easy Homes Property Listing' : 'Easy Homes Canonical Property Route';
  const legacyNote = isIndexable
    ? ''
    : `<p style="margin:0 0 18px;color:#64748b;">This URL is a legacy property route. The preferred canonical URL is <a href="${escapeHtml(canonicalUrl)}" style="color:#0f766e;">${escapeHtml(canonicalUrl)}</a>.</p>`;

  return `
    <main style="max-width:980px;margin:0 auto;padding:40px 20px 88px;font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#0f172a;line-height:1.65;background:#f8fafc;">
      <section style="background:linear-gradient(135deg,#ecfeff 0%,#f8fafc 55%,#ffffff 100%);border:1px solid #dbeafe;border-radius:28px;padding:32px;box-shadow:0 20px 50px rgba(15,23,42,0.08);">
        <p style="margin:0 0 10px;font-size:12px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:#0f766e;">${escapeHtml(heroLabel)}</p>
        <h1 style="margin:0 0 14px;font-size:clamp(30px,4vw,48px);line-height:1.1;color:#0f172a;">${escapeHtml(propertyName)}</h1>
        <p style="margin:0 0 18px;font-size:18px;color:#334155;">${escapeHtml(propertyDescription)}</p>
        ${legacyNote}
        <p style="margin:0;color:#475569;"><strong>Location:</strong> ${escapeHtml(cleanText(property?.location) || locationParts.locality || 'Andhra Pradesh')}</p>
        <div style="display:flex;flex-wrap:wrap;gap:12px;margin-top:24px;">
          ${fact('Property Type', property?.propertyType)}
          ${fact('Status', property?.status)}
          ${fact('Area Range', property?.areaRange)}
          ${fact('Price', property?.priceRange || property?.marketValue?.pricePerSqYd)}
          ${fact('MLS Number', property?.mlsNumber)}
        </div>
      </section>

      ${
        primaryImage
          ? `
            <section style="margin-top:28px;">
              <img
                src="${escapeHtml(primaryImage)}"
                alt="${escapeHtml(propertyName)}"
                style="display:block;width:100%;max-height:460px;object-fit:cover;border-radius:24px;border:1px solid #dbeafe;background:#fff;box-shadow:0 18px 40px rgba(15,23,42,0.08);"
              />
            </section>
          `
          : ''
      }

      <section style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:20px;margin-top:28px;">
        <article style="background:#fff;border:1px solid #e2e8f0;border-radius:20px;padding:24px;box-shadow:0 14px 32px rgba(15,23,42,0.05);">
          <h2 style="margin:0 0 14px;font-size:24px;color:#0f172a;">Property Overview</h2>
          <p style="margin:0;color:#334155;">${escapeHtml(overview)}</p>
        </article>
        <article style="background:#fff;border:1px solid #e2e8f0;border-radius:20px;padding:24px;box-shadow:0 14px 32px rgba(15,23,42,0.05);">
          <h2 style="margin:0 0 14px;font-size:24px;color:#0f172a;">Key Features</h2>
          ${renderList(features)}
        </article>
      </section>

      <section style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:20px;margin-top:20px;">
        <article style="background:#fff;border:1px solid #e2e8f0;border-radius:20px;padding:24px;box-shadow:0 14px 32px rgba(15,23,42,0.05);">
          <h2 style="margin:0 0 14px;font-size:24px;color:#0f172a;">Neighbourhood</h2>
          ${renderList(nearbyLandmarks)}
        </article>
        <article style="background:#fff;border:1px solid #e2e8f0;border-radius:20px;padding:24px;box-shadow:0 14px 32px rgba(15,23,42,0.05);">
          <h2 style="margin:0 0 14px;font-size:24px;color:#0f172a;">Continue Browsing</h2>
          <p style="margin:0 0 12px;color:#334155;">View the full interactive listing, compare more plots, or continue exploring verified Easy Homes properties.</p>
          <p style="margin:0 0 10px;"><a href="${escapeHtml(canonicalUrl)}" style="color:#0f766e;font-weight:700;text-decoration:none;">Open full property details</a></p>
          <p style="margin:0 0 10px;"><a href="${escapeHtml(SEARCH_PROPERTIES_URL)}" style="color:#0f766e;font-weight:700;text-decoration:none;">Browse all property listings</a></p>
          ${
            legacyUrl
              ? `<p style="margin:0;color:#64748b;font-size:14px;">Legacy route: <span style="word-break:break-all;">${escapeHtml(legacyUrl)}</span></p>`
              : ''
          }
        </article>
      </section>
    </main>
  `;
}

function buildPrerenderedPage(templateHtml, property, { indexable }) {
  const title = buildPropertyTitle(property);
  const description = buildPropertyDescription(property);
  const keywords = buildPropertyKeywords(property);
  const canonicalUrl = buildPropertyCanonical(property);
  const legacyPath = buildLegacyPropertyPath(property);
  const legacyUrl = legacyPath ? `${SITE_URL}${legacyPath}` : '';
  const primaryImage = getPrimaryPropertyImage(property);
  const robots = indexable ? 'index,follow' : 'noindex,follow';
  const propertySchema = buildPropertySchema(property);
  const breadcrumbSchema = buildPropertyBreadcrumbSchema(property);

  let html = templateHtml;
  html = upsertTitle(html, title);
  html = upsertMetaByName(html, 'description', description);
  html = upsertMetaByName(html, 'keywords', keywords);
  html = upsertMetaByName(html, 'robots', robots);
  html = upsertMetaByProperty(html, 'og:title', title);
  html = upsertMetaByProperty(html, 'og:description', description);
  html = upsertMetaByProperty(html, 'og:url', canonicalUrl);
  html = upsertMetaByProperty(html, 'og:image', primaryImage);
  html = upsertMetaByName(html, 'twitter:title', title);
  html = upsertMetaByName(html, 'twitter:description', description);
  html = upsertMetaByName(html, 'twitter:image', primaryImage);
  html = upsertCanonicalLink(html, canonicalUrl);
  html = appendToHead(
    html,
    `<script type="application/ld+json">${escapeJsonForHtml(propertySchema)}</script><script type="application/ld+json">${escapeJsonForHtml(breadcrumbSchema)}</script>`,
  );
  html = injectRootContent(html, buildPropertyPreviewMarkup(property, canonicalUrl, legacyUrl, indexable));
  return html;
}

function buildKalpavrukshaPrerenderedPage(templateHtml) {
  const schemas = buildKalpavrukshaSchemas();
  let html = templateHtml;
  html = upsertTitle(html, KALPAVRUKSHA_SEO.title);
  html = upsertMetaByName(html, 'description', KALPAVRUKSHA_SEO.description);
  html = upsertMetaByName(html, 'keywords', KALPAVRUKSHA_SEO.keywords);
  html = upsertMetaByName(html, 'robots', 'index,follow');
  html = upsertMetaByProperty(html, 'og:title', KALPAVRUKSHA_SEO.shareTitle);
  html = upsertMetaByProperty(html, 'og:description', KALPAVRUKSHA_SEO.shareDescription);
  html = upsertMetaByProperty(html, 'og:url', KALPAVRUKSHA_CANONICAL_URL);
  html = upsertMetaByProperty(html, 'og:image', KALPAVRUKSHA_IMAGE_URL);
  html = upsertMetaByName(html, 'twitter:title', KALPAVRUKSHA_SEO.shareTitle);
  html = upsertMetaByName(html, 'twitter:description', KALPAVRUKSHA_SEO.shareDescription);
  html = upsertMetaByName(html, 'twitter:image', KALPAVRUKSHA_IMAGE_URL);
  html = upsertCanonicalLink(html, KALPAVRUKSHA_CANONICAL_URL);
  html = appendToHead(
    html,
    schemas
      .map((schema) => `<script type="application/ld+json">${escapeJsonForHtml(schema)}</script>`)
      .join(''),
  );
  html = injectRootContent(html, buildKalpavrukshaPreviewMarkup());
  return html;
}

async function writeRoutePage(relativeRoute, html) {
  const routeSegments = relativeRoute.split('/').filter(Boolean);
  const routeDir = path.join(BUILD_DIR, ...routeSegments);
  await fs.mkdir(routeDir, { recursive: true });
  await fs.writeFile(path.join(routeDir, 'index.html'), html, 'utf8');
}

async function generatePropertyPages() {
  const templateHtml = await fs.readFile(BUILD_INDEX_PATH, 'utf8');
  const properties = await loadProperties();

  if (properties.length === 0) {
    console.warn('Prerender: no properties available, skipping property page generation.');
    return;
  }

  let writtenPages = 0;

  for (const property of properties) {
    const canonicalRoute = buildPropertyPath(property);
    const legacyRoute = buildLegacyPropertyPath(property);

    if (!canonicalRoute) {
      continue;
    }

    await writeRoutePage(canonicalRoute, buildPrerenderedPage(templateHtml, property, { indexable: true }));
    writtenPages += 1;

    if (legacyRoute) {
      await writeRoutePage(legacyRoute, buildPrerenderedPage(templateHtml, property, { indexable: false }));
      writtenPages += 1;
    }
  }

  await writeRoutePage(KALPAVRUKSHA_PATH, buildKalpavrukshaPrerenderedPage(templateHtml));
  writtenPages += 1;

  console.log(`Prerender: generated ${writtenPages} HTML files.`);
}

generatePropertyPages().catch((err) => {
  console.error('Prerender failed:', err);
  process.exitCode = 1;
});
