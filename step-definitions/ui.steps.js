const { Given, When, Then } = require('@wdio/cucumber-framework');
const { expect } = require('@wdio/globals');
const sel = require('../support/selectors');

const BASE_URL = 'https://qa-practice.razvanvancea.ro/auth_ecommerce.html';

const VALID_EMAIL = 'admin@admin.com';
const VALID_PASSWORD = 'admin123';

// Shipping data used in step3 & step4
const SHIPPING = {
  phone: '0812345678',
  street: '123 Main Street',
  city: 'Bangkok',
  country: 'Thailand'
};

// ─── Background ──────────────────────────────────────────────────────────────

Given('I navigate to the shop login page', async () => {
  await browser.url(BASE_URL);
  await $(sel.emailInput).waitForDisplayed({ timeout: 10000 });
});

// ─── Step 1: Login ────────────────────────────────────────────────────────────

When('I login with username {string} and password {string}', async (email, password) => {
  await $(sel.emailInput).setValue(email);
  await $(sel.passwordInput).setValue(password);
  await $(sel.loginBtn).click();
  // Wait for page to respond (either products or error)
  await browser.waitUntil(
    async () => {
      const prooood = await $('#prooood');
      const msg = await $(sel.messageBox);
      return (await prooood.isDisplayed()) || (await msg.isDisplayed());
    },
    { timeout: 10000 }
  );
  // Clear all cart rows and reset total via JS
  await browser.execute(() => {
    const cartItems = document.querySelector('.cart-items');
    if (cartItems) {
      while (cartItems.firstChild) cartItems.removeChild(cartItems.firstChild);
    }
    const totalEl = document.querySelector('.cart-total-price');
    if (totalEl) totalEl.textContent = '$0';
  });
});

Then('I should see the products page', async () => {
  // On success, loginSection is removed and #prooood becomes visible
  await browser.waitUntil(
    async () => {
      const el = await $('#prooood');
      return (await el.isDisplayed());
    },
    { timeout: 10000, timeoutMsg: 'Products page did not appear after login' }
  );
  expect(await $('#prooood')).toBeDisplayed();
  // Clear cart by clicking remove button for each item
  const cartRows = await $$(sel.cartRows);
  for (const row of cartRows) {
    try {
      const removeBtn = await row.$('.btn-danger');
      if (await removeBtn.isDisplayed()) {
        await removeBtn.click();
        await browser.pause(200);
      }
    } catch (e) {
      // Ignore if no remove button
    }
  }
  // Refresh to ensure clean state
  await browser.refresh();
  await $(sel.emailInput).waitForDisplayed({ timeout: 10000 });
});

Then('I should see a login error message', async () => {
  const msg = await $(sel.messageBox);
  await msg.waitForDisplayed({ timeout: 5000 });
  const classes = await msg.getAttribute('class');
  expect(classes).toContain('alert-danger');
  const text = await msg.getText();
  expect(text).toContain('Bad credentials');
});

// ─── Step 2: Select Items ─────────────────────────────────────────────────────

When('I add {int} units of {string}', async (qty, productName) => {
  // Wait for products to load (dynamic via fetch)
  await browser.waitUntil(
    async () => (await $$(sel.productCard)).length > 0,
    { timeout: 15000, timeoutMsg: `Products did not load` }
  );

  // Search across pages until product is found
  let found = false;
  let attempts = 0;
  const maxPages = 20;

  while (!found && attempts < maxPages) {
    const cards = await $$(sel.productCard);
    for (const card of cards) {
      const titleEl = await card.$(sel.productTitle);
      const title = await titleEl.getText();
      if (title.includes(productName)) {
        const priceEl = await card.$(sel.productPrice);
        const priceText = await priceEl.getText();
        const price = parseFloat(priceText.replace(/[^0-9.]/g, ''));

        // Each click adds 1 item; click qty times
        const addBtn = await card.$(sel.addToCartBtn);
        for (let i = 0; i < qty; i++) {
          await addBtn.click();
          // After first click, item is in cart — subsequent clicks show alert "already added"
          // So we set quantity via the cart input instead
          if (i === 0 && qty > 1) {
            // Find the cart row for this item and set quantity
            await browser.waitUntil(
              async () => (await $$(sel.cartRows)).length > 0,
              { timeout: 5000 }
            );
            const cartRows = await $$(sel.cartRows);
            for (const row of cartRows) {
              const rowTitle = await row.$(sel.cartItemTitle);
              if ((await rowTitle.getText()).includes(productName)) {
                const qtyInput = await row.$(sel.cartQuantityInput);
                await qtyInput.setValue('');
                await qtyInput.setValue(String(qty));
                // Trigger change event so updateCartTotal() fires
                await browser.execute((el, q) => {
                  el.value = q;
                  el.dispatchEvent(new Event('change'));
                }, qtyInput, String(qty));
                break;
              }
            }
            break;
          }
        }

        global.scenarioContext[productName] = { price, qty };
        found = true;
        break;
      }
    }

    if (!found) {
      // Go to next page
      const nextBtn = await $('button.pagination-btn:last-child');
      if (await nextBtn.isEnabled()) {
        await nextBtn.click();
        await browser.waitUntil(
          async () => (await $$(sel.productCard)).length > 0,
          { timeout: 10000 }
        );
        attempts++;
      } else {
        break;
      }
    }
  }

  if (!found) throw new Error(`Product "${productName}" not found`);
});

Then('the total cost should equal the sum of item prices times quantities', async () => {
  // Read price and qty directly from the cart rows to avoid stale scenarioContext
  const cartRows = await $$(sel.cartRows);
  let expected = 0;
  for (const row of cartRows) {
    const priceEl = await row.$('.cart-price');
    const qtyInput = await row.$(sel.cartQuantityInput);
    if (await priceEl.isExisting() && await qtyInput.isExisting()) {
      const priceText = await priceEl.getText();
      const price = parseFloat(priceText.replace(/[^0-9.]/g, ''));
      const qty = parseInt(await qtyInput.getValue(), 10);
      expected += price * qty;
    }
  }

  const totalEl = await $(sel.cartTotalPrice);
  await totalEl.waitForDisplayed({ timeout: 5000 });
  const totalText = await totalEl.getText();
  const actual = parseFloat(totalText.replace(/[^0-9.]/g, ''));

  expect(actual).toBeCloseTo(expected, 1);
});

When('I click Proceed to Checkout', async () => {
  const btn = await $(sel.proceedBtn);
  await btn.waitForDisplayed({ timeout: 5000 });
  await btn.click();
});

Then('I should see the shopping details form', async () => {
  await $(sel.shippingSection).waitForDisplayed({ timeout: 10000 });
  expect(await $(sel.shippingSection)).toBeDisplayed();
});

// ─── Step 3: Shopping Details ─────────────────────────────────────────────────

When('I fill in all required shipping fields', async () => {
  await $(sel.shippingSection).waitForDisplayed({ timeout: 10000 });
  await $(sel.phoneInput).setValue(SHIPPING.phone);
  await $(sel.streetInput).setValue(SHIPPING.street);
  await $(sel.cityInput).setValue(SHIPPING.city);
  await $(sel.countrySelect).selectByVisibleText(SHIPPING.country);
  global.scenarioContext.shipping = SHIPPING;
});

Then('I should be able to submit the order successfully', async () => {
  await $(sel.submitOrderBtn).click();
  const msg = await $(sel.messageBox);
  await msg.waitForDisplayed({ timeout: 10000 });
  const text = await msg.getText();
  expect(text).toContain('Congrats');
});

When('I submit the order without filling required fields', async () => {
  await $(sel.shippingSection).waitForDisplayed({ timeout: 10000 });
  // Leave all fields empty and click submit
  await $(sel.submitOrderBtn).click();
});

Then('the order submission should be prevented', async () => {
  // submitOrder() only shows success when all fields are filled
  // When fields are empty, it turns country dropdown red but does NOT show #message with Congrats
  const msg = await $(sel.messageBox);
  const isVisible = await msg.isDisplayed().catch(() => false);
  if (isVisible) {
    const text = await msg.getText();
    expect(text).not.toContain('Congrats');
  }
  // Shipping form should still be present (not removed)
  expect(await $(sel.shippingSection)).toBeDisplayed();
});

// ─── Step 4: Order Confirmation Validation ────────────────────────────────

When('I submit the order successfully', async () => {
  await $(sel.submitOrderBtn).click();

  const msg = await $(sel.messageBox);
  await msg.waitForDisplayed({ timeout: 10000 });
});
Then(
  'the order confirmation message should be displayed correctly',
  async () => {

    const s = global.scenarioContext.shipping || SHIPPING;

    const msg = await $(sel.messageBox);

    await msg.waitForDisplayed({ timeout: 5000 });

    const text = await msg.getText();

    // Validate generic confirmation message
    expect(text).toContain('Congrats!');
    expect(text).toContain('has been registered');
    expect(text).toContain('will be shipped to');

    // Validate shipping address
    const expectedAddress =
      `${s.street}, ${s.city} - ${s.country}`;

    expect(text).toContain(expectedAddress);
  }
);

Then(
  'the displayed address should match {string} format',
  async (_format) => {

    const msg = await $(sel.messageBox);

    await msg.waitForDisplayed({ timeout: 5000 });

    const text = await msg.getText();

    // Extract address from message
    const extractedAddress = text
      .split('will be shipped to ')[1]
      .replace('.', '')
      .trim();

    // Validate format:
    // Street, City - Country
    const addressPattern = /^.+,\s.+\s-\s.+$/;

    expect(extractedAddress).toMatch(addressPattern);
  }
);