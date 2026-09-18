async (page) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('https://127.0.0.1:4173/');
  await page.locator('[data-mobile-next]').waitFor({ state: 'visible' });
  await page.evaluate(() => document.fonts.ready);
  const result = await page.evaluate(() => {
    const resources = performance.getEntriesByType('resource');
    return {
      portraitRequests: resources.filter(r => r.name.includes('/hero/profile.webp')).length,
      initial3D: resources.filter(r => /vendor-three|avatar_box|bruno-draco/.test(r.name)).length,
      floorBlurs: [...document.querySelectorAll('.floor-room')].filter(e => getComputedStyle(e).backdropFilter !== 'none').length,
      fontsLoaded: document.fonts.status === 'loaded',
      overflow: document.documentElement.scrollWidth > innerWidth
    };
  });
  if (result.portraitRequests !== 1 || result.initial3D || result.floorBlurs || !result.fontsLoaded || result.overflow) {
    throw Error(JSON.stringify(result));
  }
  await page.locator('[data-mobile-next]').click();
  await page.waitForFunction(() => document.querySelector('.exterior')?.dataset.floor === 'about' && !document.body.classList.contains('elevator-transition-active'));
  await page.locator('[data-mobile-floor-toggle]').click();
  await page.locator('[data-mobile-floor="experience"]').click();
  await page.waitForFunction(() => document.querySelector('.exterior')?.dataset.floor === 'experience' && !document.body.classList.contains('elevator-transition-active'));
  if (await page.locator('.mobile-elevator__number').textContent() !== '2') throw Error('Wrong floor after navigation');
  return { ...result, firstFloor: true, experienceFloor: 2 };
}