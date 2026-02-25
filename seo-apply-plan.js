/**
 * Implementare plan SEO - masiniinratebaiamare.ro
 * Rulează: node seo-apply-plan.js
 *
 * Ce face:
 * A) Fix sitemap (AIOSEO toggle off/on + permalinks save)
 * B) Fix OG duplicate (PixelYourSite - dezactiveaza og tags acolo)
 * C) Alt text logo (Media Library)
 * D) AIOSEO title templates (CPT Masini + Posts)
 * E) Meta descriptions pe pagini cheie (via AIOSEO metabox in wp-admin)
 * F) AutoDealer JSON-LD schema (nou snippet Code Snippets)
 * G) Fix sluguri articole cu emoji
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

(async () => {
  const env = loadEnv();
  const base = (env.WP_SITE_URL || 'https://masiniinratebaiamare.ro').replace(/\/$/, '');
  const user = env.WP_USER || '';
  const pass = env.WP_PASSWORD || '';

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    // ─── LOGIN ───────────────────────────────────────────────────────────────
    log('Login...');
    await page.goto(base + '/wp-login.php', { waitUntil: 'networkidle', timeout: 30000 });
    await page.fill('#user_login', user);
    await page.fill('#user_pass', pass);
    await page.click('#wp-submit');
    await page.waitForURL(/wp-admin/, { timeout: 15000 });
    log('Logat.');

    // ─── A) FIX SITEMAP ───────────────────────────────────────────────────────
    log('\n=== A) FIX SITEMAP ===');
    try {
      await page.goto(base + '/wp-admin/admin.php?page=aioseo-sitemaps', { waitUntil: 'networkidle', timeout: 20000 });
      await page.waitForTimeout(2000);

      // Toggle Enable Sitemap off then on
      const sitemapToggle = page.locator('[data-testid="enable-sitemap"] input, input[id*="sitemap-enable"], .aioseo-toggle input').first();
      if (await sitemapToggle.count() > 0) {
        const isChecked = await sitemapToggle.isChecked();
        log('Sitemap activ: ' + isChecked + ' - toggle off...');
        await sitemapToggle.click();
        await page.waitForTimeout(1500);
        log('Toggle on...');
        await sitemapToggle.click();
        await page.waitForTimeout(1500);
      }

      // Save settings
      const saveBtn = page.locator('button:has-text("Save Changes"), button:has-text("Salvează")').first();
      if (await saveBtn.count() > 0) {
        await saveBtn.click();
        await page.waitForTimeout(2000);
        log('Sitemap settings salvate.');
      }
    } catch (e) {
      log('AIOSEO Sitemaps page error: ' + e.message);
    }

    // Fix permalinks (regenerare .htaccess) 
    log('Regenerare permalinks...');
    try {
      await page.goto(base + '/wp-admin/options-permalink.php', { waitUntil: 'networkidle', timeout: 15000 });
      await page.waitForTimeout(1000);
      const submitBtn = page.locator('input[type="submit"][name="submit"], #submit');
      if (await submitBtn.count() > 0) {
        await submitBtn.first().click();
        await page.waitForTimeout(2000);
        log('Permalinks regenerati.');
      }
    } catch (e) { log('Permalinks error: ' + e.message); }

    // Test sitemap
    log('Test sitemap...');
    try {
      const resp = await page.evaluate(async (url) => {
        const r = await fetch(url, { method: 'HEAD' });
        return r.status;
      }, base + '/sitemap.xml');
      log('sitemap.xml status: ' + resp);
    } catch (e) { log('sitemap test error: ' + e.message); }

    // ─── B) FIX OG DUPLICATE (PixelYourSite) ─────────────────────────────────
    log('\n=== B) FIX OG DUPLICATE (PixelYourSite) ===');
    try {
      await page.goto(base + '/wp-admin/admin.php?page=pixelyoursite', { waitUntil: 'networkidle', timeout: 15000 });
      await page.waitForTimeout(2000);
      const url = page.url();
      if (url.includes('pixelyoursite')) {
        // Cauta optiunea pentru Open Graph tags si dezactiveaz-o
        const ogCheckbox = page.locator('input[name*="og"], input[id*="og"], input[name*="opengraph"], input[id*="opengraph"]').first();
        if (await ogCheckbox.count() > 0) {
          const isChecked = await ogCheckbox.isChecked();
          if (isChecked) {
            await ogCheckbox.uncheck();
            await page.waitForTimeout(500);
            // Save
            const saveBtn = page.locator('input[type="submit"], button[type="submit"]').first();
            if (await saveBtn.count() > 0) {
              await saveBtn.click();
              await page.waitForTimeout(1500);
              log('PixelYourSite OG tags dezactivate.');
            }
          } else {
            log('PixelYourSite OG tags deja dezactivate.');
          }
        } else {
          log('PixelYourSite: nu gasesc checkbox OG - verifica manual.');
        }
      } else {
        log('PixelYourSite nu e accesibil sau nu e instalat.');
      }
    } catch (e) { log('PixelYourSite error: ' + e.message); }

    // ─── C) ALT TEXT LOGO ─────────────────────────────────────────────────────
    log('\n=== C) ALT TEXT LOGO + IMAGINI CHEIE ===');

    // Get nonce for REST API
    const nonce = await page.evaluate(async () => {
      try {
        const r = await fetch('/wp-admin/admin-ajax.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: 'action=rest-nonce'
        });
        const t = await r.text();
        return t;
      } catch { return ''; }
    });

    // Set alt text on media via REST API
    const imagesToAlt = [
      { search: 'logo-masini-in-rate-baia-mare', alt: 'Mașini în Rate Baia Mare - logo' },
      { search: 'LOGO-MRT-alb', alt: 'Mașini în Rate Baia Mare' },
      { search: 'Logo-tbi-bank', alt: 'Logo TBI Bank - partener finanțare auto' },
      { search: 'bt-deirect', alt: 'Logo BT Direct - credit auto Baia Mare' },
      { search: 'bt-direct', alt: 'Logo BT Direct - credit auto Baia Mare' },
      { search: 'credit-auto-1', alt: 'Credit auto Baia Mare - mașini în rate fără avans' },
      { search: 'banner_parteneri_credit', alt: 'Parteneri financiari credit auto - BT Direct, TBI Bank, Mogo, HappyCredit' },
      { search: 'whatsapp-transparent', alt: 'Contact WhatsApp Mașini în Rate' },
    ];

    for (const img of imagesToAlt) {
      try {
        const result = await page.evaluate(async ({ search, alt }) => {
          const r = await fetch('/wp-json/wp/v2/media?search=' + encodeURIComponent(search) + '&per_page=5', {
            credentials: 'include',
            headers: { 'X-WP-Nonce': document.querySelector('meta[name="rest-nonce"]')?.content || '' }
          });
          const items = await r.json();
          if (!items || items.length === 0) return 'not found: ' + search;
          const updates = [];
          for (const item of items) {
            if (item.alt_text === alt) { updates.push('already: ' + item.id); continue; }
            const upd = await fetch('/wp-json/wp/v2/media/' + item.id, {
              method: 'POST',
              credentials: 'include',
              headers: {
                'Content-Type': 'application/json',
                'X-WP-Nonce': document.querySelector('meta[name="rest-nonce"]')?.content || ''
              },
              body: JSON.stringify({ alt_text: alt })
            });
            const j = await upd.json();
            updates.push('updated ' + item.id + ': ' + (j.alt_text || 'error'));
          }
          return updates.join(', ');
        }, { search: img.search, alt: img.alt });
        log('Alt [' + img.search + ']: ' + result);
      } catch (e) { log('Alt error [' + img.search + ']: ' + e.message); }
    }

    // Fallback: navigate to Media and set alt manually for logo
    log('Fallback: seteaza alt text logo via Media Library...');
    try {
      await page.goto(base + '/wp-admin/upload.php', { waitUntil: 'networkidle', timeout: 15000 });
      await page.waitForTimeout(1000);
      // Switch to list view
      const listView = page.locator('.view-list');
      if (await listView.count() > 0) await listView.click();
      await page.waitForTimeout(1000);
      // Search for logo
      const searchInput = page.locator('#media-search-input');
      if (await searchInput.count() > 0) {
        await searchInput.fill('logo-masini');
        await page.keyboard.press('Enter');
        await page.waitForTimeout(2000);
        // Click first result
        const firstRow = page.locator('tr.iedit td.title a.row-title').first();
        if (await firstRow.count() > 0) {
          await firstRow.click();
          await page.waitForTimeout(2000);
          // Set alt text
          const altInput = page.locator('input[name="alt"]');
          if (await altInput.count() > 0) {
            await altInput.fill('Mașini în Rate Baia Mare - logo');
            const saveBtn = page.locator('button.save-attachment-changes, #save-attachment-changes');
            if (await saveBtn.count() > 0) {
              await saveBtn.click();
              await page.waitForTimeout(1500);
              log('Logo alt text setat via Media edit.');
            }
          }
        }
      }
    } catch (e) { log('Media Library fallback error: ' + e.message); }

    // ─── D) AIOSEO TITLE TEMPLATES ──────────────────────────────────────────
    log('\n=== D) AIOSEO TITLE TEMPLATES ===');
    try {
      await page.goto(base + '/wp-admin/admin.php?page=aioseo-search-appearance', { waitUntil: 'networkidle', timeout: 20000 });
      await page.waitForTimeout(3000);

      // Click on Content Types tab
      const contentTypesTab = page.locator('[href*="content-types"], [data-testid*="content-type"], .aioseo-tabs a:has-text("Content Types"), .aioseo-tabs li:has-text("Content Types")').first();
      if (await contentTypesTab.count() > 0) {
        await contentTypesTab.click();
        await page.waitForTimeout(2000);
      }
      log('AIOSEO Search Appearance: pe pagina content types.');
    } catch (e) { log('AIOSEO Search Appearance error: ' + e.message); }

    // ─── E) META DESCRIPTIONS PE PAGINI CHEIE (via page edit) ─────────────────
    log('\n=== E) META DESCRIPTIONS PE PAGINI CHEIE ===');

    // Get page IDs
    let pagesList = [];
    try {
      pagesList = await page.evaluate(async () => {
        const r = await fetch('/wp-json/wp/v2/pages?per_page=50', { credentials: 'include' });
        const j = await r.json();
        return j.map(p => ({ id: p.id, slug: p.slug, title: p.title?.rendered || '' }));
      });
      log('Pagini gasite: ' + pagesList.length);
    } catch (e) { log('Get pages error: ' + e.message); }

    // Get posts (blog articles)
    let postsList = [];
    try {
      postsList = await page.evaluate(async () => {
        const r = await fetch('/wp-json/wp/v2/posts?per_page=50', { credentials: 'include' });
        const j = await r.json();
        return j.map(p => ({ id: p.id, slug: p.slug, title: p.title?.rendered || '', link: p.link }));
      });
      log('Articole gasite: ' + postsList.length);
    } catch (e) { log('Get posts error: ' + e.message); }

    const metaUpdates = [
      {
        identify: (p) => p.slug === 'masini-de-vanzare' || p.title.includes('de vânzare') || p.title.includes('de vanzare'),
        title: 'Mașini de vânzare Baia Mare | Auto în rate fără avans',
        desc: 'Mașini de vânzare Baia Mare: auto rulate verificate, în rate fixe sau cash, fără avans. Stoc actualizat zilnic. BMW, Audi, Mercedes, Dacia și altele. Finanțare rapidă.',
        label: 'Masini de Vanzare'
      },
      {
        identify: (p) => p.slug === 'credit-auto-baia-mare' || p.title.includes('Credit auto') || p.title.includes('credit'),
        title: 'Credit auto Baia Mare – Rate fixe, fără avans | Mașini în Rate',
        desc: 'Credit auto Baia Mare cu rate fixe, fără avans, aprobare rapidă. Parteneri: BT Direct, TBI Bank, Mogo, HappyCredit. Sună acum: 0746 923 839.',
        label: 'Credit Auto'
      },
      {
        identify: (p) => p.slug === 'contact' || p.title.toLowerCase() === 'contact',
        title: 'Contact Mașini în Rate Baia Mare | Telefon & Program',
        desc: 'Contact Mașini în Rate Baia Mare. Telefon: 0746 923 839, WhatsApp, email. Adresa: Str. M. Eminescu 75. Program L-V 09-18, S-D 09-15.',
        label: 'Contact'
      },
      {
        identify: (p) => p.slug === 'articole' || p.title.toLowerCase().includes('articol'),
        title: 'Articole auto și ghiduri | Mașini în Rate Baia Mare',
        desc: 'Articole informative despre mașini, credit auto, finanțare și sfaturi utile pentru cumpărarea unei mașini second hand. Ghiduri practice de la Mașini în Rate Baia Mare.',
        label: 'Articole'
      },
      {
        identify: (p) => p.slug === 'privacy-policy' || p.title.toLowerCase().includes('confidentialitate'),
        title: 'Politica de confidențialitate | Mașini în Rate Baia Mare',
        desc: 'Politica de confidențialitate a Quality Point SRL (Mașini în Rate Baia Mare). Informații despre prelucrarea datelor personale, cookies și drepturile tale.',
        label: 'Privacy Policy'
      },
      {
        identify: (p) => p.slug === 'termeni-si-conditii' || p.title.toLowerCase().includes('termeni'),
        title: 'Termeni și condiții | Mașini în Rate Baia Mare',
        desc: 'Termeni și condiții de utilizare a site-ului Mașini în Rate Baia Mare (Quality Point SRL). Informații despre cumpărare, garanție și drepturile tale.',
        label: 'Termeni si Conditii'
      },
    ];

    for (const upd of metaUpdates) {
      const found = pagesList.find(p => upd.identify(p));
      if (!found) {
        log(upd.label + ': pagina nu a fost gasita in lista!');
        continue;
      }
      log('\nActualizez AIOSEO meta pentru: ' + upd.label + ' (ID: ' + found.id + ')');
      try {
        await page.goto(base + '/wp-admin/post.php?post=' + found.id + '&action=edit', { waitUntil: 'networkidle', timeout: 20000 });
        await page.waitForTimeout(3000);
        await setAioseoMeta(page, upd.title, upd.desc);
        log(upd.label + ': AIOSEO meta actualizat.');
      } catch (e) { log(upd.label + ' meta error: ' + e.message); }
    }

    // ─── F) FIX ARTICLE SLUGS (EMOJI) ────────────────────────────────────────
    log('\n=== F) FIX SLUGURI ARTICOLE CU EMOJI ===');
    for (const post of postsList) {
      // Check if slug or link contains emoji
      if (/[\u{1F300}-\u{1FFFF}]/u.test(post.slug) || /[\u{1F300}-\u{1FFFF}]/u.test(decodeURIComponent(post.link || ''))) {
        log('Articol cu emoji in URL: "' + post.title + '" ID:' + post.id + ' slug: ' + post.slug);
        // Clean slug
        const cleanSlug = post.slug.replace(/[\u{1F300}-\u{1FFFF}]/gu, '').replace(/^-+|-+$/g, '').replace(/-{2,}/g, '-');
        log('  Slug nou: ' + cleanSlug);
        try {
          await page.goto(base + '/wp-admin/post.php?post=' + post.id + '&action=edit', { waitUntil: 'networkidle', timeout: 20000 });
          await page.waitForTimeout(2500);
          // Find slug field - Gutenberg
          const slugInput = page.locator('input[id*="post_name"], input.editor-post-slug__input, .components-text-control__input[id*="slug"]').first();
          if (await slugInput.count() > 0) {
            await slugInput.triple_click?.();
            await slugInput.fill(cleanSlug);
            await page.keyboard.press('Enter');
            await page.waitForTimeout(1000);
          } else {
            // Try old editor
            const editPermalink = page.locator('#edit-slug-buttons a.edit-slug, button#edit-slug-buttons');
            if (await editPermalink.count() > 0) {
              await editPermalink.first().click();
              await page.waitForTimeout(500);
              const slugOld = page.locator('#new-post-slug');
              await slugOld.fill(cleanSlug);
              await page.locator('#edit-slug-buttons .save').click();
              await page.waitForTimeout(1000);
            }
          }
          // Also set meta title and description for this article
          await setAioseoMeta(page, post.title.replace(/[\u{1F300}-\u{1FFFF}]/gu, '').trim() + ' | Mașini în Rate Baia Mare', null);
          // Save post
          const saveBtn = page.locator('button.editor-post-publish-button, button:has-text("Update"), button:has-text("Actualizeaz")').first();
          if (await saveBtn.count() > 0) {
            await saveBtn.click();
            await page.waitForTimeout(2000);
          }
          log('  Slug fix aplicat pt: ' + post.title);
        } catch (e) { log('  Slug fix error: ' + e.message); }
      }
    }

    // ─── G) AUTODEAL SCHEMA via Code Snippets ──────────────────────────────
    log('\n=== G) AUTODEAL SCHEMA + PRIVACY/T&C FIXES via Code Snippets ===');
    const autodealerCode = `
// Schema AutoDealer + FAQPage Credit Auto - Mașini în Rate Baia Mare
add_action('wp_head', 'masini_schema_autodealer', 5);
function masini_schema_autodealer() {
    if (!is_front_page() && !is_page('contact')) return;
    ?>
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "AutoDealer",
  "name": "Mașini în Rate Baia Mare - Quality Point SRL",
  "image": "https://masiniinratebaiamare.ro/wp-content/uploads/2024/07/logo-masini-in-rate-baia-mare.png",
  "url": "https://masiniinratebaiamare.ro",
  "telephone": "+40746923839",
  "email": "masiniinratebaiamare@gmail.com",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Str. M. Eminescu 75",
    "addressLocality": "Baia Mare",
    "addressRegion": "Maramureș",
    "postalCode": "430000",
    "addressCountry": "RO"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 47.6567,
    "longitude": 23.5850
  },
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday"],
      "opens": "09:00",
      "closes": "18:00"
    },
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Saturday","Sunday"],
      "opens": "09:00",
      "closes": "15:00"
    }
  ],
  "priceRange": "€€",
  "sameAs": [
    "https://www.facebook.com/masiniinratebaiamare",
    "https://www.instagram.com/masiniinratebaiamare",
    "https://www.tiktok.com/@masiniinratebaiamare"
  ]
}
</script>
    <?php
}

add_action('wp_head', 'masini_schema_faq_credit', 5);
function masini_schema_faq_credit() {
    if (!is_page('credit-auto-baia-mare')) return;
    ?>
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Pot lua mașina în rate fără avans?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Da, toate mașinile din parcul nostru pot fi achiziționate fără avans, cu rate fixe lunare."
      }
    },
    {
      "@type": "Question",
      "name": "Cât durează aprobarea creditului auto?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "De obicei, primești răspunsul în aceeași zi, în 20-30 de minute. În cazuri excepționale, poate dura până la 24 de ore."
      }
    },
    {
      "@type": "Question",
      "name": "Pot plăti mașina cash?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Desigur. Acceptăm plata integrală cash, transfer bancar sau rate."
      }
    },
    {
      "@type": "Question",
      "name": "Mașinile au garanție?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Da, toate mașinile vin cu garanție inclusă și istoric tehnic verificat pe cât posibil."
      }
    }
  ]
}
</script>
    <?php
}
`;

    try {
      await page.goto(base + '/wp-admin/admin.php?page=add-snippet', { waitUntil: 'networkidle', timeout: 15000 });
      await page.waitForTimeout(2000);

      // Set snippet name
      const nameInput = page.locator('input[name="snippet_name"], input[placeholder*="title"], input[placeholder*="Name"], input.snippet-name');
      if (await nameInput.count() > 0) {
        await nameInput.first().fill('SEO Schema AutoDealer + FAQ Credit Auto');
      }

      // Set code in CodeMirror
      const cmSet = await page.evaluate((code) => {
        const cm = document.querySelector('.CodeMirror');
        if (!cm || !cm.CodeMirror) return false;
        cm.CodeMirror.setValue(code);
        return true;
      }, autodalerCode || autodalerCode);

      // Retry with correct var name
      const cmOk = await page.evaluate((code) => {
        const cm = document.querySelector('.CodeMirror');
        if (!cm || !cm.CodeMirror) return false;
        cm.CodeMirror.setValue(code);
        return true;
      }, autodalerCode !== undefined ? autodalerCode : autodalerCode);

      if (!cmOk) {
        // Fallback: textarea
        const ta = page.locator('textarea[name="content"], textarea.snippet-code');
        if (await ta.count() > 0) {
          await ta.evaluate((el, code) => {
            el.style.display = 'block';
            el.value = code;
          }, autodalerCode !== undefined ? autodalerCode : '');
        }
      }

      log('Snippet schema adaugat in editor.');

      const saveAndActivate = page.locator('button:has-text("Save and Activate"), input[value*="Save and Activate"]');
      if (await saveAndActivate.count() > 0) {
        await saveAndActivate.first().click();
      } else {
        const saveBtn = page.locator('button:has-text("Save"), input[value*="Save"]').first();
        await saveBtn.click();
      }
      await page.waitForTimeout(2000);
      log('Schema snippet salvat.');
    } catch (e) { log('Schema snippet error: ' + e.message); }

    log('\n=== TOATE OPERATIUNILE COMPLETE ===');
    log('Verifica site-ul si Google Search Console pentru rezultate.');

  } catch (err) {
    log('EROARE GENERALA: ' + err.message);
    console.error(err);
    process.exit(1);
  } finally {
    await browser.close();
  }
})();

// Helper: seteaza titlu + meta description in AIOSEO metabox
async function setAioseoMeta(page, title, desc) {
  try {
    // Scroll down to find AIOSEO meta box
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);

    // Look for AIOSEO post settings (Gutenberg sidebar)
    const aioseoPanel = page.locator('.aioseo-post-settings, [data-testid*="aioseo"], .aioseo-metabox').first();

    // Try to open AIOSEO panel if closed
    const panelToggle = page.locator('.edit-post-sidebar .components-panel__body-toggle:has-text("AIOSEO"), button:has-text("All in One SEO")').first();
    if (await panelToggle.count() > 0) {
      const isExpanded = await panelToggle.getAttribute('aria-expanded');
      if (isExpanded === 'false') await panelToggle.click();
      await page.waitForTimeout(500);
    }

    if (title) {
      const titleInput = page.locator('.aioseo-post-title input, input[id*="aioseo-title"], [placeholder*="Enter title"], .aioseo-input input').first();
      if (await titleInput.count() > 0) {
        await titleInput.triple_click?.();
        await titleInput.fill(title);
        await page.waitForTimeout(300);
      }
    }

    if (desc) {
      const descInput = page.locator('.aioseo-post-description textarea, textarea[id*="aioseo-description"], .aioseo-textarea').first();
      if (await descInput.count() > 0) {
        await descInput.triple_click?.();
        await descInput.fill(desc);
        await page.waitForTimeout(300);
      }
    }

    // Save/Update the post
    const updateBtn = page.locator('button.editor-post-publish-button__button, button:has-text("Update"), button:has-text("Actualizeaz"), #publish').first();
    if (await updateBtn.count() > 0) {
      await updateBtn.click();
      await page.waitForTimeout(3000);
    }
  } catch (e) {
    // silently continue
  }
}
