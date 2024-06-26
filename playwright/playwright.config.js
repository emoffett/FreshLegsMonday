const { defineConfig, devices } = require('@playwright/test');
// Note: test is extended in ./tests/generateScreenshot.spec.js

/**
 * @see https://playwright.dev/docs/test-configuration
 */
module.exports = defineConfig({
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: 'http://localhost:63342/crtools/static/',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'feature-graphic',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1024, height: 500 },
        store: 'PlayStore',
      },
    },
    {
      name: 'phone portrait',
      use: {
        ...devices['Pixel 7'],
        store: 'PlayStore',
      },
    },
    {
      name: 'tablet small portrait',
      use: {
        ...devices['iPad Mini'],
        store: 'PlayStore',
      },
    },
    {
      name: 'tablet small landscape',
      use: {
        ...devices['iPad Mini landscape'],
        store: 'PlayStore',
      },
    },
    {
      name: 'tablet large portrait',
      use: {
        ...devices['iPad Pro 11'],
        store: 'PlayStore',
      },
    },
    {
      name: 'tablet large landscape',
      use: {
        ...devices['iPad Pro 11 landscape'],
        store: 'PlayStore',
      },
    },

    {
      name: 'iPhone 6.7"',
      use: {
        ...devices['iPhone 14 Pro Max'],
        viewport: { width: 430, height: 932 },
        store: 'AppleAppStore',
      },
    },
    {
      name: 'iPhone 6.5"',
      use: {
        ...devices['iPhone 14 Plus'],
        viewport: { width: 428, height: 926 },
        store: 'AppleAppStore',
      },
    },
    {
      name: 'iPhone 5.5"',
      use: {
        ...devices['iPhone 8 Plus'],
        store: 'AppleAppStore',
      },
    },
    {
      name: 'iPad Pro 12.9"',
      use: {
        ...devices['iPad Pro 11'],
        viewport: { width: 1024, height: 1366 },
        store: 'AppleAppStore',
      },
    },
    {
      name: 'iPad Pro 12.9" landscape',
      use: {
        ...devices['iPad Pro 11'],
        viewport: { width: 1366, height: 1024 },
        store: 'AppleAppStore',
      },
    },

    {
      name: 'MS desktop landscape',
      use: {
        ...devices['iPad Pro 11 landscape'],
        store: 'MicrosoftStore',
      },
    },
    {
      name: 'MS mobile portrait',
      use: {
        ...devices['Microsoft Lumia 950'],
        deviceScaleFactor: 2,
        store: 'MicrosoftStore',
      },
    },

  ],
});
