import { test } from '@playwright/test';

test.describe('Generate screenshots using Playwright', () => {

  test('Device screenshot km', async ({ page }) => {
    let name = test.info().project.name;
    if (name !== 'feature-graphic') {
      name += " km"
    }
    await page.goto('http://localhost:63342/crtools/static/');
    await page.screenshot({path: '../static/img/PlayStore/' + name + '.png'});
  })

  test('Device screenshot miles', async ({ page }) => {
    let name = test.info().project.name;
    if (name !== 'feature-graphic') {
      name += " miles"
      await page.goto('http://localhost:63342/crtools/static/');
      const milesButton = await page.$('#miles');
      await milesButton.evaluate((node) => {node.click()});
      await page.waitForTimeout(500);
      await page.screenshot({path: '../static/img/PlayStore/' + name + '.png'});
    }
  })

})
