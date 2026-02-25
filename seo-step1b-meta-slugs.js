/**
 * SEO Step 1b - Meta descriptions via AIOSEO API + Fix slug emoji (URL-encoded)
 * Rulează: node seo-step1b-meta-slugs.js
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

// Page metas to set
const PAGE_METAS = [
  { id: 658,   type: 'pages', title: 'Mașini de vânzare Baia Mare | Auto în rate fără avans',                       desc: 'Mașini de vânzare Baia Mare: auto rulate verificate, în rate fixe sau cash, fără avans. Stoc actualizat zilnic. BMW, Audi, Mercedes, Dacia și altele. Finanțare rapidă.' },
  { id: 18,    type: 'pages', title: 'Credit auto Baia Mare – Rate fixe, fără avans | Mașini în Rate',              desc: 'Credit auto Baia Mare cu rate fixe, fără avans, aprobare rapidă. Parteneri: BT Direct, TBI Bank, Mogo, HappyCredit. Sună acum: 0746 923 839.' },
  { id: 10477, type: 'pages', title: 'Contact Mașini în Rate Baia Mare | Telefon & Program',                        desc: 'Contact Mașini în Rate Baia Mare. Telefon: 0746 923 839, WhatsApp, email. Adresa: Str. M. Eminescu 75. Program L-V 09-18, S-D 09-15.' },
  { id: 10513, type: 'pages', title: 'Articole auto și ghiduri | Mașini în Rate Baia Mare',                         desc: 'Articole informative despre mașini, credit auto, finanțare și sfaturi utile pentru cumpărarea unei mașini second hand. Ghiduri practice de la Mașini în Rate Baia Mare.' },
  { id: 3,     type: 'pages', title: 'Politica de confidențialitate | Mașini în Rate Baia Mare',                    desc: 'Politica de confidențialitate a Quality Point SRL (Mașini în Rate Baia Mare). Informații despre prelucrarea datelor personale, cookies și drepturile tale.' },
  { id: 3036,  type: 'pages', title: 'Termeni și condiții | Mașini în Rate Baia Mare',                              desc: 'Termeni și condiții de utilizare a site-ului Mașini în Rate Baia Mare (Quality Point SRL). Informații despre cumpărare, garanție și drepturile tale.' },
];

// Article slugs with emoji to fix
const SLUG_FIXES = [
  { id: 14641, newSlug: 'cum-sa-iti-vinzi-masina-rapid-si-fara-batai-de-cap' },
  { id: 14626, newSlug: 'cum-evaluam-masinile-la-buy-back-transparenta-totala-pentru-clientii-nostri' },
];

(async () => {
  const env = loadEnv();
  const base = (env.WP_SITE_URL || 'https://masiniinratebaiamare.ro').replace(/\/$/, '');
  const user = env.WP_USER || '';
  const pass = env.WP_PASSWORD || '';

  const browser = await chromium.launch({ headless: false, slowMo: 50 });
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

    // Navigate to dashboard to get proper nonce
    await page.goto(base + '/wp-admin/', { waitUntil: 'domcontentloaded', timeout: 20000 });
    await page.waitForTimeout(2000);

    // ─── SET META DESCRIPTIONS VIA AIOSEO REST API ────────────────────────────
    log('\n=== META DESCRIPTIONS VIA AIOSEO REST API ===');

    // Check available AIOSEO endpoints
    const aioseoEndpoints = await page.evaluate(async () => {
      const r = await fetch('/wp-json/', { credentials: 'include' });
      const j = await r.json();
      return Object.keys(j.namespaces || {}).filter(k => k.includes('aioseo'));
    });
    log('AIOSEO REST namespaces: ' + aioseoEndpoints.join(', '));

    for (const meta of PAGE_METAS) {
      log('\nSet meta pentru post ID: ' + meta.id);
      
      // Method 1: Try AIOSEO v4 REST API
      const result1 = await page.evaluate(async ({ id, title, desc }) => {
        const nonce = window.wpApiSettings?.nonce || '';
        // AIOSEO v4 endpoint
        const r = await fetch('/wp-json/aioseo/v1/post', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json', 'X-WP-Nonce': nonce },
          body: JSON.stringify({ id, title, description: desc })
        });
        const text = await r.text();
        return r.status + ': ' + text.substring(0, 200);
      }, { id: meta.id, title: meta.title, desc: meta.desc });
      log('  AIOSEO REST v1/post: ' + result1);

      // Method 2: Try direct post meta update
      const result2 = await page.evaluate(async ({ id, title, desc }) => {
        const nonce = window.wpApiSettings?.nonce || '';
        const r = await fetch('/wp-json/wp/v2/pages/' + id, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json', 'X-WP-Nonce': nonce },
          body: JSON.stringify({
            meta: {
              _aioseo_title: title,
              _aioseo_description: desc
            }
          })
        });
        const j = await r.json();
        return r.status + ' meta=' + JSON.stringify(j.meta || 'no meta field');
      }, { id: meta.id, title: meta.title, desc: meta.desc });
      log('  WP REST pages meta: ' + result2);
    }

    // ─── FIX EMOJI SLUGS ──────────────────────────────────────────────────────
    log('\n=== FIX SLUGURI ARTICOLE ===');

    for (const fix of SLUG_FIXES) {
      log('\nFix slug pentru post ID: ' + fix.id + ' → ' + fix.newSlug);
      
      const result = await page.evaluate(async ({ id, newSlug }) => {
        const nonce = window.wpApiSettings?.nonce || '';
        const r = await fetch('/wp-json/wp/v2/posts/' + id, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json', 'X-WP-Nonce': nonce },
          body: JSON.stringify({ slug: newSlug })
        });
        const j = await r.json();
        return r.status + ' new_slug=' + (j.slug || 'not returned');
      }, fix);
      log('  Result: ' + result);
    }

    // ─── AIOSEO TITLE FORMAT VIA PHP SNIPPET ─────────────────────────────────
    // Since AIOSEO REST API might not accept changes without Nonce properly,
    // let's add a PHP snippet that sets the meta via aioseo_post table
    log('\n=== AIOSEO META VIA PHP SNIPPET (ONE-TIME) ===');
    
    const metaInsertCode = `<?php
/**
 * SEO One-Time: Seteaza meta title + description AIOSEO pe pagini cheie
 * Ruleaza O SINGURA DATA la activare, apoi dezactiveaza snippet-ul.
 */
add_action( 'init', 'masini_seo_set_aioseo_meta_once', 1 );
function masini_seo_set_aioseo_meta_once() {
	// Verifica daca s-a rulat deja
	if ( get_option( 'masini_seo_meta_set_v1' ) ) return;

	global $wpdb;
	$table = $wpdb->prefix . 'aioseo_posts';

	$metas = array(
		array(
			'post_id'           => 658,
			'title'             => 'Mașini de vânzare Baia Mare | Auto în rate fără avans',
			'description'       => 'Mașini de vânzare Baia Mare: auto rulate verificate, în rate fixe sau cash, fără avans. Stoc actualizat zilnic. BMW, Audi, Mercedes, Dacia și altele. Finanțare rapidă.',
			'og_title'          => 'Mașini de vânzare Baia Mare | Auto în rate fără avans',
			'og_description'    => 'Mașini de vânzare Baia Mare cu stoc actualizat zilnic. Auto rulate verificate, în rate fixe sau cash. BMW, Audi, Mercedes și altele.',
		),
		array(
			'post_id'           => 18,
			'title'             => 'Credit auto Baia Mare – Rate fixe, fără avans | Mașini în Rate',
			'description'       => 'Credit auto Baia Mare cu rate fixe, fără avans, aprobare rapidă. Parteneri: BT Direct, TBI Bank, Mogo, HappyCredit. Sună acum: 0746 923 839.',
			'og_title'          => 'Credit auto Baia Mare – Rate fixe, fără avans',
			'og_description'    => 'Credit auto Baia Mare cu rate fixe, fără avans, aprobare rapidă. Parteneri: BT Direct, TBI Bank, Mogo, HappyCredit.',
		),
		array(
			'post_id'           => 10477,
			'title'             => 'Contact Mașini în Rate Baia Mare | Telefon & Program',
			'description'       => 'Contact Mașini în Rate Baia Mare. Telefon: 0746 923 839, WhatsApp, email. Adresa: Str. M. Eminescu 75. Program L-V 09-18, S-D 09-15.',
			'og_title'          => 'Contact Mașini în Rate Baia Mare',
			'og_description'    => 'Contact Mașini în Rate Baia Mare. Telefon: 0746 923 839. Adresa: Str. M. Eminescu 75, Baia Mare.',
		),
		array(
			'post_id'           => 10513,
			'title'             => 'Articole auto și ghiduri | Mașini în Rate Baia Mare',
			'description'       => 'Articole informative despre mașini, credit auto, finanțare și sfaturi utile pentru cumpărarea unei mașini second hand. Ghiduri practice de la Mașini în Rate Baia Mare.',
			'og_title'          => 'Articole auto și ghiduri | Mașini în Rate Baia Mare',
			'og_description'    => 'Articole informative despre mașini, credit auto și sfaturi pentru cumpărarea de mașini second hand de la Mașini în Rate Baia Mare.',
		),
		array(
			'post_id'           => 3,
			'title'             => 'Politica de confidențialitate | Mașini în Rate Baia Mare',
			'description'       => 'Politica de confidențialitate a Quality Point SRL (Mașini în Rate Baia Mare). Informații despre prelucrarea datelor personale, cookies și drepturile tale.',
			'og_title'          => 'Politica de confidențialitate | Mașini în Rate Baia Mare',
			'og_description'    => 'Politica de confidențialitate Quality Point SRL. Prelucrarea datelor personale, cookies și drepturile utilizatorilor.',
		),
		array(
			'post_id'           => 3036,
			'title'             => 'Termeni și condiții | Mașini în Rate Baia Mare',
			'description'       => 'Termeni și condiții de utilizare a site-ului Mașini în Rate Baia Mare (Quality Point SRL). Informații despre cumpărare, garanție și drepturile tale.',
			'og_title'          => 'Termeni și condiții | Mașini în Rate Baia Mare',
			'og_description'    => 'Termeni și condiții Quality Point SRL. Cumpărare, garanție, retururi și drepturile consumatorilor.',
		),
	);

	foreach ( $metas as $m ) {
		$existing = $wpdb->get_row( $wpdb->prepare(
			"SELECT id FROM {$table} WHERE post_id = %d", $m['post_id']
		) );

		$data = array(
			'post_id'        => $m['post_id'],
			'title'          => $m['title'],
			'description'    => $m['description'],
			'og_title'       => $m['og_title'],
			'og_description' => $m['og_description'],
			'updated'        => current_time( 'mysql' ),
		);

		if ( $existing ) {
			$wpdb->update( $table, $data, array( 'post_id' => $m['post_id'] ) );
		} else {
			$data['created'] = current_time( 'mysql' );
			$wpdb->insert( $table, $data );
		}
	}

	// Mark as done
	update_option( 'masini_seo_meta_set_v1', true );

	// Also fix article slugs with emoji
	$posts_table = $wpdb->posts;
	$wpdb->query( $wpdb->prepare(
		"UPDATE {$posts_table} SET post_name = %s WHERE ID = %d AND post_status = 'publish'",
		'cum-sa-iti-vinzi-masina-rapid-si-fara-batai-de-cap', 14641
	) );
	$wpdb->query( $wpdb->prepare(
		"UPDATE {$posts_table} SET post_name = %s WHERE ID = %d AND post_status = 'publish'",
		'cum-evaluam-masinile-la-buy-back-transparenta-totala-pentru-clientii-nostri', 14626
	) );
}
`;

    // Navigate to add-snippet
    await page.goto(base + '/wp-admin/admin.php?page=add-snippet', { waitUntil: 'networkidle', timeout: 20000 });
    await page.waitForTimeout(2000);

    // Set name
    const nameField = page.locator('input[name="snippet_name"], input.snippet-name').first();
    if (await nameField.count() > 0) {
      await nameField.fill('SEO One-Time: AIOSEO Meta + Fix Sluguri');
    }

    // Set code
    const cmResult = await page.evaluate((code) => {
      const cm = document.querySelector('.CodeMirror');
      if (cm && cm.CodeMirror) {
        cm.CodeMirror.setValue(code);
        return 'ok';
      }
      return 'no cm';
    }, metaInsertCode);
    log('CodeMirror set: ' + cmResult);

    if (cmResult === 'no cm') {
      const ta = page.locator('textarea[name="code"], textarea.snippet-editor').first();
      if (await ta.count() > 0) {
        await ta.evaluate((el, code) => { el.style.display = 'block'; el.value = code; }, metaInsertCode);
      }
    }

    // Save and Activate
    const saveActivate = page.locator('button:has-text("Save and Activate")').first();
    if (await saveActivate.count() > 0 && await saveActivate.isVisible()) {
      await saveActivate.click();
      log('Snippet activat.');
    } else {
      const saveBtn = page.locator('input[value="Save"], button:has-text("Save")').first();
      if (await saveBtn.count() > 0) { await saveBtn.click(); }
    }
    await page.waitForTimeout(3000);

    log('\nSnippet SEO One-Time adaugat/activat. Va rula la urmatorul request.');

    // Trigger by visiting homepage
    log('Trigger snippet - vizitez homepage...');
    await page.goto(base + '/', { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.waitForTimeout(3000);
    log('Homepage vizitat. Meta-urile AIOSEO ar trebui sa fie setate acum.');

    // ─── AIOSEO CONTENT TYPES - check screenshot ──────────────────────────────
    const screenshotPath = path.join(__dirname, 'screenshot-aioseo-content-types.png');
    if (fs.existsSync(screenshotPath)) {
      log('\nScreenshot AIOSEO Content Types exista la: ' + screenshotPath);
      log('Verifica manual ce template-uri sunt setate pentru CPT Masini + Posts.');
    }

    // Navigate to AIOSEO Search Appearance and set post formats
    log('\n=== AIOSEO TITLE TEMPLATES PENTRU POSTS ===');
    await page.goto(base + '/wp-admin/admin.php?page=aioseo-search-appearance', { waitUntil: 'networkidle', timeout: 25000 });
    await page.waitForTimeout(3000);

    await page.screenshot({ path: path.join(__dirname, 'screenshot-aioseo-sa-main.png') });
    log('Screenshot AIOSEO SA Main salvat.');

    // Look for the content types section
    const allTabs = await page.locator('.aioseo-tabs a, .aioseo-tabs li a, nav.aioseo-tabs a').all();
    log('Tabs gasite: ' + allTabs.length);
    for (const t of allTabs) {
      const text = await t.textContent();
      log('  Tab: "' + text?.trim() + '"');
    }

    log('\n=== STEP 1b COMPLET ===');
    log('Verificati:');
    log('- https://masiniinratebaiamare.ro/sitemap.xml (trebuie sa fie 200 OK cu XML)');
    log('- Meta descriptions pe pagini via AIOSEO');
    log('- Sluguri articole fara emoji');

  } catch (err) {
    log('EROARE: ' + err.message);
    console.error(err);
    await page.screenshot({ path: path.join(__dirname, 'screenshot-step1b-error.png') }).catch(() => {});
  } finally {
    await browser.close();
  }
})();
