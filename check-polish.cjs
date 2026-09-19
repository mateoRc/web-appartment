const {chromium}=require('C:/Users/Mateo/AppData/Local/npm-cache/_npx/a19578de4de14e3e/node_modules/playwright');
(async()=>{
 const browser=await chromium.launch({channel:'chrome'});
 const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://localhost:8081',{waitUntil:'domcontentloaded'});
 await page.evaluate(()=>document.fonts.ready);
 await page.locator('#contact').scrollIntoViewIfNeeded();
 await page.waitForTimeout(800);
 await page.evaluate(()=>scrollTo(0,0));
 await page.screenshot({path:'polish-desktop.png',fullPage:true});
 for(const width of [320,390,768,1440]){
  await page.setViewportSize({width,height:844});
  for(const selector of ['.header','#gallery','#contact','.footer']){
   await page.locator(selector).scrollIntoViewIfNeeded();
   if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth))throw Error('Overflow '+width+' '+selector);
   if(!(await page.locator('.whatsapp-float').evaluate(e=>{const r=e.getBoundingClientRect();return r.left>=16&&r.right<=innerWidth-16&&r.bottom<=innerHeight-16})))throw Error('WhatsApp bounds');
  }
 }
 await page.setViewportSize({width:390,height:844});
 await page.screenshot({path:'polish-mobile.png',fullPage:true});
 await page.locator('.gallery-item').first().click();
 await page.keyboard.press('ArrowRight');
 if(!(await page.locator('#lightbox figcaption').textContent()).startsWith('2 /'))throw Error('Gallery broken');
 await page.keyboard.press('Escape');
 await page.evaluate(()=>{window.open=url=>{window.inquiry=url;return null}});
 await page.locator('[name=name]').fill('Test Guest');
 await page.locator('[name=arrival]').fill('2027-07-10');
 await page.locator('[name=departure]').fill('2027-07-17');
 await page.locator('button[type=submit]').click();
 if(!(await page.evaluate(()=>window.inquiry)).startsWith('https://wa.me/'))throw Error('WhatsApp inquiry broken');
 await page.setViewportSize({width:1440,height:1000});
 await page.emulateMedia({reducedMotion:'no-preference'});
 await page.locator('.tide-divider').scrollIntoViewIfNeeded();
 await page.waitForTimeout(150);
 const before=await page.locator('.tide-divider').evaluate(e=>e.style.getPropertyValue('--drift'));
 await page.evaluate(()=>scrollBy(0,160));
 await page.waitForTimeout(150);
 const after=await page.locator('.tide-divider').evaluate(e=>e.style.getPropertyValue('--drift'));
 if(!before||before===after)throw Error('Parallax not moving');
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.waitForTimeout(100);
 if(await page.locator('.tide-divider').evaluate(e=>e.style.getPropertyValue('--drift')))throw Error('Reduced motion not respected');
 if(errors.length)throw Error(errors.join('\n'));
 console.log('PASS: 4 responsive widths; floating button; gallery; WhatsApp inquiry; desktop parallax; reduced motion; no JS errors.');
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
