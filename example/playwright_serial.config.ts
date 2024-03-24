import { defineConfig, devices } from "@playwright/test";

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// require('dotenv').config();

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: "./tests/serial",
  /* Run tests in files in parallel */
  fullyParallel: false,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 2,
  /* Always serial */
  workers: 1,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [["html", { open: "never" }]],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    // baseURL: 'http://127.0.0.1:3000',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: "on-first-retry",
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"], baseURL: "http://127.0.0.1:3001" },
    },

    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"], baseURL: "http://127.0.0.1:3001" },
    },

    {
      name: "webkit",
      use: { ...devices["Desktop Safari"], baseURL: "http://127.0.0.1:3001" },
    },

    {
      name: "chromium-google",
      use: { ...devices["Desktop Chrome"], baseURL: "http://127.0.0.1:3002" },
    },

    {
      name: "firefox-google",
      use: { ...devices["Desktop Firefox"], baseURL: "http://127.0.0.1:3002" },
    },

    {
      name: "webkit-google",
      use: { ...devices["Desktop Safari"], baseURL: "http://127.0.0.1:3002" },
    },

    /* Test against mobile viewports. */
    {
      name: "mobile-chromium",
      use: { ...devices["Pixel 5"], baseURL: "http://127.0.0.1:3001" },
    },
    {
      name: "mobile-safari",
      use: { ...devices["iPhone 12"], baseURL: "http://127.0.0.1:3001" },
    },

    {
      name: "mobile-chromium-google",
      use: { ...devices["Pixel 5"], baseURL: "http://127.0.0.1:3002" },
    },

    {
      name: "mobile-safari-google",
      use: { ...devices["iPhone 12"], baseURL: "http://127.0.0.1:3002" },
    },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Run your local dev server before starting the tests */
  webServer: [
    {
      env: {
        PORT: "3001",
      },
      command: "npm run serve",
      url: "http://127.0.0.1:3001",
      reuseExistingServer: false,
    },
    {
      env: {
        PORT: "3002",
      },
      command: "npm run serve-google",
      url: "http://127.0.0.1:3002",
      reuseExistingServer: false,
    },
    // {
    //   env: {
    //     PORT: "3003",
    //   },
    //   command: "npm run serve",
    //   url: "http://127.0.0.1:3003",
    //   reuseExistingServer: false,
    // },
  ],
});
