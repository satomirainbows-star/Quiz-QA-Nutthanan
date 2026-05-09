const { Before, After } = require('@wdio/cucumber-framework');
const fs = require('fs');
const path = require('path');

// Shared state across steps
global.scenarioContext = {};

// Screenshot directory
const screenshotDir = path.join(
  __dirname,
  '..',
  'reports',
  'screenshots'
);

// Create screenshot folder automatically
if (!fs.existsSync(screenshotDir)) {
  fs.mkdirSync(screenshotDir, { recursive: true });
}

Before({ tags: '@ui' }, async function () {

  // Reset shared scenario state
  global.scenarioContext = {};

  // Open application
  await browser.url(
    'https://qa-practice.razvanvancea.ro/auth_ecommerce.html'
  );

  // Wait until page fully loaded
  await browser.waitUntil(
    async () => {
      return await browser.execute(() => {
        return document.readyState === 'complete';
      });
    },
    {
      timeout: 20000,
      timeoutMsg: 'Initial page load did not complete'
    }
  );

  // Wait for login form to be displayed
  const emailInput = await $('#email');

  await emailInput.waitForDisplayed({
    timeout: 20000
  });

  // Clear browser storage safely
  await browser.execute(() => {

    localStorage.clear();
    sessionStorage.clear();

  });

  // Refresh browser after clearing storage
  await browser.refresh();

  // Wait until page fully loaded again
  await browser.waitUntil(
    async () => {
      return await browser.execute(() => {
        return document.readyState === 'complete';
      });
    },
    {
      timeout: 20000,
      timeoutMsg: 'Page did not finish loading after refresh'
    }
  );

  // Re-find element after refresh
  const refreshedEmailInput = await $('#email');

  // Wait for login form again
  await refreshedEmailInput.waitForDisplayed({
    timeout: 20000
  });

});

After({ tags: '@ui' }, async function (scenario) {

  try {

    // Capture screenshot when scenario fails
    if (scenario.result.status === 'FAILED') {

      const timestamp = Date.now();

      await browser.saveScreenshot(
        path.join(
          screenshotDir,
          `error-${timestamp}.png`
        )
      );
    }

  } finally {

    // Always cleanup browser state
    await browser.deleteCookies();

  }

});