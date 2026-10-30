const puppeteer = require('puppeteer-core');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

(async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://127.0.0.1:3000', { waitUntil: 'networkidle2' });
  
  const items = await page.$$('.animate-tech-marquee > div');
  console.log('Found items:', items.length);
  
  if (items.length > 6) {
    // Hover over PostgreSQL (index 6)
    await items[6].hover();
    await new Promise(r => setTimeout(r, 600));
    
    // Screenshot section
    const strip = await page.$('section.bg-white');
    if (strip) {
      await strip.screenshot({ path: path.join(__dirname, '..', 'public', 'screenshots', 'tools_pop_big.png') });
      console.log('Saved tools_pop_big.png');
    }
  }
  
  await browser.close();
})();
