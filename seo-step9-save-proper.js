/**
 * SEO Step 9: Salvare corecta snippet 7 - update si CodeMirror SI textarea
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

// Snippet final - cu OG fix via output buffer + continut pagini
const FINAL_CODE = `
/**
 * SEO v4 - masiniinratebaiamare.ro
 * 1. Fix OG duplicate (output buffer)
 * 2. H1 pe masini-de-vanzare
 * 3. H1 + continut pe credit-auto
 * 4. Schema AutoDealer + FAQPage
 */

add_action( 'wp', 'mirt_start_og_filter', 999 );
function mirt_start_og_filter() {
	ob_start( 'mirt_clean_og_tags' );
}

add_action( 'shutdown', 'mirt_end_og_filter', 0 );
function mirt_end_og_filter() {
	if ( ob_get_level() > 0 ) ob_end_flush();
}

function mirt_clean_og_tags( $html ) {
	$html = preg_replace( '~<meta\\s[^>]*property=["\\\']og:[^"\\\' ]*["\\\'][^>]*name=["\\\']og:[^"\\\' ]*["\\\'][^>]*/?>~i', '', $html );
	$html = preg_replace( '~<meta\\s[^>]*name=["\\\']og:[^"\\\' ]*["\\\'][^>]*property=["\\\']og:[^"\\\' ]*["\\\'][^>]*/?>~i', '', $html );
	return $html;
}

add_filter( 'the_content', 'mirt_inject_masini', 11 );
function mirt_inject_masini( $content ) {
	if ( ! is_page( 'masini-de-vanzare' ) || wp_doing_ajax() ) return $content;
	return '<div style="max-width:900px;margin:0 auto 8px;padding:0 16px;"><h1 style="font-size:clamp(22px,4vw,34px);font-weight:700;color:#1a1a1a;margin:24px 0 12px;">Ma&#x219;ini de v&acirc;nzare Baia Mare &ndash; Auto &icirc;n rate f&#x103;r&#x103; avans</h1><p style="font-size:16px;color:#444;line-height:1.65;margin:0 0 6px;">Descoper&#x103; parcul nostru auto din Baia Mare. Autoturisme verificate tehnic, achizi&#x21B;ionabile &icirc;n <strong>rate fixe f&#x103;r&#x103; avans</strong> sau cash.</p><p style="font-size:16px;color:#444;line-height:1.65;margin:0;">BMW, Audi, Mercedes-Benz, VW, Renault, Dacia, Skoda. Suna: <strong>0746 923 839</strong>.</p></div>' . $content;
}

add_filter( 'the_content', 'mirt_inject_credit', 11 );
function mirt_inject_credit( $content ) {
	if ( ( ! is_page( 'credit-auto-baia-mare' ) && ! is_page( 'credit-auto' ) ) || wp_doing_ajax() ) return $content;
	$h = '<div style="max-width:900px;margin:0 auto;padding:0 16px 32px;">';
	$h .= '<h1 style="font-size:clamp(22px,4vw,36px);font-weight:700;color:#1a1a1a;margin:24px 0 16px;">Credit auto Baia Mare &ndash; Rate fixe, aprobare rapid&#x103;</h1>';
	$h .= '<p style="font-size:16px;color:#444;line-height:1.7;margin:0 0 12px;">Cau&#x21B;i <strong>credit auto &icirc;n Baia Mare</strong>? Oferim finan&#x21B;are pentru ma&#x219;ini second hand &icirc;n <strong>rate fixe f&#x103;r&#x103; avans</strong>, cu aprobare &icirc;n aceea&#x219;i zi. Perioade 12&ndash;60 luni.</p>';
	$h .= '<h2 style="font-size:clamp(18px,3vw,26px);font-weight:700;color:#1a1a1a;margin:28px 0 12px;border-bottom:2px solid #e63028;padding-bottom:8px;">Cum func&#x21B;ioneaz&#x103;?</h2>';
	$h .= '<ol style="font-size:16px;color:#444;line-height:1.8;margin:0 0 20px;padding-left:20px;"><li>Alege ma&#x219;ina din stoc</li><li>Complet&#x103; cererea &icirc;n 10 minute</li><li>Prime&#x219;ti aprobarea &icirc;n aceea&#x219;i zi</li><li>Ridici ma&#x219;ina cu actele &icirc;n regul&#x103;</li></ol>';
	$h .= '<h2 style="font-size:clamp(18px,3vw,26px);font-weight:700;color:#1a1a1a;margin:28px 0 12px;border-bottom:2px solid #e63028;padding-bottom:8px;">Parteneri financiari</h2>';
	$h .= '<ul style="font-size:16px;color:#444;line-height:1.8;margin:0 0 20px;padding-left:20px;"><li><strong>BT Direct (Banca Transilvania)</strong> &ndash; dobanda competitiva</li><li><strong>TBI Bank</strong> &ndash; pana la 60 luni, rate fixe</li><li><strong>Mogo</strong> &ndash; 100% online</li><li><strong>HappyCredit</strong> &ndash; accepta si istoric financiar dificil</li></ul>';
	$h .= '<h2 style="font-size:clamp(18px,3vw,26px);font-weight:700;color:#1a1a1a;margin:28px 0 12px;border-bottom:2px solid #e63028;padding-bottom:8px;">Condi&#x21B;ii</h2>';
	$h .= '<ul style="font-size:16px;color:#444;line-height:1.8;margin:0 0 20px;padding-left:20px;"><li>V&acirc;rst&#x103; minim&#x103;: 18 ani</li><li>Act de identitate valid</li><li>Domiciliu &icirc;n Rom&acirc;nia</li></ul>';
	$h .= '<h2 style="font-size:clamp(18px,3vw,26px);font-weight:700;color:#1a1a1a;margin:28px 0 12px;border-bottom:2px solid #e63028;padding-bottom:8px;">&Icirc;ntreb&#x103;ri frecvente</h2>';
	$h .= '<div style="border:1px solid #eee;border-radius:8px;overflow:hidden;">';
	$h .= '<details open style="border-bottom:1px solid #eee;"><summary style="padding:14px 16px;font-weight:600;cursor:pointer;background:#fafafa;list-style:none;">Pot lua ma&#x219;ina f&#x103;r&#x103; avans?</summary><p style="padding:14px 16px;margin:0;">Da, toate ma&#x219;inile pot fi achizi&#x21B;ionate f&#x103;r&#x103; avans.</p></details>';
	$h .= '<details style="border-bottom:1px solid #eee;"><summary style="padding:14px 16px;font-weight:600;cursor:pointer;background:#fafafa;list-style:none;">C&acirc;t dureaz&#x103; aprobarea?</summary><p style="padding:14px 16px;margin:0;">De obicei &icirc;n aceea&#x219;i zi, &icirc;n 20&ndash;30 minute.</p></details>';
	$h .= '<details style="border-bottom:1px solid #eee;"><summary style="padding:14px 16px;font-weight:600;cursor:pointer;background:#fafafa;list-style:none;">Pot pl&#x103;ti cash?</summary><p style="padding:14px 16px;margin:0;">Da, accept&#x103;m cash, transfer sau rate.</p></details>';
	$h .= '<details><summary style="padding:14px 16px;font-weight:600;cursor:pointer;background:#fafafa;list-style:none;">Ma&#x219;inile au garan&#x21B;ie?</summary><p style="padding:14px 16px;margin:0;">Da, garan&#x21B;ie inclus&#x103; la toate ma&#x219;inile.</p></details>';
	$h .= '</div></div>';
	return $h . $content;
}

add_action( 'wp_head', 'mirt_schema_dealer', 2 );
function mirt_schema_dealer() {
	if ( ! is_front_page() && ! is_page( 'contact' ) ) return;
	echo '<script type="application/ld+json">{"@context":"https://schema.org","@type":"AutoDealer","name":"Ma\\u0219ini \\u00een Rate Baia Mare","url":"https://masiniinratebaiamare.ro","telephone":"+40746923839","address":{"@type":"PostalAddress","streetAddress":"Str. M. Eminescu 75","addressLocality":"Baia Mare","addressRegion":"Maramure\\u015f","postalCode":"430000","addressCountry":"RO"},"openingHoursSpecification":[{"@type":"OpeningHoursSpecification","dayOfWeek":["Monday","Tuesday","Wednesday","Thursday","Friday"],"opens":"09:00","closes":"18:00"},{"@type":"OpeningHoursSpecification","dayOfWeek":["Saturday","Sunday"],"opens":"09:00","closes":"15:00"}],"priceRange":"\\u20ac\\u20ac"}</script>' . PHP_EOL;
}

add_action( 'wp_head', 'mirt_schema_faq', 2 );
function mirt_schema_faq() {
	if ( ! is_page( 'credit-auto-baia-mare' ) && ! is_page( 'credit-auto' ) ) return;
	echo '<script type="application/ld+json">{"@context":"https://schema.org","@type":"FAQPage","mainEntity":[{"@type":"Question","name":"Pot lua ma\\u0219ina f\\u0103r\\u0103 avans?","acceptedAnswer":{"@type":"Answer","text":"Da, f\\u0103r\\u0103 avans, rate fixe."}},{"@type":"Question","name":"C\\u00e2t dureaz\\u0103 aprobarea?","acceptedAnswer":{"@type":"Answer","text":"\\u00cen aceea\\u0219i zi, 20-30 minute."}},{"@type":"Question","name":"Pot pl\\u0103ti cash?","acceptedAnswer":{"@type":"Answer","text":"Da, cash, transfer sau rate."}},{"@type":"Question","name":"Garan\\u021bie?","acceptedAnswer":{"@type":"Answer","text":"Da, garan\\u021bie inclus\\u0103."}}]}</script>' . PHP_EOL;
}
`;

(async () => {
  const env = loadEnv();
  const base = (env.WP_SITE_URL || 'https://masiniinratebaiamare.ro').replace(/\/$/, '');
  const user = env.WP_USER || '';
  const pass = env.WP_PASSWORD || '';

  const browser = await chromium.launch({ headless: false, slowMo: 80 });
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

    // Update BOTH CodeMirror AND the underlying textarea
    const setResult = await page.evaluate((code) => {
      const results = [];
      
      // 1. Update CodeMirror
      const cmEl = document.querySelector('.CodeMirror');
      if (cmEl && cmEl.CodeMirror) {
        cmEl.CodeMirror.setValue(code);
        results.push('CM set');
        // Trigger CodeMirror change event
        cmEl.CodeMirror.save();
        results.push('CM save');
      }
      
      // 2. Update the hidden textarea that CodeMirror mirrors
      const allTextareas = document.querySelectorAll('textarea');
      for (const ta of allTextareas) {
        if (ta.name === 'code' || ta.id === 'snippet-code' || ta.className.includes('snippet-code')) {
          ta.value = code;
          // Trigger native input events
          const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value').set;
          nativeInputValueSetter.call(ta, code);
          ta.dispatchEvent(new Event('input', { bubbles: true }));
          ta.dispatchEvent(new Event('change', { bubbles: true }));
          results.push('TA[' + (ta.name || ta.id) + '] set');
        }
      }
      
      // 3. Also find CodeMirror's linked textarea
      if (cmEl && cmEl.CodeMirror) {
        const linkedTA = cmEl.CodeMirror.getTextArea ? cmEl.CodeMirror.getTextArea() : null;
        if (linkedTA) {
          linkedTA.value = code;
          results.push('CM linked TA set');
        }
      }
      
      return results.join(', ');
    }, FINAL_CODE);
    log('Set result: ' + setResult);

    await page.waitForTimeout(1000);

    // Now submit the form directly
    const submitted = await page.evaluate(() => {
      const form = document.querySelector('form#snippet-edit-form, form.snippet-edit-form, form[name="edit-snippet"]');
      if (!form) {
        // Try to find the form that contains the snippet name input
        const nameInput = document.querySelector('input[name="snippet_name"]');
        const snippetForm = nameInput ? nameInput.closest('form') : null;
        if (snippetForm) {
          // Submit via button (Save Snippet)
          const saveBtn = snippetForm.querySelector('button[name="save_snippet"], button.save-snippet, #save-snippet-header');
          if (saveBtn) { saveBtn.click(); return 'clicked save button'; }
          return 'found form but no save button';
        }
        return 'no form found';
      }
      
      // Find Save Snippet input/button in form
      const saveInput = form.querySelector('input[name="save_snippet"], button[name="save_snippet"]');
      if (saveInput) {
        saveInput.click();
        return 'clicked ' + saveInput.name;
      }
      return 'form found but no submit';
    });
    log('Form submit: ' + submitted);

    // Wait and check
    await page.waitForTimeout(3000);
    const urlAfterSave = page.url();
    log('URL after: ' + urlAfterSave);

    // Check what the server has for the snippet
    log('\nVerifica codul salvat pe server...');
    await page.goto(base + '/wp-admin/admin.php?page=edit-snippet&id=7', { waitUntil: 'domcontentloaded', timeout: 20000 });
    await page.waitForTimeout(3000);
    
    const savedCode = await page.evaluate(() => {
      const cm = document.querySelector('.CodeMirror');
      if (cm && cm.CodeMirror) {
        const code = cm.CodeMirror.getValue();
        return { length: code.length, first100: code.substring(0, 100), hasOGFix: code.includes('mirt_clean_og_tags'), hasH1: code.includes('mirt_inject_masini') };
      }
      return { error: 'no CM' };
    });
    log('Cod salvat: ' + JSON.stringify(savedCode));

    if (!savedCode.hasOGFix) {
      log('⚠️  Codul OG fix NU a fost salvat! Incerc submit direct al formularului...');
      
      // Try direct form submit with updated textarea
      await page.evaluate((code) => {
        const cm = document.querySelector('.CodeMirror');
        if (cm && cm.CodeMirror) cm.CodeMirror.setValue(code);
        // Force textarea sync
        const ta = document.querySelector('textarea');
        if (ta) ta.value = code;
      }, FINAL_CODE);
      
      // Press Enter or click save
      await page.keyboard.press('Tab');
      await page.waitForTimeout(500);
      const saveBtn = page.locator('button:has-text("Save Snippet"), button:has-text("Save")').last();
      await saveBtn.scrollIntoViewIfNeeded();
      await saveBtn.click({ force: true });
      await page.waitForTimeout(3000);
      
      log('Snippet submit fortat.');
    }

    // Test OG on site
    log('\nTest final OG...');
    const ogFinal = await page.evaluate(async (base) => {
      const r = await fetch(base + '/masini-de-vanzare/', { cache: 'no-store' });
      const html = await r.text();
      const tags = [...html.matchAll(/<meta[^>]*og:title[^>]*>/gi)].map(m => m[0].substring(0, 100));
      return tags;
    }, base);
    log('OG Title count: ' + ogFinal.length);
    ogFinal.forEach((t, i) => log('  ' + (i+1) + ': ' + t));

    log('\n=== STEP 9 DONE ===');

  } catch (err) {
    log('EROARE: ' + err.message);
    await page.screenshot({ path: path.join(__dirname, 'screenshot-step9-error.png') }).catch(() => {});
  } finally {
    await browser.close();
  }
})();
