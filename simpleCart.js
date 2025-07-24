// simpleCart.js

// Key for localStorage
const CART_KEY = "spcCart";

// Load cart array from storage (or empty)
function loadCart() {
  const raw = localStorage.getItem(CART_KEY);
  try {
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Error parsing cart, resetting:', e);
    return [];
  }
}

// Save cart array back to storage
function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

// Update badge (single #cart-badge in nav)
function updateBadge() {
  const badge = document.querySelector("#cart-badge");
  if (!badge) return;
  const cart = loadCart();
  const total = cart.reduce((sum, item) => sum + item.qty, 0);
  badge.textContent = total;
  badge.style.display = total > 0 ? 'inline-flex' : 'none';
}

// Global "Add to Cart" delegation - works on both shop and product pages
document.addEventListener("click", e => {
  const btn = e.target.closest("[data-add]");
  if (!btn) return;
  
  e.preventDefault(); // Prevent navigation when clicking add to cart
  e.stopPropagation();
  
  let id, name, price, img, qty = 1;
  
  // Check if we're on product page or shop page
  const card = btn.closest(".product-card");
  if (card) {
    // Shop page - get data from card
    id = card.dataset.id;
    name = card.dataset.name;
    price = parseFloat(card.dataset.price);
    img = card.dataset.img;
    qty = 1;
  } else {
    // Product page - get data from page elements and button attributes
    id = btn.dataset.id || document.querySelector('[data-product-id]')?.dataset.productId;
    name = btn.dataset.name || document.querySelector('.product-info__title')?.textContent?.trim();
    price = parseFloat(btn.dataset.price || document.querySelector('.product-info__price-current')?.textContent?.replace('£', ''));
    img = btn.dataset.img || '';
    qty = parseInt(document.querySelector('#product-quantity')?.value || '1', 10) || 1;
  }
  
  if (!id || !name || !price) {
    console.error('Missing product data for cart:', { id, name, price });
    return;
  }
  
  // Update cart array
  const cart = loadCart();
  const existing = cart.find(i => i.id === id);
  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({ id, name, price, img, qty });
  }
  saveCart(cart);
  updateBadge();
  
  console.log(`Added ${qty} × ${name} to cart. Total items:`, cart.reduce((sum, x) => sum + x.qty, 0));
});

// Single event delegation for quantity controls and navigation - prevent duplicate handlers
if (!window.qtyNavHandlerAdded) {
  window.qtyNavHandlerAdded = true;
  
  document.addEventListener('click', e => {
    // Debounce rapid clicks
    if (e.timeStamp - (window.lastClickTime || 0) < 100) {
      return;
    }
    window.lastClickTime = e.timeStamp;
    const plusBtn = e.target.closest('[data-plus]');
    const minusBtn = e.target.closest('[data-minus]');
    
    if (!plusBtn && !minusBtn) {
      // Product card navigation (click anywhere except add-to-cart)
      const card = e.target.closest(".product-card");
      if (!card) return;
      if (e.target.closest(".add-to-cart")) return;          // don't navigate when adding
      if (e.target.closest(".card-qty-controls")) return;   // don't navigate on qty clicks
      
      // otherwise, treat it as a navigation click:
      const id = card.dataset.id;
      window.location.href = `product.html?id=${encodeURIComponent(id)}`;
      return;
    }
    
    // Quantity button clicked
    e.preventDefault();
    e.stopPropagation();
    
    const container = (plusBtn || minusBtn).closest('.quantity-selector');
    const input = container.querySelector('#product-quantity');
    
    if (!input) {
      console.log('Input not found!');
      return;
    }
    
    let qty = parseInt(input.value, 10) || 1;
    
    if (plusBtn) {
      const maxQty = parseInt(input.max) || 10;
      if (qty < maxQty) {
        qty += 1;
        console.log('Plus clicked, newQty=', qty);
      }
    } else if (minusBtn && qty > 1) {
      qty--;
      console.log('Minus clicked, newQty=', qty);
    }
    
    input.value = qty;
    
    // Update button disabled states based on new quantity
    const minusButton = container.querySelector('[data-minus]');
    const plusButton = container.querySelector('[data-plus]');
    if (minusButton) minusButton.disabled = qty <= 1;
    if (plusButton) plusButton.disabled = qty >= (parseInt(input.max) || 10);
  });
}

// When on cart page, render items + delegate qty/remove
if (document.body.contains(document.querySelector("#cart-items"))) {
  const container = document.querySelector("#cart-items");
  const totalEl = document.querySelector("#cart-total");

  function renderCart() {
    const cart = loadCart();
    container.innerHTML = "";
    let subtotal = 0;
    cart.forEach(item => {
      subtotal += item.price * item.qty;
      const el = document.createElement("div");
      el.className = "cart-row";
      el.innerHTML = `
        <div class="cart-main">
          <img src="${item.img || 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-1.414-.586H14l-2-2"/></svg>'}" class="cart-image" alt="${item.name}" />
          <div class="cart-title">${item.name}</div>
        </div>
        <div class="cart-actions">
          <div class="cart-controls">
            <button data-minus data-id="${item.id}" class="cart-qty-btn" aria-label="Decrease quantity">–</button>
            <span class="cart-qty-display">${item.qty}</span>
            <button data-plus data-id="${item.id}" class="cart-qty-btn" aria-label="Increase quantity">+</button>
          </div>
          <button data-remove data-id="${item.id}" class="cart-remove" aria-label="Remove item">🗑️</button>
          <div class="cart-price">£${(item.price * item.qty).toFixed(2)}</div>
        </div>
      `;
      container.append(el);
    });
    totalEl.textContent = `Subtotal: £${subtotal.toFixed(2)}`;
  }

  // Delegate plus/minus/remove
  container.addEventListener("click", e => {
    e.preventDefault();
    e.stopPropagation();
    
    const cart = loadCart();
    let cartUpdated = false;
    
    if (e.target.matches("[data-plus]")) {
      const id = e.target.dataset.id;
      const item = cart.find(i => i.id === id);
      if (item) {
        console.log(`Plus clicked: ${item.name} qty ${item.qty} -> ${item.qty + 1}`);
        item.qty += 1;
        cartUpdated = true;
      }
    } else if (e.target.matches("[data-minus]")) {
      const id = e.target.dataset.id;
      const item = cart.find(i => i.id === id);
      if (item && item.qty > 1) {
        console.log(`Minus clicked: ${item.name} qty ${item.qty} -> ${item.qty - 1}`);
        item.qty -= 1;
        cartUpdated = true;
      }
    } else if (e.target.matches("[data-remove]")) {
      const id = e.target.dataset.id;
      const idx = cart.findIndex(i => i.id === id);
      if (idx > -1) {
        console.log(`Remove clicked: ${cart[idx].name}`);
        cart.splice(idx, 1);
        cartUpdated = true;
      }
    }
    
    if (cartUpdated) {
      saveCart(cart);
      updateBadge();
      renderCart();
    }
  });

  // Initial render
  updateBadge();
  renderCart();
}

// Initialize badge on page load (only once)
if (!window.simpleCartInitialized) {
  window.simpleCartInitialized = true;
  
  document.addEventListener('DOMContentLoaded', function() {
    updateBadge();
  });
}