async (page) => {
  const errors = [];
  const onError = error => errors.push(error.message);
  page.on('pageerror', onError);
  await page.setViewportSize({width:390,height:844});
  const base = 'https://127.0.0.1:4173';
  for (const [path, language] of [['/','es'],['/en/','en']]) {
    const html = await (await page.request.get(base+path)).text();
    if (!html.includes('data-language="'+language+'"') || !/<h1[ >]/.test(html)) throw Error('Missing prerender '+language);
    await page.goto(base+path);
    await page.locator('[data-mobile-next]').waitFor();
    const state = await page.evaluate(()=>({
      ready:document.querySelectorAll('[data-ready="true"]').length,
      chunks:performance.getEntriesByType('resource').filter(r=>/chunks\/(About|Projects|Talks|Awards|Education|Contact)\./.test(r.name)).map(r=>r.name),
      language:document.documentElement.lang
    }));
    if(state.ready || state.chunks.length || state.language!==language) throw Error(JSON.stringify(state));
  }
  // Loading only when approaching the next floor.
  await page.locator('#about').scrollIntoViewIfNeeded();
  await page.locator('#about [data-ready="true"]').waitFor();
  if(await page.locator('#contact [data-ready="true"]').count()) throw Error('Contact loaded too early');
  // A direct URL must prepare preceding floors before locating its destination.
  await page.goto(base+'/#contact');
  await page.locator('#contact form').waitFor();
  await page.waitForFunction(()=>Math.abs(document.getElementById('contact').getBoundingClientRect().top-64)<8);
  await page.waitForTimeout(800);
  const top = await page.locator('#contact').evaluate(e=>e.getBoundingClientRect().top);
  if(Math.abs(top-64)>8) throw Error('Unstable contact landing: '+top);
  // A direct elevator jump from a fresh home.
  await page.goto(base+'/');
  await page.locator('[data-mobile-floor-toggle]').click();
  await page.locator('[data-mobile-floor="awards"]').click();
  await page.waitForFunction(()=>!document.body.classList.contains('elevator-transition-active') && document.querySelector('.exterior')?.dataset.floor==='awards');
  const awardsTop=await page.locator('#awards').evaluate(e=>e.getBoundingClientRect().top);
  if(Math.abs(awardsTop)>120)throw Error('Elevator missed awards: '+awardsTop);
  if(await page.locator('#awards [data-ready="true"]').count()!==1)throw Error('Awards not ready');
  page.off('pageerror',onError);
  if(errors.length)throw Error(errors.join('\n'));
  return {prerender:['es','en'],initialFloorChunks:0,proximity:true,hashContactTop:top,elevatorAwardsTop:awardsTop,errors};
}