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

  console.log(`Prerender: generated ${writtenPages} property HTML files.`);
}

generatePropertyPages().catch((err) => {
  console.error('Prerender failed:', err);
  process.exitCode = 1;
});
