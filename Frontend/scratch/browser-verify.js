const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function waitForPort(port, maxRetries = 20) {
  return new Promise((resolve, reject) => {
    let retries = 0;
    const interval = setInterval(() => {
      http.get(`http://127.0.0.1:${port}/json`, (res) => {
        clearInterval(interval);
        resolve();
      }).on('error', () => {
        retries++;
        if (retries >= maxRetries) {
          clearInterval(interval);
          reject(new Error('Timeout waiting for Chrome remote debugging port'));
        }
      });
    }, 500);
  });
}

async function getWsUrl() {
  return new Promise((resolve, reject) => {
    http.get('http://127.0.0.1:9222/json', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const list = JSON.parse(data);
          const page = list.find(p => p.type === 'page');
          if (page && page.webSocketDebuggerUrl) {
            resolve(page.webSocketDebuggerUrl);
          } else {
            reject(new Error('No page found in Chrome CDP'));
          }
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function run() {
  console.log('Spawning Headless Chrome...');
  const chromeProcess = spawn(CHROME_PATH, [
    '--headless=new',
    '--remote-debugging-port=9222',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    '--user-data-dir=' + path.join(__dirname, 'chrome-temp-profile'),
    'about:blank'
  ]);

  try {
    await waitForPort(9222);
    console.log('Chrome remote debugging is ready.');

    const wsUrl = await getWsUrl();
    console.log('Connecting to WebSocket:', wsUrl);

    const ws = new WebSocket(wsUrl);

    let id = 1;
    const callbacks = new Map();

    function send(method, params = {}) {
      return new Promise((resolve) => {
        const msgId = id++;
        callbacks.set(msgId, resolve);
        ws.send(JSON.stringify({ id: msgId, method, params }));
      });
    }

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.id && callbacks.has(data.id)) {
        const cb = callbacks.get(data.id);
        callbacks.delete(data.id);
        cb(data.result);
      }
    };

    await new Promise((resolve) => (ws.onopen = resolve));

    await send('Page.enable');
    await send('Runtime.enable');
    await send('Network.enable');

    const networkRequests = [];
    ws.addEventListener('message', (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.method === 'Network.responseReceived') {
          networkRequests.push({
            url: msg.params.response.url,
            status: msg.params.response.status,
            mimeType: msg.params.response.mimeType,
          });
        }
      } catch {}
    });

    // 1. VERIFY HOMEPAGE (1440x900)
    console.log('\n--- VERIFYING HOMEPAGE AT 1440x900 ---');
    await send('Emulation.setDeviceMetricsOverride', {
      width: 1440,
      height: 900,
      deviceScaleFactor: 1,
      mobile: false,
    });

    await send('Page.navigate', { url: 'http://localhost:3000' });
    await sleep(3000);

    const checkCode = `
      (async () => {
        await document.fonts.ready;
        
        const loadedFonts = [];
        document.fonts.forEach(f => {
          loadedFonts.push({
            family: f.family,
            weight: f.weight,
            style: f.style,
            status: f.status
          });
        });

        const checks = {
          w300: document.fonts.check('300 16px "Zoho Puvi"'),
          w400: document.fonts.check('400 16px "Zoho Puvi"'),
          w500: document.fonts.check('500 16px "Zoho Puvi"'),
          w600: document.fonts.check('600 16px "Zoho Puvi"'),
          w700: document.fonts.check('700 16px "Zoho Puvi"'),
          w800: document.fonts.check('800 16px "Zoho Puvi"'),
        };

        const h1 = document.querySelector('h1');
        const p = document.querySelector('p');
        const btn = document.querySelector('a[href="/courses"]') || document.querySelector('button');
        const navLink = document.querySelector('nav a');

        const computed = {
          h1: h1 ? {
            text: h1.innerText,
            fontFamily: window.getComputedStyle(h1).fontFamily,
            fontWeight: window.getComputedStyle(h1).fontWeight,
            fontSize: window.getComputedStyle(h1).fontSize,
          } : null,
          p: p ? {
            text: p.innerText,
            fontFamily: window.getComputedStyle(p).fontFamily,
            fontWeight: window.getComputedStyle(p).fontWeight,
            fontSize: window.getComputedStyle(p).fontSize,
          } : null,
          button: btn ? {
            text: btn.innerText,
            fontFamily: window.getComputedStyle(btn).fontFamily,
            fontWeight: window.getComputedStyle(btn).fontWeight,
          } : null,
          navLink: navLink ? {
            text: navLink.innerText,
            fontFamily: window.getComputedStyle(navLink).fontFamily,
            fontWeight: window.getComputedStyle(navLink).fontWeight,
          } : null,
        };

        return { loadedFonts, checks, computed, title: document.title };
      })()
    `;

    const evalResult = await send('Runtime.evaluate', {
      expression: checkCode,
      awaitPromise: true,
      returnByValue: true
    });

    console.log('Homepage Font Check Results:');
    console.log(JSON.stringify(evalResult.result.value, null, 2));

    // Save Desktop Screenshot
    const ss1 = await send('Page.captureScreenshot', { format: 'png' });
    if (ss1 && ss1.data) {
      fs.writeFileSync(path.join(__dirname, '..', 'public', 'desktop-homepage-verified.png'), Buffer.from(ss1.data, 'base64'));
      console.log('Desktop Screenshot saved to public/desktop-homepage-verified.png');
    }

    // 2. VERIFY MOBILE VIEWPORT (390x844)
    console.log('\n--- VERIFYING MOBILE VIEWPORT AT 390x844 ---');
    await send('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 2,
      mobile: true,
    });
    await send('Page.navigate', { url: 'http://localhost:3000' });
    await sleep(2000);

    const ssMobile = await send('Page.captureScreenshot', { format: 'png' });
    if (ssMobile && ssMobile.data) {
      fs.writeFileSync(path.join(__dirname, '..', 'public', 'mobile-homepage-verified.png'), Buffer.from(ssMobile.data, 'base64'));
      console.log('Mobile Screenshot saved to public/mobile-homepage-verified.png');
    }

    // 3. FONT NETWORK REQUESTS
    console.log('\n--- FONT NETWORK ASSET AUDIT ---');
    const fontReqs = networkRequests.filter(r => r.url.includes('.woff2') || r.url.includes('font'));
    console.log('Loaded Font HTTP Responses:');
    console.log(JSON.stringify(fontReqs, null, 2));

    ws.close();
  } finally {
    chromeProcess.kill();
    console.log('\nHeadless Chrome process closed.');
  }
}

run().catch(err => {
  console.error('Test run failed:', err);
  process.exit(1);
});
