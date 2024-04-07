// Import test and extend the parameters to include "store" to allow screenshots to be put in per-store directories
import { test as base } from '@playwright/test';
const test = base.extend({
  store: ["StoreNotSet", { option: true }],
});
export { test };

test.describe('Generate screenshots using Playwright', () => {
  const url = 'http://localhost:63342/crtools/static/';
  const now = new Date()
  const time = now.getTime();
  const expiry = time/1000 + 60;
  const appPlatformCookie = { name:"app-platform", value:"screenshot", url:url, expires:expiry }  // Used to signal that app store logos, etc., should be hidden

  test('Device screenshot km', async ({ page, context, store }) => {
    let name = test.info().project.name;
    if (name !== 'feature-graphic') {
      name += " km"
    }
    await context.addCookies([appPlatformCookie]);
    await page.goto(url);
    await page.screenshot({ path: '../static/img/' + store + '/' + name + '.png' });
  })

  test('Device screenshot miles', async ({ page, context, store }) => {
    let name = test.info().project.name;
    if (name !== 'feature-graphic') {
      name += " miles"
      await context.addCookies([appPlatformCookie]);
      await page.goto(url);
      const milesButton = await page.$('#miles');
      await milesButton.evaluate((node) => { node.click() });
      await page.waitForTimeout(500);
      await page.screenshot({ path: '../static/img/' + store + '/' + name + '.png' });
    }
  })

})
