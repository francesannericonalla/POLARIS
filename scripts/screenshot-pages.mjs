import { chromium } from 'playwright';
import { mkdir } from 'fs/promises';
import path from 'path';

const BASE = 'http://localhost:3000';
const OUT = 'd:/polaris-app/docs/screenshots';

const QAO_EMAIL = 'hanz@cit.edu';
const QAO_PASSWORD = '123456789';
const OFFICE_EMAIL = 'francesanne.riconalla@cit.edu';
const OFFICE_PASSWORD = '123456789';
const ADMIN_EMAIL = 'superadmin@cit.edu';
const ADMIN_PASSWORD = '123456789';

const CHROMIUM = 'C:/Users/Frances/AppData/Local/ms-playwright/chromium-1254/chrome-win64/chrome.exe';

await mkdir(OUT, { recursive: true });

const browser = await chromium.launch({ executablePath: CHROMIUM, headless: true });

async function shot(page, name) {
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(OUT, `${name}.png`), fullPage: true });
  console.log(`  ✓ ${name}.png  [${page.url()}]`);
}

async function loginAs(browser, email, password) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/login`);
  await page.waitForSelector('input[name="email"]');
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForTimeout(4000);
  console.log(`  logged in as ${email} → ${page.url()}`);
  return { ctx, page };
}

// ── 1. Login page ─────────────────────────────────────────────────────────────
console.log('01-login');
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/login`);
  await page.waitForSelector('input[name="email"]');
  await shot(page, '01-login');
  await ctx.close();
}

// ── 2. Signup page ────────────────────────────────────────────────────────────
console.log('02-signup');
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(`${BASE}/signup`);
  await page.waitForTimeout(2000);
  await shot(page, '02-signup');
  await ctx.close();
}

// ── QAO session ───────────────────────────────────────────────────────────────
console.log('QAO session...');
{
  const { ctx, page } = await loginAs(browser, QAO_EMAIL, QAO_PASSWORD);
  try {
    // 3. QAO university-wide dashboard
    await page.goto(`${BASE}/dashboard`);
    await page.waitForTimeout(3000);
    await shot(page, '03-qao-dashboard');

    // 4. QAO individual office dashboard — click View on first office row
    const viewLink = page.locator('a[href*="/dashboard/office/"]').first();
    if (await viewLink.count()) {
      const href = await viewLink.getAttribute('href');
      await page.goto(`${BASE}${href}`);
      await page.waitForTimeout(3000);
      await shot(page, '04-qao-office-dashboard');
    }

    // 5. Repository (unit level) — find link from office dashboard
    const repoLink = page.locator('a[href*="/repository/"]').first();
    if (await repoLink.count()) {
      const href = await repoLink.getAttribute('href');
      await page.goto(`${BASE}${href}`);
      await page.waitForTimeout(3000);
      await shot(page, '05-repository-unit');

      // 6. Folder inside repository
      const folderLink = page.locator('a[href*="/repository/"]').nth(1);
      if (await folderLink.count()) {
        const fhref = await folderLink.getAttribute('href');
        const parts = fhref.replace('/repository/', '').split('/');
        if (parts.length >= 2 && parts[1]) {
          await page.goto(`${BASE}${fhref}`);
          await page.waitForTimeout(3000);
          await shot(page, '06-repository-folder');
        }
      }
    }
  } catch (e) {
    console.error('QAO error:', e.message);
    await shot(page, 'qao-error');
  }
  await ctx.close();
}

// ── Office User session ───────────────────────────────────────────────────────
console.log('Office user session...');
{
  const { ctx, page } = await loginAs(browser, OFFICE_EMAIL, OFFICE_PASSWORD);
  try {
    // 7. Office user dashboard
    await page.goto(`${BASE}/dashboard`);
    await page.waitForTimeout(3000);
    await shot(page, '07-office-dashboard');

    // 8. Pending page (navigate directly)
    await page.goto(`${BASE}/pending`);
    await page.waitForTimeout(2000);
    await shot(page, '08-pending');
  } catch (e) {
    console.error('Office user error:', e.message);
    await shot(page, 'office-error');
  }
  await ctx.close();
}

// ── System Admin session ──────────────────────────────────────────────────────
console.log('Admin session...');
{
  const { ctx, page } = await loginAs(browser, ADMIN_EMAIL, ADMIN_PASSWORD);
  try {
    // 9. Admin approvals
    await page.goto(`${BASE}/admin/approvals`);
    await page.waitForTimeout(3000);
    await shot(page, '09-admin-approvals');

    // 10. Admin accounts
    await page.goto(`${BASE}/admin/accounts`);
    await page.waitForTimeout(3000);
    await shot(page, '10-admin-accounts');

    // 11. Audit log
    await page.goto(`${BASE}/admin/audit-log`);
    await page.waitForTimeout(3000);
    await shot(page, '11-admin-audit-log');
  } catch (e) {
    console.error('Admin error:', e.message);
    await shot(page, 'admin-error');
  }
  await ctx.close();
}

await browser.close();
console.log('\nDone →', OUT);
