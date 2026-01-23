# Playwright
## Generating screenshots
See PlayStore documentation for the screenshot requirements [PlayStore.md](appStores).

See Apple developer documentation for [screenshot sizes](https://developer.apple.com/help/app-store-connect/reference/screenshot-specifications).

[Available devices](https://github.com/microsoft/playwright/blob/main/packages/playwright-core/src/server/deviceDescriptorsSource.json) in Playwright.


### Set up Playwright
Use npm to install [PlayWright](https://playwright.dev/docs/intro) selecting JavaScript and /tests for the testing directory.
Install the Playwright Chromium browser dependency.
Ensure that the server will allow requests from PlayWright, e.g. that PyCharm will allow unsigned requests.
Install ImageMagick (to remove the alpha channel from Apple App Store images)

### Create screenshots
```shell
cd playwright
npx playwright test
mogrify -background white -alpha remove -alpha off ../static/img/AppleAppStore/*.png
```
