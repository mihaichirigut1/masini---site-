const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await (await browser.newContext()).newPage();
  await page.goto('https://masiniinratebaiamare.ro/masini/suzuki-ignis-4x4-prima-inmatriculare-08-2007/', {
    waitUntil: 'domcontentloaded',
  });
  const html = await page.content();
  const hasTelefon = /Telefon/i.test(html);
  const requiredNearTelefon = (html.match(/telefon[\s\S]{0,500}required/gi) || []).length;
  const formSnippets = [...html.matchAll(/<form[\s\S]*?<\/form>/gi)].map((m) => m[0].slice(0, 1200));
  console.log('hasTelefon:', hasTelefon);
  console.log('requiredNearTelefon:', requiredNearTelefon);
  console.log('formsFound:', formSnippets.length);
  if (formSnippets[0]) {
    console.log('--- form preview ---');
    console.log(formSnippets[0]);
  }
  await browser.close();
})();

