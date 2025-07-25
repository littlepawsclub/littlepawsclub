// simpleCart.js - Minimal cart implementation

// Cart storage functions
function loadCart() {
  try {
    return JSON.parse(localStorage.getItem('spcCart') || '[]');
  } catch {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem('spcCart', JSON.stringify(cart));
}

function updateBadge() {
  const cart = loadCart();
  const count = cart.reduce((sum, item) => sum + item.qty, 0);
  const badge = document.getElementById('cart-badge');
  if (badge) badge.textContent = count;
}

// Add to cart function
function addToCart(product) {
  const cart = loadCart();
  const existing = cart.find(item => item.id === product.id);
  
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      img: product.img || '',
      qty: 1
    });
  }
  
  saveCart(cart);
  updateBadge();
  console.log(`Added to cart: ${product.name}`);
}

// Add to cart button event delegation
document.addEventListener('click', e => {
  if (e.target.matches('[data-add-to-cart]')) {
    e.preventDefault();
    e.stopPropagation();
    
    const btn = e.target;
    const productData = {
      id: btn.dataset.productId,
      name: btn.dataset.productName,
      price: parseFloat(btn.dataset.productPrice),
      img: btn.dataset.productImg
    };
    
    addToCart(productData);
  }
});

// Cart page functionality
if (document.getElementById('cart-items')) {
  const cartContainer = document.getElementById('cart-items');
  const subtotalEl = document.getElementById('cart-subtotal');

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
    
    if (subtotalEl) {
      subtotalEl.textContent = `Subtotal: £${cart.reduce((sum, i) => sum + i.price * i.qty, 0).toFixed(2)}`;
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
  renderCart();
}

// Initialize badge on page load
updateBadge();
console.log('Small Paws Club initialized');