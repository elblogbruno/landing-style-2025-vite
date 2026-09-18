// Run with Playwright browser_run_code_unsafe using this file as filename.
async (page) => {
  await page.goto('https://localhost:5173/');
  const results = [];
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 900 });
    const card = page.locator('.award-cabinet').first();
    await card.scrollIntoViewIfNeeded();
    if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)) throw new Error('Horizontal overflow');
    for (const key of ['Enter', 'Space']) {
      await card.focus();
      await page.keyboard.press(key);
      const close = page.getByRole('button', { name: 'Close modal', exact: true });
      await close.waitFor({ state: 'visible' });
      await close.click();
    }
    results.push({ width, cases: await page.locator('.award-cabinet').count(), keyboard: true });
  }
  return results;
}
