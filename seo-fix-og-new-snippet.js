/**
 * Adauga un snippet NOU dedicat fix-ului OG tags
 * Snippet simplu, mic, usor de salvat
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

// Snippet mic si simplu pentru OG fix
const OG_SNIPPET_CODE = `add_action('wp','mirt_og_fix',999);function mirt_og_fix(){ob_start('mirt_og');}add_action('shutdown',function(){if(ob_get_level()>0)ob_end_flush();},0);function mirt_og($s){$s=preg_replace('~<meta\\\\s[^>]*property=["\\'\\']og:[^"\\'\\' ]*["\\'\\'][^>]*name=["\\'\\']og:[^"\\'\\' ]*["\\'\\'][^>]*/?>[\\\\r\\\\n]*~i','',$s);return $s;}`;

(async () => {
  const env = loadEnv();
  const base = (env.WP_SITE_URL || 'https://masiniinratebaiamare.ro').replace(/\/$/, '');
  const user = env.WP_USER || '';
  const pass = env.WP_PASSWORD || '';

  const browser = await chromium.launch({ headless: false, slowMo: 100 });
  const context = await browser.newContext();
  const page = await context.newPage();
  page.setDefaultTimeout(30000);

  try {
    log('Login...');
    await page.goto(base + '/wp-login.php', { waitUntil: 'networkidle', timeout: 30000 });
    await page.fill('#user_login', user);
    await page.fill('#user_pass', pass);
    await page.click('#wp-submit');
    await page.waitForURL(/wp-admin/, { timeout: 15000 });
    log('Logat.');

    log('Adaug snippet nou OG Fix...');
    await page.goto(base + '/wp-admin/admin.php?page=add-snippet', { waitUntil: 'networkidle', timeout: 20000 });
    await page.waitForTimeout(3000);

    // Set snippet name
    const nameField = page.locator('input[name="snippet_name"]').first();
    await nameField.fill('SEO Fix OG Duplicate Tags');
    await page.waitForTimeout(300);

    // Make textarea visible and fill it directly
    await page.evaluate(() => {
      // Make all textareas visible
      document.querySelectorAll('textarea').forEach(ta => {
        ta.style.display = 'block';
        ta.style.visibility = 'visible';
        ta.style.opacity = '1';
        ta.style.height = '200px';
        ta.style.width = '100%';
      });
    });
    await page.waitForTimeout(500);

    // Find textarea for code
    const taName = await page.locator('textarea[name="snippet_code"], textarea#snippet_code, textarea.snippet_code').first();
    if (await taName.count() > 0) {
      log('Gasit textarea snippet_code');
      await taName.fill(OG_SNIPPET_CODE);
      await page.waitForTimeout(500);
    } else {
      // Try any visible textarea
      log('Fallback: CodeMirror setValue + linked textarea');
      await page.evaluate((code) => {
        const cm = document.querySelector('.CodeMirror');
        if (cm && cm.CodeMirror) {
          cm.CodeMirror.setValue(code);
          cm.CodeMirror.save();
          // Also manually update textarea
          const ta = cm.CodeMirror.getTextArea();
          if (ta) {
            const nativeSetter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set;
            nativeSetter.call(ta, code);
            ta.dispatchEvent(new Event('input', { bubbles: true }));
            ta.dispatchEvent(new Event('change', { bubbles: true }));
          }
        }
      }, OG_SNIPPET_CODE);
    }

    await page.waitForTimeout(500);

    // Screenshot before save
    await page.screenshot({ path: path.join(__dirname, 'screenshot-og-snippet-before-save.png') });

    // Click Save and Activate - try multiple approaches
    log('Attempting Save and Activate...');
    
    // Approach 1: Direct click on visible button
    const saveActivateBtn = page.locator('button:has-text("Save and Activate")').first();
    if (await saveActivateBtn.count() > 0) {
      log('Found Save and Activate button, clicking...');
      try {
        await saveActivateBtn.click({ timeout: 5000 });
        await page.waitForTimeout(3000);
        log('Clicked Save and Activate.');
      } catch (e) {
        log('Direct click failed: ' + e.message);
        // Try force click
        await saveActivateBtn.click({ force: true });
        await page.waitForTimeout(3000);
        log('Force clicked.');
      }
    }

    const urlAfter = page.url();
    log('URL after save: ' + urlAfter);
    
    if (urlAfter.includes('page=edit-snippet') && urlAfter.includes('id=')) {
      log('Snippet salvat! ID: ' + urlAfter.match(/id=(\d+)/)?.[1]);
    } else if (urlAfter.includes('page=add-snippet')) {
      log('Snippet NU a fost salvat (inca pe add-snippet page).');
      log('Incerc abordare alternativa: submit form via JS...');
      
      // Try submitting via JS with fetch
      const saveResult = await page.evaluate(async () => {
        // Find the form
        const form = document.querySelector('form');
        if (!form) return 'no form';
        
        // Collect form data
        const fd = new FormData(form);
        
        // Submit via fetch
        const r = await fetch(form.action || window.location.href, {
          method: 'POST',
          body: fd,
          credentials: 'include',
          redirect: 'follow'
        });
        return r.url + ' (status ' + r.status + ')';
      });
      log('JS fetch submit result: ' + saveResult);
    }

    await page.screenshot({ path: path.join(__dirname, 'screenshot-og-snippet-after.png') });

    // Verify result
    log('\nVerifica OG tags pe site...');
    const ogVerify = await page.evaluate(async (base) => {
      const r = await fetch(base + '/masini-de-vanzare/', { cache: 'no-store' });
      const html = await r.text();
      const tags = [...html.matchAll(/<meta[^>]*og:title[^>]*/gi)].map(m => m[0].substring(0, 100));
      return tags;
    }, base);
    log('OG Title tags: ' + ogVerify.length);
    ogVerify.forEach((t, i) => log('  ' + (i+1) + ': ' + t));

    log('\n=== DONE ===');
    log(ogVerify.length === 1 ? '✅ OG duplicate eliminat!' : '⚠️  OG inca duplicat (' + ogVerify.length + ' tags)');

  } catch (err) {
    log('EROARE: ' + err.message);
    await page.screenshot({ path: path.join(__dirname, 'screenshot-og-fix-error.png') }).catch(() => {});
  } finally {
    await browser.close();
  }
})();
