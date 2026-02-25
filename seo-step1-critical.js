/**
 * SEO STEP 1 - Critice: Sitemap + OG site_name + Logo alt + AIOSEO meta + Article slugs
 * Rulează: node seo-step1-critical.js
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

async function login(page, base, user, pass) {
  log('Login...');
  await page.goto(base + '/wp-login.php', { waitUntil: 'networkidle', timeout: 30000 });
  await page.fill('#user_login', user);
  await page.fill('#user_pass', pass);
  await page.click('#wp-submit');
  await page.waitForURL(/wp-admin/, { timeout: 15000 });
  log('Logat OK.');
}

async function setAioseoOnPage(page, base, postId, title, description) {
  log('  AIOSEO pe post ID=' + postId + '...');
  await page.goto(base + '/wp-admin/post.php?post=' + postId + '&action=edit', { waitUntil: 'networkidle', timeout: 25000 });
  await page.waitForTimeout(4000);

  // Try to find AIOSEO section - it might need scrolling
  await page.evaluate(() => window.scrollTo(0, 3000));
  await page.waitForTimeout(1500);

  // Look for AIOSEO tab/panel in classic editor or Gutenberg
  // In Gutenberg sidebar: click "Post" tab, then look for AIOSEO plugin
  let setOk = false;

  // Try Gutenberg approach: switch to Text tab and look for AIOSEO
  // AIOSEO in Gutenberg adds a panel in the sidebar Document tab
  const panelHeader = await page.locator('button.components-button:has-text("AIOSEO"), .edit-post-sidebar .components-panel__body-title:has-text("AIOSEO")').first();
  if (await panelHeader.count() > 0) {
    try {
      const expanded = await panelHeader.getAttribute('aria-expanded');
      if (expanded === 'false') await panelHeader.click();
      await page.waitForTimeout(800);
      log('  AIOSEO panel deschis in Gutenberg sidebar.');
    } catch (e) {}
  }

  // Try setting title via AIOSEO JS API (works with Gutenberg AIOSEO integration)
  if (title) {
    const result = await page.evaluate((titleText) => {
      // Try AIOSEO React store
      try {
        if (window.aioseo && window.aioseo.store) {
          window.aioseo.store.dispatch({ type: 'UPDATE_POST_META', data: { title: titleText } });
          return 'dispatch ok';
        }
      } catch {}
      // Try direct input
      const inputs = document.querySelectorAll('input[id*="aioseo"], input[name*="aioseo_title"], .aioseo-post-title input');
      for (const inp of inputs) {
        if (inp.offsetParent !== null) {
          inp.value = titleText;
          inp.dispatchEvent(new Event('input', { bubbles: true }));
          inp.dispatchEvent(new Event('change', { bubbles: true }));
          return 'input set';
        }
      }
      return 'not found';
    }, title);
    log('  Title set result: ' + result);
  }

  if (description) {
    const result = await page.evaluate((descText) => {
      const textareas = document.querySelectorAll('textarea[id*="aioseo"], textarea[name*="aioseo_description"], .aioseo-post-description textarea');
      for (const ta of textareas) {
        if (ta.offsetParent !== null) {
          ta.value = descText;
          ta.dispatchEvent(new Event('input', { bubbles: true }));
          ta.dispatchEvent(new Event('change', { bubbles: true }));
          return 'textarea set';
        }
      }
      return 'not found';
    }, description);
    log('  Description set result: ' + result);
  }

  // Click Update/Save
  await page.waitForTimeout(500);
  const updateBtn = await page.locator('button.editor-post-publish-button__button:not([aria-disabled="true"]), #publish, input[value="Update"]').first();
  if (await updateBtn.count() > 0) {
    await updateBtn.click();
    await page.waitForTimeout(3000);
    log('  Post salvat.');
    setOk = true;
  }

  // If AIOSEO meta not found via JS, try REST API approach
  if (!setOk || result === 'not found') {
    log('  Incercare alternativa via REST API...');
    try {
      await page.evaluate(async ({ postId, title, description }) => {
        const nonce = window.wpApiSettings?.nonce || '';
        // Try direct wp REST API update for AIOSEO meta
        const resp = await fetch('/wp-json/wp/v2/posts/' + postId, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json', 'X-WP-Nonce': nonce },
          body: JSON.stringify({ meta: { _aioseo_title: title, _aioseo_description: description } })
        });
        return await resp.status;
      }, { postId, title, description });
    } catch {}
  }
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
    await login(page, base, user, pass);

    // ─── 1. FIX OG:SITE_NAME (scurteaza tagline) ─────────────────────────────
    log('\n=== 1. FIX OG SITE_NAME ===');
    try {
      await page.goto(base + '/wp-admin/options-general.php', { waitUntil: 'networkidle', timeout: 20000 });
      const taglineInput = page.locator('#blogdescription');
      if (await taglineInput.count() > 0) {
        const current = await taglineInput.inputValue();
        log('Tagline actual: "' + current + '"');
        if (current.length > 80) {
          await taglineInput.fill('Mașini second hand în rate fixe sau cash, fără avans, în Baia Mare');
          const saveBtn = page.locator('#submit');
          await saveBtn.click();
          await page.waitForTimeout(2000);
          log('Tagline scurtat si salvat.');
        } else {
          log('Tagline OK, nu modific.');
        }
      }
    } catch (e) { log('Error tagline: ' + e.message); }

    // ─── 2. FIX SITEMAP ───────────────────────────────────────────────────────
    log('\n=== 2. FIX SITEMAP ===');
    // First flush permalinks
    try {
      await page.goto(base + '/wp-admin/options-permalink.php', { waitUntil: 'networkidle', timeout: 20000 });
      await page.waitForTimeout(1000);
      await page.locator('#submit').first().click();
      await page.waitForTimeout(2000);
      log('Permalinks flush OK.');
    } catch (e) { log('Permalinks error: ' + e.message); }

    // Check if sitemap works now
    try {
      const sitemapStatus = await page.evaluate(async (url) => {
        try {
          const r = await fetch(url);
          return r.status;
        } catch (e) { return 'fetch error: ' + e.message; }
      }, base + '/sitemap.xml');
      log('Sitemap status dupa flush: ' + sitemapStatus);

      if (sitemapStatus !== 200) {
        // Try AIOSEO sitemap page
        await page.goto(base + '/wp-admin/admin.php?page=aioseo-sitemaps', { waitUntil: 'networkidle', timeout: 20000 });
        await page.waitForTimeout(3000);
        const pageContent = await page.content();
        if (pageContent.includes('aioseo')) {
          log('AIOSEO Sitemaps page loaded.');
          // Save settings to trigger regeneration
          const saveBtn = page.locator('button:has-text("Save Changes"), button:has-text("Salvează modificările")').first();
          if (await saveBtn.count() > 0) {
            await saveBtn.click();
            await page.waitForTimeout(3000);
            log('AIOSEO Sitemaps settings saved/regenerated.');
          }
        }
      }
    } catch (e) { log('Sitemap check error: ' + e.message); }

    // ─── 3. ALT TEXT PE LOGO (via Media Library) ─────────────────────────────
    log('\n=== 3. ALT TEXT LOGO + IMAGINI CHEIE ===');
    
    // Get all pages for REST API nonce
    const restNonce = await page.evaluate(() => {
      return window.wpApiSettings?.nonce || '';
    });
    log('REST nonce: ' + (restNonce ? 'OK' : 'nu am gasit - continuu fara'));

    const altUpdates = [
      { search: 'logo-masini-in-rate', alt: 'Mașini în Rate Baia Mare - logo' },
      { search: 'LOGO-MRT-alb', alt: 'Mașini în Rate Baia Mare' },
      { search: 'logo-mrt', alt: 'Mașini în Rate Baia Mare' },
      { search: 'Logo-tbi-bank', alt: 'Logo TBI Bank - partener finanțare auto' },
      { search: 'tbi-bank', alt: 'Logo TBI Bank - partener finanțare auto' },
      { search: 'bt-direct', alt: 'Logo BT Direct - credit auto Baia Mare' },
      { search: 'bt-deirect', alt: 'Logo BT Direct - credit auto Baia Mare' },
      { search: 'credit-auto', alt: 'Credit auto Baia Mare - mașini în rate fără avans' },
      { search: 'banner_parteneri', alt: 'Parteneri financiari credit auto - BT Direct, TBI Bank, Mogo, HappyCredit' },
      { search: 'whatsapp', alt: 'Contact WhatsApp Mașini în Rate Baia Mare' },
    ];

    for (const item of altUpdates) {
      try {
        const result = await page.evaluate(async ({ search, alt }) => {
          const r = await fetch('/wp-json/wp/v2/media?search=' + encodeURIComponent(search) + '&per_page=5', {
            credentials: 'include',
            headers: { 'X-WP-Nonce': window.wpApiSettings?.nonce || '' }
          });
          if (!r.ok) return 'REST error: ' + r.status;
          const items = await r.json();
          if (!items || !items.length) return 'not found';
          const results = [];
          for (const media of items) {
            if (media.alt_text === alt) { results.push('already set #' + media.id); continue; }
            const upd = await fetch('/wp-json/wp/v2/media/' + media.id, {
              method: 'POST',
              credentials: 'include',
              headers: {
                'Content-Type': 'application/json',
                'X-WP-Nonce': window.wpApiSettings?.nonce || ''
              },
              body: JSON.stringify({ alt_text: alt })
            });
            const j = await upd.json();
            results.push('updated #' + media.id + ' -> "' + (j.alt_text || 'ERROR') + '"');
          }
          return results.join('; ');
        }, { search: item.search, alt: item.alt });
        log('  [' + item.search + ']: ' + result);
      } catch (e) { log('  [' + item.search + '] error: ' + e.message); }
    }

    // ─── 4. GET PAGE IDS ─────────────────────────────────────────────────────
    log('\n=== 4. OBTINE ID-URI PAGINI ===');
    let pages = [], posts = [];
    try {
      pages = await page.evaluate(async () => {
        const r = await fetch('/wp-json/wp/v2/pages?per_page=100&_fields=id,slug,title,link', { credentials: 'include' });
        return r.ok ? await r.json() : [];
      });
      log('Pagini WP: ' + pages.length);
      pages.forEach(p => log('  ' + p.id + ' | ' + p.slug + ' | ' + (p.title?.rendered || '')));
    } catch (e) { log('Pages error: ' + e.message); }

    try {
      posts = await page.evaluate(async () => {
        const r = await fetch('/wp-json/wp/v2/posts?per_page=100&_fields=id,slug,title,link,status', { credentials: 'include' });
        return r.ok ? await r.json() : [];
      });
      log('Articole: ' + posts.length);
      posts.forEach(p => log('  ' + p.id + ' | ' + p.slug + ' | ' + (p.title?.rendered || '')));
    } catch (e) { log('Posts error: ' + e.message); }

    // ─── 5. AIOSEO META DESCRIPTIONS PE PAGINI ───────────────────────────────
    log('\n=== 5. META DESCRIPTIONS PAGINI ===');

    const pageMetas = [
      {
        find: (p) => p.slug === 'masini-de-vanzare' || (p.title?.rendered || '').toLowerCase().includes('masini de v') || (p.title?.rendered || '').toLowerCase().includes('mașini de v'),
        title: 'Mașini de vânzare Baia Mare | Auto în rate fără avans',
        desc: 'Mașini de vânzare Baia Mare: auto rulate verificate, în rate fixe sau cash, fără avans. Stoc actualizat zilnic. BMW, Audi, Mercedes, Dacia și altele. Finanțare rapidă.',
        label: 'Masini de Vanzare'
      },
      {
        find: (p) => p.slug === 'credit-auto-baia-mare' || p.slug === 'credit-auto' || (p.title?.rendered || '').toLowerCase().includes('credit'),
        title: 'Credit auto Baia Mare – Rate fixe, fără avans | Mașini în Rate',
        desc: 'Credit auto Baia Mare cu rate fixe, fără avans, aprobare rapidă. Parteneri: BT Direct, TBI Bank, Mogo, HappyCredit. Sună acum: 0746 923 839.',
        label: 'Credit Auto'
      },
      {
        find: (p) => p.slug === 'contact' || (p.title?.rendered || '').toLowerCase() === 'contact',
        title: 'Contact Mașini în Rate Baia Mare | Telefon & Program',
        desc: 'Contact Mașini în Rate Baia Mare. Telefon: 0746 923 839, WhatsApp, email. Adresa: Str. M. Eminescu 75. Program L-V 09-18, S-D 09-15.',
        label: 'Contact'
      },
      {
        find: (p) => p.slug === 'articole' || (p.title?.rendered || '').toLowerCase().includes('articol'),
        title: 'Articole auto și ghiduri | Mașini în Rate Baia Mare',
        desc: 'Articole informative despre mașini, credit auto, finanțare și sfaturi utile pentru cumpărarea unei mașini second hand. Ghiduri practice de la Mașini în Rate Baia Mare.',
        label: 'Articole'
      },
      {
        find: (p) => p.slug === 'privacy-policy' || (p.title?.rendered || '').toLowerCase().includes('confidential'),
        title: 'Politica de confidențialitate | Mașini în Rate Baia Mare',
        desc: 'Politica de confidențialitate a Quality Point SRL (Mașini în Rate Baia Mare). Informații despre prelucrarea datelor personale, cookies și drepturile tale.',
        label: 'Privacy Policy'
      },
      {
        find: (p) => p.slug === 'termeni-si-conditii' || p.slug === 'termeni' || (p.title?.rendered || '').toLowerCase().includes('termeni'),
        title: 'Termeni și condiții | Mașini în Rate Baia Mare',
        desc: 'Termeni și condiții de utilizare a site-ului Mașini în Rate Baia Mare (Quality Point SRL). Informații despre cumpărare, garanție și drepturile tale.',
        label: 'Termeni si Conditii'
      },
    ];

    for (const meta of pageMetas) {
      const found = pages.find(meta.find);
      if (!found) {
        log('\n' + meta.label + ': NU GASIT in lista de pagini!');
        continue;
      }
      log('\n--- ' + meta.label + ' (ID: ' + found.id + ', slug: ' + found.slug + ') ---');
      
      try {
        await page.goto(base + '/wp-admin/post.php?post=' + found.id + '&action=edit', {
          waitUntil: 'networkidle', timeout: 25000
        });
        await page.waitForTimeout(4000);

        // Try to set AIOSEO meta via Playwright (look for inputs)
        let titleSet = false, descSet = false;

        // Scroll to bottom to see AIOSEO metabox
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await page.waitForTimeout(1000);

        // Classic editor AIOSEO inputs
        const titleInputs = await page.locator('#aioseo-title-field, [id*="aioseo-title"], .aioseo-post-title input').all();
        for (const inp of titleInputs) {
          if (await inp.isVisible()) {
            await inp.triple_click();
            await inp.fill(meta.title);
            titleSet = true;
            break;
          }
        }

        const descInputs = await page.locator('#aioseo-description-field, [id*="aioseo-description"], .aioseo-post-description textarea').all();
        for (const inp of descInputs) {
          if (await inp.isVisible()) {
            await inp.triple_click();
            await inp.fill(meta.desc);
            descSet = true;
            break;
          }
        }

        if (!titleSet || !descSet) {
          // Try REST API with AIOSEO post meta keys
          log('  Setez via REST API (AIOSEO meta)...');
          const apiResult = await page.evaluate(async ({ postId, title, desc }) => {
            const nonce = window.wpApiSettings?.nonce || '';
            // AIOSEO stores meta as _aioseo_title and _aioseo_description
            const r = await fetch('/wp-json/wp/v2/pages/' + postId, {
              method: 'POST',
              credentials: 'include',
              headers: {
                'Content-Type': 'application/json',
                'X-WP-Nonce': nonce
              },
              body: JSON.stringify({
                meta: {
                  _aioseo_title: title,
                  _aioseo_description: desc,
                  aioseo_title: title,
                  aioseo_description: desc
                }
              })
            });
            return r.status + ' ' + (r.ok ? 'OK' : 'FAIL');
          }, { postId: found.id, title: meta.title, desc: meta.desc });
          log('  REST result: ' + apiResult);
        } else {
          log('  Input setate: title=' + titleSet + ' desc=' + descSet);
          // Save
          const updateBtn = page.locator('button.editor-post-publish-button__button, input#publish, input[value="Update"]').first();
          if (await updateBtn.count() > 0 && await updateBtn.isVisible()) {
            await updateBtn.click();
            await page.waitForTimeout(3000);
            log('  Salvat OK.');
          }
        }
      } catch (e) { log('  Error: ' + e.message); }
    }

    // ─── 6. AIOSEO TITLE FORMAT PENTRU MASINI + POSTS ───────────────────────
    log('\n=== 6. AIOSEO TITLE TEMPLATES ===');
    try {
      await page.goto(base + '/wp-admin/admin.php?page=aioseo-search-appearance', { waitUntil: 'networkidle', timeout: 25000 });
      await page.waitForTimeout(4000);
      log('AIOSEO Search Appearance loaded. Cauta Content Types tab...');

      // Click Content Types tab
      const contentTypesTabs = await page.locator('a[href*="content-types"], li[data-slug*="content"], .aioseo-tabs li:has-text("Content"), button:has-text("Content Types")').all();
      for (const tab of contentTypesTabs) {
        if (await tab.isVisible()) {
          await tab.click();
          await page.waitForTimeout(2000);
          log('Content Types tab click.');
          break;
        }
      }

      await page.screenshot({ path: path.join(__dirname, 'screenshot-aioseo-content-types.png') });
      log('Screenshot salvat: screenshot-aioseo-content-types.png');
    } catch (e) { log('AIOSEO Content Types error: ' + e.message); }

    // ─── 7. FIX ARTICLE EMOJI SLUGS ──────────────────────────────────────────
    log('\n=== 7. FIX SLUGURI ARTICOLE CU EMOJI ===');
    
    const emojiRegex = /[\u{1F300}-\u{1FFFF}\u{1F100}-\u{1F1FF}\u{2600}-\u{27BF}\u{FE00}-\u{FE0F}\u{1F000}-\u{1F02F}]/gu;
    
    for (const post of posts) {
      const decodedLink = decodeURIComponent(post.link || '');
      const hasEmoji = emojiRegex.test(post.slug) || emojiRegex.test(decodedLink);
      if (hasEmoji) {
        const cleanSlug = post.slug.replace(emojiRegex, '').replace(/^-+|-+$/g, '').replace(/-{2,}/g, '-');
        log('\nArticol cu emoji: "' + post.title?.rendered + '" (ID: ' + post.id + ')');
        log('  Slug vechi: ' + post.slug + '  →  Slug nou: ' + cleanSlug);
        
        try {
          const result = await page.evaluate(async ({ postId, newSlug }) => {
            const nonce = window.wpApiSettings?.nonce || '';
            const r = await fetch('/wp-json/wp/v2/posts/' + postId, {
              method: 'POST',
              credentials: 'include',
              headers: { 'Content-Type': 'application/json', 'X-WP-Nonce': nonce },
              body: JSON.stringify({ slug: newSlug })
            });
            const j = await r.json();
            return r.status + ' slug=' + (j.slug || 'error');
          }, { postId: post.id, newSlug: cleanSlug });
          log('  Result: ' + result);
        } catch (e) { log('  Error: ' + e.message); }
      }
    }

    // ─── 8. FIX OG TAGS - PixelYourSite ─────────────────────────────────────
    log('\n=== 8. FIX OG TAGS DUPLICATE (PixelYourSite) ===');
    try {
      await page.goto(base + '/wp-admin/admin.php?page=pixelyoursite', { waitUntil: 'networkidle', timeout: 15000 });
      await page.waitForTimeout(2000);
      const currentUrl = page.url();
      if (currentUrl.includes('pixelyoursite')) {
        log('PixelYourSite accesibil. Cauta Open Graph optiune...');
        await page.screenshot({ path: path.join(__dirname, 'screenshot-pixelyoursite.png') });
        log('Screenshot salvat: screenshot-pixelyoursite.png');
        
        // Find OG related checkboxes
        const content = await page.content();
        if (content.toLowerCase().includes('open graph') || content.toLowerCase().includes('og tag')) {
          log('Gasit Open Graph optiune. Dezactiveaza...');
          // Look for og toggle
          const ogToggles = await page.locator('input[type="checkbox"]').all();
          for (const toggle of ogToggles) {
            const label = await toggle.evaluate(el => {
              const id = el.id;
              const label = document.querySelector('label[for="' + id + '"]');
              return label ? label.textContent : '';
            });
            if (label.toLowerCase().includes('open graph') || label.toLowerCase().includes('og')) {
              const isChecked = await toggle.isChecked();
              if (isChecked) {
                await toggle.uncheck();
                log('  Dezactivat: ' + label);
              }
            }
          }
          // Save
          const saveBtn = page.locator('button[type="submit"], input[type="submit"]').first();
          if (await saveBtn.count() > 0 && await saveBtn.isVisible()) {
            await saveBtn.click();
            await page.waitForTimeout(2000);
            log('PixelYourSite salvat.');
          }
        } else {
          log('PixelYourSite nu are optiune OG vizibila - verifica manual screenshot.');
        }
      } else {
        log('PixelYourSite nu e instalat sau activ.');
      }
    } catch (e) { log('PixelYourSite error: ' + e.message); }

    // ─── SUMMARY ─────────────────────────────────────────────────────────────
    log('\n=== STEP 1 COMPLET ===');
    log('Fa un screenshot final si verifica https://masiniinratebaiamare.ro/sitemap.xml');
    
    // Final screenshot
    await page.goto(base + '/sitemap.xml', { waitUntil: 'networkidle', timeout: 15000 });
    await page.screenshot({ path: path.join(__dirname, 'screenshot-sitemap-final.png') });
    log('Screenshot sitemap: screenshot-sitemap-final.png');

  } catch (err) {
    log('EROARE GENERALA: ' + err.message);
    console.error(err);
    await page.screenshot({ path: path.join(__dirname, 'screenshot-error.png') }).catch(() => {});
  } finally {
    await browser.close();
  }
})();
