const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

(async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox']
  });

  const outDir = path.join(__dirname, '../public/screenshots/responsive');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const viewports = [
    { name: 'mobile_375', width: 375, height: 812 },
    { name: 'tablet_768', width: 768, height: 1024 },
    { name: 'desktop_1440', width: 1440, height: 900 }
  ];

  for (const vp of viewports) {
    const page = await browser.newPage();
    await page.setViewport({ width: vp.width, height: vp.height });
    
    // 1. Homepage Top
    await page.goto('http://127.0.0.1:3000', { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: path.join(outDir, `home_top_${vp.name}.png`) });

    // 2. Scroll to Academic Programs Section
    await page.evaluate(() => {
      window.scrollBy(0, 1100);
    });
    await new Promise(r => setTimeout(r, 800));
    await page.screenshot({ path: path.join(outDir, `home_academic_${vp.name}.png`) });

    // 3. Scroll to Footer
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
    await new Promise(r => setTimeout(r, 800));
    await page.screenshot({ path: path.join(outDir, `home_footer_${vp.name}.png`) });

    await page.close();
  }

  await browser.close();
  console.log('All screen responsive testing completed successfully!');
})();
