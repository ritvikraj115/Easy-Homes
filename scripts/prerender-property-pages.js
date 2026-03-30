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
const PRERENDER_TEMPLATE_PATH = path.join(BUILD_DIR, '.prerender-template.html');
const LOGO_IMAGE_URL = `${SITE_URL}/logo.png`;
const SEARCH_PROPERTIES_URL = `${SITE_URL}/searchProperties`;
const HOME_CANONICAL_URL = `${SITE_URL}/`;
const ABOUT_PATH = '/about';
const ABOUT_CANONICAL_URL = `${SITE_URL}${ABOUT_PATH}`;
const CONTACT_PATH = '/contact';
const CONTACT_CANONICAL_URL = `${SITE_URL}${CONTACT_PATH}`;
const SEARCH_PROPERTIES_PATH = '/searchProperties';
const KALPAVRUKSHA_PATH = '/kalpavruksha/';
const KALPAVRUKSHA_CANONICAL_URL = `${SITE_URL}${KALPAVRUKSHA_PATH}`;
const KALPAVRUKSHA_IMAGE_URL = `${SITE_URL}/kalpPcImg.webp`;
const HOME_SEO = {
  title: 'Easy Homes | CRDA-Approved Plots in Amaravati & Vijayawada',
  description:
    'Discover CRDA-approved plots and verified real estate projects in Amaravati and Vijayawada with Easy Homes. Explore trusted listings, clear titles, and transparent guidance.',
  keywords:
    'CRDA approved plots Amaravati, Vijayawada plots, Easy Homes, verified plots Andhra Pradesh, gated community plots',
  shareTitle: 'Easy Homes | CRDA-Approved Plots in Amaravati & Vijayawada',
  shareDescription:
    'Explore verified real estate projects, compare plots, and connect with Easy Homes for trusted guidance in Amaravati and Vijayawada.',
};
const ABOUT_SEO = {
  title: 'About Us | Easy Homes',
  description:
    'Learn about Easy Homes, your trusted partner for CRDA-approved plots in Amaravati and Vijayawada, with a focus on transparency, verified documentation, and guided property buying.',
  keywords:
    'About Easy Homes, Easy Homes Vijayawada, CRDA approved plots company, real estate guidance Amaravati',
};
const CONTACT_SEO = {
  title: 'Contact Us | Easy Homes',
  description:
    'Contact Easy Homes for CRDA-approved plot enquiries, site visits, and trusted real estate support in Amaravati and Vijayawada.',
  keywords:
    'Contact Easy Homes, plot enquiry Vijayawada, Amaravati real estate contact, site visit Easy Homes',
};
const SEARCH_PROPERTIES_SEO = {
  title: 'Search CRDA Approved Plots in Vijayawada & Amaravati | Easy Homes',
  description:
    'Browse and compare CRDA-approved plots in Vijayawada and Amaravati. Explore verified Easy Homes listings by project, area, location, and price.',
  keywords:
    'search plots Vijayawada, CRDA approved plots Amaravati, compare plots Andhra Pradesh, Easy Homes listings',
  robots: 'noindex,follow',
};
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

function buildLinkedPropertyCards(properties, { limit } = {}) {
  const selectedProperties = Array.isArray(properties) ? properties.slice(0, limit || properties.length) : [];

  if (selectedProperties.length === 0) {
    return '<p style="margin:0;color:#475569;">Verified listings will appear here after the next content refresh.</p>';
  }

  return selectedProperties
    .map((property) => {
      const canonicalUrl = buildPropertyCanonical(property);
      const propertyName = cleanText(property?.name) || 'Property';
      const location = cleanText(property?.location) || 'Andhra Pradesh';
      const areaRange = cleanText(property?.areaRange);
      const price = cleanText(property?.priceRange) || cleanText(property?.marketValue?.pricePerSqYd);
      const description = buildPropertyDescription(property);

      return `
        <article style="background:#fff;border:1px solid #dbeafe;border-radius:20px;padding:20px;box-shadow:0 14px 32px rgba(15,23,42,0.05);">
          <h3 style="margin:0 0 10px;font-size:20px;line-height:1.3;color:#0f172a;">
            <a href="${escapeHtml(canonicalUrl)}" style="color:#0f172a;text-decoration:none;">${escapeHtml(propertyName)}</a>
          </h3>
          <p style="margin:0 0 10px;color:#475569;">${escapeHtml(location)}</p>
          <p style="margin:0 0 14px;color:#334155;">${escapeHtml(description)}</p>
          <p style="margin:0 0 8px;color:#475569;"><strong>Area:</strong> ${escapeHtml(areaRange || 'Available on listing page')}</p>
          <p style="margin:0 0 14px;color:#475569;"><strong>Price:</strong> ${escapeHtml(price || 'Contact Easy Homes')}</p>
          <a href="${escapeHtml(canonicalUrl)}" style="color:#0f766e;font-weight:700;text-decoration:none;">Open property details</a>
        </article>
      `;
    })
    .join('');
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

function buildStaticPage(templateHtml, seo, markup, schemas = []) {
  let html = templateHtml;
  const shareTitle = seo.shareTitle || seo.title;
  const shareDescription = seo.shareDescription || seo.description;
  const image = seo.image || LOGO_IMAGE_URL;

  html = upsertTitle(html, seo.title);
  html = upsertMetaByName(html, 'description', seo.description);
  html = upsertMetaByName(html, 'keywords', seo.keywords || '');
  html = upsertMetaByName(html, 'robots', seo.robots || 'index,follow');
  html = upsertMetaByProperty(html, 'og:title', shareTitle);
  html = upsertMetaByProperty(html, 'og:description', shareDescription);
  html = upsertMetaByProperty(html, 'og:url', seo.canonicalUrl);
  html = upsertMetaByProperty(html, 'og:image', image);
  html = upsertMetaByName(html, 'twitter:title', shareTitle);
  html = upsertMetaByName(html, 'twitter:description', shareDescription);
  html = upsertMetaByName(html, 'twitter:image', image);
  html = upsertCanonicalLink(html, seo.canonicalUrl);

  if (schemas.length > 0) {
    html = appendToHead(
      html,
      schemas.map((schema) => `<script type="application/ld+json">${escapeJsonForHtml(schema)}</script>`).join(''),
    );
  }

  return injectRootContent(html, markup);
}

function buildHomeSchemas() {
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      '@id': `${HOME_CANONICAL_URL}#website`,
      name: 'Easy Homes',
      url: HOME_CANONICAL_URL,
      potentialAction: {
        '@type': 'SearchAction',
        target: `${SEARCH_PROPERTIES_URL}?location={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      '@id': `${HOME_CANONICAL_URL}#organization`,
      name: 'Easy Homes',
      url: HOME_CANONICAL_URL,
      logo: {
        '@type': 'ImageObject',
        url: LOGO_IMAGE_URL,
      },
      telephone: '+918988896666',
      address: {
        '@type': 'PostalAddress',
        streetAddress: '4th Floor, adjacent to GIG International School, Gollapudi',
        addressLocality: 'Vijayawada',
        addressRegion: 'Andhra Pradesh',
        postalCode: '521225',
        addressCountry: 'IN',
      },
    },
  ];
}

function buildHomePreviewMarkup(properties) {
  return `
    <main style="max-width:1120px;margin:0 auto;padding:40px 20px 88px;font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#0f172a;line-height:1.65;background:#f8fafc;">
      <section style="background:linear-gradient(135deg,#0f172a 0%,#1d4ed8 55%,#dbeafe 100%);border-radius:32px;padding:36px;color:#fff;box-shadow:0 24px 60px rgba(15,23,42,0.24);">
        <p style="margin:0 0 10px;font-size:12px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:#bfdbfe;">Easy Homes</p>
        <h1 style="margin:0 0 16px;font-size:clamp(34px,5vw,56px);line-height:1.05;">CRDA-approved plots and verified projects in Amaravati and Vijayawada</h1>
        <p style="margin:0 0 18px;max-width:760px;font-size:18px;color:#e2e8f0;">${escapeHtml(HOME_SEO.description)}</p>
        <div style="display:flex;flex-wrap:wrap;gap:12px;margin-top:24px;">
          <a href="${escapeHtml(SEARCH_PROPERTIES_URL)}" style="display:inline-block;padding:14px 20px;border-radius:999px;background:#fff;color:#0f172a;font-weight:700;text-decoration:none;">Browse all listings</a>
          <a href="${escapeHtml(KALPAVRUKSHA_CANONICAL_URL)}" style="display:inline-block;padding:14px 20px;border-radius:999px;border:1px solid rgba(255,255,255,0.35);color:#fff;font-weight:700;text-decoration:none;">View Kalpavruksha</a>
          <a href="${escapeHtml(CONTACT_CANONICAL_URL)}" style="display:inline-block;padding:14px 20px;border-radius:999px;border:1px solid rgba(255,255,255,0.35);color:#fff;font-weight:700;text-decoration:none;">Talk to Easy Homes</a>
        </div>
      </section>

      <section style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:18px;margin-top:28px;">
        <article style="background:#fff;border:1px solid #dbeafe;border-radius:20px;padding:22px;box-shadow:0 14px 32px rgba(15,23,42,0.05);">
          <h2 style="margin:0 0 10px;font-size:22px;color:#0f172a;">Why buyers trust Easy Homes</h2>
          <ul style="margin:0;padding-left:20px;color:#334155;">
            <li style="margin-bottom:8px;">CRDA-approved plots and verified project information.</li>
            <li style="margin-bottom:8px;">Transparent pricing, location details, and listing summaries.</li>
            <li>Support for site visits, documentation checks, and property shortlisting.</li>
          </ul>
        </article>
        <article style="background:#fff;border:1px solid #dbeafe;border-radius:20px;padding:22px;box-shadow:0 14px 32px rgba(15,23,42,0.05);">
          <h2 style="margin:0 0 10px;font-size:22px;color:#0f172a;">Quick links</h2>
          <p style="margin:0 0 10px;"><a href="${escapeHtml(ABOUT_CANONICAL_URL)}" style="color:#0f766e;font-weight:700;text-decoration:none;">About Easy Homes</a></p>
          <p style="margin:0 0 10px;"><a href="${escapeHtml(CONTACT_CANONICAL_URL)}" style="color:#0f766e;font-weight:700;text-decoration:none;">Contact Easy Homes</a></p>
          <p style="margin:0;"><a href="${escapeHtml(SEARCH_PROPERTIES_URL)}" style="color:#0f766e;font-weight:700;text-decoration:none;">Search CRDA-approved plots</a></p>
        </article>
      </section>

      <section style="margin-top:32px;">
        <div style="display:flex;justify-content:space-between;align-items:flex-end;gap:16px;flex-wrap:wrap;margin-bottom:18px;">
          <div>
            <p style="margin:0 0 6px;font-size:12px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:#0f766e;">Featured listings</p>
            <h2 style="margin:0;font-size:28px;color:#0f172a;">Explore verified Easy Homes properties</h2>
          </div>
          <a href="${escapeHtml(SEARCH_PROPERTIES_URL)}" style="color:#0f766e;font-weight:700;text-decoration:none;">See all properties</a>
        </div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:18px;">
          ${buildLinkedPropertyCards(properties, { limit: 6 })}
        </div>
      </section>
    </main>
  `;
}

function buildAboutSchemas() {
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'AboutPage',
      url: ABOUT_CANONICAL_URL,
      name: ABOUT_SEO.title,
      description: ABOUT_SEO.description,
      isPartOf: {
        '@type': 'WebSite',
        url: HOME_CANONICAL_URL,
        name: 'Easy Homes',
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: HOME_CANONICAL_URL },
        { '@type': 'ListItem', position: 2, name: 'About', item: ABOUT_CANONICAL_URL },
      ],
    },
  ];
}

function buildAboutPreviewMarkup() {
  return `
    <main style="max-width:1040px;margin:0 auto;padding:40px 20px 88px;font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#0f172a;line-height:1.65;background:#f8fafc;">
      <section style="background:linear-gradient(135deg,#eff6ff 0%,#ffffff 60%,#dbeafe 100%);border:1px solid #dbeafe;border-radius:28px;padding:32px;box-shadow:0 18px 44px rgba(15,23,42,0.08);">
        <p style="margin:0 0 10px;font-size:12px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:#0f766e;">About Easy Homes</p>
        <h1 style="margin:0 0 14px;font-size:clamp(32px,4vw,50px);line-height:1.1;color:#0f172a;">Trusted guidance for CRDA-approved plots and verified property buying</h1>
        <p style="margin:0 0 18px;font-size:18px;color:#334155;">${escapeHtml(ABOUT_SEO.description)}</p>
        <p style="margin:0;color:#475569;">Easy Homes helps families and investors explore approved plotted developments with transparent information, verified documentation, and hands-on support from enquiry to registration.</p>
      </section>

      <section style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:20px;margin-top:28px;">
        <article style="background:#fff;border:1px solid #e2e8f0;border-radius:20px;padding:24px;box-shadow:0 14px 32px rgba(15,23,42,0.05);">
          <h2 style="margin:0 0 14px;font-size:24px;color:#0f172a;">Our mission</h2>
          <p style="margin:0;color:#334155;">To make property buying more transparent, secure, and stress-free for buyers looking at CRDA-approved plots in Amaravati and Vijayawada.</p>
        </article>
        <article style="background:#fff;border:1px solid #e2e8f0;border-radius:20px;padding:24px;box-shadow:0 14px 32px rgba(15,23,42,0.05);">
          <h2 style="margin:0 0 14px;font-size:24px;color:#0f172a;">Why people choose Easy Homes</h2>
          <ul style="margin:0;padding-left:20px;color:#334155;">
            <li style="margin-bottom:8px;">Verified layouts and project details.</li>
            <li style="margin-bottom:8px;">Guidance on documentation and clear titles.</li>
            <li>Support from enquiry to site visit and registration.</li>
          </ul>
        </article>
      </section>
    </main>
  `;
}

function buildContactSchemas() {
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'ContactPage',
      url: CONTACT_CANONICAL_URL,
      name: CONTACT_SEO.title,
      description: CONTACT_SEO.description,
      about: {
        '@type': 'Organization',
        name: 'Easy Homes',
        url: HOME_CANONICAL_URL,
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: HOME_CANONICAL_URL },
        { '@type': 'ListItem', position: 2, name: 'Contact', item: CONTACT_CANONICAL_URL },
      ],
    },
  ];
}

function buildContactPreviewMarkup() {
  return `
    <main style="max-width:1040px;margin:0 auto;padding:40px 20px 88px;font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#0f172a;line-height:1.65;background:#f8fafc;">
      <section style="background:linear-gradient(135deg,#eff6ff 0%,#ffffff 60%,#dbeafe 100%);border:1px solid #dbeafe;border-radius:28px;padding:32px;box-shadow:0 18px 44px rgba(15,23,42,0.08);">
        <p style="margin:0 0 10px;font-size:12px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:#0f766e;">Contact Easy Homes</p>
        <h1 style="margin:0 0 14px;font-size:clamp(32px,4vw,50px);line-height:1.1;color:#0f172a;">Talk to Easy Homes about plots, site visits, and verified listings</h1>
        <p style="margin:0;font-size:18px;color:#334155;">${escapeHtml(CONTACT_SEO.description)}</p>
      </section>

      <section style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:20px;margin-top:28px;">
        <article style="background:#fff;border:1px solid #e2e8f0;border-radius:20px;padding:24px;box-shadow:0 14px 32px rgba(15,23,42,0.05);">
          <h2 style="margin:0 0 14px;font-size:24px;color:#0f172a;">Reach us directly</h2>
          <p style="margin:0 0 10px;color:#334155;"><strong>Phone:</strong> <a href="tel:+918988896666" style="color:#0f766e;text-decoration:none;">+91 8988896666</a></p>
          <p style="margin:0 0 10px;color:#334155;"><strong>Email:</strong> <a href="mailto:contact@easyhomess.com" style="color:#0f766e;text-decoration:none;">contact@easyhomess.com</a></p>
          <p style="margin:0;color:#334155;"><strong>Address:</strong> 4th Floor, adjacent to GIG International School, Gollapudi, Vijayawada, Andhra Pradesh 521225</p>
        </article>
        <article style="background:#fff;border:1px solid #e2e8f0;border-radius:20px;padding:24px;box-shadow:0 14px 32px rgba(15,23,42,0.05);">
          <h2 style="margin:0 0 14px;font-size:24px;color:#0f172a;">Useful links</h2>
          <p style="margin:0 0 10px;"><a href="${escapeHtml(SEARCH_PROPERTIES_URL)}" style="color:#0f766e;font-weight:700;text-decoration:none;">Browse all listings</a></p>
          <p style="margin:0 0 10px;"><a href="${escapeHtml(KALPAVRUKSHA_CANONICAL_URL)}" style="color:#0f766e;font-weight:700;text-decoration:none;">See Kalpavruksha project details</a></p>
          <p style="margin:0;"><a href="${escapeHtml(ABOUT_CANONICAL_URL)}" style="color:#0f766e;font-weight:700;text-decoration:none;">Learn about Easy Homes</a></p>
        </article>
      </section>
    </main>
  `;
}

function buildSearchSchemas() {
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      url: SEARCH_PROPERTIES_URL,
      name: SEARCH_PROPERTIES_SEO.title,
      description: SEARCH_PROPERTIES_SEO.description,
      isPartOf: {
        '@type': 'WebSite',
        url: HOME_CANONICAL_URL,
        name: 'Easy Homes',
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: HOME_CANONICAL_URL },
        { '@type': 'ListItem', position: 2, name: 'Search Properties', item: SEARCH_PROPERTIES_URL },
      ],
    },
  ];
}

function buildSearchPreviewMarkup(properties) {
  const listingCount = Array.isArray(properties) ? properties.length : 0;

  return `
    <main style="max-width:1120px;margin:0 auto;padding:40px 20px 88px;font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#0f172a;line-height:1.65;background:#f8fafc;">
      <section style="background:linear-gradient(135deg,#ecfeff 0%,#f8fafc 55%,#ffffff 100%);border:1px solid #dbeafe;border-radius:28px;padding:32px;box-shadow:0 20px 50px rgba(15,23,42,0.08);">
        <p style="margin:0 0 10px;font-size:12px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:#0f766e;">Search Properties</p>
        <h1 style="margin:0 0 14px;font-size:clamp(32px,4vw,50px);line-height:1.1;color:#0f172a;">Browse verified Easy Homes listings</h1>
        <p style="margin:0 0 18px;font-size:18px;color:#334155;">${escapeHtml(SEARCH_PROPERTIES_SEO.description)}</p>
        <p style="margin:0;color:#475569;">This route remains noindex,follow so Google can use it as a crawl hub without needing to rank the filtered search experience itself. Currently available listings: ${escapeHtml(String(listingCount))}.</p>
      </section>

      <section style="margin-top:28px;">
        <div style="display:flex;justify-content:space-between;align-items:flex-end;gap:16px;flex-wrap:wrap;margin-bottom:18px;">
          <div>
            <p style="margin:0 0 6px;font-size:12px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:#0f766e;">Property links</p>
            <h2 style="margin:0;font-size:28px;color:#0f172a;">Direct links to property detail pages</h2>
          </div>
          <a href="${escapeHtml(HOME_CANONICAL_URL)}" style="color:#0f766e;font-weight:700;text-decoration:none;">Back to homepage</a>
        </div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:18px;">
          ${buildLinkedPropertyCards(properties)}
        </div>
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

function buildHomePrerenderedPage(templateHtml, properties) {
  return buildStaticPage(
    templateHtml,
    {
      ...HOME_SEO,
      canonicalUrl: HOME_CANONICAL_URL,
      image: LOGO_IMAGE_URL,
    },
    buildHomePreviewMarkup(properties),
    buildHomeSchemas(),
  );
}

function buildAboutPrerenderedPage(templateHtml) {
  return buildStaticPage(
    templateHtml,
    {
      ...ABOUT_SEO,
      canonicalUrl: ABOUT_CANONICAL_URL,
      image: LOGO_IMAGE_URL,
    },
    buildAboutPreviewMarkup(),
    buildAboutSchemas(),
  );
}

function buildContactPrerenderedPage(templateHtml) {
  return buildStaticPage(
    templateHtml,
    {
      ...CONTACT_SEO,
      canonicalUrl: CONTACT_CANONICAL_URL,
      image: LOGO_IMAGE_URL,
    },
    buildContactPreviewMarkup(),
    buildContactSchemas(),
  );
}

function buildSearchPropertiesPrerenderedPage(templateHtml, properties) {
  return buildStaticPage(
    templateHtml,
    {
      ...SEARCH_PROPERTIES_SEO,
      canonicalUrl: SEARCH_PROPERTIES_URL,
      image: LOGO_IMAGE_URL,
    },
    buildSearchPreviewMarkup(properties),
    buildSearchSchemas(),
  );
}

async function writeRoutePage(relativeRoute, html) {
  const routeSegments = relativeRoute.split('/').filter(Boolean);
  const routeDir = path.join(BUILD_DIR, ...routeSegments);
  await fs.mkdir(routeDir, { recursive: true });
  await fs.writeFile(path.join(routeDir, 'index.html'), html, 'utf8');
}

async function loadTemplateHtml() {
  try {
    return await fs.readFile(PRERENDER_TEMPLATE_PATH, 'utf8');
  } catch (err) {
    const templateHtml = await fs.readFile(BUILD_INDEX_PATH, 'utf8');
    await fs.writeFile(PRERENDER_TEMPLATE_PATH, templateHtml, 'utf8');
    return templateHtml;
  }
}

async function generatePropertyPages() {
  const templateHtml = await loadTemplateHtml();
  const properties = await loadProperties();

  if (properties.length === 0) {
    console.warn('Prerender: no properties available, continuing with static route generation only.');
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

  await writeRoutePage('/', buildHomePrerenderedPage(templateHtml, properties));
  writtenPages += 1;
  await writeRoutePage(ABOUT_PATH, buildAboutPrerenderedPage(templateHtml));
  writtenPages += 1;
  await writeRoutePage(CONTACT_PATH, buildContactPrerenderedPage(templateHtml));
  writtenPages += 1;
  await writeRoutePage(SEARCH_PROPERTIES_PATH, buildSearchPropertiesPrerenderedPage(templateHtml, properties));
  writtenPages += 1;
  await writeRoutePage(KALPAVRUKSHA_PATH, buildKalpavrukshaPrerenderedPage(templateHtml));
  writtenPages += 1;

  console.log(`Prerender: generated ${writtenPages} HTML files.`);
}

generatePropertyPages().catch((err) => {
  console.error('Prerender failed:', err);
  process.exitCode = 1;
});
