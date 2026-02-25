/**
 * Loghează în WordPress și creează/actualizează snippet-ul "Cautare sub masini pe mobil"
 * cu codul din snippet-cautare-jos-php.txt. Rulează: node deploy-snippet-cautare-jos.js
 */
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

function loadEnv() {
  const envPath = path.join(__dirname, '.env');
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

const SNIPPET_NAME = 'Cautare sub masini pe mobil';
const SNIPPET_FILE = path.join(__dirname, 'snippet-cautare-jos-php.txt');

(async () => {
  const env = loadEnv();
  const baseUrl = (env.WP_SITE_URL || 'https://masiniinratebaiamare.ro').replace(/\/$/, '');
  const user = env.WP_USER || '';
  const pass = env.WP_PASSWORD || '';

  if (!user || !pass) {
    console.error('Lipsește .env: WP_USER și WP_PASSWORD.');
    process.exit(1);
  }

  if (!fs.existsSync(SNIPPET_FILE)) {
    console.error('Lipsește fișierul:', SNIPPET_FILE);
    process.exit(1);
  }

  const snippetCode = fs.readFileSync(SNIPPET_FILE, 'utf8');

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    console.log('Conectare la', baseUrl + '/wp-login.php');
    await page.goto(baseUrl + '/wp-login.php', { waitUntil: 'networkidle', timeout: 20000 });
    await page.fill('#user_login', user);
    await page.fill('#user_pass', pass);
    await page.click('#wp-submit');
    await page.waitForURL(/wp-admin/, { timeout: 15000 });
    console.log('Logat. Merg la Snippets...');

    await page.goto(baseUrl + '/wp-admin/', { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(1500);

    const snippetsMenu = page.getByRole('link', { name: 'Snippets' });
    if (await snippetsMenu.count() > 0) {
      await snippetsMenu.nth(0).click();
      await page.waitForTimeout(2000);
    } else {
      await page.goto(baseUrl + '/wp-admin/admin.php?page=code-snippets', { waitUntil: 'networkidle', timeout: 15000 });
      await page.waitForTimeout(2000);
    }

    const link = page.locator(`a:has-text("${SNIPPET_NAME}")`);
    const count = await link.count();
    if (count > 0) {
      console.log('Snippet existent – deschid pentru editare...');
      await link.nth(0).click();
      await page.waitForTimeout(3000);
    } else {
      console.log('Snippet nou – Add New...');
      const addNew = page.getByRole('link', { name: /Add New/i });
      if (await addNew.count() > 0) {
        await addNew.nth(0).click();
      } else {
        await page.locator('a:has-text("Add New")').nth(0).click({ timeout: 5000 });
      }
      await page.waitForTimeout(3000);
      const nameInput = page.locator('input[name="snippet_name"], input#snippet_name, input[placeholder*="Name"], input[placeholder*="name"]');
      if (await nameInput.count() > 0) {
        await nameInput.nth(0).fill(SNIPPET_NAME);
      }
    }

    await page.waitForTimeout(1000);

    const codeSelector = 'textarea#snippet-code, textarea[name="snippet_code"], textarea[name="code"]';
    const codeTextarea = page.locator(codeSelector);
    if (await codeTextarea.count() > 0) {
      const el = codeTextarea.nth(0);
      await el.evaluate(e => e.scrollIntoView({ block: 'center' }));
      await page.waitForTimeout(500);
      await el.evaluate(e => { e.style.visibility = 'visible'; e.style.display = 'block'; e.style.height = '400px'; });
      await el.click();
      await page.waitForTimeout(300);
      await el.fill('');
      await el.fill(snippetCode);
    } else {
      const anyTextarea = page.locator('textarea');
      if (await anyTextarea.count() > 0) {
        const el = anyTextarea.nth(0);
        await el.evaluate(e => e.scrollIntoView({ block: 'center' }));
        await page.waitForTimeout(500);
        await el.fill('');
        await el.fill(snippetCode);
      } else {
        await page.keyboard.press('Control+a');
        await page.keyboard.insertText(snippetCode);
      }
    }

    console.log('Cod setat. Salvez...');
    await page.waitForTimeout(500);

    const saveBtn = page.locator('button:has-text("Save"), input[value*="Save"], button:has-text("Update"), .button-primary:has-text("Save"), .button-primary:has-text("Update")').nth(0);
    if (await saveBtn.count() > 0) {
      await saveBtn.click();
    } else {
      await page.keyboard.press('Control+s');
    }

    await page.waitForTimeout(3000);
    const err = page.locator('.notice-error, .error');
    if (await err.count() > 0) {
      const msg = await err.nth(0).textContent();
      console.error('Eroare WordPress:', msg);
    } else {
      console.log('Snippet salvat.');
    }

    const activateSwitch = page.locator('.snippet-active-switch, input[type="checkbox"][name*="active"], .cm-toggle').nth(0);
    if (await activateSwitch.count() > 0) {
      const checked = await activateSwitch.isChecked();
      if (!checked) {
        await activateSwitch.click();
        await page.waitForTimeout(1000);
        console.log('Snippet activat.');
      }
    }
  } catch (e) {
    console.error('Eroare:', e.message);
  } finally {
    await browser.close();
  }
})();
