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

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 1200 });

  console.log('Navigating to http://127.0.0.1:3000...');
  await page.goto('http://127.0.0.1:3000', { waitUntil: 'networkidle2', timeout: 30000 });

  const outDir = path.join(__dirname, '../public/screenshots');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  // Locate the Academic Programs section
  const sectionHandle = await page.evaluateHandle(() => {
    const h2 = document.evaluate(
      "//h2[contains(text(), 'Explore Industry-Relevant')]",
      document,
      null,
      XPathResult.FIRST_ORDERED_NODE_TYPE,
      null
    ).singleNodeValue;
    return h2 ? h2.closest('section') : null;
  });

  if (sectionHandle) {
    const element = sectionHandle.asElement();
    if (element) {
      await element.scrollIntoView();
      await new Promise(r => setTimeout(r, 1500));
      const sectionPath = path.join(outDir, 'academic_section_full.png');
      await element.screenshot({ path: sectionPath });
      console.log(`Saved full section screenshot to ${sectionPath}`);
    }
  }

  // Scroll to Academic Programs top view
  await page.evaluate(() => {
    const el = document.evaluate(
      "//h2[contains(text(), 'Explore Industry-Relevant')]",
      document,
      null,
      XPathResult.FIRST_ORDERED_NODE_TYPE,
      null
    ).singleNodeValue;
    if (el) {
      el.scrollIntoView({ behavior: 'instant', block: 'start' });
    }
    window.scrollBy(0, -90);
  });
  await new Promise(r => setTimeout(r, 1000));
  const topPath = path.join(outDir, 'academic_redesign_top.png');
  await page.screenshot({ path: topPath });
  console.log(`Saved top screenshot to ${topPath}`);

  // Scroll down to cards section
  await page.evaluate(() => {
    window.scrollBy(0, 520);
  });
  await new Promise(r => setTimeout(r, 1000));
  const cardsPath = path.join(outDir, 'academic_redesign_cards.png');
  await page.screenshot({ path: cardsPath });
  console.log(`Saved cards screenshot to ${cardsPath}`);

  // Scroll down to bottom strip
  await page.evaluate(() => {
    window.scrollBy(0, 550);
  });
  await new Promise(r => setTimeout(r, 1000));
  const bottomPath = path.join(outDir, 'academic_redesign_bottom.png');
  await page.screenshot({ path: bottomPath });
  console.log(`Saved bottom strip screenshot to ${bottomPath}`);

  // Test mobile viewport (390px)
  await page.setViewport({ width: 390, height: 844 });
  await page.evaluate(() => {
    const el = document.evaluate(
      "//h2[contains(text(), 'Explore Industry-Relevant')]",
      document,
      null,
      XPathResult.FIRST_ORDERED_NODE_TYPE,
      null
    ).singleNodeValue;
    if (el) {
      el.scrollIntoView({ behavior: 'instant', block: 'start' });
    }
    window.scrollBy(0, -70);
  });
  await new Promise(r => setTimeout(r, 1000));
  const mobilePath = path.join(outDir, 'academic_redesign_mobile.png');
  await page.screenshot({ path: mobilePath });
  console.log(`Saved mobile screenshot to ${mobilePath}`);

  await browser.close();
  console.log('All screenshots captured successfully!');
})();
