/**
 * Salveaza snippet OG Fix via REST API Code Snippets + WordPress
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

const OG_FIX_PHP = `add_action('wp','mirt_ogf',999);function mirt_ogf(){ob_start('mirt_ogff');}add_action('shutdown',function(){if(ob_get_level()>0)ob_end_flush();},0);function mirt_ogff($s){return preg_replace('~<meta\\\\s[^>]*name=["\\'\\']og:[^">\\'\\'][^>]*/?>\\\\s*~i','',$s);}`;

(async () => {
  const env = loadEnv();
  const base = (env.WP_SITE_URL || 'https://masiniinratebaiamare.ro').replace(/\/$/, '');
  const user = env.WP_USER || '';
  const pass = env.WP_PASSWORD || '';

  const browser = await chromium.launch({ headless: false, slowMo: 100 });
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

    // Get REST API nonce
    await page.goto(base + '/wp-admin/', { waitUntil: 'domcontentloaded', timeout: 20000 });
    const wpApiNonce = await page.evaluate(() => window.wpApiSettings?.nonce || '');
    log('WP API Nonce: ' + (wpApiNonce ? 'found' : 'NOT FOUND'));

    // ─── Incearca Code Snippets REST API ────────────────────────────────────
    log('\nIncearca Code Snippets REST API...');
    const csRestResult = await page.evaluate(async ({ code }) => {
      const nonce = window.wpApiSettings?.nonce || '';
      
      // Try Code Snippets REST API v1
      const r = await fetch('/wp-json/code-snippets/v1/snippets', {
        method: 'POST',
        credentials: 'include',
        headers: { 
          'Content-Type': 'application/json',
          'X-WP-Nonce': nonce 
        },
        body: JSON.stringify({
          title: 'SEO Fix OG Duplicate',
          code: code,
          scope: 'global',
          active: true
        })
      });
      const text = await r.text();
      return { status: r.status, body: text.substring(0, 300) };
    }, { code: OG_FIX_PHP });
    log('Code Snippets REST result: ' + JSON.stringify(csRestResult));

    if (csRestResult.status === 201 || csRestResult.status === 200) {
      log('✅ Snippet creat via Code Snippets REST API!');
    } else {
      // Try wp_insert_post approach via custom REST endpoint or admin-ajax
      log('Code Snippets REST nu a mers. Incerc admin-ajax...');
      
      // Get admin-ajax nonce from the add-snippet page
      await page.goto(base + '/wp-admin/admin.php?page=add-snippet', { waitUntil: 'domcontentloaded', timeout: 20000 });
      await page.waitForTimeout(3000);
      
      // Extract nonce and snippet data
      const ajaxData = await page.evaluate((code) => {
        const nonce = document.querySelector('#snippet_nonce')?.value || 
                      document.querySelector('input[name="snippet_nonce"]')?.value ||
                      document.querySelector('input[name="_wpnonce"]')?.value || '';
        const action = document.querySelector('input[name="action"]')?.value || 'save_snippet';
        return { nonce, action, snippetId: 0 };
      }, OG_FIX_PHP);
      log('AJAX data: ' + JSON.stringify(ajaxData));

      // Try wp-admin POST request to save snippet
      const adminSaveResult = await page.evaluate(async ({ code, nonce }) => {
        const fd = new URLSearchParams();
        fd.set('action', 'save_snippet');
        fd.set('snippet_nonce', nonce);
        fd.set('_wpnonce', nonce);
        fd.set('snippet_name', 'SEO Fix OG Duplicate');
        fd.set('snippet_code', code);
        fd.set('snippet_scope', 'global');
        fd.set('snippet_active', '1');
        fd.set('snippet_id', '0');
        
        const r = await fetch('/wp-admin/admin-ajax.php', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: fd.toString()
        });
        const text = await r.text();
        return { status: r.status, url: r.url, body: text.substring(0, 200) };
      }, { code: OG_FIX_PHP, nonce: ajaxData.nonce });
      log('Admin AJAX result: ' + JSON.stringify(adminSaveResult));

      // Alternative: Try inserting directly via WordPress API approach
      log('\nAlternativa: Inseara snippet direct in DB via custom PHP endpoint...');
      
      // Create a one-time mu-plugin via the filesystem - not possible without server access
      // Try to use WordPress Customizer Additional CSS to inject OG removal JS
      // Actually let's try removing OG tags via Customizer inline CSS approach - no that won't work for head removal
      
      // LAST RESORT: Try to keyboard navigate to save snippet
      log('Last resort: keyboard navigation...');
      await page.goto(base + '/wp-admin/admin.php?page=add-snippet', { waitUntil: 'domcontentloaded', timeout: 20000 });
      await page.waitForTimeout(3000);
      
      // Fill name
      await page.locator('input[name="snippet_name"]').first().fill('SEO Fix OG Dup');
      await page.waitForTimeout(300);
      
      // Set code via CodeMirror and immediately trigger the save
      await page.evaluate((code) => {
        const cm = document.querySelector('.CodeMirror');
        if (cm && cm.CodeMirror) {
          cm.CodeMirror.setValue(code);
          cm.CodeMirror.save(); // Sync to textarea
          // Dispatch change event on textarea
          const ta = cm.CodeMirror.getTextArea();
          if (ta) {
            // Override textarea value using Object.defineProperty hack
            const proto = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value');
            proto.set.call(ta, code);
            ta.dispatchEvent(new Event('input', { bubbles: true }));
          }
        }
      }, OG_FIX_PHP);
      
      await page.waitForTimeout(500);
      
      // Use Tab key to navigate to the Save and Activate button
      await page.keyboard.press('Tab');
      await page.waitForTimeout(200);
      await page.keyboard.press('Tab');
      await page.waitForTimeout(200);
      
      // Find the "Save and Activate" button specifically and hover + click
      const saveActivateLocator = page.locator('button:has-text("Save and Activate")');
      const count = await saveActivateLocator.count();
      log('Save+Activate buttons: ' + count);
      
      if (count > 0) {
        // Scroll to button
        await saveActivateLocator.first().scrollIntoViewIfNeeded();
        await page.waitForTimeout(500);
        
        // Take screenshot to see state
        await page.screenshot({ path: path.join(__dirname, 'screenshot-before-final-save.png') });
        
        const btnBox = await saveActivateLocator.first().boundingBox();
        log('Button bounding box: ' + JSON.stringify(btnBox));
        
        if (btnBox) {
          // Click at exact coordinates
          await page.mouse.click(btnBox.x + btnBox.width / 2, btnBox.y + btnBox.height / 2);
          log('Clicked via mouse at: ' + (btnBox.x + btnBox.width/2) + ',' + (btnBox.y + btnBox.height/2));
        } else {
          // Try evaluate click
          await saveActivateLocator.first().evaluate(el => el.click());
          log('Clicked via evaluate().');
        }
        await page.waitForTimeout(4000);
        
        const finalUrl = page.url();
        log('Final URL: ' + finalUrl);
        
        if (finalUrl.includes('edit-snippet')) {
          log('✅ Snippet salvat! ID: ' + finalUrl.match(/id=(\d+)/)?.[1]);
        }
      }
    }

    // Final OG check
    log('\nVerificare finala OG...');
    const ogFinal = await page.evaluate(async (base) => {
      const r = await fetch(base + '/masini-de-vanzare/', { cache: 'no-store' });
      const html = await r.text();
      const byProperty = [...html.matchAll(/<meta[^>]*property=["']og:title["'][^>]*>/gi)].length;
      const byName = [...html.matchAll(/<meta[^>]*name=["']og:title["'][^>]*>/gi)].length;
      return { byProperty, byName };
    }, base);
    log('OG Title by property: ' + ogFinal.byProperty);
    log('OG Title by name: ' + ogFinal.byName);

    log('\n=== DONE ===');

  } catch (err) {
    log('EROARE: ' + err.message);
    await page.screenshot({ path: path.join(__dirname, 'screenshot-og-rest-error.png') }).catch(() => {});
  } finally {
    await browser.close();
  }
})();
