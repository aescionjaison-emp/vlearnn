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

  const widths = [320, 360, 375, 414, 480, 640, 768, 820, 1024, 1280, 1440, 1920];
  const pages = ['/', '/courses', '/about', '/blogs', '/contact'];

  console.log('--- TESTING HORIZONTAL OVERFLOW ACROSS VIEWPORTS ---');

  for (const pagePath of pages) {
    const page = await browser.newPage();
    for (const w of widths) {
      await page.setViewport({ width: w, height: 800 });
      await page.goto(`http://127.0.0.1:3000${pagePath}`, { waitUntil: 'networkidle2', timeout: 20000 });
      await new Promise(r => setTimeout(r, 400));

      const result = await page.evaluate(() => {
        const docWidth = document.documentElement.scrollWidth;
        const bodyWidth = document.body.scrollWidth;
        const winWidth = window.innerWidth;
        const hasOverflow = docWidth > winWidth || bodyWidth > winWidth;

        let overflowingElements = [];
        if (hasOverflow) {
          const all = document.querySelectorAll('*');
          for (const el of all) {
            const rect = el.getBoundingClientRect();
            if (rect.right > winWidth + 1 || rect.left < -1) {
              overflowingElements.push({
                tag: el.tagName,
                class: (el.className || '').toString().slice(0, 80),
                rect: { left: rect.left, right: rect.right, width: rect.width }
              });
              if (overflowingElements.length >= 5) break;
            }
          }
        }

        return {
          winWidth,
          docWidth,
          bodyWidth,
          hasOverflow,
          overflowingElements
        };
      });

      if (result.hasOverflow) {
        console.log(`[OVERFLOW DETECTED] Page: ${pagePath} @ ${w}px -> docWidth: ${result.docWidth}, winWidth: ${result.winWidth}`);
        console.log('Elements causing overflow:', JSON.stringify(result.overflowingElements, null, 2));
      } else {
        console.log(`[OK] Page: ${pagePath} @ ${w}px`);
      }
    }
    await page.close();
  }

  await browser.close();
  console.log('--- TEST FINISHED ---');
})();
