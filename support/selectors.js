// Centralised selectors for the e-commerce UI
const selectors = {
  // Login
  emailInput: '#email',
  passwordInput: '#password',
  loginBtn: '#submitLoginBtn',
  messageBox: '#message',

  // Products page
  shopItems: '.shop-items',
  productCard: '.shop-item',
  productTitle: '.shop-item-title',
  productPrice: '.shop-item-price',
  addToCartBtn: '.shop-item-button',

  // Cart
  cartRows: '.cart-items .cart-row',
  cartItemTitle: '.cart-item-title',
  cartQuantityInput: '.cart-quantity-input',
  cartTotalPrice: '.cart-total-price',
  proceedBtn: '.btn-purchase',

  // Shipping form (fields accessed by name via form, or by id)
  shippingSection: '#shipping-address',
  phoneInput: '[name="phone"]',
  streetInput: '[name="street"]',
  cityInput: '[name="city"]',
  countrySelect: '#countries_dropdown_menu',
  submitOrderBtn: '#submitOrderBtn'
};

module.exports = selectors;
