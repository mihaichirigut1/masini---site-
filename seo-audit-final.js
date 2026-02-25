const { chromium } = require('playwright');

const WP_SITE_URL = 'https://masiniinratebaiamare.ro';
const WP_USER = 'masiniinratebaiamare@gmail.com';
const WP_PASSWORD = 'Z*ulokl4Xg@k756J';

const PAGES = [
  { name: 'Homepage', url: '/' },
  { name: 'Masini de vanzare', url: '/masini-de-vanzare/' },
  { name: 'Credit Auto', url: '/credit-auto-baia-mare/' },
  { name: 'Contact', url: '/contact/' },
  { name: 'Articole', url: '/articole/' },
  { name: 'Privacy Policy', url: '/privacy-policy/' },
  { name: 'Termeni si Conditii', url: '/termeni-si-conditii/' },
];

function checkOgDuplicates(html) {
  const matches = html.match(/<meta[^>]+property="og:title"[^>]*>/gi) || [];
  return matches.length;
}

function checkSchema(html, type) {
  return html.includes('"@type":"' + type + '"') || html.includes('"@type": "' + type + '"');
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  page.setDefaultTimeout(30000);

  // Login for admin checks
  await page.goto(WP_SITE_URL + '/wp-login.php');
  await page.fill('#user_login', WP_USER);
  await page.fill('#user_pass', WP_PASSWORD);
  await page.click('#wp-submit');
  await page.waitForURL('**/wp-admin/**');

  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║              AUDIT SEO - masiniinratebaiamare.ro             ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  let totalScore = 0;
  let totalChecks = 0;

  for (const p of PAGES) {
    const res = await page.goto(WP_SITE_URL + p.url + '?nocache=' + Date.now(), { waitUntil: 'domcontentloaded', timeout: 30000 });
    const html = await page.content();

    const title = await page.title();
    const metaDesc = html.match(/<meta[^>]+name="description"[^>]+content="([^"]{10,})"/) ||
                     html.match(/<meta[^>]+content="([^"]{10,})"[^>]+name="description"/);
    const h1s = [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)].map(m => m[1].replace(/<[^>]+>/g, '').trim().substring(0, 50));
    const ogCount = checkOgDuplicates(html);
    const hasAutoDealer = checkSchema(html, 'AutoDealer');
    const hasFAQ = checkSchema(html, 'FAQPage');
    const canonical = html.match(/<link[^>]+rel="canonical"[^>]+href="([^"]+)"/);

    let score = 0;
    let issues = [];

    // Title check
    if (title && title.length >= 30 && title.length <= 70) { score++; } else { issues.push('⚠️  Title: ' + (title ? title.length + ' chars (ideal 30-70)' : 'LIPSA')); }
    totalChecks++;

    // Meta description check
    if (metaDesc && metaDesc[1].length >= 50) { score++; } else { issues.push('⚠️  Meta description: ' + (metaDesc ? 'prea scurta' : 'LIPSA')); }
    totalChecks++;

    // H1 check
    if (h1s.length === 1) { score++; } else if (h1s.length === 0) { issues.push('❌ H1: LIPSA'); } else { issues.push('⚠️  H1: ' + h1s.length + ' H1-uri (trebuie exact 1)'); }
    totalChecks++;

    // OG duplicates
    if (ogCount <= 1) { score++; } else { issues.push('❌ OG duplicate: ' + ogCount + ' og:title tags'); }
    totalChecks++;

    // Canonical
    if (canonical) { score++; } else { issues.push('⚠️  Canonical: lipsa'); }
    totalChecks++;

    totalScore += score;

    const pct = Math.round((score / 5) * 100);
    const bar = '█'.repeat(Math.round(pct/10)) + '░'.repeat(10 - Math.round(pct/10));

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📄 ' + p.name + ' — ' + bar + ' ' + pct + '%');
    console.log('   Title: ' + title.substring(0, 60));
    console.log('   H1: ' + (h1s.length ? '"' + h1s[0] + '"' : 'LIPSA'));
    console.log('   Meta desc: ' + (metaDesc ? '✅ prezenta' : '❌ LIPSA'));
    console.log('   OG tags: ' + (ogCount <= 1 ? '✅ ok (' + ogCount + ')' : '❌ DUPLICATE (' + ogCount + ')'));
    console.log('   Canonical: ' + (canonical ? '✅ ' + canonical[1].substring(0, 50) : '❌ LIPSA'));
    if (p.url === '/') console.log('   Schema AutoDealer: ' + (hasAutoDealer ? '✅' : '❌'));
    if (p.url === '/credit-auto-baia-mare/') console.log('   Schema FAQPage: ' + (hasFAQ ? '✅' : '❌'));
    if (issues.length) issues.forEach(i => console.log('   ' + i));
  }

  // Sitemap check
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  const sitemapRes = await page.goto(WP_SITE_URL + '/sitemap.xml');
  const sitemapOk = sitemapRes.status() === 200;
  console.log('🗺️  Sitemap XML: ' + (sitemapOk ? '✅ accesibil' : '❌ EROARE'));

  // Alt text check via REST API
  const mediaRes = await page.goto(WP_SITE_URL + '/wp-json/wp/v2/media?per_page=50&_fields=id,alt_text,source_url');
  const media = JSON.parse(await page.evaluate(() => document.body.innerText));
  const noAlt = media.filter(m => !m.alt_text || m.alt_text.trim() === '');
  console.log('🖼️  Imagini fara alt text (din primele 50): ' + (noAlt.length === 0 ? '✅ toate au alt text' : '⚠️  ' + noAlt.length + ' imagini fara alt'));

  const overallPct = Math.round((totalScore / totalChecks) * 100);
  console.log('\n╔══════════════════════════════════════════════════════════════╗');
  console.log('║  SCOR GENERAL TEHNIC: ' + overallPct + '/100                              ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');

  if (overallPct >= 90) console.log('🟢 Excelent! SEO tehnic foarte bun.');
  else if (overallPct >= 75) console.log('🟡 Bun. Mai sunt cateva imbunatatiri posibile.');
  else console.log('🔴 Sunt probleme ce necesita atentie.');

  await browser.close();
})();
