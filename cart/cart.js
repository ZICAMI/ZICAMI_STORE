/* =============================================================
   CART.JS  —  Global shopping cart for every page.
   Responsibilities:
     • localStorage persistence (key: "tshirt_cart")
     • Slide-out drawer (items + qty controls + remove)
     • Checkout form with Wilaya delivery pricing
     • Order review panel before submit
     • FormSubmit POST with full cart + customer data
     • "Add to Cart" button wired on product pages
   ============================================================= */

(() => {
  'use strict';

  /* ===========================================================
     0.  DELIVERY PRICES  (exact copy from script.js — one source)
     =========================================================== */
  const DELIVERY_PRICES = {
    "Alger":              { home: 500,  desk: 300  },
    "Boumerdes":          { home: 600,  desk: 400  },
    "Blida":              { home: 600,  desk: 400  },
    "Tipaza":             { home: 600,  desk: 400  },
    "Tizi Ouzou":         { home: 700,  desk: 450  },
    "Bouira":             { home: 700,  desk: 450  },
    "Medea":              { home: 700,  desk: 450  },
    "Bejaia":             { home: 800,  desk: 500  },
    "Bordj Bou Arreridj": { home: 800,  desk: 500  },
    "Ain Defla":          { home: 800,  desk: 500  },
    "Ain Temouchent":     { home: 800,  desk: 500  },
    "Annaba":             { home: 800,  desk: 500  },
    "Batna":              { home: 800,  desk: 500  },
    "Chlef":              { home: 800,  desk: 500  },
    "Constantine":        { home: 800,  desk: 500  },
    "Mascara":            { home: 800,  desk: 500  },
    "Mila":               { home: 800,  desk: 500  },
    "Mostaganem":         { home: 800,  desk: 500  },
    "M'Sila":             { home: 800,  desk: 500  },
    "Oran":               { home: 800,  desk: 500  },
    "Oum El Bouaghi":     { home: 800,  desk: 500  },
    "Relizane":           { home: 800,  desk: 500  },
    "Tissemsilt":         { home: 800,  desk: 500  },
    "Tlemcen":            { home: 800,  desk: 500  },
    "Setif":              { home: 800,  desk: 500  },
    "Sidi Bel Abbes":     { home: 800,  desk: 500  },
    "Skikda":             { home: 800,  desk: 500  },
    "Jijel":              { home: 800,  desk: 500  },
    "El Tarf":            { home: 900,  desk: 600  },
    "Guelma":             { home: 900,  desk: 600  },
    "Khenchela":          { home: 900,  desk: 600  },
    "Saida":              { home: 900,  desk: 600  },
    "Souk Ahras":         { home: 900,  desk: 600  },
    "Tebessa":            { home: 900,  desk: 600  },
    "Tiaret":             { home: 1000, desk: 600  },
    "Oued Djellal":       { home: 1000, desk: 600  },
    "Djelfa":             { home: 1000, desk: 600  },
    "Laghouat":           { home: 1000, desk: 600  },
    "Biskra":             { home: 1000, desk: 600  },
    "Ghardaia":           { home: 1100, desk: 700  },
    "El Oued":            { home: 1100, desk: 700  },
    "El M'Ghair":         { home: 1100, desk: 700  },
    "Ouargla":            { home: 1100, desk: 700  },
    "Touggourt":          { home: 1100, desk: 700  },
    "El Meniaa":          { home: 1100, desk: 800  },
    "El Bayadh":          { home: 1200, desk: 800  },
    "Naama":              { home: 1200, desk: 800  },
    "Bechar":             { home: 1200, desk: 800  },
    "Beni Abbes":         { home: 1500, desk: 1000 },
    "Adrar":              { home: 1500, desk: 1000 },
    "Timimoun":           { home: 1500, desk: 1000 },
    "Tindouf":            { home: 1700, desk: 1000 },
    "In Salah":           { home: 1800, desk: 1200 },
    "Illizi":             { home: 1900, desk: 1500 },
    "Tamanrasset":        { home: 2000, desk: 1500 }
  };

  /* ===========================================================
     1.  STORAGE HELPERS
     =========================================================== */
  const STORAGE_KEY = 'tshirt_cart';

  /** Load cart array from localStorage */
  function loadCart() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch { return []; }
  }

  /** Persist cart array to localStorage */
  function saveCart(cart) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  }

  /* ===========================================================
     2.  CART BUSINESS LOGIC
     =========================================================== */

  /**
   * Build a unique key for a cart item so duplicates are merged.
   * Same product-name + model + size + color = same item.
   */
  function itemKey(item) {
    return `${item.productName}|${item.model}|${item.size}|${item.color}`;
  }

  /**
   * Add a product to the cart.
   * If an identical item (same key) exists, increment its qty.
   * Returns the updated cart.
   */
  function addToCart(item) {
    const cart = loadCart();
    const key  = itemKey(item);
    const idx  = cart.findIndex(c => itemKey(c) === key);

    if (idx > -1) {
      // Merge: just bump the quantity
      cart[idx].quantity  += item.quantity;
      cart[idx].totalPrice = cart[idx].unitPrice * cart[idx].quantity;
    } else {
      // New item — assign a stable ID
      item.id        = Date.now() + Math.random().toString(36).slice(2);
      item.totalPrice = item.unitPrice * item.quantity;
      cart.push(item);
    }

    saveCart(cart);
    return cart;
  }

  /**
   * Remove an item by its id.
   */
  function removeFromCart(id) {
    const cart = loadCart().filter(c => c.id !== id);
    saveCart(cart);
    return cart;
  }

  /**
   * Change qty for an item.  Removes item if qty drops to 0.
   */
  function setQty(id, qty) {
    let cart = loadCart();
    if (qty <= 0) {
      cart = cart.filter(c => c.id !== id);
    } else {
      const item = cart.find(c => c.id === id);
      if (item) {
        item.quantity  = qty;
        item.totalPrice = item.unitPrice * qty;
      }
    }
    saveCart(cart);
    return cart;
  }

  /** Cart subtotal (sum of all item totals) */
  function calcSubtotal(cart) {
    return cart.reduce((s, c) => s + c.totalPrice, 0);
  }

  /** Total item count (sum of quantities) */
  function calcItemCount(cart) {
    return cart.reduce((s, c) => s + c.quantity, 0);
  }

  /* ===========================================================
     3.  INJECT GLOBAL HTML (drawer + overlay + toast + fab)
     =========================================================== */
  function injectCartHTML() {
    /* ── Floating cart button ── */
    const fab = document.createElement('button');
    fab.className   = 'cart-fab';
    fab.id          = 'cartFab';
    fab.setAttribute('aria-label', 'Open cart');
    fab.innerHTML   = `🛒<span class="cart-fab-badge" id="cartBadge">0</span>`;
    document.body.appendChild(fab);

    /* ── Overlay ── */
    const overlay = document.createElement('div');
    overlay.className = 'cart-overlay';
    overlay.id        = 'cartOverlay';
    document.body.appendChild(overlay);

    /* ── Toast ── */
    const toast = document.createElement('div');
    toast.className = 'cart-toast';
    toast.id        = 'cartToast';
    document.body.appendChild(toast);

    /* ── Drawer ── */
    const drawer = document.createElement('div');
    drawer.className = 'cart-drawer';
    drawer.id        = 'cartDrawer';
    drawer.setAttribute('role', 'dialog');
    drawer.setAttribute('aria-label', 'Shopping cart');
    drawer.innerHTML = `
      <!-- Header -->
      <div class="cart-header">
        <h2>🛒 Your Cart <span id="cartHeaderCount"></span></h2>
        <button class="cart-close-btn" id="cartCloseBtn" aria-label="Close cart">✕</button>
      </div>

      <!-- Scrollable body: items + checkout + review -->
      <div class="cart-body" id="cartBody">

        <!-- Empty state -->
        <div class="cart-empty" id="cartEmptyState">
          <div class="cart-empty-icon">🛍️</div>
          <p>Your cart is empty.</p>
        </div>

        <!-- Item list -->
        <div class="cart-item-list" id="cartItemList"></div>

        <!-- Checkout panel (hidden until "Proceed to Checkout" clicked) -->
        <div class="checkout-panel" id="checkoutPanel">
          <h3>📦 Checkout</h3>

          <!-- Checkout form (posts to FormSubmit) -->
          <form id="cartCheckoutForm"
                action="https://api.web3forms.com/submit"
                method="POST"
                novalidate>
                <input type="hidden" name="access_key" value="09b44a62-9044-4d25-932c-92fc7e4e31c8">

            <!-- FormSubmit config -->
            <input type="hidden" name="_subject"  value="New  Order!">
            <input type="hidden" name="_template" value="table">
            <input type="hidden" name="_captcha"  value="false">

            <!-- Hidden computed fields synced by JS -->
            <input type="hidden" name="Cart Items"    id="co_cartItems">
            <input type="hidden" name="Subtotal"      id="co_subtotal">
            <input type="hidden" name="Delivery Cost" id="co_deliveryCost">
            <input type="hidden" name="Grand Total"   id="co_grandTotal">
            <input type="hidden" name="Delivery Type" id="co_deliveryType">
            <input type="hidden" name="Wilaya"        id="co_wilaya">

            <!-- Full Name -->
            <div class="form-group">
              <label for="co_fullName">Full Name <span style="color:#ef4444">*</span></label>
              <input type="text" id="co_fullName" name="Full Name"
                     placeholder="e.g. John Doe" autocomplete="name">
              <span class="error-msg">Please enter your full name.</span>
            </div>

            <!-- Phone -->
            <div class="form-group">
              <label for="co_phone">Phone Number <span style="color:#ef4444">*</span></label>
              <input type="tel" id="co_phone" name="Phone Number"
                     placeholder="e.g. 0555 12 34 56" autocomplete="tel">
              <span class="error-msg">Please enter a valid phone number.</span>
            </div>

            <!-- Address -->
            <div class="form-group">
              <label for="co_address">Address <span style="color:#ef4444">*</span></label>
              <textarea id="co_address" name="Address" rows="2"
                        placeholder="Street, City, Neighborhood..."></textarea>
              <span class="error-msg">Please enter your address.</span>
            </div>

            <!-- Wilaya -->
            <div class="form-group">
              <label for="co_wilaya">Wilaya <span style="color:#ef4444">*</span></label>
              <select id="co_wilayaSelect" name="WilayaSelect">
                <option value="" disabled selected>Select your wilaya</option>
              </select>
              <span class="error-msg">Please select your wilaya.</span>
            </div>

            <!-- Delivery Type -->
            <div class="form-group">
              <label>Delivery Type <span style="color:#ef4444">*</span></label>
              <div class="checkout-delivery-options">
                <input type="radio" id="co_home" name="co_deliveryType"
                       value="home" class="co-delivery-radio" checked>
                <label for="co_home" class="co-delivery-label">🚚 Home Delivery</label>

                <input type="radio" id="co_desk" name="co_deliveryType"
                       value="desk" class="co-delivery-radio">
                <label for="co_desk" class="co-delivery-label">🏢 Stop Desk (Pickup)</label>
              </div>
            </div>

            <!-- Order review (rendered by JS before submit) -->
            <div class="order-review-panel" id="orderReviewPanel">
              <h3>📋 Order Review</h3>
              <div id="orderReviewContent"></div>
            </div>

            <!-- Submit -->
            <button type="submit" class="checkout-submit-btn" id="checkoutSubmitBtn">
              ✅ Place Order
            </button>

          </form><!-- /cartCheckoutForm -->
        </div><!-- /checkoutPanel -->

      </div><!-- /cartBody -->

      <!-- Footer: subtotal + grand total + proceed button -->
      <div class="cart-footer" id="cartFooter" style="display:none">

        <div class="cart-summary-row">
          <span class="label">Subtotal</span>
          <span class="value" id="cartSubtotalDisplay">0 DA</span>
        </div>
        <div class="cart-summary-row">
          <span class="label">Delivery</span>
          <span class="value" id="cartDeliveryDisplay">--</span>
        </div>
        <div class="cart-total-row">
          <span>Grand Total</span>
          <span class="total-value" id="cartGrandTotalDisplay">0 DA</span>
        </div>

        <button class="cart-checkout-btn" id="proceedCheckoutBtn">
          Proceed to Checkout →
        </button>

      </div><!-- /cartFooter -->
    `;
    document.body.appendChild(drawer);
  }

  /* ===========================================================
     4.  POPULATE WILAYA <SELECT> IN CHECKOUT
     =========================================================== */
  function populateWilayaSelect() {
    const sel = document.getElementById('co_wilayaSelect');
    if (!sel) return;
    Object.keys(DELIVERY_PRICES).forEach(name => {
      const opt = document.createElement('option');
      opt.value = name;
      opt.textContent = name;
      sel.appendChild(opt);
    });
  }

  /* ===========================================================
     5.  RENDER CART ITEMS
     =========================================================== */
  function renderCart() {
    const cart          = loadCart();
    const itemList      = document.getElementById('cartItemList');
    const emptyState    = document.getElementById('cartEmptyState');
    const cartFooter    = document.getElementById('cartFooter');
    const headerCount   = document.getElementById('cartHeaderCount');
    const count         = calcItemCount(cart);

    // Badge
    updateBadge(count);

    // Header count text
    if (headerCount) headerCount.textContent = count > 0 ? `(${count})` : '';

    // Show/hide empty state & footer
    const isEmpty = cart.length === 0;
    emptyState.style.display  = isEmpty ? 'flex'  : 'none';
    cartFooter.style.display  = isEmpty ? 'none'  : 'block';

    // Build item HTML
    itemList.innerHTML = cart.map(item => `
      <div class="cart-item" data-id="${item.id}">
        <img class="cart-item-img"
             src="${item.image}"
             alt="${item.productName}"
             onerror="this.src='images/model-a-front.png'">
        <div class="cart-item-info">
          <div class="cart-item-name">${item.productName}</div>
          <div class="cart-item-meta">
            <span>${item.model}</span>
            <span>Size: ${item.size}</span>
            <span>${item.color}</span>
          </div>
          <div class="cart-item-unit">${item.unitPrice} DA / unit</div>
          <div class="cart-item-price-row">
            <!-- Qty controls -->
            <div class="cart-item-qty">
              <button class="cart-qty-btn" data-action="dec" data-id="${item.id}"
                      aria-label="Decrease quantity">−</button>
              <span class="cart-item-qty-num">${item.quantity}</span>
              <button class="cart-qty-btn" data-action="inc" data-id="${item.id}"
                      aria-label="Increase quantity">+</button>
            </div>
            <!-- Subtotal + remove -->
            <div style="display:flex;align-items:center;gap:10px">
              <span class="cart-item-subtotal">${item.totalPrice} DA</span>
              <button class="cart-remove-btn" data-action="remove" data-id="${item.id}"
                      aria-label="Remove item">✕</button>
            </div>
          </div>
        </div>
      </div>
    `).join('');

    // Update footer totals
    updateFooterTotals(cart);
  }

  /* ===========================================================
     6.  FOOTER TOTALS (subtotal / delivery / grand total)
     =========================================================== */
  function updateFooterTotals(cart) {
    cart = cart || loadCart();
    const subtotal     = calcSubtotal(cart);
    const deliveryCost = getCurrentDeliveryCost();
    const grandTotal   = subtotal + deliveryCost;

    setText('cartSubtotalDisplay',   subtotal    + ' DA');
    setText('cartDeliveryDisplay',   deliveryCost > 0 ? deliveryCost + ' DA' : '--');
    setText('cartGrandTotalDisplay', grandTotal  + ' DA');

    // Keep hidden form fields in sync
    setVal('co_subtotal',     subtotal);
    setVal('co_deliveryCost', deliveryCost);
    setVal('co_grandTotal',   grandTotal);
  }

  /** Read the currently selected Wilaya + delivery type and return cost */
  function getCurrentDeliveryCost() {
    const wilaya = document.getElementById('co_wilayaSelect')?.value || '';
    const type   = document.querySelector('input[name="co_deliveryType"]:checked')?.value || 'home';
    if (wilaya && DELIVERY_PRICES[wilaya]) {
      return DELIVERY_PRICES[wilaya][type];
    }
    return 0;
  }

  /* ===========================================================
     7.  BADGE
     =========================================================== */
  function updateBadge(count) {
    const badge = document.getElementById('cartBadge');
    if (!badge) return;
    badge.textContent = count;
    badge.classList.toggle('visible', count > 0);
  }

  /* ===========================================================
     8.  EVENT DELEGATION — cart body (qty +/- and remove)
     =========================================================== */
  function bindCartBodyEvents() {
    const body = document.getElementById('cartBody');
    if (!body) return;

    body.addEventListener('click', e => {
      const btn = e.target.closest('[data-action]');
      if (!btn) return;

      const { action, id } = btn.dataset;

      if (action === 'inc') {
        const cart = loadCart();
        const item = cart.find(c => c.id === id);
        if (item) setQty(id, item.quantity + 1);
        renderCart();
        updateFooterTotals();
        buildOrderReview();
      }

      if (action === 'dec') {
        const cart = loadCart();
        const item = cart.find(c => c.id === id);
        if (item) setQty(id, item.quantity - 1);
        renderCart();
        updateFooterTotals();
        buildOrderReview();
      }

      if (action === 'remove') {
        removeFromCart(id);
        renderCart();
        updateFooterTotals();
        buildOrderReview();
        // Close checkout if cart emptied
        if (loadCart().length === 0) closeCheckout();
      }
    });
  }

  /* ===========================================================
     9.  OPEN / CLOSE DRAWER
     =========================================================== */
  function openDrawer() {
    document.getElementById('cartDrawer')?.classList.add('open');
    document.getElementById('cartOverlay')?.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    document.getElementById('cartDrawer')?.classList.remove('open');
    document.getElementById('cartOverlay')?.classList.remove('open');
    document.body.style.overflow = '';
  }

  function closeCheckout() {
    document.getElementById('checkoutPanel')?.classList.remove('open');
    document.getElementById('orderReviewPanel')?.classList.remove('open');
  }

  /* ===========================================================
     10. PROCEED TO CHECKOUT
     =========================================================== */
  function bindProceedBtn() {
    document.getElementById('proceedCheckoutBtn')?.addEventListener('click', () => {
      const panel = document.getElementById('checkoutPanel');
      panel?.classList.add('open');
      // Scroll so checkout form is visible
      panel?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  /* ===========================================================
     11. CHECKOUT FORM — WILAYA / DELIVERY CHANGE → RETOTAL
     =========================================================== */
  function bindCheckoutFormEvents() {
    // Wilaya change
    document.getElementById('co_wilayaSelect')?.addEventListener('change', e => {
      e.target.closest('.form-group')?.classList.remove('invalid');
      setVal('co_wilaya', e.target.value);
      updateFooterTotals();
      buildOrderReview();
    });

    // Delivery type change
    document.querySelectorAll('input[name="co_deliveryType"]').forEach(r => {
      r.addEventListener('change', () => {
        setVal('co_deliveryType',
          r.value === 'home' ? 'Home Delivery' : 'Stop Desk (Pickup)');
        updateFooterTotals();
        buildOrderReview();
      });
    });

    // Live error clearing
    ['co_fullName','co_phone','co_address'].forEach(id => {
      document.getElementById(id)?.addEventListener('input', () => {
        document.getElementById(id)?.closest('.form-group')?.classList.remove('invalid');
      });
    });
  }

  /* ===========================================================
     12. BUILD ORDER REVIEW
         Called any time cart, qty, wilaya or delivery changes.
     =========================================================== */
  function buildOrderReview() {
    const panel   = document.getElementById('orderReviewPanel');
    const content = document.getElementById('orderReviewContent');
    if (!panel || !content) return;

    const cart         = loadCart();
    if (cart.length === 0) { panel.classList.remove('open'); return; }

    const subtotal     = calcSubtotal(cart);
    const deliveryCost = getCurrentDeliveryCost();
    const grandTotal   = subtotal + deliveryCost;

    // Customer info (read from form fields)
    const name    = document.getElementById('co_fullName')?.value  || '--';
    const phone   = document.getElementById('co_phone')?.value     || '--';
    const address = document.getElementById('co_address')?.value   || '--';
    const wilaya  = document.getElementById('co_wilayaSelect')?.value || '--';
    const dtype   = document.querySelector('input[name="co_deliveryType"]:checked')?.value === 'desk'
                    ? 'Stop Desk (Pickup)' : 'Home Delivery';

    // Products HTML
    const productsHTML = cart.map(item => `
      <div class="review-product-card">
        <div class="review-product-name">${item.productName}</div>
        <div class="review-product-meta">
          ${item.model} · Size ${item.size} · ${item.color} · Qty ${item.quantity}
        </div>
        <div class="review-row" style="margin-top:4px">
          <span class="rl">Item Total</span>
          <span class="rv">${item.totalPrice} DA</span>
        </div>
      </div>
    `).join('');

    content.innerHTML = `
      <div class="review-section-title">Customer Info</div>
      <div class="review-row"><span class="rl">Name</span>    <span class="rv">${name}</span></div>
      <div class="review-row"><span class="rl">Phone</span>   <span class="rv">${phone}</span></div>
      <div class="review-row"><span class="rl">Address</span> <span class="rv">${address}</span></div>
      <div class="review-row"><span class="rl">Wilaya</span>  <span class="rv">${wilaya}</span></div>
      <div class="review-row"><span class="rl">Delivery</span><span class="rv">${dtype}</span></div>

      <div class="review-section-title" style="margin-top:14px">Products</div>
      ${productsHTML}

      <div class="review-divider"></div>
      <div class="review-row"><span class="rl">Subtotal</span>      <span class="rv">${subtotal} DA</span></div>
      <div class="review-row"><span class="rl">Delivery</span>      <span class="rv">${deliveryCost > 0 ? deliveryCost + ' DA' : '--'}</span></div>
      <div class="review-total-row"><span>Grand Total</span>        <span>${grandTotal} DA</span></div>
    `;

    panel.classList.add('open');

    // Sync hidden cart-items field for FormSubmit email
    const cartSummary = cart.map(i =>
      `${i.productName} | ${i.model} | Size ${i.size} | ${i.color} | Qty ${i.quantity} | ${i.totalPrice} DA`
    ).join(' ;; ');
    setVal('co_cartItems', cartSummary);
    setVal('co_subtotal',     subtotal);
    setVal('co_deliveryCost', deliveryCost);
    setVal('co_grandTotal',   grandTotal);
    setVal('co_wilaya',       wilaya);
    setVal('co_deliveryType', dtype);
  }

  /* ===========================================================
     13. CHECKOUT FORM VALIDATION & SUBMIT
     =========================================================== */
  function bindCheckoutSubmit() {
    document.getElementById('cartCheckoutForm')?.addEventListener('submit', e => {

      // Build review first so hidden fields are up to date
      buildOrderReview();

      let valid = true;
      valid = coValidateText('co_fullName', v => v.trim().length > 0) && valid;
      valid = coValidateText('co_phone',    v => /^[+]?[\d\s\-().]{7,}$/.test(v.trim())) && valid;
      valid = coValidateText('co_address',  v => v.trim().length > 0) && valid;
      valid = coValidateSelect('co_wilayaSelect') && valid;

      // Must have items
      if (loadCart().length === 0) {
        showToast('Your cart is empty!');
        e.preventDefault();
        return;
      }

      if (!valid) {
        e.preventDefault();
        document.querySelector('.checkout-panel .form-group.invalid')
                ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }

      // Valid — clear cart after successful submit (use a tiny delay so
      // the form POST has time to fire before we clear localStorage)
      setTimeout(() => {
        localStorage.removeItem(STORAGE_KEY);
        renderCart();
      }, 300);
    });
  }

  function coValidateText(id, fn) {
    const el = document.getElementById(id);
    if (!el) return true;
    const ok = fn(el.value);
    el.closest('.form-group')?.classList.toggle('invalid', !ok);
    return ok;
  }

  function coValidateSelect(id) {
    const el = document.getElementById(id);
    if (!el) return true;
    const ok = el.value.trim().length > 0;
    el.closest('.form-group')?.classList.toggle('invalid', !ok);
    return ok;
  }

  /* ===========================================================
     14. "ADD TO CART" BUTTON — PRODUCT PAGE
         The product page exposes window.CART_PRODUCT so this
         handler can read the current selections.
     =========================================================== */
  function bindAddToCartBtn() {
    // Wait for the product page button (may not exist on other pages)
    const btn = document.getElementById('addToCartBtn');
    if (!btn) return;

    btn.addEventListener('click', () => {
      // Read current selections from the product page
      // These globals are set by script.js (see edits below)
      const product = window.CART_PRODUCT;
      if (!product) return;

      const { productName, image, unitPrice } = product;
const model = product.model || '';

      // Validate required selections
      const size  = document.querySelector('input[name="size"]:checked')?.value;
      const color = document.querySelector('input[name="formColor"]:checked')?.value
              || window.CART_PRODUCT?.color
              || '';
      const qty   = parseInt(document.getElementById('quantity')?.value, 10) || 1;
      

      if (!size && document.getElementById('sizeOptions')) {
  showToast('Please select a size first!');
  document.getElementById('sizeOptions')
          ?.closest('.form-group')
          ?.classList.add('invalid');
  return;
}

      if (!color && document.getElementById('formColorOptions')) {
  showToast('Please select a color first!');
  return;
}

      const item = {
        productName,
        model,
        image,
        size,
        color,
        quantity:   qty,
        unitPrice,
        totalPrice: unitPrice * qty
      };

      addToCart(item);
      renderCart();

      // Bounce the FAB
      const fab = document.getElementById('cartFab');
      fab?.classList.remove('bounce');
      void fab?.offsetWidth;
      fab?.classList.add('bounce');

      showToast(`${model} (${size}, ${color}) added to cart!`);
    });
  }

  /* ===========================================================
     15. TOAST
     =========================================================== */
  let toastTimer = null;

  function showToast(msg, duration = 2800) {
    const toast = document.getElementById('cartToast');
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), duration);
  }

  /* ===========================================================
     16. TINY DOM HELPERS
     =========================================================== */
  function setText(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  }

  function setVal(id, val) {
    const el = document.getElementById(id);
    if (el) el.value = val;
  }

  /* ===========================================================
     17. INIT — runs on every page
     =========================================================== */
  function init() {
    injectCartHTML();
    populateWilayaSelect();
    renderCart();
    bindCartBodyEvents();
    bindProceedBtn();
    bindCheckoutFormEvents();
    bindCheckoutSubmit();
    bindAddToCartBtn();

    // Open / close drawer
    document.getElementById('cartFab')?.addEventListener('click', openDrawer);
    document.getElementById('cartCloseBtn')?.addEventListener('click', closeDrawer);
    document.getElementById('cartOverlay')?.addEventListener('click', closeDrawer);

    // Keyboard close (Escape)
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') closeDrawer();
    });

    // Keep badge correct after localStorage changes from other tabs
    window.addEventListener('storage', e => {
      if (e.key === STORAGE_KEY) renderCart();
    });
  }

  // Run after DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
