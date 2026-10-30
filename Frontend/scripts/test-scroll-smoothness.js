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

  console.log('Testing incremental smooth scroll to verify zero-stutter...');

  // Track state transitions
  const stateTransitions = [];

  // Scroll in small 10px increments simulating mouse wheel
  for (let y = 0; y <= 150; y += 15) {
    await page.evaluate((targetY) => window.scrollTo(0, targetY), y);
    await new Promise(r => setTimeout(r, 60));
    const isIsland = await page.evaluate(() => {
      const el = document.querySelector('.dynamic-island-shell');
      return el ? el.classList.contains('rounded-full') : false;
    });
    stateTransitions.push({ y, isIsland });
  }

  console.log('Scroll Transitions:', JSON.stringify(stateTransitions, null, 2));

  // Check how many times it toggled
  let toggles = 0;
  for (let i = 1; i < stateTransitions.length; i++) {
    if (stateTransitions[i].isIsland !== stateTransitions[i - 1].isIsland) toggles++;
  }
  console.log(`Total state toggles during scroll: ${toggles} (Expected: exactly 1, no oscillations!)`);

  await page.screenshot({ path: path.join(__dirname, '..', 'public', 'screenshots', 'smooth_scroll_final_island.png') });
  console.log('Saved smooth_scroll_final_island.png');

  await browser.close();
})();
