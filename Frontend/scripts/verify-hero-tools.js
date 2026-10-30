const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

if (!process.env.PATH.includes('System32')) {
  process.env.PATH = `${process.env.PATH};C:\\Windows\\System32`;
}

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACTS_DIR = path.join(__dirname, '..', '..', '..', '..', 'USER', '.gemini', 'antigravity-ide', 'brain', '3d25ebe6-ee88-46b4-8eac-05b20efa0b3c', 'screenshots');
const PUBLIC_DIR = path.join(__dirname, '..', 'public', 'screenshots');
if (!fs.existsSync(PUBLIC_DIR)) fs.mkdirSync(PUBLIC_DIR, { recursive: true });

const saveImg = async (page, name) => {
  const p = path.join(PUBLIC_DIR, name);
  await page.screenshot({ path: p, fullPage: false });
  console.log(`Saved screenshot to ${p}`);
};

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function run() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });

  const page = await browser.newPage();
  
  // 1. Desktop 1440x900 Single Page Viewport
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://127.0.0.1:3000', { waitUntil: 'networkidle2' });
  await sleep(1000);

  // Check bounds of Hero and Tools
  const metrics = await page.evaluate(() => {
    const hero = document.querySelector('section');
    const heroRect = hero ? hero.getBoundingClientRect() : null;
    const tools = document.querySelector('.animate-tech-marquee');
    const toolsRect = tools ? tools.getBoundingClientRect() : null;
    const hasScrollToExplore = !!document.body.innerText.includes('SCROLL TO EXPLORE');
    return {
      windowHeight: window.innerHeight,
      heroRect: heroRect ? { top: heroRect.top, bottom: heroRect.bottom, height: heroRect.height } : null,
      toolsRect: toolsRect ? { top: toolsRect.top, bottom: toolsRect.bottom, height: toolsRect.height } : null,
      hasScrollToExplore
    };
  });
  console.log('Metrics at 1440x900:', JSON.stringify(metrics, null, 2));

  // Take screenshot of viewport (above the fold)
  await saveImg(page, 'hero_single_page_1440x900.png');

  // Hover over one of the technology items in the slideshow
  const techItems = await page.$$('.animate-tech-marquee > div');
  if (techItems.length > 0) {
    console.log(`Found ${techItems.length} marquee items. Hovering over item 2...`);
    await techItems[1].hover();
    await sleep(600);
    await saveImg(page, 'tools_slideshow_hovered.png');
  }

  // Also check 1920x1080
  await page.setViewport({ width: 1920, height: 1080 });
  await page.goto('http://127.0.0.1:3000', { waitUntil: 'networkidle2' });
  await sleep(800);
  await saveImg(page, 'hero_single_page_1920x1080.png');

  await browser.close();
}

run().catch(console.error);
