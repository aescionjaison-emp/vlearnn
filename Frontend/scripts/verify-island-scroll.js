const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const PUBLIC_DIR = path.join(__dirname, '..', 'public', 'screenshots');

if (!fs.existsSync(PUBLIC_DIR)) fs.mkdirSync(PUBLIC_DIR, { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function run() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
  });

  const page = await browser.newPage();

  // 1. Desktop 1440x900 Top State (Unscrolled)
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://127.0.0.1:3000', { waitUntil: 'networkidle2' });
  await sleep(1000);
  await page.screenshot({ path: path.join(PUBLIC_DIR, 'island_01_top_unscrolled.png') });
  console.log('Saved island_01_top_unscrolled.png');

  // 2. Desktop 1440x900 Scrolled State (Apple Dynamic Island)
  await page.evaluate(() => window.scrollTo({ top: 450, behavior: 'smooth' }));
  await sleep(1200);
  await page.screenshot({ path: path.join(PUBLIC_DIR, 'island_02_scrolled_dynamic_island.png') });
  console.log('Saved island_02_scrolled_dynamic_island.png');

  // 3. Desktop 1920x1080 Scrolled State (Widescreen Dynamic Island)
  await page.setViewport({ width: 1920, height: 1080 });
  await page.evaluate(() => window.scrollTo({ top: 500, behavior: 'smooth' }));
  await sleep(1000);
  await page.screenshot({ path: path.join(PUBLIC_DIR, 'island_03_widescreen_island.png') });
  console.log('Saved island_03_widescreen_island.png');

  // 4. Mobile 390x844 Scrolled State
  await page.setViewport({ width: 390, height: 844 });
  await page.goto('http://127.0.0.1:3000', { waitUntil: 'networkidle2' });
  await page.evaluate(() => window.scrollTo({ top: 350, behavior: 'smooth' }));
  await sleep(1000);
  await page.screenshot({ path: path.join(PUBLIC_DIR, 'island_04_mobile_island.png') });
  console.log('Saved island_04_mobile_island.png');

  await browser.close();
}

run().catch(console.error);
