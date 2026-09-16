// Run with Playwright browser_run_code using this file as filename.
async (page) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('https://localhost:5173');
  await page.locator('[data-mobile-next]').waitFor();
  for (const top of [350, 310]) {
    await page.evaluate(target => new Promise((resolve, reject) => {
      const bar = document.querySelector('.mobile-elevator');
      let hidden = false;
      const timeout = setTimeout(() => { observer.disconnect(); reject(new Error('Hide/idle cycle missing')); }, 8000);
      const observer = new MutationObserver(() => {
        if (bar.classList.contains('mobile-elevator--reading')) hidden = true;
        else if (hidden) { observer.disconnect(); clearTimeout(timeout); resolve(true); }
      });
      observer.observe(bar, {attributes:true, attributeFilter:['class']});
      window.scrollTo({top:target, behavior:'instant'});
    }), top);
  }
  await page.locator('[data-mobile-floor-toggle]').click();
  await page.evaluate(() => window.scrollBy({ top: 150, behavior: 'instant' }));
  if (await page.locator('.mobile-elevator').evaluate(el => el.classList.contains('mobile-elevator--reading'))) throw new Error('Open selector hidden');
  await page.keyboard.press('Escape');
  await page.locator('body').click({position:{x:5,y:120}});
  await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }));
  await page.waitForFunction(() => !document.querySelector('.mobile-elevator').classList.contains('mobile-elevator--reading'));
  await page.emulateMedia({reducedMotion:'reduce'});
  const duration = await page.locator('.mobile-elevator').evaluate(el => getComputedStyle(el).transitionDuration);
  if (duration !== '0s') throw new Error('Reduced motion not respected');
  await page.emulateMedia({reducedMotion:'no-preference'});
  return { hidesWhileReading:true, hidesInBothDirections:true, returnsAfterPause:true, selectorStaysOpen:true, visibleAtPageEnd:true, reducedMotion:true };
}
