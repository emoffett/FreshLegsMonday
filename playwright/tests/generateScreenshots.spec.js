import { test } from '@playwright/test';

test.describe('Generate screenshots using Playwright', () => {

  test('Create feature-graphic screenshot', async ({ page }) => {
    await page.setViewportSize({width: 1024, height: 500});
    await page.goto('http://localhost:63342/crtools/static/');
    await page.screenshot({path: '../static/img/PlayStore/feature-graphic.png'});
  })

  test('Create chromebook-landscape-km screenshot', async ({ page }) => {
    await page.setViewportSize({width: 3840, height: 2160});
    await page.goto('http://localhost:63342/crtools/static/');
    await page.screenshot({path: '../static/img/PlayStore/chromebook-landscape-km.png'});
  })

  test('Create chromebook-portrait-km screenshot', async ({ page }) => {
    await page.setViewportSize({width: 2160, height: 3840});
    await page.goto('http://localhost:63342/crtools/static/');
    await page.screenshot({path: '../static/img/PlayStore/chromebook-portrait-km.png'});
  })

  test('Create landscape-km screenshot', async ({ page }) => {
    await page.setViewportSize({width: 2048, height: 1536});
    await page.goto('http://localhost:63342/crtools/static/');
    await page.screenshot({path: '../static/img/PlayStore/landscape-km.png'});
  })

  test('Create portrait-km screenshot', async ({ page }) => {
    await page.setViewportSize({width: 1536, height: 2048});
    await page.goto('http://localhost:63342/crtools/static/');
    await page.screenshot({path: '../static/img/PlayStore/portrait-km.png'});
  })

})
