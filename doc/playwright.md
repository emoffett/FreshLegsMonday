# Playwright
## Generating screenshots
See PlayStore documentation for the screenshot requirements [PlayStore.md](appStores).

See Apple developer documentation for [screenshot sizes](https://developer.apple.com/help/app-store-connect/reference/screenshot-specifications).

[Available devices](https://github.com/microsoft/playwright/blob/main/packages/playwright-core/src/server/deviceDescriptorsSource.json) in Playwright.


### Set up Playwright
Use npm to install [PlayWright](https://playwright.dev/docs/intro) selecting JavaScript and /tests for the testing directory.
Install the Playwright Chromium browser dependency.

### Create screenshots
```commandline
cd playwright
npx playwright test
```
