const { Before, After, BeforeAll, AfterAll } = require('@wdio/cucumber-framework');

// Store shared state across steps within a scenario
global.scenarioContext = {};

Before(async function () {
  global.scenarioContext = {};
  // Navigate to login page — this resets all in-memory JS state including cart
  await browser.url('https://qa-practice.razvanvancea.ro/auth_ecommerce.html');
  await browser.waitUntil(
    async () => (await $('#email')).isDisplayed(),
    { timeout: 10000 }
  );
  // Also clear cart DOM in case it persists
  await browser.execute(() => {
    const cartItems = document.querySelector('.cart-items');
    if (cartItems) cartItems.innerHTML = '';

    //localStorage.clear();
    //sessionStorage.clear();
    //browser.deleteCookies();

    const totalEl = document.querySelector('.cart-total-price');
    if (totalEl) totalEl.innerHTML = '$0';
  });
});

After(async function (scenario) {
  if (scenario.result.status === 'FAILED') {
    await browser.takeScreenshot();
  }
});
