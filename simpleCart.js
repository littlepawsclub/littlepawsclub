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
  // grab product data
  const id    = btn.dataset.id;
  const name  = btn.dataset.name;
  const price = parseFloat(btn.dataset.price);
  const img   = btn.dataset.img;
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
    const cart = loadCart();
    if (e.target.matches("[data-plus]")) {
      const id = e.target.dataset.id;
      cart.find(i => i.id === id).qty++;
    }
    if (e.target.matches("[data-minus]")) {
      const id = e.target.dataset.id;
      const it = cart.find(i => i.id === id);
      if (it.qty > 1) it.qty--;
    }
    if (e.target.matches("[data-remove]")) {
      const id = e.target.dataset.id;
      const idx = cart.findIndex(i => i.id === id);
      if (idx > -1) cart.splice(idx, 1);
    }
    saveCart(cart);
    updateBadge();
    renderCart();
  });

  // Initial render
  updateBadge();
  renderCart();
}

// Initialize badge on page load
document.addEventListener('DOMContentLoaded', function() {
    updateBadge();
});