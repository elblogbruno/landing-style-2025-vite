// Run with the Playwright browser_run_code tool's filename argument.
async (page) => {
  const results = [];
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 950 });
    for (const floor of ['hero', 'projects', 'education', 'contact']) {
      await page.locator('#' + floor).evaluate(el => el.scrollIntoView({ behavior: 'instant' }));
      await page.waitForFunction(key => document.querySelector('.exterior')?.dataset.floor === key, floor);
      await page.waitForTimeout(1750);
      const state = await page.locator('.exterior').evaluate(el => ({
        ground: parseFloat(el.style.getPropertyValue('--ground')),
        buildings: el.querySelectorAll('.exterior__building').length,
        overflow: document.documentElement.scrollWidth > innerWidth,
        pointerEvents: getComputedStyle(el).pointerEvents,
      }));
      if (state.overflow || state.buildings !== 10 || state.pointerEvents !== 'none') throw new Error(JSON.stringify(state));
      if (floor === 'hero' && (state.ground < 70 || state.ground > 95)) throw new Error('Lobby not at street level');
      if (floor === 'education' && state.ground <= 150) throw new Error('Upper floor too low');
      if (floor === 'contact' && state.ground <= 180) throw new Error('Rooftop too low');
      const order = ['hero', 'experience', 'projects', 'about', 'talks', 'awards', 'education', 'contact'];
      const badge = await page.locator('#' + floor + ' .floor-room__number').textContent();
      if (Number(badge) !== order.indexOf(floor)) throw new Error('Incorrect floor plaque: ' + badge);
      results.push({ width, floor, ...state });
    }
  }
  const initial = await page.locator('.exterior').getAttribute('data-theme');
  await page.getByRole('button', { name: 'Cambiar tema', exact: true }).first().click();
  await page.waitForFunction(previous => document.querySelector('.exterior')?.dataset.theme !== previous, initial);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const duration = await page.locator('.exterior__world').evaluate(el => getComputedStyle(el).transitionDuration);
  if (duration !== '0s') throw new Error('Reduced motion not respected');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  return results;
}
