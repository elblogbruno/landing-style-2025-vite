// Run with Playwright browser_run_code_unsafe using this file as filename.
async (page) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('https://localhost:5173/');
  await page.locator('.elevator-welcome').waitFor({ state: 'visible' });
  await page.evaluate(() => {
    window.elevatorTiming = {};
    window.addEventListener('elevator-moving', e => {
      window.elevatorTiming = { start: performance.now(), target: e.detail.toFloor };
    }, { once: true });
    window.addEventListener('elevator-arrived', () => {
      window.elevatorTiming.elapsed = performance.now() - window.elevatorTiming.start;
    }, { once: true });
  });
  await page.locator('.elevator-welcome button').click();
  await page.waitForFunction(() => !document.body.classList.contains('elevator-transition-active'));
  const timing = await page.evaluate(() => window.elevatorTiming);
  if (timing.target !== 'about' || !(timing.elapsed >= 3000)) throw new Error('Incorrect tour destination or speed');
  if (await page.locator('.exterior').getAttribute('data-floor') !== 'about') throw new Error('Did not arrive at first floor');
  await page.locator('.hero-intro a[href="#experience"]').click();
  await page.waitForFunction(() => document.querySelector('.exterior')?.dataset.floor === 'experience');
  return { firstFloor: true, movementMs: Math.round(timing.elapsed), directExperience: true };
}
