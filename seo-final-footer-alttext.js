/**
 * SEO Final:
 * 1. Alt text pe imagini masini (bulk update fara alt text)
 * 2. Footer: ANPC text fix + page_id=13 link fix (Elementor Theme Builder)
 */

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

function loadEnv() {
  const envPath = path.join(__dirname, '.env');
  if (!fs.existsSync(envPath)) return {};
  const raw = fs.readFileSync(envPath, 'utf8').replace(/\r\n/g, '\n').replace(/^\uFEFF/, '');
  const env = {};
  raw.split('\n').forEach(line => {
    line = line.trim();
    if (!line || line.startsWith('#')) return;
    const eq = line.indexOf('=');
    if (eq === -1) return;
    env[line.slice(0, eq).trim()] = line.slice(eq + 1).trim();
  });
  return env;
}

function log(msg) { console.log('[' + new Date().toLocaleTimeString() + '] ' + msg); }

// Keywords from filename to generate alt text
function generateAltFromFilename(filename, url) {
  const name = filename.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ').replace(/\s+/g, ' ').trim();
  
  // Map of brands
  const brands = ['BMW', 'Audi', 'Mercedes', 'Volkswagen', 'VW', 'Renault', 'Dacia', 'Skoda', 'Ford', 'Opel', 'Peugeot', 'Citroen', 'Toyota', 'Honda', 'Hyundai', 'Kia', 'Seat', 'Fiat'];
  const foundBrand = brands.find(b => name.toLowerCase().includes(b.toLowerCase()));
  
  // Common car views
  const isInterior = /interior|bord|scaun|volan/i.test(name);
  const isMotor = /motor|motor|capota|engine/i.test(name);
  
  let alt = '';
  if (foundBrand) {
    alt = name.replace(/masini.in.rate.baia.mare/i, '').replace(/ratebaiamare/i, '').replace(/baiamare/i, '').trim();
    alt = alt.charAt(0).toUpperCase() + alt.slice(1);
    if (!/baia mare/i.test(alt)) {
      alt += ' - mașini în rate Baia Mare';
    }
  } else if (/masina|auto|vehicle|car/i.test(name)) {
    alt = name.charAt(0).toUpperCase() + name.slice(1) + ' - dealer auto Baia Mare';
  } else {
    return null; // Skip non-car images
  }
  
  return alt.substring(0, 125);
}

(async () => {
  const env = loadEnv();
  const base = (env.WP_SITE_URL || 'https://masiniinratebaiamare.ro').replace(/\/$/, '');
  const user = env.WP_USER || '';
  const pass = env.WP_PASSWORD || '';

  const browser = await chromium.launch({ headless: false, slowMo: 50 });
  const page = await browser.newPage();
  page.setDefaultTimeout(30000);

  try {
    log('Login...');
    await page.goto(base + '/wp-login.php', { waitUntil: 'networkidle', timeout: 30000 });
    await page.fill('#user_login', user);
    await page.fill('#user_pass', pass);
    await page.click('#wp-submit');
    await page.waitForURL(/wp-admin/, { timeout: 15000 });
    log('Logat.');

    // ─── 1. BULK ALT TEXT PE IMAGINI FARA ALT ────────────────────────────────
    log('\n=== 1. BULK ALT TEXT MASINI ===');
    
    // Get media items without alt text - search for car images
    const mediaWithoutAlt = await page.evaluate(async () => {
      const nonce = window.wpApiSettings?.nonce || '';
      const results = [];
      let page = 1;
      const perPage = 100;
      
      while (page <= 3) { // Max 3 pages = 300 items
        const r = await fetch(`/wp-json/wp/v2/media?per_page=${perPage}&page=${page}&mime_type=image&_fields=id,source_url,slug,alt_text`, {
          credentials: 'include',
          headers: { 'X-WP-Nonce': nonce }
        });
        if (!r.ok) break;
        const items = await r.json();
        if (!items || items.length === 0) break;
        
        // Filter: no alt text
        const withoutAlt = items.filter(m => !m.alt_text || m.alt_text.trim() === '');
        results.push(...withoutAlt.map(m => ({ id: m.id, slug: m.slug, url: m.source_url })));
        
        if (items.length < perPage) break;
        page++;
      }
      return results;
    });
    
    log('Imagini fara alt text: ' + mediaWithoutAlt.length);
    
    let altUpdated = 0;
    let altSkipped = 0;
    
    for (const media of mediaWithoutAlt) {
      const filename = media.slug || '';
      const url = media.url || '';
      const altText = generateAltFromFilename(filename, url);
      
      if (!altText) { altSkipped++; continue; }
      
      try {
        const result = await page.evaluate(async ({ id, alt }) => {
          const nonce = window.wpApiSettings?.nonce || '';
          const r = await fetch('/wp-json/wp/v2/media/' + id, {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json', 'X-WP-Nonce': nonce },
            body: JSON.stringify({ alt_text: alt })
          });
          const j = await r.json();
          return r.status + ': ' + (j.alt_text || 'error');
        }, { id: media.id, alt: altText });
        
        if (result.startsWith('200')) altUpdated++;
        if (altUpdated % 10 === 0 && altUpdated > 0) log('  Progress: ' + altUpdated + ' actualizate...');
      } catch (e) { /* continue */ }
    }
    
    log('Alt text actualizat pe: ' + altUpdated + ' imagini');
    log('Sarit (nu imagini masini): ' + altSkipped);

    // ─── 2. FOOTER: ANPC TEXT + PAGE_ID LINK ─────────────────────────────────
    log('\n=== 2. FOOTER FIXES VIA ELEMENTOR THEME BUILDER ===');
    try {
      await page.goto(base + '/wp-admin/admin.php?page=elementor#theme_builder', { waitUntil: 'domcontentloaded', timeout: 20000 });
      await page.waitForTimeout(2000);
      await page.screenshot({ path: path.join(__dirname, 'screenshot-elementor-tb.png') });
      log('Screenshot Elementor Theme Builder');
      
      // Navigate to Theme Builder Footer
      await page.goto(base + '/wp-admin/admin.php?page=elementor-app#/site-editor/templates', { waitUntil: 'domcontentloaded', timeout: 20000 });
      await page.waitForTimeout(2000);
      await page.screenshot({ path: path.join(__dirname, 'screenshot-elementor-templates.png') });
      log('Screenshot Elementor Templates');

      // Try finding footer templates
      await page.goto(base + '/wp-admin/edit.php?post_type=elementor_library&tabs_group=theme&elementor_library_type=footer', { waitUntil: 'domcontentloaded', timeout: 20000 });
      await page.waitForTimeout(2000);
      await page.screenshot({ path: path.join(__dirname, 'screenshot-footer-templates.png') });
      
      const footerTemplates = await page.evaluate(() => {
        const rows = document.querySelectorAll('tr.post-type-elementor_library, tr.type-elementor_library');
        return Array.from(rows).map(r => ({
          id: r.id?.replace('post-', ''),
          title: r.querySelector('.column-title a')?.textContent?.trim(),
          editLink: r.querySelector('.column-title a')?.href
        }));
      });
      log('Footer templates gasite: ' + footerTemplates.length);
      footerTemplates.forEach(t => log('  #' + t.id + ': ' + t.title));

    } catch (e) { log('Footer template error: ' + e.message); }

    // Alternative: Update footer links via WP REST API (find relevant Elementor templates)
    log('\n=== 2b. CAUTA ELEMENTOR TEMPLATES ===');
    const elementorTemplates = await page.evaluate(async () => {
      const r = await fetch('/wp-json/wp/v2/elementor_library?per_page=50&_fields=id,title,slug', {
        credentials: 'include',
        headers: { 'X-WP-Nonce': window.wpApiSettings?.nonce || '' }
      });
      if (!r.ok) return [];
      return await r.json();
    });
    log('Elementor Library templates: ' + elementorTemplates.length);
    elementorTemplates.forEach(t => log('  #' + t.id + ' [' + t.slug + ']: ' + t.title?.rendered));

    // Find footer template
    const footerTemplate = elementorTemplates.find(t => 
      t.slug.includes('footer') || (t.title?.rendered || '').toLowerCase().includes('footer')
    );
    
    if (footerTemplate) {
      log('\nGasit footer template: #' + footerTemplate.id + ' - ' + footerTemplate.title?.rendered);
      log('Edit link: ' + base + '/wp-admin/post.php?post=' + footerTemplate.id + '&action=elementor');
      
      // Get Elementor data for footer
      const footerData = await page.evaluate(async (id) => {
        const r = await fetch('/wp-json/wp/v2/elementor_library/' + id, {
          credentials: 'include',
          headers: { 'X-WP-Nonce': window.wpApiSettings?.nonce || '' }
        });
        const j = await r.json();
        const data = j.meta?._elementor_data || '';
        // Search for ANPC and page_id in the data
        const hasAnpc = data.includes('anpc');
        const hasPageId13 = data.includes('page_id=13');
        const hasListItem = data.includes('List Item');
        return { hasAnpc, hasPageId13, hasListItem, dataLen: data.length };
      }, footerTemplate.id);
      log('Footer data: ' + JSON.stringify(footerData));
    }

    // ─── FINAL STATS ─────────────────────────────────────────────────────────
    log('\n=== REZUMAT FINAL COMPLET ===');
    log('\nSCHIMBARI APLICATE PE SITE:');
    log('');
    log('✅ SITEMAP: functional (200 OK) - generat automat de AIOSEO');
    log('✅ OG TAGS: duplicate eliminate (snippet PHP via output buffer)');
    log('✅ ALT TEXT: setat pe logo, TBI Bank, BT Direct, WhatsApp, banner parteneri + ' + altUpdated + ' imagini masini');
    log('✅ META DESCRIPTIONS: setate via AIOSEO REST API pe 6 pagini cheie');
    log('✅ H1 "Mașini de vânzare Baia Mare" injectat pe pagina /masini-de-vanzare/');
    log('✅ H1 "Credit auto Baia Mare" + 5 sectiuni HTML injectate pe /credit-auto-baia-mare/');
    log('✅ SCHEMA AutoDealer JSON-LD pe homepage + contact');
    log('✅ SCHEMA FAQPage JSON-LD pe /credit-auto-baia-mare/');
    log('✅ SLUGURI ARTICOLE: 2 articole cu emoji în URL au fost corectate');
    log('✅ OG:SITE_NAME: scurtat de la 190+ caractere');
    log('✅ AIOSEO TITLE TEMPLATES: setate pentru CPT Masini + Posts');
    log('');
    log('RAMASE DE FACUT (necesita interventie manuala):');
    log('⚠️  Footer: text "List Item" → "ANPC" (necesita Elementor Theme Builder)');
    log('⚠️  Footer: link ?page_id=13 → URL curat (necesita Elementor)');
    log('⚠️  Homepage: sterge sectiunea "Despre" duplicata (Elementor Editor)');
    log('⚠️  Heading hierarchy: H3→H2 in template CPT Masini (Elementor)');
    log('⚠️  Privacy Policy: corectie adresa/telefon vechi (Elementor/Gutenberg)');
    log('⚠️  Termeni si Conditii: sectiunea 10 "?" → text real');
    log('⚠️  Alt text pe imaginile individuale ale masinilor');

  } catch (err) {
    log('EROARE: ' + err.message);
    await page.screenshot({ path: path.join(__dirname, 'screenshot-final-error.png') }).catch(() => {});
  } finally {
    await browser.close();
  }
})();
