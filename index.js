const puppeteer = require('puppeteer');

function delay(time) {
  return new Promise(resolv => {
    setTimeout(() => resolv(), time)
  });
}

async function runTest(browser) {
  const page = await browser.newPage();
  await page.goto('http://speed.aussiebroadband.com.au/');

  const frames = await page.frames();
  let speedtestFrame;
  for (const frame of frames) {
    const url = frame.url();
    if (url.startsWith('https://aussiebb.dualstack.speedtestcustom.com')) {
      speedtestFrame = frame;
    }
  }

  if (!speedtestFrame) {
    throw new Error("Speed test frame not found");
  }

  await speedtestFrame.click('button[aria-label="start your speedtest"]');
  await speedtestFrame.waitForSelector('.share-assembly', {
    // One minute timeout on the test.
    timeout: 60 * 1000
  });

  // Allow to flush metrics to ABB
  await page.waitForTimeout(2000);
}

async function main() {
  const browser = await puppeteer.launch({
    headless: false,
    args: [
      '--disable-web-security',
      '--disable-features=IsolateOrigins,site-per-process'
    ]
  });

  try {
    await runTest(browser);
  } catch (e) {
    console.error(e);
  } finally {
    await browser.close();
  }
}

main();
