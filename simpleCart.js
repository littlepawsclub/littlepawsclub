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
  const cartContainer = document.getElementById('cart-items');
  const totalEl = document.querySelector("#cart-total");

  function renderCart() {
    const cart = loadCart();
    cartContainer.innerHTML = '';
    cart.forEach(item => {
      const row = document.createElement('div');
      row.className = 'cart-item';
      row.innerHTML = `
        <img src="${item.img}" alt="${item.name}" class="cart-image" />
        <div class="cart-details">
          <div class="cart-info">
            <h3 class="cart-name">${item.name}</h3>
            <span class="cart-price">£${(item.price * item.qty).toFixed(2)}</span>
          </div>
          <div class="cart-controls">
            <button class="qty-btn" data-action="minus" data-id="${item.id}">–</button>
            <span class="qty">${item.qty}</span>
            <button class="qty-btn" data-action="plus" data-id="${item.id}">+</button>
            <button class="remove-btn" data-action="remove" data-id="${item.id}">🗑️</button>
          </div>
        </div>`;
      cartContainer.appendChild(row);
    });
    if (totalEl) {
      totalEl.textContent = `Subtotal: £${cart.reduce((sum, i) => sum + i.price * i.qty, 0).toFixed(2)}`;
    }
  }

  function updateQty(id, delta) {
    const cart = loadCart();
    const item = cart.find(i => i.id === id);
    if (item) {
      item.qty += delta;
      if (item.qty <= 0) {
        removeFromCart(id);
      } else {
        saveCart(cart);
        updateBadge();
      }
    }
  }

  function removeFromCart(id) {
    const cart = loadCart();
    const idx = cart.findIndex(i => i.id === id);
    if (idx > -1) {
      cart.splice(idx, 1);
      saveCart(cart);
      updateBadge();
    }
  }

  document.getElementById('cart-items').addEventListener('click', e => {
    const btn = e.target.closest('button');
    if (!btn) return;
    const { action, id } = btn.dataset;
    if (action === 'plus') updateQty(id, +1);
    if (action === 'minus') updateQty(id, -1);
    if (action === 'remove') removeFromCart(id);
    renderCart();
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