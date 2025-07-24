// Simple Cart Implementation - Single File Solution
// Small Paws Club Cart System

const CART_KEY = "spcCart";

// Helper functions
function loadCart() {
    try {
        const cartData = localStorage.getItem(CART_KEY);
        return cartData ? JSON.parse(cartData) : [];
    } catch (e) {
        console.error('Error loading cart:', e);
        return [];
    }
}

function saveCart(cart) {
    try {
        localStorage.setItem(CART_KEY, JSON.stringify(cart));
        console.log('Cart saved:', cart);
    } catch (e) {
        console.error('Error saving cart:', e);
    }
}

function findItem(id) {
    const cart = loadCart();
    return cart.find(item => item.id === id);
}

function updateBadge() {
    const cart = loadCart();
    const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
    
    const badge = document.getElementById('cart-badge');
    if (badge) {
        badge.textContent = totalQty;
        badge.style.display = totalQty > 0 ? 'inline-flex' : 'none';
        
        if (totalQty > 0) {
            badge.setAttribute('aria-label', `${totalQty} items in cart`);
        } else {
            badge.removeAttribute('aria-label');
        }
    }
    
    console.log('Badge updated:', totalQty);
}

// Cart operations
function addToCart(productObj) {
    console.log('Adding to cart:', productObj);
    
    const cart = loadCart();
    const existingItem = cart.find(item => item.id === productObj.id);
    
    if (existingItem) {
        existingItem.qty += 1;
    } else {
        cart.push({
            id: productObj.id,
            name: productObj.name,
            price: parseFloat(productObj.price),
            qty: 1,
            img: productObj.img || ''
        });
    }
    
    saveCart(cart);
    updateBadge();
    showNotification(`Added ${productObj.name} to cart`);
}

function removeFromCart(id) {
    console.log('Removing from cart:', id);
    
    const cart = loadCart();
    const updatedCart = cart.filter(item => item.id !== id);
    
    saveCart(updatedCart);
    updateBadge();
    
    // Re-render cart if on cart page
    if (window.location.pathname.includes('cart.html')) {
        renderCartPage();
    }
}

function changeQty(id, delta) {
    console.log('Changing qty:', id, delta);
    
    const cart = loadCart();
    const item = cart.find(item => item.id === id);
    
    if (item) {
        item.qty += delta;
        
        if (item.qty <= 0) {
            removeFromCart(id);
            return;
        }
        
        saveCart(cart);
        updateBadge();
        
        // Update just this item's display if on cart page
        if (window.location.pathname.includes('cart.html')) {
            updateItemDisplay(id);
            updateCartTotal();
        }
    }
}

// Cart page rendering
function renderCartPage() {
    const cart = loadCart();
    const cartItems = document.getElementById('cart-items');
    const emptyMsg = document.getElementById('empty-msg');
    const cartTotal = document.getElementById('cart-total');
    
    if (!cartItems) return;
    
    if (cart.length === 0) {
        cartItems.innerHTML = '';
        emptyMsg.style.display = 'block';
        cartTotal.innerHTML = '';
        return;
    }
    
    emptyMsg.style.display = 'none';
    
    cartItems.innerHTML = cart.map(item => `
        <div class="cart-item" data-id="${item.id}" style="display: flex; align-items: center; gap: 1rem; padding: 1rem; border-bottom: 1px solid #eee;">
            <div class="cart-item-img" style="width: 60px; height: 60px; background: #f5f5f5; border-radius: 8px; display: flex; align-items: center; justify-content: center;">
                ${item.img ? `<img src="${item.img}" alt="${item.name}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 8px;">` : '<div class="placeholder" style="font-size: 24px;">📦</div>'}
            </div>
            <div class="cart-item-details" style="flex: 1;">
                <h4 style="margin: 0 0 0.5rem 0; font-size: 1rem;"><a href="product.html?id=${item.id}" style="color: #333; text-decoration: none;">${item.name}</a></h4>
                <p style="margin: 0; color: #666;">£${item.price.toFixed(2)} each</p>
            </div>
            <div class="cart-item-qty" style="display: flex; align-items: center; gap: 0.5rem;">
                <button class="qty-btn minus" data-id="${item.id}" ${item.qty <= 1 ? 'disabled' : ''} style="width: 32px; height: 32px; border: 1px solid #ccc; background: white; border-radius: 4px; cursor: pointer;">-</button>
                <span class="qty-display" style="min-width: 2rem; text-align: center;">${item.qty}</span>
                <button class="qty-btn plus" data-id="${item.id}" style="width: 32px; height: 32px; border: 1px solid #ccc; background: white; border-radius: 4px; cursor: pointer;">+</button>
            </div>
            <div class="cart-item-total" style="min-width: 80px; text-align: right; font-weight: 600;">
                £${(item.price * item.qty).toFixed(2)}
            </div>
            <button class="remove-btn" data-id="${item.id}" aria-label="Remove ${item.name}" style="width: 32px; height: 32px; border: none; background: #ff4444; color: white; border-radius: 4px; cursor: pointer; margin-left: 0.5rem;">🗑️</button>
        </div>
    `).join('');
    
    updateCartTotal();
}

function updateItemDisplay(id) {
    const cart = loadCart();
    const item = cart.find(item => item.id === id);
    const itemElement = document.querySelector(`[data-id="${id}"]`);
    
    if (item && itemElement) {
        const qtyDisplay = itemElement.querySelector('.qty-display');
        const totalDisplay = itemElement.querySelector('.cart-item-total');
        const minusBtn = itemElement.querySelector('.minus');
        
        qtyDisplay.textContent = item.qty;
        totalDisplay.textContent = `£${(item.price * item.qty).toFixed(2)}`;
        minusBtn.disabled = item.qty <= 1;
    }
}

function updateCartTotal() {
    const cart = loadCart();
    const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    const cartTotal = document.getElementById('cart-total');
    
    if (cartTotal) {
        cartTotal.innerHTML = `<strong>Total: £${total.toFixed(2)}</strong>`;
    }
}

// Notification system
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'cart-notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #4CAF50;
        color: white;
        padding: 12px 20px;
        border-radius: 4px;
        z-index: 1000;
        opacity: 0;
        transition: opacity 0.3s;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => notification.style.opacity = '1', 100);
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => notification.remove(), 300);
    }, 2000);
}

// Event delegation setup
function setupCartEventListeners() {
    console.log('Setting up cart event listeners');
    
    // Global add-to-cart delegation
    document.addEventListener('click', function(e) {
        const addBtn = e.target.closest('[data-add]');
        if (addBtn) {
            e.preventDefault();
            e.stopPropagation();
            
            const productObj = {
                id: addBtn.dataset.id,
                name: addBtn.dataset.name,
                price: addBtn.dataset.price,
                img: addBtn.dataset.img
            };
            
            addToCart(productObj);
        }
    });
    
    // Cart page specific delegation
    const cartItems = document.getElementById('cart-items');
    if (cartItems) {
        cartItems.addEventListener('click', function(e) {
            const target = e.target;
            const id = target.dataset.id;
            
            if (!id) return;
            
            if (target.matches('.plus')) {
                changeQty(id, 1);
            } else if (target.matches('.minus')) {
                changeQty(id, -1);
            } else if (target.matches('.remove-btn')) {
                removeFromCart(id);
            }
        });
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    console.log('Simple cart initialized');
    
    // Always update badge on page load
    updateBadge();
    
    // Setup event listeners
    setupCartEventListeners();
    
    // Render cart page if we're on cart.html
    if (window.location.pathname.includes('cart.html')) {
        renderCartPage();
    }
});