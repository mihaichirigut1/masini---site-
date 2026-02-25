/**
 * SEO Step 8: Update snippet 7 cu output buffer approach mai fiabil pt OG fix
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

// Snippet actualizat - OG fix via output buffer pe intreaga pagina
const FINAL_SNIPPET = `
/**
 * SEO - masiniinratebaiamare.ro - v3
 * 1. Remove duplicate OG tags (Elementor/PYS)
 * 2. H1 + text pe masini-de-vanzare
 * 3. H1 + continut complet pe credit-auto  
 * 4. Schema AutoDealer + FAQPage
 */

// ─── FIX OG TAGS DUPLICATE (output buffer) ─────────────────────────────────
// Elimina meta tags cu format <meta property="og:X" name="og:X" content="...">
// Acestea sunt generate de Elementor/PYS si dubleaza AIOSEO
add_action( 'wp', 'masini_start_og_filter', 999 );
function masini_start_og_filter() {
	ob_start( 'masini_clean_og_tags' );
}

add_action( 'shutdown', 'masini_end_og_filter', 0 );
function masini_end_og_filter() {
	if ( ob_get_level() > 0 && ob_get_length() !== false ) {
		ob_end_flush();
	}
}

function masini_clean_og_tags( $html ) {
	// Sterge meta tags care au AMBELE atribute: property="og:X" si name="og:X"
	// Formatul standard al AIOSEO e: <meta property="og:X" content="..."> (fara name)
	// Duplicatele de la Elementor/PYS au si name="og:X" - le stergem pe acestea
	$html = preg_replace(
		'~<meta\s+[^>]*property=["\']og:[^"\']*["\'][^>]*name=["\']og:[^"\']*["\'][^>]*/?\s*>~i',
		'',
		$html
	);
	$html = preg_replace(
		'~<meta\s+[^>]*name=["\']og:[^"\']*["\'][^>]*property=["\']og:[^"\']*["\'][^>]*/?\s*>~i',
		'',
		$html
	);
	return $html;
}

// ─── H1 + TEXT SEO: MASINI DE VANZARE ─────────────────────────────────────────
add_filter( 'the_content', 'masini_seo_inject_masini_de_vanzare', 11 );
function masini_seo_inject_masini_de_vanzare( $content ) {
	if ( ! is_page( 'masini-de-vanzare' ) ) return $content;
	if ( wp_doing_ajax() ) return $content;

	$block = '<div class="masini-seo-intro" style="max-width:900px;margin:0 auto 8px auto;padding:0 16px;">'
		. '<h1 style="font-size:clamp(22px,4vw,34px);font-weight:700;color:#1a1a1a;margin:24px 0 12px;line-height:1.3;">'
		. 'Mașini de vânzare Baia Mare &ndash; Auto în rate fără avans'
		. '</h1>'
		. '<p style="font-size:16px;color:#444;line-height:1.65;margin:0 0 6px;">'
		. 'Descoperă parcul nostru auto cu mașini de vânzare în Baia Mare. Toate autoturismele sunt '
		. 'verificate tehnic, au istoric documentat și pot fi achiziționate în <strong>rate fixe fără avans</strong> sau cash.'
		. '</p>'
		. '<p style="font-size:16px;color:#444;line-height:1.65;margin:0;">'
		. 'Stocul include mărci populare: BMW, Audi, Mercedes-Benz, Volkswagen, Renault, Dacia, Skoda și altele. '
		. 'Sună la <strong>0746 923 839</strong> pentru detalii sau finanțare.'
		. '</p>'
		. '</div>';

	return $block . $content;
}

// ─── H1 + CONTINUT COMPLET: CREDIT AUTO ──────────────────────────────────────
add_filter( 'the_content', 'masini_seo_inject_credit_auto', 11 );
function masini_seo_inject_credit_auto( $content ) {
	if ( ! is_page( 'credit-auto-baia-mare' ) && ! is_page( 'credit-auto' ) ) return $content;
	if ( wp_doing_ajax() ) return $content;

	$html = '<div class="masini-credit-seo" style="max-width:900px;margin:0 auto;padding:0 16px 32px;">';
	$html .= '<h1 style="font-size:clamp(22px,4vw,36px);font-weight:700;color:#1a1a1a;margin:24px 0 16px;">Credit auto Baia Mare &ndash; Rate fixe, aprobare rapid&#x103;</h1>';
	$html .= '<p style="font-size:16px;color:#444;line-height:1.7;margin:0 0 12px;">Cau&#x21B;i <strong>credit auto &icirc;n Baia Mare</strong>? La Ma&#x219;ini &icirc;n Rate oferim solu&#x21B;ii flexibile de finan&#x21B;are pentru ma&#x219;ini second hand, cu <strong>aprobare rapid&#x103;</strong> &#x219;i condi&#x21B;ii transparente. Po&#x21B;i achizi&#x21B;iona orice ma&#x219;in&#x103; din parcul nostru &icirc;n <strong>rate fixe, f&#x103;r&#x103; avans</strong>, cu perioade &icirc;ntre 12 &#x219;i 60 de luni.</p>';
	$html .= '<p style="font-size:16px;color:#444;line-height:1.7;margin:0 0 24px;">Colabor&#x103;m cu b&#x103;nci de top din Rom&acirc;nia. Indiferent dac&#x103; e&#x219;ti salariat, pensionar sau lucrezi pe cont propriu, g&#x103;sim solu&#x21B;ia potrivit&#x103;.</p>';

	$html .= '<h2 style="font-size:clamp(18px,3vw,26px);font-weight:700;color:#1a1a1a;margin:28px 0 14px;border-bottom:2px solid #e63028;padding-bottom:8px;">Cum func&#x21B;ioneaz&#x103; creditul auto?</h2>';
	$html .= '<ol style="font-size:16px;color:#444;line-height:1.8;margin:0 0 20px;padding-left:20px;"><li><strong>Alege ma&#x219;ina</strong> &ndash; R&#x103;sfoie&#x219;te stocul online sau viziteaz&#x103;-ne</li><li><strong>Completaz&#x103; cererea</strong> &ndash; Online sau la sediu, &icirc;n maxim 10 minute</li><li><strong>Prime&#x219;ti aprobarea</strong> &ndash; &Icirc;n aceea&#x219;i zi, &icirc;n 20&ndash;30 minute</li><li><strong>Ridici ma&#x219;ina</strong> &ndash; Cu actele &icirc;n regul&#x103; &#x219;i rata stabilit&#x103;</li></ol>';
	$html .= '<p style="font-size:16px;color:#444;line-height:1.7;margin:0 0 24px;"><strong>Rata lunar&#x103; porne&#x219;te de la 81 EUR</strong>, f&#x103;r&#x103; avans.</p>';

	$html .= '<h2 style="font-size:clamp(18px,3vw,26px);font-weight:700;color:#1a1a1a;margin:28px 0 14px;border-bottom:2px solid #e63028;padding-bottom:8px;">Partenerii no&#x219;tri financiari</h2>';
	$html .= '<ul style="font-size:16px;color:#444;line-height:1.8;margin:0 0 24px;padding-left:20px;"><li><strong>BT Direct (Banca Transilvania)</strong> &ndash; Credit auto cu dob&acirc;nd&#x103; competitiv&#x103;, aprobare rapid&#x103; online.</li><li><strong>TBI Bank</strong> &ndash; Rate fixe, p&acirc;n&#x103; la 60 luni.</li><li><strong>Mogo</strong> &ndash; Leasing operațional &#x219;i credit auto 100% online.</li><li><strong>HappyCredit</strong> &ndash; Aprobare chiar &#x219;i cu istoric financiar dificil.</li></ul>';

	$html .= '<h2 style="font-size:clamp(18px,3vw,26px);font-weight:700;color:#1a1a1a;margin:28px 0 14px;border-bottom:2px solid #e63028;padding-bottom:8px;">Condi&#x21B;ii de eligibilitate</h2>';
	$html .= '<ul style="font-size:16px;color:#444;line-height:1.8;margin:0 0 24px;padding-left:20px;"><li>V&acirc;rst&#x103; minim&#x103;: 18 ani</li><li>Act de identitate valid</li><li>Domiciliu stabil &icirc;n Rom&acirc;nia</li></ul>';

	$html .= '<h2 style="font-size:clamp(18px,3vw,26px);font-weight:700;color:#1a1a1a;margin:28px 0 14px;border-bottom:2px solid #e63028;padding-bottom:8px;">&Icirc;ntreb&#x103;ri frecvente</h2>';
	$html .= '<div style="border:1px solid #eee;border-radius:8px;overflow:hidden;margin-bottom:24px;">';
	$html .= '<details open style="border-bottom:1px solid #eee;"><summary style="padding:14px 16px;font-size:16px;font-weight:600;cursor:pointer;background:#fafafa;list-style:none;">Pot lua ma&#x219;ina f&#x103;r&#x103; avans?</summary><p style="padding:14px 16px;font-size:15px;color:#555;margin:0;">Da, toate ma&#x219;inile pot fi achizi&#x21B;ionate f&#x103;r&#x103; avans, cu rate fixe lunare.</p></details>';
	$html .= '<details style="border-bottom:1px solid #eee;"><summary style="padding:14px 16px;font-size:16px;font-weight:600;cursor:pointer;background:#fafafa;list-style:none;">C&acirc;t dureaz&#x103; aprobarea?</summary><p style="padding:14px 16px;font-size:15px;color:#555;margin:0;">De obicei &icirc;n aceea&#x219;i zi, &icirc;n 20&ndash;30 minute.</p></details>';
	$html .= '<details style="border-bottom:1px solid #eee;"><summary style="padding:14px 16px;font-size:16px;font-weight:600;cursor:pointer;background:#fafafa;list-style:none;">Pot pl&#x103;ti cash?</summary><p style="padding:14px 16px;font-size:15px;color:#555;margin:0;">Desigur. Accept&#x103;m cash, transfer bancar sau rate.</p></details>';
	$html .= '<details><summary style="padding:14px 16px;font-size:16px;font-weight:600;cursor:pointer;background:#fafafa;list-style:none;">Ma&#x219;inile au garan&#x21B;ie?</summary><p style="padding:14px 16px;font-size:15px;color:#555;margin:0;">Da, garan&#x21B;ie inclus&#x103; &#x219;i istoric tehnic verificat.</p></details>';
	$html .= '</div>';
	$html .= '</div>';

	return $html . $content;
}

// ─── SCHEMA AUTODEALER ─────────────────────────────────────────────────────────
add_action( 'wp_head', 'masini_schema_autodealer_json', 2 );
function masini_schema_autodealer_json() {
	if ( ! is_front_page() && ! is_page( 'contact' ) ) return;
	echo '<script type="application/ld+json">{"@context":"https://schema.org","@type":"AutoDealer","name":"Ma\\u0219ini \\u00een Rate Baia Mare","image":"https://masiniinratebaiamare.ro/wp-content/uploads/2024/07/logo-masini-in-rate-baia-mare.png","url":"https://masiniinratebaiamare.ro","telephone":"+40746923839","email":"masiniinratebaiamare@gmail.com","address":{"@type":"PostalAddress","streetAddress":"Str. M. Eminescu 75","addressLocality":"Baia Mare","addressRegion":"Maramure\\u015f","postalCode":"430000","addressCountry":"RO"},"geo":{"@type":"GeoCoordinates","latitude":47.6567,"longitude":23.585},"openingHoursSpecification":[{"@type":"OpeningHoursSpecification","dayOfWeek":["Monday","Tuesday","Wednesday","Thursday","Friday"],"opens":"09:00","closes":"18:00"},{"@type":"OpeningHoursSpecification","dayOfWeek":["Saturday","Sunday"],"opens":"09:00","closes":"15:00"}],"priceRange":"\\u20ac\\u20ac","sameAs":["https://www.facebook.com/masiniinratebaiamare","https://www.instagram.com/masiniinratebaiamare","https://www.tiktok.com/@masiniinratebaiamare"]}</script>' . PHP_EOL;
}

// ─── SCHEMA FAQPAGE: CREDIT AUTO ──────────────────────────────────────────────
add_action( 'wp_head', 'masini_schema_faq_credit_auto', 2 );
function masini_schema_faq_credit_auto() {
	if ( ! is_page( 'credit-auto-baia-mare' ) && ! is_page( 'credit-auto' ) ) return;
	echo '<script type="application/ld+json">{"@context":"https://schema.org","@type":"FAQPage","mainEntity":[{"@type":"Question","name":"Pot lua ma\\u0219ina f\\u0103r\\u0103 avans?","acceptedAnswer":{"@type":"Answer","text":"Da, toate ma\\u0219inile pot fi achizi\\u021bionate f\\u0103r\\u0103 avans, cu rate fixe lunare."}},{"@type":"Question","name":"C\\u00e2t dureaz\\u0103 aprobarea creditului?","acceptedAnswer":{"@type":"Answer","text":"De obicei \\u00een aceea\\u0219i zi, \\u00een 20-30 de minute."}},{"@type":"Question","name":"Pot pl\\u0103ti cash?","acceptedAnswer":{"@type":"Answer","text":"Desigur. Accept\\u0103m cash, transfer bancar sau rate."}},{"@type":"Question","name":"Ma\\u0219inile au garan\\u021bie?","acceptedAnswer":{"@type":"Answer","text":"Da, garan\\u021bie inclus\\u0103 \\u0219i istoric tehnic verificat."}}]}</script>' . PHP_EOL;
}
`;

(async () => {
  const env = loadEnv();
  const base = (env.WP_SITE_URL || 'https://masiniinratebaiamare.ro').replace(/\/$/, '');
  const user = env.WP_USER || '';
  const pass = env.WP_PASSWORD || '';

  const browser = await chromium.launch({ headless: false, slowMo: 60 });
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

    log('Edit snippet 7...');
    await page.goto(base + '/wp-admin/admin.php?page=edit-snippet&id=7', { waitUntil: 'domcontentloaded', timeout: 20000 });
    await page.waitForTimeout(4000);

    // Set code
    const cmResult = await page.evaluate((code) => {
      const cm = document.querySelector('.CodeMirror');
      if (!cm || !cm.CodeMirror) return 'no CM';
      cm.CodeMirror.setValue(code);
      return 'ok, len=' + cm.CodeMirror.getValue().length;
    }, FINAL_SNIPPET);
    log('Code set: ' + cmResult);

    await page.waitForTimeout(1500);

    // Take screenshot to see buttons
    await page.screenshot({ path: path.join(__dirname, 'screenshot-snip7-buttons.png') });

    // Find and click Save Snippet button (the one that keeps activation state)
    const saveBtn = await page.evaluate(() => {
      const buttons = document.querySelectorAll('button, input[type="submit"]');
      const found = [];
      for (const b of buttons) {
        const txt = (b.textContent || b.value || '').trim();
        if (txt) found.push(txt);
      }
      return found;
    });
    log('Buttons: ' + saveBtn.join(' | '));

    // Click "Save Snippet" which preserves activation
    const saveBtnEl = page.locator('button:has-text("Save Snippet")').first();
    if (await saveBtnEl.count() > 0) {
      await saveBtnEl.click();
      log('Clicked "Save Snippet".');
    } else {
      // Try header save button
      const headerSave = page.locator('#save-snippet-header, .save-snippet-header, button.snippet-header-save').first();
      if (await headerSave.count() > 0) {
        await headerSave.click();
        log('Clicked header save button.');
      }
    }
    await page.waitForTimeout(3000);
    
    const urlAfter = page.url();
    log('URL after save: ' + urlAfter);
    await page.screenshot({ path: path.join(__dirname, 'screenshot-snip7-saved.png') });

    // Test OG fix
    log('\nTest OG fix...');
    const ogTest = await page.evaluate(async (base) => {
      const r = await fetch(base + '/masini-de-vanzare/', { cache: 'no-store' });
      const html = await r.text();
      const all = [...html.matchAll(/<meta[^>]*property=["']og:title["'][^>]*>/gi)].map(m => m[0].substring(0, 120));
      return { count: all.length, tags: all };
    }, base);
    log('OG Title tags: ' + ogTest.count);
    ogTest.tags.forEach((t, i) => log('  ' + (i+1) + ': ' + t));

    log('\n=== DONE ===');
    if (ogTest.count === 1) {
      log('✅ OG duplicate eliminat! Ramane un singur tag OG.');
    } else if (ogTest.count === 2) {
      log('⚠️  OG duplicate inca prezent. Va necesita investigare manuala.');
    }

  } catch (err) {
    log('EROARE: ' + err.message);
    await page.screenshot({ path: path.join(__dirname, 'screenshot-step8-error.png') }).catch(() => {});
  } finally {
    await browser.close();
  }
})();
