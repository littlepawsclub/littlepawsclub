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

// Global "Add to Cart" delegation
document.addEventListener("click", e => {
  const btn = e.target.closest("[data-add]");
  if (!btn) return;
  
  e.preventDefault(); // Prevent navigation when clicking add to cart
  e.stopPropagation();
  
  // Get product data from the parent card
  const card = btn.closest(".product-card");
  if (!card) return;
  
  const id    = card.dataset.id;
  const name  = card.dataset.name;
  const price = parseFloat(card.dataset.price);
  const img   = card.dataset.img;
  
  // update cart array
  const cart = loadCart();
  const existing = cart.find(i => i.id === id);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ id, name, price, img, qty: 1 });
  }
  saveCart(cart);
  updateBadge();
});

// Single event delegation for quantity controls
document.addEventListener('click', e => {
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
  } else if (minusBtn) {
    qty = Math.max(qty - 1, 1);
    console.log('Minus clicked, newQty=', qty);
  }
  
  input.value = qty;
});

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
      el.style.cssText = "display: flex; align-items: center; gap: 1rem; padding: 1rem; border-bottom: 1px solid #eee;";
      el.innerHTML = `
        <img src="${item.img}" width="50" style="border-radius: 4px;" />
        <strong style="flex: 1;">${item.name}</strong>
        <button data-minus data-id="${item.id}" style="width: 32px; height: 32px; border: 1px solid #ccc; background: white; border-radius: 4px; cursor: pointer;">–</button>
        <span style="min-width: 2rem; text-align: center;">${item.qty}</span>
        <button data-plus data-id="${item.id}" style="width: 32px; height: 32px; border: 1px solid #ccc; background: white; border-radius: 4px; cursor: pointer;">+</button>
        <button data-remove data-id="${item.id}" style="width: 32px; height: 32px; border: none; background: #ff4444; color: white; border-radius: 4px; cursor: pointer;">🗑️</button>
        <span style="min-width: 80px; text-align: right; font-weight: 600;">£${(item.price * item.qty).toFixed(2)}</span>
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