// Run with Playwright browser_run_code_unsafe using this file as filename.
async (page) => {
  const results = [];
  for (const lang of ['es', 'en']) {
    await page.goto('https://127.0.0.1:4173/' + (lang === 'en' ? 'en/' : ''), { waitUntil: 'networkidle' });
    await page.locator('#about').scrollIntoViewIfNeeded();
    await page.locator('.story-museum').waitFor();
    for (const width of [320, 390, 1440]) {
      await page.setViewportSize({ width, height: 950 });
      const story = page.locator('.story-museum');
      const milestones = story.locator('ol > li');
      if (await milestones.count() !== 8) throw new Error('All eight stages must remain');
      if (await story.locator('button, [role="tab"]').count()) throw new Error('The museum must remain scrollable without a carousel');
      for (const milestone of await milestones.all()) {
        await milestone.scrollIntoViewIfNeeded();
        if (!await milestone.locator('h3').isVisible()) throw new Error('Hidden exhibit');
        for (const image of await milestone.locator('img').all()) {
          await image.evaluate(img => new Promise((resolve, reject) => {
            if (img.complete) return img.naturalWidth ? resolve(true) : reject(new Error(img.src));
            img.onload = () => resolve(true);
            img.onerror = () => reject(new Error(img.src));
          }));
        }
      }
      const layout = await milestones.evaluateAll(items => items.map(item => {
        const r = item.getBoundingClientRect();
        return { top: r.top, bottom: r.bottom, width: item.clientWidth, contentWidth: item.scrollWidth };
      }));
      if (layout.some((item, i) => item.contentWidth > item.width + 1 || (i > 0 && item.top < layout[i - 1].bottom)))
        throw new Error('Exhibits overlap or overflow');
      const info = await story.locator('.story-museum__details').innerText();
      if (!/\d+/.test(info) || info.includes('{{')) throw new Error('Age is not resolved');
      results.push({ lang, width, exhibits: layout.length, info });
    }
  }
  await page.locator('.hero-welcome__speaker').click();
  await page.waitForFunction(() => document.querySelector('#talks [data-ready="true"]'));
  if (Math.abs(await page.locator('#talks').evaluate(el => el.getBoundingClientRect().top)) > 150)
    throw new Error('Speaker link did not reach talks');
  return results;
}
