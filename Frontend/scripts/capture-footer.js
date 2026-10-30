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

  const outDir = path.join(__dirname, '../public/screenshots');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 950 });
  console.log('Navigating to http://127.0.0.1:3000...');
  await page.goto('http://127.0.0.1:3000', { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 1500));

  // Scroll all the way to the footer
  await page.evaluate(() => {
    window.scrollTo(0, document.body.scrollHeight);
  });
  await new Promise(r => setTimeout(r, 1000));

  const footerPath = path.join(outDir, 'footer_lightened.png');
  await page.screenshot({ path: footerPath });
  console.log(`Saved footer screenshot to ${footerPath}`);

  // Also take an element screenshot of just the footer
  const footerElem = await page.$('footer');
  if (footerElem) {
    const footerElemPath = path.join(outDir, 'footer_element_lightened.png');
    await footerElem.screenshot({ path: footerElemPath });
    console.log(`Saved footer element screenshot to ${footerElemPath}`);
  }

  await page.close();
  await browser.close();
  console.log('Footer capture completed successfully!');
})();
