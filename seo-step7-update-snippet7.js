/**
 * SEO Step 7: Actualizeaza snippet 7 cu OG Fix adaugat
 * Snippet 7 e activ ("Save and Deactivate" e prezent) - il actualizam cu cod nou
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

// Codul complet actualizat - include OG fix
const UPDATED_SNIPPET_CODE = `
/**
 * SEO Content Injection + Schema + OG Fix - masiniinratebaiamare.ro
 * Include:
 * 1. H1 + text SEO pe masini-de-vanzare
 * 2. H1 + continut HTML complet pe credit-auto
 * 3. Schema AutoDealer pe homepage + contact
 * 4. Schema FAQPage pe credit-auto
 * 5. Fix OG duplicate tags (elimina setul duplicat cu atribut name="og:...")
 */

// ─── FIX OG TAGS DUPLICATE ────────────────────────────────────────────────────
// Elimina OG tags de la PixelYourSite (care au si property si name attributes)
add_action( 'template_redirect', 'masini_remove_pys_og', 1 );
function masini_remove_pys_og() {
	global $wp_filter;
	if ( ! isset( $wp_filter['wp_head'] ) ) return;
	foreach ( $wp_filter['wp_head']->callbacks as $priority => $callbacks ) {
		foreach ( $callbacks as $key => $callback ) {
			$func = $callback['function'];
			$class_name = '';
			if ( is_array( $func ) && is_object( $func[0] ) ) {
				$class_name = get_class( $func[0] );
			}
			if ( stripos( $class_name, 'PYS' ) !== false
				|| stripos( $class_name, 'PixelYourSite' ) !== false
				|| stripos( $class_name, 'pixel_your_site' ) !== false ) {
				$wp_filter['wp_head']->remove_filter( 'wp_head', $func, $priority );
			}
		}
	}
}

// ─── H1 + TEXT SEO: MASINI DE VANZARE ─────────────────────────────────────────
add_filter( 'the_content', 'masini_seo_inject_masini_de_vanzare', 11 );
function masini_seo_inject_masini_de_vanzare( $content ) {
	if ( ! is_page( 'masini-de-vanzare' ) ) return $content;
	if ( wp_doing_ajax() ) return $content;

	$seo_block = '<div class="masini-seo-inject" style="max-width:900px;margin:0 auto 8px auto;padding:0 16px;">'
		. '<h1 style="font-size:clamp(22px,4vw,34px);font-weight:700;color:#1a1a1a;margin:24px 0 12px;line-height:1.3;">'
		. 'Mașini de vânzare Baia Mare \\u2013 Auto în rate fără avans'
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

	ob_start();
	?>
<div class="masini-credit-seo-inject" style="max-width:900px;margin:0 auto;padding:0 16px 32px;font-family:inherit;">
  <h1 style="font-size:clamp(22px,4vw,36px);font-weight:700;color:#1a1a1a;margin:24px 0 16px;line-height:1.3;">
    Credit auto Baia Mare &ndash; Rate fixe, aprobare rapid&#x103;
  </h1>
  <p style="font-size:16px;color:#444;line-height:1.7;margin:0 0 12px;">
    Cau&#x21B;i <strong>credit auto &icirc;n Baia Mare</strong>? La Ma&#x219;ini &icirc;n Rate oferim solu&#x21B;ii
    flexibile de finan&#x21B;are pentru ma&#x219;ini second hand, cu <strong>aprobare rapid&#x103;</strong> &#x219;i
    condi&#x21B;ii transparente. Po&#x21B;i achizi&#x21B;iona orice ma&#x219;in&#x103; din parcul nostru auto
    &icirc;n <strong>rate fixe, f&#x103;r&#x103; avans</strong>, cu perioade de rambursare &icirc;ntre 12 &#x219;i 60 de luni.
  </p>
  <p style="font-size:16px;color:#444;line-height:1.7;margin:0 0 24px;">
    Colabor&#x103;m cu b&#x103;nci &#x219;i institu&#x21B;ii financiare de top din Rom&acirc;nia pentru a-&#x21B;i
    oferi cele mai avantajoase condi&#x21B;ii de creditare. Indiferent dac&#x103; e&#x219;ti salariat,
    pensionar sau lucrezi pe cont propriu, g&#x103;sim solu&#x21B;ia potrivit&#x103; pentru tine.
  </p>

  <h2 style="font-size:clamp(18px,3vw,26px);font-weight:700;color:#1a1a1a;margin:32px 0 14px;border-bottom:2px solid #e63028;padding-bottom:8px;">
    Cum func&#x21B;ioneaz&#x103; creditul auto?
  </h2>
  <ol style="font-size:16px;color:#444;line-height:1.8;margin:0 0 24px;padding-left:20px;">
    <li><strong>Alege ma&#x219;ina</strong> &ndash; R&#x103;sfoie&#x219;te stocul nostru online sau viziteaz&#x103;-ne la sediu</li>
    <li><strong>Completaz&#x103; cererea</strong> &ndash; Online sau la fa&#x21B;a locului, &icirc;n maxim 10 minute</li>
    <li><strong>Prime&#x219;ti r&#x103;spunsul</strong> &ndash; Aprobare &icirc;n aceea&#x219;i zi de la partenerii no&#x219;tri financiari</li>
    <li><strong>Ridici ma&#x219;ina</strong> &ndash; Cu actele &icirc;n regul&#x103; &#x219;i rata stabilit&#x103;</li>
  </ol>
  <p style="font-size:16px;color:#444;line-height:1.7;margin:0 0 24px;">
    Nu ai nevoie de avans. <strong>Rata lunar&#x103; porne&#x219;te de la 81 EUR</strong>,
    &icirc;n func&#x21B;ie de pre&#x21B;ul ma&#x219;inii &#x219;i perioada de creditare aleas&#x103;.
  </p>

  <h2 style="font-size:clamp(18px,3vw,26px);font-weight:700;color:#1a1a1a;margin:32px 0 14px;border-bottom:2px solid #e63028;padding-bottom:8px;">
    Partenerii no&#x219;tri financiari
  </h2>
  <ul style="font-size:16px;color:#444;line-height:1.8;margin:0 0 24px;padding-left:20px;">
    <li><strong>BT Direct (Banca Transilvania)</strong> &ndash; Credit auto cu dob&acirc;nd&#x103; competitiv&#x103;, aprobare rapid&#x103; online.</li>
    <li><strong>TBI Bank</strong> &ndash; Finan&#x21B;are flexibil&#x103; pentru auto rulate, cu perioade de p&acirc;n&#x103; la 60 de luni.</li>
    <li><strong>Mogo</strong> &ndash; Solu&#x21B;ii de leasing opera&#x21B;ional &#x219;i credit auto, proces 100% online.</li>
    <li><strong>HappyCredit</strong> &ndash; Credit auto accesibil, cu aprobare chiar &#x219;i pentru persoane cu istoric financiar mai dificil.</li>
  </ul>

  <h2 style="font-size:clamp(18px,3vw,26px);font-weight:700;color:#1a1a1a;margin:32px 0 14px;border-bottom:2px solid #e63028;padding-bottom:8px;">
    Condi&#x21B;ii de eligibilitate
  </h2>
  <ul style="font-size:16px;color:#444;line-height:1.8;margin:0 0 24px;padding-left:20px;">
    <li>V&acirc;rst&#x103; minim&#x103;: 18 ani</li>
    <li>Act de identitate valid (carte de identitate)</li>
    <li>Domiciliu stabil &icirc;n Rom&acirc;nia</li>
  </ul>

  <h2 style="font-size:clamp(18px,3vw,26px);font-weight:700;color:#1a1a1a;margin:32px 0 14px;border-bottom:2px solid #e63028;padding-bottom:8px;">
    &Icirc;ntreb&#x103;ri frecvente despre creditul auto
  </h2>
  <div style="border:1px solid #eee;border-radius:8px;overflow:hidden;margin-bottom:24px;">
    <details style="border-bottom:1px solid #eee;" open>
      <summary style="padding:16px;font-size:16px;font-weight:600;cursor:pointer;background:#fafafa;list-style:none;">
        Pot lua ma&#x219;ina &icirc;n rate f&#x103;r&#x103; avans?
      </summary>
      <p style="padding:16px;font-size:15px;color:#555;margin:0;line-height:1.7;">
        Da, toate ma&#x219;inile din parcul nostru pot fi achizi&#x21B;ionate f&#x103;r&#x103; avans, cu rate fixe lunare.
      </p>
    </details>
    <details style="border-bottom:1px solid #eee;">
      <summary style="padding:16px;font-size:16px;font-weight:600;cursor:pointer;background:#fafafa;list-style:none;">
        C&acirc;t dureaz&#x103; aprobarea creditului?
      </summary>
      <p style="padding:16px;font-size:15px;color:#555;margin:0;line-height:1.7;">
        De obicei, prime&#x219;ti r&#x103;spunsul &icirc;n aceea&#x219;i zi, &icirc;n 20&ndash;30 de minute. &Icirc;n cazuri excep&#x21B;ionale, poate dura p&acirc;n&#x103; la 24 de ore.
      </p>
    </details>
    <details style="border-bottom:1px solid #eee;">
      <summary style="padding:16px;font-size:16px;font-weight:600;cursor:pointer;background:#fafafa;list-style:none;">
        Pot pl&#x103;ti ma&#x219;ina cash?
      </summary>
      <p style="padding:16px;font-size:15px;color:#555;margin:0;line-height:1.7;">
        Desigur. Accept&#x103;m plata integral&#x103; cash, transfer bancar sau rate.
      </p>
    </details>
    <details>
      <summary style="padding:16px;font-size:16px;font-weight:600;cursor:pointer;background:#fafafa;list-style:none;">
        Ma&#x219;inile au garan&#x21B;ie?
      </summary>
      <p style="padding:16px;font-size:15px;color:#555;margin:0;line-height:1.7;">
        Da, toate ma&#x219;inile vin cu garan&#x21B;ie inclus&#x103; &#x219;i istoric tehnic verificat pe c&acirc;t posibil.
      </p>
    </details>
  </div>
</div>
	<?php
	$credit_html = ob_get_clean();
	return $credit_html . $content;
}

// ─── SCHEMA AUTODEALER ─────────────────────────────────────────────────────────
add_action( 'wp_head', 'masini_schema_autodealer_json', 2 );
function masini_schema_autodealer_json() {
	if ( ! is_front_page() && ! is_page( 'contact' ) ) return;
	?>
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"AutoDealer","name":"Ma\u0219ini \u00een Rate Baia Mare - Quality Point SRL","image":"https://masiniinratebaiamare.ro/wp-content/uploads/2024/07/logo-masini-in-rate-baia-mare.png","url":"https://masiniinratebaiamare.ro","telephone":"+40746923839","email":"masiniinratebaiamare@gmail.com","address":{"@type":"PostalAddress","streetAddress":"Str. M. Eminescu 75","addressLocality":"Baia Mare","addressRegion":"Maramure\u015f","postalCode":"430000","addressCountry":"RO"},"geo":{"@type":"GeoCoordinates","latitude":47.6567,"longitude":23.585},"openingHoursSpecification":[{"@type":"OpeningHoursSpecification","dayOfWeek":["Monday","Tuesday","Wednesday","Thursday","Friday"],"opens":"09:00","closes":"18:00"},{"@type":"OpeningHoursSpecification","dayOfWeek":["Saturday","Sunday"],"opens":"09:00","closes":"15:00"}],"priceRange":"\u20ac\u20ac","sameAs":["https://www.facebook.com/masiniinratebaiamare","https://www.instagram.com/masiniinratebaiamare","https://www.tiktok.com/@masiniinratebaiamare"]}
</script>
	<?php
}

// ─── SCHEMA FAQPAGE: CREDIT AUTO ──────────────────────────────────────────────
add_action( 'wp_head', 'masini_schema_faq_credit_auto', 2 );
function masini_schema_faq_credit_auto() {
	if ( ! is_page( 'credit-auto-baia-mare' ) && ! is_page( 'credit-auto' ) ) return;
	?>
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"FAQPage","mainEntity":[{"@type":"Question","name":"Pot lua ma\u0219ina \u00een rate f\u0103r\u0103 avans?","acceptedAnswer":{"@type":"Answer","text":"Da, toate ma\u0219inile din parcul nostru pot fi achizi\u021bionate f\u0103r\u0103 avans, cu rate fixe lunare."}},{"@type":"Question","name":"C\u00e2t dureaz\u0103 aprobarea creditului auto?","acceptedAnswer":{"@type":"Answer","text":"De obicei, prime\u0219ti r\u0103spunsul \u00een aceea\u0219i zi, \u00een 20-30 de minute."}},{"@type":"Question","name":"Pot pl\u0103ti ma\u0219ina cash?","acceptedAnswer":{"@type":"Answer","text":"Desigur. Accept\u0103m plata integral\u0103 cash, transfer bancar sau rate."}},{"@type":"Question","name":"Ma\u0219inile au garan\u021bie?","acceptedAnswer":{"@type":"Answer","text":"Da, toate ma\u0219inile vin cu garan\u021bie inclus\u0103 \u0219i istoric tehnic verificat pe c\u00e2t posibil."}}]}
</script>
	<?php
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

    // Navigate to edit snippet 7
    log('\nNavighez la editarea snippet 7...');
    await page.goto(base + '/wp-admin/admin.php?page=edit-snippet&id=7', { waitUntil: 'domcontentloaded', timeout: 20000 });
    await page.waitForTimeout(4000);

    // Update code
    log('Actualizez codul in CodeMirror...');
    const cmResult = await page.evaluate((code) => {
      const cm = document.querySelector('.CodeMirror');
      if (!cm || !cm.CodeMirror) return 'no CodeMirror';
      cm.CodeMirror.setValue(code);
      // Trigger change event
      cm.CodeMirror.execCommand('selectAll');
      return 'updated, length=' + cm.CodeMirror.getValue().length;
    }, UPDATED_SNIPPET_CODE);
    log('CodeMirror result: ' + cmResult);

    await page.waitForTimeout(1000);

    // Click "Save Snippet" (NOT Save and Deactivate!)
    const saveSnippetBtn = page.locator('button:has-text("Save Snippet"), button#save-snippet-header').first();
    if (await saveSnippetBtn.count() > 0 && await saveSnippetBtn.isVisible()) {
      await saveSnippetBtn.click();
      await page.waitForTimeout(3000);
      log('Snippet 7 salvat via "Save Snippet".');
    } else {
      // Try to find the Save button that doesn't deactivate
      const allBtns = await page.locator('button:visible').all();
      for (const btn of allBtns) {
        const txt = await btn.textContent();
        if (txt && txt.trim() === 'Save Snippet') {
          await btn.click();
          await page.waitForTimeout(3000);
          log('Snippet 7 salvat via "' + txt.trim() + '".');
          break;
        }
      }
    }

    const urlAfter = page.url();
    log('URL dupa save: ' + urlAfter);
    await page.screenshot({ path: path.join(__dirname, 'screenshot-snippet7-updated.png') });
    log('Screenshot: screenshot-snippet7-updated.png');

    // Verify on pages
    log('\nVerificare finala...');
    
    const finalCheck = await page.evaluate(async (base) => {
      const results = {};
      const pages = { masini: base + '/masini-de-vanzare/', credit: base + '/credit-auto-baia-mare/' };
      for (const [key, url] of Object.entries(pages)) {
        const r = await fetch(url, { cache: 'no-store' });
        const html = await r.text();
        const ogTitles = [...html.matchAll(/<meta[^>]*property=["']og:title["'][^>]*>/gi)].length;
        const h1Count = [...html.matchAll(/<h1[^>]*>/gi)].length;
        results[key] = { ogTitles, h1Count };
      }
      return results;
    }, base);
    
    log('masini-de-vanzare: OG titles=' + finalCheck.masini?.ogTitles + ' H1s=' + finalCheck.masini?.h1Count);
    log('credit-auto: OG titles=' + finalCheck.credit?.ogTitles + ' H1s=' + finalCheck.credit?.h1Count);

    log('\n=== ACTUALIZARE SNIPPET 7 COMPLETA ===');
    log('OG fix adaugat in snippet 7. Verifica daca duplicatele sunt eliminate.');

  } catch (err) {
    log('EROARE: ' + err.message);
    console.error(err);
    await page.screenshot({ path: path.join(__dirname, 'screenshot-step7-error.png') }).catch(() => {});
  } finally {
    await browser.close();
  }
})();
