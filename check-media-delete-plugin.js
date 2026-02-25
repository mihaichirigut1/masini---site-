const { chromium } = require('playwright');

const WP_SITE_URL = 'https://masiniinratebaiamare.ro';
const WP_USER = 'masiniinratebaiamare@gmail.com';
const WP_PASSWORD = 'Z*ulokl4Xg@k756J';

function includesAny(haystack, needles) {
  const h = (haystack || '').toLowerCase();
  return needles.some((n) => h.includes(n));
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  page.setDefaultTimeout(45000);

  // Login
  await page.goto(WP_SITE_URL + '/wp-login.php', { waitUntil: 'domcontentloaded' });
  await page.fill('#user_login', WP_USER);
  await page.fill('#user_pass', WP_PASSWORD);
  await page.click('#wp-submit');
  await page.waitForURL('**/wp-admin/**');

  // Scrape plugins list from wp-admin UI (works without REST permissions)
  await page.goto(WP_SITE_URL + '/wp-admin/plugins.php?plugin_status=all', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#the-list tr');

  const plugins = await page.$$eval('#the-list tr', (rows) =>
    rows
      .map((tr) => {
        const nameEl = tr.querySelector('td.plugin-title strong');
        const descEl = tr.querySelector('td.plugin-description .plugin-description p');
        const checkbox = tr.querySelector('th.check-column input[type=\"checkbox\"]');
        const classes = tr.getAttribute('class') || '';
        const isActive = classes.split(/\s+/).includes('active');
        return {
          name: nameEl ? nameEl.textContent.trim() : '',
          plugin: checkbox ? checkbox.getAttribute('value') || '' : '',
          status: isActive ? 'active' : 'inactive',
          description: descEl ? descEl.textContent.trim() : '',
        };
      })
      .filter((p) => p.name)
  );
  const keywords = [
    'delete',
    'remove',
    'attachment',
    'media',
    'orphan',
    'cleanup',
    'clean up',
    'unattached',
    'auto delete',
    'trash',
  ];

  const suspects = plugins
    .map((p) => ({
      name: p.name,
      plugin: p.plugin,
      status: p.status,
      description: p.description || '',
    }))
    .filter((p) => includesAny([p.name, p.plugin, p.description].join(' '), keywords));

  console.log('\n=== Pluginuri instalate:', plugins.length, '===');
  console.log('Active:', plugins.filter((p) => p.status === 'active').length, '| Inactive:', plugins.filter((p) => p.status !== 'active').length);

  console.log('\n=== Suspecte (posibil stergere media la stergere post) ===');
  if (suspects.length === 0) {
    console.log('N-am gasit niciun plugin suspect dupa cuvinte cheie.');
  } else {
    for (const s of suspects) {
      console.log(`- ${s.name} [${s.status}] (${s.plugin})`);
      const d = (s.description || '').replace(/\s+/g, ' ').trim();
      console.log('  Desc:', d.substring(0, 220) + (d.length > 220 ? '…' : ''));
    }
  }

  console.log('\nNOTA: Pentru a sterge automat imaginile cand stergi un articol, de obicei pluginul mentioneaza \"delete attachments\" sau \"delete media\".');

  await browser.close();
})();

