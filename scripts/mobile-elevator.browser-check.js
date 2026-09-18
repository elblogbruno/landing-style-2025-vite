// Run with Playwright browser_run_code using this file as filename.
async (page) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('https://localhost:5173');
  await page.locator('[data-mobile-next]').click();
  await page.waitForFunction(() => document.querySelector('.exterior')?.dataset.floor === 'about');
  await page.waitForFunction(() => !document.body.classList.contains('elevator-transition-active'));
  if (await page.locator('.mobile-elevator__number').textContent() !== '1') throw new Error('Wrong current floor');
  await page.locator('[data-mobile-floor-toggle]').click();
  if (await page.locator('[data-mobile-floor]').count() !== 8) throw new Error('Missing floors');
  await page.keyboard.press('Escape');
  await page.locator('[data-mobile-floor-toggle]').waitFor();
  await page.waitForFunction(() => document.querySelector('[data-mobile-floor-toggle]') === document.activeElement);
  await page.locator('[data-mobile-floor-toggle]').click();
  await page.locator('[data-mobile-floor="contact"]').click();
  await page.waitForFunction(() => document.querySelector('.exterior')?.dataset.floor === 'contact');
  await page.waitForFunction(() => !document.body.classList.contains('elevator-transition-active'));
  if (!await page.locator('[data-mobile-next]').textContent().then(s => s.includes('Volver'))) throw new Error('Missing return to lobby');
  await page.locator('[data-mobile-next]').click();
  await page.waitForFunction(() => document.querySelector('.exterior')?.dataset.floor === 'hero');
  await page.waitForFunction(() => !document.body.classList.contains('elevator-transition-active'));
  const sizes = [];
  for (const width of [320, 390]) {
    await page.setViewportSize({ width, height: 700 });
    const size = await page.locator('[data-mobile-next]').boundingBox();
    if (!size || size.height < 44) throw new Error('Touch target too small');
    if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)) throw new Error('Horizontal overflow');
    await page.locator('[data-mobile-floor-toggle]').click();
    await page.locator('[data-mobile-floor="contact"]').scrollIntoViewIfNeeded();
    if (!await page.locator('[data-mobile-floor="contact"]').isVisible()) throw new Error('Last floor inaccessible');
    await page.keyboard.press('Escape');
    sizes.push(width);
  }
  return { nextFloor: true, directSelection: true, returnToLobby: true, escapeAndFocus: true, widths: sizes };
}
