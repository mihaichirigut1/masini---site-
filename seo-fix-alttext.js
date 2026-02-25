const { chromium } = require('playwright');

const WP_SITE_URL = 'https://masiniinratebaiamare.ro';
const WP_USER = 'masiniinratebaiamare@gmail.com';
const WP_PASSWORD = 'Z*ulokl4Xg@k756J';

function generateAlt(url, title) {
  if (title && title.trim() && !title.match(/^\d+$/) && title.length > 3) {
    return title.trim().substring(0, 100);
  }
  const filename = url.split('/').pop().replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ').replace(/\s+/g, ' ').trim();
  if (!filename || filename.length < 3) return 'Masina de vanzare Baia Mare';

  const lower = filename.toLowerCase();

  // Known car brands
  const brands = ['dacia','renault','volkswagen','vw','ford','opel','skoda','toyota','hyundai','kia',
    'bmw','mercedes','audi','seat','fiat','peugeot','citroen','nissan','honda','mazda','volvo',
    'suzuki','mitsubishi','chevrolet','jeep','land rover','porsche','alfa romeo','lancia'];
  const foundBrand = brands.find(b => lower.includes(b));

  // Year pattern
  const yearMatch = lower.match(/\b(19|20)\d{2}\b/);
  const year = yearMatch ? yearMatch[0] : '';

  // View keywords
  const views = {
    'fata': 'vedere față', 'spate': 'vedere spate', 'lateral': 'vedere laterală',
    'interior': 'interior', 'bord': 'bord', 'motor': 'motor', 'portbagaj': 'portbagaj',
    'front': 'vedere față', 'rear': 'vedere spate', 'side': 'vedere laterală',
    'cockpit': 'interior cockpit', 'salon': 'salon'
  };
  const foundView = Object.entries(views).find(([k]) => lower.includes(k));

  let parts = [];
  if (foundBrand) parts.push(foundBrand.charAt(0).toUpperCase() + foundBrand.slice(1));
  if (year) parts.push(year);
  if (foundView) parts.push(foundView[1]);
  parts.push('rate Baia Mare');

  if (parts.length >= 2) return parts.join(' – ');

  // Fallback: clean filename as alt
  const cleaned = filename.replace(/^\d+\s*/, '').replace(/\d{3,}/g, '').trim();
  if (cleaned.length > 3) return cleaned + ' – masina rate Baia Mare';
  return 'Autoturism second hand rate Baia Mare';
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  page.setDefaultTimeout(30000);

  // Login
  console.log('Login...');
  await page.goto(WP_SITE_URL + '/wp-login.php');
  await page.fill('#user_login', WP_USER);
  await page.fill('#user_pass', WP_PASSWORD);
  await page.click('#wp-submit');
  await page.waitForURL('**/wp-admin/**');

  // Get nonce
  const nonceRes = await page.goto(WP_SITE_URL + '/wp-admin/admin-ajax.php?action=rest-nonce');
  const nonceText = await page.evaluate(() => document.body.innerText);
  let nonce = nonceText.trim();
  if (!nonce || nonce.length > 20) {
    await page.goto(WP_SITE_URL + '/wp-admin/');
    nonce = await page.evaluate(() => window.wpApiSettings ? window.wpApiSettings.nonce : '');
  }
  console.log('Nonce:', nonce ? 'ok' : 'LIPSA');

  // Fetch all images without alt text - paginate through all
  let allNoAlt = [];
  let currentPage = 1;
  while (true) {
    const res = await page.goto(
      `${WP_SITE_URL}/wp-json/wp/v2/media?per_page=100&page=${currentPage}&_fields=id,alt_text,title,source_url&mime_type=image`,
      { waitUntil: 'domcontentloaded' }
    );
    if (res.status() !== 200) break;
    const items = JSON.parse(await page.evaluate(() => document.body.innerText));
    if (!Array.isArray(items) || items.length === 0) break;

    const noAlt = items.filter(m => !m.alt_text || m.alt_text.trim() === '');
    allNoAlt = allNoAlt.concat(noAlt);
    console.log(`Pagina ${currentPage}: ${items.length} imagini, ${noAlt.length} fara alt`);
    if (items.length < 100) break;
    currentPage++;
  }

  console.log(`\nTotal imagini fara alt text: ${allNoAlt.length}`);
  if (allNoAlt.length === 0) {
    console.log('Toate imaginile au deja alt text!');
    await browser.close();
    return;
  }

  // Update alt text via REST API
  let updated = 0;
  let failed = 0;

  for (const img of allNoAlt) {
    const titleRaw = img.title && img.title.rendered ? img.title.rendered : '';
    const altText = generateAlt(img.source_url, titleRaw);

    try {
      const result = await page.evaluate(async ({ url, id, alt, nonce }) => {
        const r = await fetch(url + '/wp-json/wp/v2/media/' + id, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-WP-Nonce': nonce
          },
          body: JSON.stringify({ alt_text: alt })
        });
        return { status: r.status, ok: r.ok };
      }, { url: WP_SITE_URL, id: img.id, alt: altText, nonce });

      if (result.ok) {
        updated++;
        if (updated % 20 === 0) console.log(`  Actualizate: ${updated}/${allNoAlt.length}`);
      } else {
        failed++;
        console.log(`  EROARE ID ${img.id}: status ${result.status}`);
      }
    } catch (e) {
      failed++;
    }
  }

  console.log(`\n✅ Actualizate cu succes: ${updated}`);
  if (failed > 0) console.log(`❌ Esuate: ${failed}`);

  // Final verification
  const verifyRes = await page.goto(
    `${WP_SITE_URL}/wp-json/wp/v2/media?per_page=100&_fields=id,alt_text&mime_type=image`
  );
  const verifyItems = JSON.parse(await page.evaluate(() => document.body.innerText));
  const stillNoAlt = verifyItems.filter(m => !m.alt_text || m.alt_text.trim() === '');
  console.log(`\nVerificare finala (primele 100 imagini): ${stillNoAlt.length} inca fara alt text`);

  await browser.close();
  console.log('\nGata!');
})();
