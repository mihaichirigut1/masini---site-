/**
 * Fix footer Elementor: ANPC text + page_id link via REST API Code Snippets
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

const FOOTER_FIX_CODE = `add_action('init','mirt_footer_fix',1);function mirt_footer_fix(){if(get_option('mirt_ff_v2'))return;$ids=[57,907];foreach($ids as $id){$d=get_post_meta($id,'_elementor_data',true);if(!$d)continue;$d=str_replace('"text":"List Item"','"text":"ANPC"',$d);$d=str_replace('?page_id=13','',$d);$d=str_replace('\\\\\\/\\\\\\/masiniinratebaiamare.ro\\\\\\/?page_id=13','\\\\\\/\\\\\\/'.$_SERVER['HTTP_HOST'],$d);update_post_meta($id,'_elementor_data',$d);}update_option('mirt_ff_v2',1);}`;

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

    // First, let's READ the footer Elementor data to see what's in it
    log('\n=== CITIRE DATE FOOTER ELEMENTOR ===');
    const footerData = await page.evaluate(async () => {
      const nonce = window.wpApiSettings?.nonce || '';
      const results = {};
      
      for (const id of [57, 907]) {
        // Try to get meta via a custom endpoint or just check the page
        const r = await fetch('/wp-json/wp/v2/elementor_library/' + id + '?_fields=id,title,meta', {
          credentials: 'include',
          headers: { 'X-WP-Nonce': nonce }
        });
        const j = await r.json();
        results[id] = { title: j.title?.rendered, metaKeys: Object.keys(j.meta || {}) };
      }
      return results;
    });
    log('Footer template data: ' + JSON.stringify(footerData, null, 2));

    // Create footer fix snippet via Code Snippets REST API
    log('\n=== CREARE SNIPPET FOOTER FIX ===');
    const snippetResult = await page.evaluate(async ({ code }) => {
      const nonce = window.wpApiSettings?.nonce || '';
      const r = await fetch('/wp-json/code-snippets/v1/snippets', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', 'X-WP-Nonce': nonce },
        body: JSON.stringify({
          title: 'SEO Fix Footer Links',
          code: code,
          scope: 'global',
          active: true
        })
      });
      const j = await r.json();
      return { status: r.status, id: j.id, name: j.name, active: j.active };
    }, { code: FOOTER_FIX_CODE });
    log('Snippet footer fix: ' + JSON.stringify(snippetResult));

    // Trigger by visiting a page
    if (snippetResult.status === 200 || snippetResult.status === 201) {
      log('Trigger snippet prin vizitare homepage...');
      await page.goto(base + '/', { waitUntil: 'domcontentloaded', timeout: 20000 });
      await page.waitForTimeout(3000);
      log('Snippet footer executat.');

      // Verify footer
      log('\nVerificare footer...');
      const footerCheck = await page.evaluate(async (base) => {
        const r = await fetch(base + '/', { cache: 'no-store' });
        const html = await r.text();
        const hasAnpc = /ANPC/i.test(html) && !/List\s+Item/i.test(html);
        const listItemCount = (html.match(/List Item/gi) || []).length;
        const pageId13Count = (html.match(/page_id=13/gi) || []).length;
        return { hasAnpc, listItemCount, pageId13Count };
      }, base);
      log('Footer fix check: ' + JSON.stringify(footerCheck));
    }

    // Also check Privacy Policy for old address
    log('\n=== CHECK PRIVACY POLICY ===');
    const privacyCheck = await page.evaluate(async (base) => {
      const r = await fetch(base + '/privacy-policy/', { cache: 'no-store' });
      const html = await r.text();
      const hasOldAddress = html.includes('Bdul Bucuresti');
      const hasOldPhone = html.includes('755 052 042');
      const hasDoubleComma = html.includes('QUALITY POINT SRL,,');
      return { hasOldAddress, hasOldPhone, hasDoubleComma };
    }, base);
    log('Privacy issues: ' + JSON.stringify(privacyCheck));

    // Final comprehensive check
    log('\n=== VERIFICARE FINALA SITE ===');
    const siteCheck = await page.evaluate(async (base) => {
      const checks = {};
      const pages = {
        home: '/',
        masini: '/masini-de-vanzare/',
        credit: '/credit-auto-baia-mare/',
        contact: '/contact/',
        privacy: '/privacy-policy/'
      };
      
      for (const [name, url] of Object.entries(pages)) {
        const r = await fetch(base + url, { cache: 'no-store' });
        const html = await r.text();
        const title = html.match(/<title>(.*?)<\/title>/)?.[1] || '';
        const metaDesc = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']{0,160})/)?.[1] || '';
        const h1s = [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)].map(m => m[1].replace(/<[^>]+>/g, '').trim().substring(0, 50));
        const ogDup = html.match(/<meta[^>]*property=["']og:title["'][^>]*>/gi)?.length || 0;
        checks[name] = { title: title.substring(0, 60), metaDesc: metaDesc.substring(0, 80), h1s, ogDup };
      }
      return checks;
    }, base);
    
    log('\nRezultat verificare site:');
    for (const [page, data] of Object.entries(siteCheck)) {
      log('\n  [' + page + ']');
      log('    Title: ' + data.title);
      log('    Meta: ' + data.metaDesc);
      log('    H1s: ' + JSON.stringify(data.h1s));
      log('    OG dup: ' + data.ogDup);
    }

    log('\n=== IMPLEMENTARE SEO COMPLETA ===');

  } catch (err) {
    log('EROARE: ' + err.message);
    await page.screenshot({ path: path.join(__dirname, 'screenshot-footer-fix-error.png') }).catch(() => {});
  } finally {
    await browser.close();
  }
})();
