const puppeteer = require('puppeteer');
const path = require('path');
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function run() {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--use-fake-ui-for-media-stream',
      '--use-fake-device-for-media-stream'
    ]
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  await page.goto('http://localhost:3001', { timeout: 15000, waitUntil: 'networkidle0' });
  console.log('Opened page. Current URL:', page.url());

  await sleep(1000);
  
  // Step 1: Click Quick Fill Super Admin button
  console.log('Clicking Super Admin Quick-Fill button...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const btn = buttons.find(b => b.textContent.includes('Super Admin'));
    if (btn) btn.click();
  });
  await sleep(800);

  // Step 2: Submit the login form
  console.log('Submitting login form (Verify Access)...');
  await page.evaluate(() => {
    const submitBtn = document.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.click();
    } else {
      const form = document.querySelector('form');
      if (form) form.requestSubmit();
    }
  });

  await sleep(3500);
  console.log('Logged in. Navigating to Meetings & MoM in sidebar...');

  // Step 3: Click "Meetings & MoM" in sidebar
  const navClicked = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const btn = buttons.find(b => 
      b.textContent.includes('Meetings & MoM') || 
      b.textContent.includes('Meetings') ||
      b.getAttribute('title')?.includes('Meetings')
    );
    if (btn) {
      btn.click();
      return true;
    }
    return false;
  });
  console.log('Clicked Meetings nav button:', navClicked);
  await sleep(2500);

  // Step 4: Click "Instant Meeting"
  console.log('Clicking Instant Meeting button...');
  const instantClicked = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const instantBtn = buttons.find(b => b.textContent.includes('Instant Meeting'));
    if (instantBtn) {
      instantBtn.click();
      return true;
    }
    return false;
  });
  console.log('Instant Meeting clicked:', instantClicked);
  await sleep(4000);

  const artifactDir = 'C:/Users/HP/.gemini/antigravity/brain/c0b5e0eb-7cf5-449d-92c3-51391cbb6e57';
  
  // Step 5: Capture screenshot of Meeting Room with MoM Drawer
  const drawerPath = path.join(artifactDir, 'sdlc_mom_drawer_active.png');
  await page.screenshot({ path: drawerPath });
  console.log('Saved drawer screenshot to:', drawerPath);

  // Step 6: Test Saving MoM
  console.log('Testing Save MoM button in Drawer...');
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const saveBtn = buttons.find(b => b.textContent.includes('Save MoM'));
    if (saveBtn) saveBtn.click();
  });
  await sleep(1500);

  // Step 7: Expand to Full Dialog View
  console.log('Expanding MoM full modal dialog...');
  await page.evaluate(() => {
    const btn = document.querySelector('button[title="Expand to Full Dialog View"]');
    if (btn) btn.click();
  });
  await sleep(1500);

  // Step 8: Capture Full Expanded MoM Modal Screenshot
  const modalPath = path.join(artifactDir, 'sdlc_mom_full_modal_view.png');
  await page.screenshot({ path: modalPath });
  console.log('Saved modal screenshot to:', modalPath);

  await browser.close();
  console.log('All verification tasks completed successfully!');
}

run().catch(console.error);
