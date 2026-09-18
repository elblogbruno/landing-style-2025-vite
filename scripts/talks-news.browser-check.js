// Run with Playwright browser_run_code_unsafe using this file as filename.
async (page) => {
  await page.goto('https://localhost:5173/');
  const results = [];
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.locator('#talks').scrollIntoViewIfNeeded();
    const news = page.locator('#news');
    await news.waitFor({ state: 'visible' });
    if (await page.locator('.talks-stage__header button').count()) throw new Error('Tabs remain');
    const order = await news.evaluate(e => e.getBoundingClientRect().top >= e.previousElementSibling.getBoundingClientRect().bottom);
    if (!order) throw new Error('News must follow talks');
    const more = news.getByRole('button', { name: /Mostrar más|Show more/i });
    const before = await news.locator('h4').count();
    await more.click();
    await page.waitForFunction(count => document.querySelectorAll('#news h4').length > count, before);
    while (await more.count()) {
      const count = await news.locator('h4').count();
      await more.click();
      await page.waitForFunction(previous => document.querySelectorAll('#news h4').length > previous, count);
    }
    await news.locator('button').last().click();
    await page.waitForFunction(count => document.querySelectorAll('#news h4').length === count, before);
    await news.scrollIntoViewIfNeeded();
    if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)) throw new Error('Horizontal overflow');
    results.push({ width, newsVisibleWithoutTab: true, followsTalks: true, pagination: true });
  }
  return results;
}
