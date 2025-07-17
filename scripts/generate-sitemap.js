// scripts/generate-sitemap.js
const { SitemapStream, streamToPromise } = require('sitemap');
const { createWriteStream } = require('fs');
const path = require('path');

(async () => {
  const routes = [
    { url: '/', changefreq: 'daily', priority: 1.0 },
    { url: '/projects', changefreq: 'weekly', priority: 0.8 },
    { url: '/searchProperties', changefreq: 'weekly', priority: 0.8 },
    // …add other static or dynamic routes here…
  ];

  const sitemapPath = path.resolve(__dirname, '../public/sitemap.xml');
  const stream = new SitemapStream({ hostname: 'https://easyhomess.com' });
  const writeStream = createWriteStream(sitemapPath);

  streamToPromise(stream).then(data => writeStream.write(data));
  routes.forEach(route => stream.write(route));
  stream.end();
})();
