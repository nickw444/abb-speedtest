const puppeteer = require('puppeteer');

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

  console.log("Starting speed test");
  await speedtestFrame.click('button[aria-label="start your speedtest"]');
  console.log("Speed test started");
  await speedtestFrame.waitForSelector('.share-assembly', {
    // Two minutes timeout on the test.
    timeout: 60 * 1000 * 2
  });
  console.log("Speed test finished. Allowing results to flush for 10s.");

  // Allow to flush metrics to ABB
  await page.waitForTimeout(10000);
}

async function main() {
  const browser = await puppeteer.launch({
    headless: true,
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
