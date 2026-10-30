const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

if (!process.env.PATH.includes('System32')) {
  process.env.PATH = `${process.env.PATH};C:\\Windows\\System32`;
}

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACTS_DIR = path.join(__dirname, '..', '..', '..', '..', 'USER', '.gemini', 'antigravity-ide', 'brain', '3d25ebe6-ee88-46b4-8eac-05b20efa0b3c', 'screenshots');
const PUBLIC_DIR = path.join(__dirname, '..', 'public', 'screenshots');

if (!fs.existsSync(ARTIFACTS_DIR)) {
  fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });
}
if (!fs.existsSync(PUBLIC_DIR)) {
  fs.mkdirSync(PUBLIC_DIR, { recursive: true });
}

const saveScreenshots = async (page, filename, fullPage = false) => {
  const p1 = path.join(ARTIFACTS_DIR, filename);
  const p2 = path.join(PUBLIC_DIR, filename);
  await page.screenshot({ path: p1, fullPage });
  fs.copyFileSync(p1, p2);
  console.log(`Saved screenshot: ${filename}`);
};

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function runVerification() {
  console.log('Launching Chrome with puppeteer-core...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });

  const page = await browser.newPage();
  page.setDefaultNavigationTimeout(45000);

  // Track font network requests
  const fontRequests = [];
  page.on('response', (res) => {
    const url = res.url();
    if (url.includes('.woff2') || url.includes('fonts')) {
      fontRequests.push({
        url,
        status: res.status(),
        ok: res.ok(),
      });
    }
  });

  console.log('\n======================================================');
  console.log('1. HOMEPAGE AUDIT (1440x900)');
  console.log('======================================================');
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://127.0.0.1:3000', { waitUntil: 'load' });
  await sleep(1500);

  // Evaluate Font loading & document.fonts.check
  const fontAudit = await page.evaluate(async () => {
    await document.fonts.ready;

    const checks = {
      'Zoho Puvi Regular 400': document.fonts.check('400 16px "Zoho Puvi"'),
      'Zoho Puvi Medium 500': document.fonts.check('500 16px "Zoho Puvi"'),
      'Zoho Puvi Semibold 600': document.fonts.check('600 16px "Zoho Puvi"'),
      'Zoho Puvi Bold 700': document.fonts.check('700 16px "Zoho Puvi"'),
      'Zoho Puvi Extrabold 800': document.fonts.check('800 16px "Zoho Puvi"'),
      'Zoho Puvi Light 300': document.fonts.check('300 16px "Zoho Puvi"'),
    };

    const loadedFontsList = [];
    document.fonts.forEach((font) => {
      loadedFontsList.push({
        family: font.family,
        weight: font.weight,
        status: font.status,
      });
    });

    const h1 = document.querySelector('h1');
    const h2 = document.querySelector('h2');
    const p = document.querySelector('p');
    const btn = document.querySelector('a[href="/courses"]') || document.querySelector('button');
    const navLink = document.querySelector('nav a');

    const getElemComputed = (el) => {
      if (!el) return null;
      const s = window.getComputedStyle(el);
      return {
        tag: el.tagName,
        text: el.innerText.trim().slice(0, 40),
        fontFamily: s.fontFamily,
        fontWeight: s.fontWeight,
        fontSize: s.fontSize,
        lineHeight: s.lineHeight,
        color: s.color,
      };
    };

    return {
      checks,
      loadedFontsCount: loadedFontsList.length,
      sampleLoadedFonts: loadedFontsList.slice(0, 8),
      computed: {
        h1: getElemComputed(h1),
        h2: getElemComputed(h2),
        p: getElemComputed(p),
        button: getElemComputed(btn),
        navLink: getElemComputed(navLink),
      },
    };
  });

  console.log('Font document.fonts.check validation:');
  console.table(fontAudit.checks);
  console.log('\nComputed Styles across UI elements:');
  console.log(JSON.stringify(fontAudit.computed, null, 2));

  await saveScreenshots(page, '01_homepage_desktop_1440.png', true);

  console.log('\n======================================================');
  console.log('2. RESPONSIVE VIEWPORT AUDIT');
  console.log('======================================================');
  const viewports = [
    { name: '02_laptop_1280', width: 1280, height: 800 },
    { name: '03_tablet_768', width: 768, height: 1024 },
    { name: '04_mobile_390', width: 390, height: 844 },
    { name: '05_small_mobile_360', width: 360, height: 800 },
  ];

  for (const vp of viewports) {
    await page.setViewport({ width: vp.width, height: vp.height });
    await page.goto('http://127.0.0.1:3000', { waitUntil: 'load' });
    await sleep(800);
    const hasHorizontalOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > window.innerWidth;
    });
    console.log(`Viewport ${vp.name} (${vp.width}x${vp.height}): Overflow? ${hasHorizontalOverflow ? 'FAIL (Horizontal Overflow Detected)' : 'PASS (No Overflow)'}`);
    await saveScreenshots(page, `${vp.name}.png`, false);
  }

  console.log('\n======================================================');
  console.log('3. COURSES PAGE AUDIT');
  console.log('======================================================');
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://127.0.0.1:3000/courses', { waitUntil: 'load' });
  await sleep(800);
  await saveScreenshots(page, '06_courses_desktop.png', true);

  console.log('\n======================================================');
  console.log('4. ABOUT PAGE AUDIT');
  console.log('======================================================');
  await page.goto('http://127.0.0.1:3000/about', { waitUntil: 'load' });
  await sleep(800);
  await saveScreenshots(page, '07_about_desktop.png', true);

  console.log('\n======================================================');
  console.log('5. CONTACT PAGE AUDIT');
  console.log('======================================================');
  await page.goto('http://127.0.0.1:3000/contact', { waitUntil: 'load' });
  await sleep(800);
  await saveScreenshots(page, '08_contact_desktop.png', true);

  console.log('\n======================================================');
  console.log('6. ADMIN LOGIN AUDIT');
  console.log('======================================================');
  await page.goto('http://127.0.0.1:3000/admin/login', { waitUntil: 'load' });
  await sleep(800);
  await saveScreenshots(page, '09_admin_login.png', false);

  console.log('\n======================================================');
  console.log('7. NETWORK FONT ASSET AUDIT');
  console.log('======================================================');
  console.table(fontRequests);

  await browser.close();
  console.log('\nVerification suite completed successfully!');
}

runVerification().catch((err) => {
  console.error('Verification error:', err);
  process.exit(1);
});
