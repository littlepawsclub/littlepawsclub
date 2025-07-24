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
    console.log('addToCart called:', productData);
    
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
        // Note: Event listeners stay attached to #cart-items, no need to reattach
    }
    
    // Always update badge after adding
    updateCartBadge();
    
    // Show visual feedback
    showCartNotification(cart[productId].name, cart[productId].qty);
    
    console.log('Item added to cart successfully');
}

function removeFromCart(productId) {
    console.log('removeFromCart called:', productId);
    
    const cart = getCart();
    if (cart[productId]) {
        delete cart[productId];
        saveCart(cart);
        
        // Full re-render needed when removing items but reattach listeners
        if (window.location.pathname.includes('cart.html')) {
            renderCart();
            // Note: Event listeners stay attached to #cart-items, no need to reattach
        }
        
        // Always update badge after removal
        updateCartBadge();
        
        console.log('Item removed from cart successfully');
    }
}

function updateCartQuantity(productId, newQty) {
    console.log('updateCartQuantity called:', productId, newQty);
    
    const cart = getCart();
    if (cart[productId] && newQty > 0) {
        cart[productId].qty = parseInt(newQty);
        saveCart(cart);
        
        // Update display without full re-render to preserve event listeners
        updateCartItemDisplay(productId, newQty);
        
        // Always update badge after quantity change
        updateCartBadge();
        
        console.log('Cart quantity updated successfully');
    } else if (newQty <= 0) {
        removeFromCart(productId);
        return; // removeFromCart handles re-rendering
    }
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
    // Get fresh cart data from localStorage every time
    const cart = getCart();
    const totalQty = Object.values(cart).reduce((sum, p) => sum + p.qty, 0);
    
    // Update all possible badge elements
    const badges = document.querySelectorAll('[data-cart-badge], #cart-count, .nav-header__cart-count');
    
    badges.forEach(badge => {
        if (badge) {
            badge.textContent = totalQty;
            badge.classList.toggle('hidden', totalQty === 0);
            
            if (totalQty > 0) {
                badge.setAttribute('aria-label', `${totalQty} items in cart`);
                badge.style.display = 'inline-flex';
                badge.style.visibility = 'visible';
            } else {
                badge.removeAttribute('aria-label');
                badge.style.display = 'none';
                badge.style.visibility = 'hidden';
            }
        }
    });
    
    console.log(`Cart badge updated: ${totalQty} items`);
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
    // Event listeners are attached once globally, no need to re-attach
}

// Global cart event delegation - attached once to static container
function attachCartEventListeners() {
    // Use #cart-items as the stable static parent
    const cartContainer = document.getElementById('cart-items');
    if (!cartContainer) return;
    
    console.log('Attaching cart event listeners to #cart-items');
    
    // Single click event listener using true event delegation
    cartContainer.addEventListener('click', handleCartClick);
    
    // Single change event listener for quantity inputs
    cartContainer.addEventListener('change', handleCartChange);
}

function handleCartClick(e) {
    const target = e.target;
    
    // Find the product ID from the clicked element or its parent
    let productId = target.dataset.id;
    if (!productId) {
        const cartItem = target.closest('[data-id]');
        productId = cartItem?.dataset.id;
    }
    
    if (!productId) return;
    
    console.log('Cart click detected for product:', productId, 'target:', target.className);
    
    // Remove button clicked - check using matches()
    if (target.matches('.cart-item__remove-btn') || target.closest('.cart-item__remove-btn')) {
        e.preventDefault();
        e.stopPropagation();
        console.log('Remove button clicked for:', productId);
        removeFromCart(productId);
        return;
    }
    
    // Quantity plus button - check using matches()
    if (target.matches('.cart-item__qty-btn--plus')) {
        e.preventDefault();
        e.stopPropagation();
        console.log('Plus button clicked for:', productId);
        
        const input = document.getElementById(`qty-${productId}`);
        if (input) {
            const currentQty = parseInt(input.value) || 1;
            const newQty = Math.min(currentQty + 1, 99);
            input.value = newQty;
            updateCartQuantity(productId, newQty);
        }
        return;
    }
    
    // Quantity minus button - check using matches()
    if (target.matches('.cart-item__qty-btn--minus')) {
        e.preventDefault();
        e.stopPropagation();
        console.log('Minus button clicked for:', productId);
        
        const input = document.getElementById(`qty-${productId}`);
        if (input) {
            const currentQty = parseInt(input.value) || 1;
            const newQty = Math.max(1, currentQty - 1);
            input.value = newQty;
            updateCartQuantity(productId, newQty);
        }
        return;
    }
}

function handleCartChange(e) {
    if (e.target.matches('.cart-item__qty-input')) {
        const productId = e.target.dataset.id;
        let newQty = parseInt(e.target.value);
        
        if (isNaN(newQty) || newQty < 1) {
            newQty = 1;
            e.target.value = newQty;
        } else if (newQty > 99) {
            newQty = 99;
            e.target.value = newQty;
        }
        
        console.log('Quantity input changed for:', productId, 'new qty:', newQty);
        updateCartQuantity(productId, newQty);
    }
}

// Update individual cart item display without full re-render
function updateCartItemDisplay(productId, newQty) {
    const cart = getCart();
    const item = cart[productId];
    if (!item) return;
    
    // Update the total price for this item
    const totalElement = document.querySelector(`[data-id="${productId}"] .cart-item__total`);
    if (totalElement) {
        totalElement.textContent = `£${(item.price * newQty).toFixed(2)}`;
    }
    
    // Update cart summary
    const cartSummary = document.getElementById('cart-summary');
    if (cartSummary) {
        updateCartSummary();
    }
    
    // Update items count in header
    const cartHeader = document.querySelector('.cart-items-header h2');
    if (cartHeader) {
        const totalItems = Object.values(cart).reduce((sum, item) => sum + item.qty, 0);
        cartHeader.textContent = `Your Cart (${totalItems} items)`;
    }
}

// Update only the cart summary section
function updateCartSummary() {
    const cart = getCart();
    const cartSummaryContainer = document.getElementById('cart-summary');
    if (!cartSummaryContainer) return;
    
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

// Initialize cart on all pages
document.addEventListener('DOMContentLoaded', function() {
    // Always update cart badge on page load
    updateCartBadge();
    
    // Initialize cart page if we're on cart.html
    if (window.location.pathname.includes('cart.html') || window.location.pathname.endsWith('cart')) {
        // Attach event listeners first (to static container)
        attachCartEventListeners();
        // Then build/render the cart content
        buildCartPage();
    }
    
    // Set up global add-to-cart event delegation
    setupGlobalCartHandlers();
});

// Global event delegation for add-to-cart buttons
function setupGlobalCartHandlers() {
    // Handle add-to-cart button clicks anywhere on the page
    document.addEventListener('click', function(e) {
        // Check if clicked element or its parent is an add-to-cart button
        const addToCartBtn = e.target.closest('[data-add-to-cart]') || e.target.closest('#add-to-cart-btn');
        
        if (addToCartBtn) {
            e.preventDefault();
            handleAddToCartClick(addToCartBtn);
        }
    });
}

// Centralized add-to-cart handler
function handleAddToCartClick(button) {
    // Get product data from various sources
    let productData = {};
    
    // Method 1: From button's data attributes (for shop page)
    if (button.dataset.productId) {
        const productCard = button.closest('.product-card');
        if (productCard) {
            productData = {
                id: button.dataset.productId,
                name: button.dataset.productName,
                price: parseFloat(button.dataset.productPrice),
                image: button.dataset.productImage,
                qty: 1
            };
        }
    }
    
    // Method 2: From product page elements (for product.html)
    else if (button.id === 'add-to-cart-btn') {
        const quantityInput = document.getElementById('product-quantity');
        const productTitle = document.getElementById('product-title');
        const productPrice = document.querySelector('.product-detail__price .product-detail__price-current');
        
        if (productTitle && productPrice) {
            productData = {
                id: new URLSearchParams(window.location.search).get('id'),
                name: productTitle.textContent,
                price: parseFloat(productPrice.textContent.replace('£', '')),
                image: 'https://via.placeholder.com/300x300', // Default placeholder
                qty: quantityInput ? parseInt(quantityInput.value) : 1
            };
        }
    }
    
    // Add to cart if we have valid product data
    if (productData.id && productData.name && productData.price) {
        addToCart(productData);
        
        // Visual feedback
        const originalText = button.innerHTML;
        button.innerHTML = '<i data-feather="check"></i> Added to Cart';
        button.disabled = true;
        
        // Reset button after 2 seconds
        setTimeout(() => {
            button.innerHTML = originalText;
            button.disabled = false;
            if (window.feather) feather.replace();
        }, 2000);
    }
}

// Expose cart functions globally for compatibility
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.updateCartQuantity = updateCartQuantity;
window.updateCartBadge = updateCartBadge;

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