const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await (await browser.newContext()).newPage();
  await page.goto('https://masiniinratebaiamare.ro/masini-de-vanzare/?v=' + Date.now(), { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  const links = await page.$$eval('a', (anchors) =>
    anchors.map((a) => a.href).filter((h) => h && h.includes('/masini/'))
  );
  const uniq = [...new Set(links)];
  console.log('count', uniq.length);
  uniq.forEach((u) => console.log(u));

  await browser.close();
})();

