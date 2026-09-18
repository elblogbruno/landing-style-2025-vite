async (page) => {
  const base = 'https://127.0.0.1:4173';
  const errors = [];
  const onError = error => errors.push(error.message);
  page.on('pageerror', onError);
  const results = [];
  try {
    await page.setViewportSize({ width: 390, height: 844 });
    for (const route of ['/', '/en/']) {
      await page.goto(base + route);
      await page.locator('#contact form').waitFor({ state: 'attached' });
      const expected = ['hero','about','experience','projects','talks','awards','education','contact'];
      const order = await page.locator('section[data-section-id]').evaluateAll(es => es.map(e => e.id));
      if (JSON.stringify(order) !== JSON.stringify(expected)) throw Error('Wrong floor order');
      if (await page.locator('#projects a[href="/projects/jobagent/"]').count()) throw Error('Obsolete JobAgent button');
      if (await page.locator('#projects a[href="https://platform.glassear.com/"]').count() !== 1) throw Error('Missing Glassear button');
      if (await page.locator('#projects a[href="https://github.com/elblogbruno/JobAgent"]').count() !== 1) throw Error('Missing GitHub button');
      if (await page.locator('link[rel=canonical]').getAttribute('href') !== 'https://brunomoya.com' + route) throw Error('Wrong canonical');
      const more = page.locator('#talks').getByRole('button', { name: /Mostrar más charlas|Show more talks/i });
      while (await more.count()) await more.click();
      const newsMore = page.locator('#news').getByRole('button', { name: /Mostrar más noticias|Show more news/i });
      while (await newsMore.count()) await newsMore.click();
      const images = await page.locator('#talks img, #awards img, #education img').evaluateAll(async imgs => {
        await Promise.all(imgs.map(i => { i.loading = 'eager'; return i.decode().catch(() => {}); }));
        return imgs.filter(i => !i.naturalWidth).map(i => i.src);
      });
      if (images.length) throw Error('Broken images: ' + images.join(', '));
      for (const width of [320, 390, 1440]) {
        await page.setViewportSize({ width, height: 900 });
        if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)) throw Error('Horizontal overflow at ' + width);
      }
      results.push({ route, order: true, links: true, images: true, responsive: true });
    }
    for (const route of ['/projects/mapanim/', '/resume/', '/experience/']) {
      const response = await page.goto(base + route);
      if (response.status() !== 200 || !await page.locator('main h1').count()) throw Error('Broken static route ' + route);
    }
    if (errors.length) throw Error(errors.join('\n'));
    return results;
  } finally { page.off('pageerror', onError); }
}