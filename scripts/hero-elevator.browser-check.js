// Run with Playwright browser_run_code_unsafe using this file as filename.
async (page) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('https://localhost:5173/');
  await page.locator('.elevator-welcome').waitFor({ state: 'visible' });
  const results = [];
  for (const width of [1024, 1280, 1440, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    const fits = await page.locator('.elevator-buttons-panel').evaluate(panel => {
      const rect = panel.getBoundingClientRect();
      const grid = document.querySelector('.grid-layout').getBoundingClientRect();
      return rect.right <= grid.right + 1 && rect.right <= document.documentElement.clientWidth;
    });
    if (!fits) throw new Error('Elevator panel clipped');
    if (await page.locator('.hero-intro a:visible').count() !== 2) throw new Error('Desktop hero has duplicate actions');
    if (await page.locator('.elevator-welcome button').count() !== 1) throw new Error('Welcome has duplicate actions');
    results.push({ width, elevatorFits: true, primaryActions: 3 });
  }
  await page.locator('.elevator-welcome button').click();
  await page.waitForFunction(() => document.querySelector('.exterior')?.dataset.floor === 'about');
  await page.waitForFunction(() => !document.body.classList.contains('elevator-transition-active'));
  if (await page.locator('.elevator-buttons-panel button[data-floor]').count() !== 8) throw new Error('Missing floor controls');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('https://localhost:5173/');
  if (await page.locator('.hero-intro a:visible').count() !== 2) throw new Error('Mobile hero actions changed');
  if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)) throw new Error('Mobile overflow');
  return { desktop: results, enterNavigates: true, mobileActionsPreserved: true };
}
