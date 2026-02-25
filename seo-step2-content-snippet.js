/**
 * SEO STEP 2 - Content: H1 + text SEO pe masini-de-vanzare + Credit Auto + Schema AutoDealer
 * Adauga snippet PHP via Code Snippets plugin.
 * Rulează: node seo-step2-content-snippet.js
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

// ═══════════════════════════════════════════════════════════════════════════════
// CODUL PHP PENTRU SNIPPET - Injectare H1 + text SEO + Schema
// ═══════════════════════════════════════════════════════════════════════════════
const SEO_SNIPPET_CODE = `<?php
/**
 * SEO Content Injection + Schema - masiniinratebaiamare.ro
 * Adaugat: ` + new Date().toLocaleDateString('ro-RO') + `
 *
 * Ce face:
 * 1. Injecteaza H1 + text SEO DUPA continutul Elementor pe pagina masini-de-vanzare (priority 11)
 * 2. Injecteaza H1 + continut HTML complet pe pagina credit-auto (priority 11)
 * 3. Adauga schema AutoDealer pe homepage + contact
 * 4. Adauga schema FAQPage pe credit-auto
 */

// ─── H1 + TEXT SEO: MASINI DE VANZARE ─────────────────────────────────────────
add_filter( 'the_content', 'masini_seo_inject_masini_de_vanzare', 11 );
function masini_seo_inject_masini_de_vanzare( $content ) {
	if ( ! is_page( 'masini-de-vanzare' ) ) return $content;
	if ( wp_doing_ajax() ) return $content;

	$seo_block = '<div class="masini-seo-inject" style="max-width:900px;margin:0 auto 8px auto;padding:0 16px;">'
		. '<h1 style="font-size:clamp(22px,4vw,34px);font-weight:700;color:#1a1a1a;margin:24px 0 12px;line-height:1.3;">'
		. 'Mașini de vânzare Baia Mare – Auto în rate fără avans'
		. '</h1>'
		. '<p style="font-size:16px;color:#444;line-height:1.6;margin:0 0 6px;">'
		. 'Descoperiți parcul nostru auto cu mașini de vânzare în Baia Mare. Toate autoturismele sunt '
		. 'verificate tehnic, au istoric documentat și pot fi achiziționate în <strong>rate fixe fără avans</strong> sau cash.'
		. '</p>'
		. '<p style="font-size:16px;color:#444;line-height:1.6;margin:0;">'
		. 'Stocul nostru include mărci populare: BMW, Audi, Mercedes-Benz, Volkswagen, Renault, Dacia, Skoda și altele. '
		. 'Folosiți filtrele de mai jos pentru a căuta după marcă, preț, an sau combustibil. '
		. 'Sunați la <strong>0746 923 839</strong> pentru orice întrebare.'
		. '</p>'
		. '</div>';

	return $seo_block . $content;
}

// ─── H1 + CONTINUT HTML COMPLET: CREDIT AUTO ──────────────────────────────────
add_filter( 'the_content', 'masini_seo_inject_credit_auto', 11 );
function masini_seo_inject_credit_auto( $content ) {
	if ( ! is_page( 'credit-auto-baia-mare' ) && ! is_page( 'credit-auto' ) ) return $content;
	if ( wp_doing_ajax() ) return $content;

	$credit_content = '
<div class="masini-credit-seo-inject" style="max-width:900px;margin:0 auto;padding:0 16px 32px;font-family:inherit;">

  <h1 style="font-size:clamp(22px,4vw,36px);font-weight:700;color:#1a1a1a;margin:24px 0 16px;line-height:1.3;">
    Credit auto Baia Mare – Rate fixe, aprobare rapidă
  </h1>

  <p style="font-size:16px;color:#444;line-height:1.7;margin:0 0 12px;">
    Cauți <strong>credit auto în Baia Mare</strong>? La Mașini în Rate oferim soluții flexibile de
    finanțare pentru mașini second hand, cu <strong>aprobare rapidă</strong> și condiții transparente.
    Poți achiziționa orice mașină din parcul nostru auto în <strong>rate fixe, fără avans</strong>,
    cu perioade de rambursare între 12 și 60 de luni.
  </p>

  <p style="font-size:16px;color:#444;line-height:1.7;margin:0 0 24px;">
    Colaborăm cu bănci și instituții financiare de top din România pentru a-ți oferi cele mai
    avantajoase condiții de creditare. Indiferent dacă ești salariat, pensionar sau lucrezi pe
    cont propriu, găsim soluția potrivită pentru tine.
  </p>

  <h2 style="font-size:clamp(18px,3vw,26px);font-weight:700;color:#1a1a1a;margin:32px 0 14px;border-bottom:2px solid #e63028;padding-bottom:8px;">
    Cum funcționează creditul auto?
  </h2>

  <ol style="font-size:16px;color:#444;line-height:1.8;margin:0 0 24px;padding-left:20px;">
    <li><strong>Alege mașina</strong> – Răsfoiește stocul nostru online sau vizitează-ne la sediu</li>
    <li><strong>Completează cererea</strong> – Online sau la fața locului, în maxim 10 minute</li>
    <li><strong>Primești răspunsul</strong> – Aprobare în aceeași zi de la partenerii noștri financiari</li>
    <li><strong>Ridici mașina</strong> – Cu actele în regulă și rata stabilită</li>
  </ol>

  <p style="font-size:16px;color:#444;line-height:1.7;margin:0 0 24px;">
    Nu ai nevoie de avans. <strong>Rata lunară pornește de la 81 EUR</strong>, în funcție de prețul
    mașinii și perioada de creditare aleasă.
  </p>

  <h2 style="font-size:clamp(18px,3vw,26px);font-weight:700;color:#1a1a1a;margin:32px 0 14px;border-bottom:2px solid #e63028;padding-bottom:8px;">
    Partenerii noștri financiari
  </h2>

  <p style="font-size:16px;color:#444;line-height:1.7;margin:0 0 12px;">
    Lucrăm cu parteneri financiari de încredere pentru a-ți oferi cele mai bune condiții:
  </p>

  <ul style="font-size:16px;color:#444;line-height:1.8;margin:0 0 24px;padding-left:20px;">
    <li><strong>BT Direct (Banca Transilvania)</strong> – Credit auto cu dobândă competitivă, aprobare rapidă online, fără documente complexe.</li>
    <li><strong>TBI Bank</strong> – Finanțare flexibilă pentru auto rulate, cu perioade de până la 60 de luni și rate fixe.</li>
    <li><strong>Mogo</strong> – Soluții de leasing operațional și credit auto pentru persoane fizice, proces 100% online.</li>
    <li><strong>HappyCredit</strong> – Credit auto accesibil, cu aprobare chiar și pentru persoane cu istoric financiar mai dificil.</li>
  </ul>

  <h2 style="font-size:clamp(18px,3vw,26px);font-weight:700;color:#1a1a1a;margin:32px 0 14px;border-bottom:2px solid #e63028;padding-bottom:8px;">
    Condiții de eligibilitate
  </h2>

  <ul style="font-size:16px;color:#444;line-height:1.8;margin:0 0 24px;padding-left:20px;">
    <li>Vârstă minimă: 18 ani</li>
    <li>Act de identitate valid (carte de identitate)</li>
    <li>Domiciliu stabil în România</li>
  </ul>

  <p style="font-size:16px;color:#444;line-height:1.7;margin:0 0 24px;">
    Nu solicităm avans și acceptăm și clienți care lucrează în străinătate, cu condiția prezentării
    documentelor necesare.
  </p>

  <h2 style="font-size:clamp(18px,3vw,26px);font-weight:700;color:#1a1a1a;margin:32px 0 14px;border-bottom:2px solid #e63028;padding-bottom:8px;">
    Întrebări frecvente despre creditul auto
  </h2>

  <div style="border:1px solid #eee;border-radius:8px;overflow:hidden;margin-bottom:24px;">

    <details style="border-bottom:1px solid #eee;padding:0;" open>
      <summary style="padding:16px;font-size:16px;font-weight:600;cursor:pointer;background:#fafafa;list-style:none;display:flex;justify-content:space-between;">
        Pot lua mașina în rate fără avans?
      </summary>
      <p style="padding:16px;font-size:15px;color:#555;margin:0;line-height:1.7;">
        Da, toate mașinile din parcul nostru pot fi achiziționate fără avans, cu rate fixe lunare.
      </p>
    </details>

    <details style="border-bottom:1px solid #eee;padding:0;">
      <summary style="padding:16px;font-size:16px;font-weight:600;cursor:pointer;background:#fafafa;list-style:none;display:flex;justify-content:space-between;">
        Cât durează aprobarea creditului?
      </summary>
      <p style="padding:16px;font-size:15px;color:#555;margin:0;line-height:1.7;">
        De obicei, primești răspunsul în aceeași zi, în 20–30 de minute. În cazuri excepționale,
        poate dura până la 24 de ore.
      </p>
    </details>

    <details style="border-bottom:1px solid #eee;padding:0;">
      <summary style="padding:16px;font-size:16px;font-weight:600;cursor:pointer;background:#fafafa;list-style:none;display:flex;justify-content:space-between;">
        Ce se întâmplă dacă am un istoric financiar mai dificil?
      </summary>
      <p style="padding:16px;font-size:15px;color:#555;margin:0;line-height:1.7;">
        Lucrăm cu mai mulți parteneri financiari, inclusiv instituții care acceptă și clienți cu
        istoric financiar imperfect. Contactează-ne pentru a discuta situația ta.
      </p>
    </details>

    <details style="border-bottom:1px solid #eee;padding:0;">
      <summary style="padding:16px;font-size:16px;font-weight:600;cursor:pointer;background:#fafafa;list-style:none;display:flex;justify-content:space-between;">
        Pot plăti mașina cash?
      </summary>
      <p style="padding:16px;font-size:15px;color:#555;margin:0;line-height:1.7;">
        Desigur. Acceptăm plata integrală cash, transfer bancar sau rate.
      </p>
    </details>

    <details style="padding:0;">
      <summary style="padding:16px;font-size:16px;font-weight:600;cursor:pointer;background:#fafafa;list-style:none;display:flex;justify-content:space-between;">
        Mașinile au garanție?
      </summary>
      <p style="padding:16px;font-size:15px;color:#555;margin:0;line-height:1.7;">
        Da, toate mașinile vin cu garanție inclusă și istoric tehnic verificat pe cât posibil.
      </p>
    </details>

  </div>

</div>';

	return $credit_content . $content;
}

// ─── SCHEMA AUTODEALER ─────────────────────────────────────────────────────────
add_action( 'wp_head', 'masini_schema_autodealer_json', 2 );
function masini_schema_autodealer_json() {
	if ( ! is_front_page() && ! is_page( 'contact' ) ) return;
	echo '<script type="application/ld+json">
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
    "addressRegion": "Maramure\\u015f",
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
  "priceRange": "\\u20ac\\u20ac",
  "sameAs": [
    "https://www.facebook.com/masiniinratebaiamare",
    "https://www.instagram.com/masiniinratebaiamare",
    "https://www.tiktok.com/@masiniinratebaiamare"
  ]
}
</script>' . PHP_EOL;
}

// ─── SCHEMA FAQPAGE: CREDIT AUTO ──────────────────────────────────────────────
add_action( 'wp_head', 'masini_schema_faq_credit_auto', 2 );
function masini_schema_faq_credit_auto() {
	if ( ! is_page( 'credit-auto-baia-mare' ) && ! is_page( 'credit-auto' ) ) return;
	echo '<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Pot lua ma\\u0219ina \\u00een rate f\\u0103r\\u0103 avans?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Da, toate ma\\u0219inile din parcul nostru pot fi achizi\\u021bionate f\\u0103r\\u0103 avans, cu rate fixe lunare."
      }
    },
    {
      "@type": "Question",
      "name": "C\\u00e2t dureaz\\u0103 aprobarea creditului auto?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "De obicei, prime\\u0219ti r\\u0103spunsul \\u00een aceea\\u0219i zi, \\u00een 20-30 de minute. \\u00cen cazuri excep\\u021bionale, poate dura p\\u00e2n\\u0103 la 24 de ore."
      }
    },
    {
      "@type": "Question",
      "name": "Pot pl\\u0103ti ma\\u0219ina cash?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Desigur. Accept\\u0103m plata integral\\u0103 cash, transfer bancar sau rate."
      }
    },
    {
      "@type": "Question",
      "name": "Ma\\u0219inile au garan\\u021bie?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Da, toate ma\\u0219inile vin cu garan\\u021bie inclus\\u0103 \\u0219i istoric tehnic verificat pe c\\u00e2t posibil."
      }
    }
  ]
}
</script>' . PHP_EOL;
}
`;

(async () => {
  const env = loadEnv();
  const base = (env.WP_SITE_URL || 'https://masiniinratebaiamare.ro').replace(/\/$/, '');
  const user = env.WP_USER || '';
  const pass = env.WP_PASSWORD || '';
  const SNIPPET_NAME = 'SEO Content + Schema AutoDealer + FAQ';

  const browser = await chromium.launch({ headless: false, slowMo: 60 });
  const page = await browser.newPage();
  page.setDefaultTimeout(30000);

  try {
    // Login
    log('Login...');
    await page.goto(base + '/wp-login.php', { waitUntil: 'networkidle', timeout: 30000 });
    await page.fill('#user_login', user);
    await page.fill('#user_pass', pass);
    await page.click('#wp-submit');
    await page.waitForURL(/wp-admin/, { timeout: 15000 });
    log('Logat OK.');

    // Navigate to Code Snippets list
    log('Navighez la Code Snippets...');
    await page.goto(base + '/wp-admin/admin.php?page=snippets', { waitUntil: 'networkidle', timeout: 20000 });
    await page.waitForTimeout(2000);

    // Check if snippet already exists
    const existingSnippet = await page.locator('td.column-name a:has-text("' + SNIPPET_NAME + '"), .snippet-name:has-text("' + SNIPPET_NAME + '")').first();
    let snippetEditUrl = null;

    if (await existingSnippet.count() > 0) {
      log('Snippet existent gasit, il editez...');
      const editLink = await existingSnippet.evaluate(el => {
        // Get edit link from row
        const row = el.closest('tr');
        const editA = row ? row.querySelector('a[href*="edit="]') : null;
        return editA ? editA.href : el.href;
      });
      if (editLink) {
        await page.goto(editLink, { waitUntil: 'networkidle', timeout: 20000 });
        log('Snippet existent deschis pentru editare.');
      }
    } else {
      log('Snippet nou - navighez la add-snippet...');
      await page.goto(base + '/wp-admin/admin.php?page=add-snippet', { waitUntil: 'networkidle', timeout: 20000 });
    }
    await page.waitForTimeout(3000);

    // Set snippet name
    const nameField = page.locator('input[name="snippet_name"], input.snippet-name, input[placeholder*="name" i], input[placeholder*="title" i]').first();
    if (await nameField.count() > 0) {
      await nameField.fill('');
      await nameField.fill(SNIPPET_NAME);
      log('Snippet name setat.');
    } else {
      log('WARN: nu gasesc campul de nume!');
    }

    // Set code in CodeMirror
    log('Setez codul in CodeMirror...');
    const cmSet = await page.evaluate((code) => {
      const cm = document.querySelector('.CodeMirror');
      if (!cm || !cm.CodeMirror) {
        // Try all CodeMirror instances
        const instances = document.querySelectorAll('.CodeMirror');
        for (const inst of instances) {
          if (inst.CodeMirror) {
            inst.CodeMirror.setValue(code);
            return 'set via loop';
          }
        }
        return 'no CodeMirror found';
      }
      cm.CodeMirror.setValue(code);
      return 'set ok';
    }, SEO_SNIPPET_CODE);
    log('CodeMirror: ' + cmSet);

    if (cmSet.includes('no CodeMirror')) {
      // Fallback: make textarea visible and fill it
      log('Fallback: textarea...');
      const ta = page.locator('textarea[name="code"], textarea.snippet-editor, textarea[id*="snippet"]').first();
      if (await ta.count() > 0) {
        await ta.evaluate((el, code) => {
          el.style.display = 'block';
          el.style.visibility = 'visible';
          el.value = code;
        }, SEO_SNIPPET_CODE);
        log('Textarea fallback setat.');
      }
    }

    // Make sure PHP type is selected
    const phpTypeBtn = page.locator('input[value="php"], .snippet-type-button[value="php"], button[data-type="php"], [data-snippet-type="php"]').first();
    if (await phpTypeBtn.count() > 0 && !(await phpTypeBtn.isChecked().catch(() => false))) {
      await phpTypeBtn.click();
      await page.waitForTimeout(500);
      log('PHP type selectat.');
    }

    // Save and Activate
    log('Salvez si activez snippet-ul...');
    const saveActivate = page.locator('button:has-text("Save and Activate"), input[value*="Save and Activate"], button:has-text("Salveaz") + button').first();
    if (await saveActivate.count() > 0 && await saveActivate.isVisible()) {
      await saveActivate.click();
    } else {
      // Try just Save
      const saveBtn = page.locator('button[name="save_snippet"], input[value="Save"], button:has-text("Save"), #save-snippet-header').first();
      if (await saveBtn.count() > 0) {
        await saveBtn.click();
        log('Snippet salvat (fara activate).');
      }
    }
    await page.waitForTimeout(3000);

    // Check if we got redirected back to list (success)
    const currentUrl = page.url();
    log('URL dupa save: ' + currentUrl);

    await page.screenshot({ path: path.join(__dirname, 'screenshot-snippet-saved.png') });
    log('Screenshot: screenshot-snippet-saved.png');

    // Activate if not active
    if (currentUrl.includes('page=snippets') && !currentUrl.includes('edit')) {
      log('Verificare activare snippet...');
      const snippetRow = page.locator('td.column-name a:has-text("' + SNIPPET_NAME + '")').first();
      if (await snippetRow.count() > 0) {
        const rowEl = await snippetRow.evaluate(el => {
          const row = el.closest('tr');
          return {
            hasActive: row ? row.classList.contains('active') : false,
            activateLink: row ? (row.querySelector('.activate-snippet') || row.querySelector('[data-action="activate"]')) ? 'found' : 'not found' : 'no row'
          };
        });
        log('Snippet row state: ' + JSON.stringify(rowEl));

        if (!rowEl.hasActive) {
          const activateBtn = page.locator('tr:has(a:has-text("' + SNIPPET_NAME + '")) .activate-snippet, tr:has(a:has-text("' + SNIPPET_NAME + '")) a:has-text("Activate")').first();
          if (await activateBtn.count() > 0) {
            await activateBtn.click();
            await page.waitForTimeout(2000);
            log('Snippet activat!');
          }
        } else {
          log('Snippet deja activ.');
        }
      }
    }

    // Verify: check homepage source for schema
    log('\nVerificam pagina Credit Auto dupa snippet...');
    await page.goto(base + '/credit-auto-baia-mare/', { waitUntil: 'networkidle', timeout: 20000 });
    await page.waitForTimeout(2000);
    
    const hasH1 = await page.locator('h1:has-text("Credit auto Baia Mare")').count();
    const hasSchema = await page.evaluate(() => {
      const scripts = document.querySelectorAll('script[type="application/ld+json"]');
      for (const s of scripts) {
        if (s.textContent.includes('FAQPage')) return true;
      }
      return false;
    });
    log('H1 Credit Auto prezent: ' + (hasH1 > 0 ? 'DA' : 'NU'));
    log('Schema FAQPage prezenta: ' + (hasSchema ? 'DA' : 'NU'));

    log('\nVerificam homepage pentru AutoDealer schema...');
    await page.goto(base + '/', { waitUntil: 'networkidle', timeout: 20000 });
    const hasAutoDealer = await page.evaluate(() => {
      const scripts = document.querySelectorAll('script[type="application/ld+json"]');
      for (const s of scripts) {
        if (s.textContent.includes('AutoDealer')) return true;
      }
      return false;
    });
    log('Schema AutoDealer pe homepage: ' + (hasAutoDealer ? 'DA' : 'NU'));

    log('\nVerificam pagina Masini de Vanzare...');
    await page.goto(base + '/masini-de-vanzare/', { waitUntil: 'networkidle', timeout: 20000 });
    const hasH1Masini = await page.locator('h1:has-text("Mașini de vânzare Baia Mare"), h1:has-text("Masini de vanzare Baia Mare")').count();
    log('H1 Masini de Vanzare prezent: ' + (hasH1Masini > 0 ? 'DA' : 'NU'));

    await page.screenshot({ path: path.join(__dirname, 'screenshot-masini-de-vanzare.png') });
    log('Screenshot: screenshot-masini-de-vanzare.png');

    log('\n=== STEP 2 COMPLET ===');

  } catch (err) {
    log('EROARE: ' + err.message);
    console.error(err);
    await page.screenshot({ path: path.join(__dirname, 'screenshot-step2-error.png') }).catch(() => {});
  } finally {
    await browser.close();
  }
})();
