import puppeteer from 'puppeteer';
import path from 'path';

const ARTIFACT_DIR = 'C:/Users/HP/.gemini/antigravity/brain/c0b5e0eb-7cf5-449d-92c3-51391cbb6e57';

async function captureMeetingsDashboard() {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1400, height: 900 });

    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });

    // Login as Admin
    await page.waitForSelector('input[type="email"]');
    await page.type('input[type="email"]', 'admin@bankalhabib.com');
    await page.type('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');

    await page.waitForSelector('aside', { timeout: 10000 });

    // Click Meetings & MoM tab
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('aside button'));
      const target = buttons.find(b => b.textContent && b.textContent.includes('Meetings & MoM'));
      if (target) target.click();
    });

    await new Promise(r => setTimeout(r, 2000));
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'sdlc_meetings_dashboard_verified.png') });
    console.log('Saved updated sdlc_meetings_dashboard_verified.png');
  } catch (err) {
    console.error(err);
  } finally {
    await browser.close();
  }
}

captureMeetingsDashboard();
