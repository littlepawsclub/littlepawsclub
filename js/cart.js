// Small Paws Club - Cart Functionality
// Handles cart operations, persistence, and UI updates

// Cart utilities
function getCart() {
    const cartData = localStorage.getItem('spcCart');
    return cartData ? JSON.parse(cartData) : {};
}

function saveCart(cart) {
    localStorage.setItem('spcCart', JSON.stringify(cart));
}

function addToCart(productData) {
    const cart = getCart();
    const productId = productData.id;
    
    if (cart[productId]) {
        cart[productId].qty += productData.qty || 1;
    } else {
        cart[productId] = {
            id: productId,
            name: productData.name,
            price: parseFloat(productData.price),
            qty: productData.qty || 1,
            image: productData.image
        };
    }
    
    saveCart(cart);
    
    // Always re-render and update badge after mutation
    if (window.location.pathname.includes('cart.html')) {
        renderCart();
    }
    updateCartBadge();
    
    // Show visual feedback
    showCartNotification(cart[productId].name, cart[productId].qty);
}

function removeFromCart(productId) {
    const cart = getCart();
    if (cart[productId]) {
        delete cart[productId];
        saveCart(cart);
        
        // Always re-render and update badge after mutation
        if (window.location.pathname.includes('cart.html')) {
            renderCart();
        }
        updateCartBadge();
    }
}

function updateCartQuantity(productId, newQty) {
    const cart = getCart();
    if (cart[productId] && newQty > 0) {
        cart[productId].qty = parseInt(newQty);
        saveCart(cart);
    } else if (newQty <= 0) {
        removeFromCart(productId);
        return; // removeFromCart handles re-rendering
    }
    
    // Always re-render and update badge after mutation
    if (window.location.pathname.includes('cart.html')) {
        renderCart();
    }
    updateCartBadge();
}

function getCartTotalQty() {
    const cart = getCart();
    return Object.values(cart).reduce((total, item) => total + item.qty, 0);
}

function getCartTotalPrice() {
    const cart = getCart();
    return Object.values(cart).reduce((total, item) => total + (item.price * item.qty), 0);
}

function updateCartBadge() {
    const badge = document.querySelector('[data-cart-badge]') || document.getElementById('cart-count');
    const cart = getCart();
    const totalQty = Object.values(cart).reduce((sum, p) => sum + p.qty, 0);
    
    if (badge) {
        badge.textContent = totalQty;
        badge.classList.toggle('hidden', totalQty === 0);
        if (totalQty > 0) {
            badge.setAttribute('aria-label', `${totalQty} items in cart`);
            badge.style.display = 'inline-flex';
        } else {
            badge.removeAttribute('aria-label');
            badge.style.display = 'none';
        }
    }
}

function showCartNotification(productName, totalQty) {
    // Create temporary notification
    const notification = document.createElement('div');
    notification.className = 'cart-notification';
    notification.innerHTML = `
        <div class="cart-notification__content">
            <span class="cart-notification__icon">✓</span>
            <span class="cart-notification__text">Added ${productName} to cart (${totalQty})</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Show with animation
    setTimeout(() => notification.classList.add('cart-notification--show'), 100);
    
    // Hide after 3 seconds
    setTimeout(() => {
        notification.classList.remove('cart-notification--show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

function renderCart() {
    const cart = getCart();
    const cartItemsContainer = document.getElementById('cart-items');
    const cartSummaryContainer = document.getElementById('cart-summary');
    
    if (!cartItemsContainer || !cartSummaryContainer) {
        return;
    }
    
    // Clear existing content
    cartItemsContainer.innerHTML = '';
    cartSummaryContainer.innerHTML = '';
    
    const cartItems = Object.values(cart);
    
    if (cartItems.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="cart-empty">
                <div class="cart-empty__content">
                    <h2>Your cart is empty</h2>
                    <p>Add some products to get started!</p>
                    <a href="shop.html" class="btn btn--primary">Continue Shopping</a>
                </div>
            </div>
        `;
        cartSummaryContainer.innerHTML = '';
        return;
    }
    
    // Build cart items with event delegation structure
    const cartItemsHTML = cartItems.map(item => `
        <div class="cart-item" data-id="${item.id}">
            <div class="cart-item__image">
                <img src="${item.image}" alt="${item.name}" loading="lazy">
            </div>
            <div class="cart-item__details">
                <h3 class="cart-item__name">
                    <a href="product.html?id=${item.id}">${item.name}</a>
                </h3>
                <p class="cart-item__price">£${item.price.toFixed(2)}</p>
            </div>
            <div class="cart-item__quantity">
                <label for="qty-${item.id}" class="visually-hidden">Quantity for ${item.name}</label>
                <button type="button" class="cart-item__qty-btn cart-item__qty-btn--minus" data-id="${item.id}" aria-label="Decrease quantity">-</button>
                <input type="number" id="qty-${item.id}" class="cart-item__qty-input" value="${item.qty}" min="1" max="99" data-id="${item.id}">
                <button type="button" class="cart-item__qty-btn cart-item__qty-btn--plus" data-id="${item.id}" aria-label="Increase quantity">+</button>
            </div>
            <div class="cart-item__total">
                £${(item.price * item.qty).toFixed(2)}
            </div>
            <div class="cart-item__remove">
                <button type="button" class="cart-item__remove-btn" data-id="${item.id}" aria-label="Remove ${item.name} from cart">
                    <span aria-hidden="true">🗑</span>
                    <span class="visually-hidden">Remove item</span>
                </button>
            </div>
        </div>
    `).join('');
    
    cartItemsContainer.innerHTML = `
        <div class="cart-items-header">
            <h2>Your Cart (${Object.values(cart).reduce((sum, item) => sum + item.qty, 0)} items)</h2>
        </div>
        <div class="cart-items-list">
            ${cartItemsHTML}
        </div>
    `;
    
    // Build cart summary
    const subtotal = Object.values(cart).reduce((total, item) => total + (item.price * item.qty), 0);
    cartSummaryContainer.innerHTML = `
        <div class="cart-summary">
            <h3 class="cart-summary__title">Order Summary</h3>
            <div class="cart-summary__line">
                <span>Subtotal</span>
                <span>£${subtotal.toFixed(2)}</span>
            </div>
            <div class="cart-summary__line cart-summary__line--total">
                <span>Total</span>
                <span>£${subtotal.toFixed(2)}</span>
            </div>
            <button type="button" class="btn btn--primary btn--full-width cart-summary__checkout" disabled>
                Checkout (Coming Soon)
            </button>
        </div>
        <section id="checkout-options"></section>
    `;
}

function buildCartPage() {
    renderCart();
    updateCartBadge();
}

function attachCartEventListeners() {
    const cartItemsList = document.querySelector('.cart-items-list');
    if (!cartItemsList) return;
    
    // Use event delegation for all cart interactions
    cartItemsList.addEventListener('click', (e) => {
        const target = e.target;
        const productId = target.dataset.id || target.closest('[data-id]')?.dataset.id;
        
        if (!productId) return;
        
        // Remove button clicked
        if (target.classList.contains('cart-item__remove-btn') || target.closest('.cart-item__remove-btn')) {
            e.preventDefault();
            removeFromCart(productId);
            renderCart();
            updateCartBadge();
            return;
        }
        
        // Quantity plus button
        if (target.classList.contains('cart-item__qty-btn--plus')) {
            e.preventDefault();
            const input = document.getElementById(`qty-${productId}`);
            const currentQty = parseInt(input.value) || 1;
            const newQty = currentQty + 1;
            input.value = newQty;
            updateCartQuantity(productId, newQty);
            renderCart();
            updateCartBadge();
            return;
        }
        
        // Quantity minus button
        if (target.classList.contains('cart-item__qty-btn--minus')) {
            e.preventDefault();
            const input = document.getElementById(`qty-${productId}`);
            const currentQty = parseInt(input.value) || 1;
            const newQty = Math.max(1, currentQty - 1);
            input.value = newQty;
            updateCartQuantity(productId, newQty);
            renderCart();
            updateCartBadge();
            return;
        }
    });
    
    // Handle quantity input changes
    cartItemsList.addEventListener('change', (e) => {
        if (e.target.classList.contains('cart-item__qty-input')) {
            const productId = e.target.dataset.id;
            let newQty = parseInt(e.target.value);
            if (isNaN(newQty) || newQty < 1) {
                newQty = 1;
                e.target.value = newQty;
            }
            updateCartQuantity(productId, newQty);
            renderCart();
            updateCartBadge();
        }
    });
}

// Initialize cart on all pages
document.addEventListener('DOMContentLoaded', function() {
    // Always update cart badge on page load
    updateCartBadge();
    
    // Initialize cart page if we're on cart.html
    if (window.location.pathname.includes('cart.html') || window.location.pathname.endsWith('cart')) {
        buildCartPage();
        attachCartEventListeners();
    }
});

// Global functions for other scripts
window.SmallPawsCart = {
    addToCart,
    removeFromCart,
    updateCartQuantity,
    getCart,
    getCartTotalQty,
    getCartTotalPrice,
    updateCartBadge
};