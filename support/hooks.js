const { Before, After } = require('@wdio/cucumber-framework');

// Shared state across steps
global.scenarioContext = {};

Before({ tags: '@ui' }, async function () {

  global.scenarioContext = {};

  // Open application
  await browser.url(
    'https://qa-practice.razvanvancea.ro/auth_ecommerce.html'
  );

  // Wait for page ready
  const emailInput = await $('#email');

  await emailInput.waitForDisplayed({
    timeout: 20000
  });

  // Small stabilization delay for CI runners
  await browser.pause(1000);

  // Reset cart state safely
  await browser.execute(() => {

    const cartItems = document.querySelector('.cart-items');

    if (cartItems) {
      cartItems.innerHTML = '';
    }

    const totalEl = document.querySelector('.cart-total-price');

    if (totalEl) {
      totalEl.innerHTML = '$0';
    }

    localStorage.clear();
    sessionStorage.clear();

  });

});

After({ tags: '@ui' }, async function (scenario) {

  if (scenario.result.status === 'FAILED') {

    const timestamp = Date.now();

    await browser.saveScreenshot(
      `./reports/error-${timestamp}.png`
    );
  }

});