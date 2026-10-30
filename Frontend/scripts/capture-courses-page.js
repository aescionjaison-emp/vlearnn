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

  // 1. Capture courses page
  const pageCourses = await browser.newPage();
  await pageCourses.setViewport({ width: 1440, height: 1000 });
  console.log('Navigating to http://127.0.0.1:3000/courses...');
  await pageCourses.goto('http://127.0.0.1:3000/courses', { waitUntil: 'networkidle2', timeout: 30000 });
  await new Promise(r => setTimeout(r, 1500));

  const coursesTopPath = path.join(outDir, 'courses_page_top.png');
  await pageCourses.screenshot({ path: coursesTopPath });
  console.log(`Saved courses page top screenshot to ${coursesTopPath}`);

  // Scroll down to cards on courses page
  await pageCourses.evaluate(() => {
    window.scrollBy(0, 500);
  });
  await new Promise(r => setTimeout(r, 1000));
  const coursesCardsPath = path.join(outDir, 'courses_page_cards.png');
  await pageCourses.screenshot({ path: coursesCardsPath });
  console.log(`Saved courses page cards screenshot to ${coursesCardsPath}`);

  await pageCourses.close();
  await browser.close();
  console.log('All verification captures completed successfully!');
})();
