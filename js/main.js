// Small Paws Club - Main JavaScript
// Navigation, product loading, and form handling

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all functionality
    initNavigation();
    loadFeaturedProducts();
    initEmailForm();
    
    console.log('Small Paws Club initialized');
});

// Navigation Toggle
function initNavigation() {
    const toggle = document.querySelector('.nav-header__toggle');
    const drawer = document.querySelector('.nav-header__drawer');
    const body = document.body;
    
    if (!toggle || !drawer) return;
    
    toggle.addEventListener('click', function() {
        const isOpen = drawer.classList.contains('is-open');
        
        if (isOpen) {
            // Close drawer
            drawer.classList.remove('is-open');
            body.classList.remove('nav-drawer-open');
            toggle.setAttribute('aria-expanded', 'false');
        } else {
            // Open drawer
            drawer.classList.add('is-open');
            body.classList.add('nav-drawer-open');
            toggle.setAttribute('aria-expanded', 'true');
        }
    });
    
    // Close drawer when clicking outside
    document.addEventListener('click', function(e) {
        if (!drawer.contains(e.target) && !toggle.contains(e.target)) {
            drawer.classList.remove('is-open');
            body.classList.remove('nav-drawer-open');
            toggle.setAttribute('aria-expanded', 'false');
        }
    });
    
    // Close drawer on escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && drawer.classList.contains('is-open')) {
            drawer.classList.remove('is-open');
            body.classList.remove('nav-drawer-open');
            toggle.setAttribute('aria-expanded', 'false');
        }
    });
}

// Product Loading
async function loadFeaturedProducts() {
    const grid = document.getElementById('products-grid');
    if (!grid) return;
    
    try {
        // Show loading state
        grid.innerHTML = `
            <div class="products-loading">
                <svg data-feather="loader"></svg>
                Loading products...
            </div>
        `;
        
        // Replace feather icons
        if (window.feather) {
            feather.replace();
        }
        
        // Load products from JSON
        const response = await fetch('/data/featured-products.json');
        if (!response.ok) {
            throw new Error('Failed to load products');
        }
        
        const data = await response.json();
        const products = data.products || [];
        
        if (products.length === 0) {
            showEmptyState(grid);
            return;
        }
        
        // Render products
        renderProducts(grid, products);
        
    } catch (error) {
        console.error('Error loading products:', error);
        showErrorState(grid);
    }
}

function renderProducts(grid, products) {
    grid.innerHTML = products.map(product => `
        <article class="product-card ${product.featured ? 'product-card--featured' : ''}" data-product-id="${product.id}">
            <a href="product.html?id=${product.id}" class="product-card__link ${!product.inStock ? 'product-card__link--disabled' : ''}" 
               ${!product.inStock ? 'aria-disabled="true"' : ''}>
                <div class="product-card__image">
                    ${product.image ? 
                        `<img src="${product.image}" alt="${product.title}" loading="lazy">` :
                        `<div class="product-card__image-placeholder">
                            <svg data-feather="package"></svg>
                        </div>`
                    }
                    ${product.badge ? `<span class="product-card__badge">${product.badge}</span>` : ''}
                </div>
                
                <div class="product-card__content">
                    ${product.category ? `<div class="product-card__category">${product.category}</div>` : ''}
                    
                    <h3 class="product-card__title">${product.title}</h3>
                    
                    ${product.description ? `<p class="product-card__description">${product.description}</p>` : ''}
                    
                    <div class="product-card__footer">
                        <div class="product-card__price">
                            <span class="product-card__price-current">£${product.price}</span>
                            ${product.originalPrice ? 
                                `<span class="product-card__price-original">£${product.originalPrice}</span>` : 
                                ''
                            }
                        </div>
                        
                        <span class="product-card__button ${!product.inStock ? 'product-card__button--disabled' : ''}">
                            ${product.inStock ? 
                                `<svg data-feather="arrow-right"></svg> View Product` :
                                'Out of Stock'
                            }
                        </span>
                    </div>
                </div>
            </a>
        </article>
    `).join('');
    
    // Replace feather icons
    if (window.feather) {
        feather.replace();
    }
}

function showEmptyState(grid) {
    grid.innerHTML = `
        <div class="products-empty">
            <svg data-feather="package"></svg>
            <h3>No products available</h3>
            <p>Check back soon for new arrivals!</p>
        </div>
    `;
    
    if (window.feather) {
        feather.replace();
    }
}

function showErrorState(grid) {
    grid.innerHTML = `
        <div class="products-empty">
            <svg data-feather="alert-circle"></svg>
            <h3>Unable to load products</h3>
            <p>Please refresh the page or try again later.</p>
        </div>
    `;
    
    if (window.feather) {
        feather.replace();
    }
}

// Add to Cart Function (placeholder)
function addToCart(productId) {
    console.log('Adding product to cart:', productId);
    
    // Update cart count (placeholder)
    const cartCount = document.querySelector('.nav-header__cart-count');
    if (cartCount) {
        const current = parseInt(cartCount.textContent) || 0;
        cartCount.textContent = current + 1;
    }
    
    // Show feedback (simple alert for now)
    alert('Product added to cart! (This is a placeholder - cart functionality will be implemented in a future phase)');
}

// Email Form Handling
function initEmailForm() {
    const form = document.getElementById('email-form');
    if (!form) return;
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = new FormData(form);
        const email = form.querySelector('input[type="email"]').value;
        
        if (!email || !isValidEmail(email)) {
            showEmailError('Please enter a valid email address');
            return;
        }
        
        try {
            // Show loading state
            form.classList.add('is-submitting');
            const button = form.querySelector('.email-optin__button');
            const originalText = button.innerHTML;
            button.innerHTML = '<svg data-feather="loader"></svg> Subscribing...';
            
            if (window.feather) {
                feather.replace();
            }
            
            // Simulate API call (replace with actual endpoint)
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // Show success
            showEmailSuccess();
            form.reset();
            
        } catch (error) {
            console.error('Email subscription error:', error);
            showEmailError('Something went wrong. Please try again.');
        } finally {
            // Reset form state
            form.classList.remove('is-submitting');
            const button = form.querySelector('.email-optin__button');
            button.innerHTML = 'Subscribe <svg data-feather="arrow-right"></svg>';
            
            if (window.feather) {
                feather.replace();
            }
        }
    });
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function showEmailSuccess() {
    const form = document.getElementById('email-form');
    let successDiv = form.querySelector('.email-optin__success');
    
    if (!successDiv) {
        successDiv = document.createElement('div');
        successDiv.className = 'email-optin__success';
        successDiv.innerHTML = '<p>Thank you for subscribing! Welcome to the Small Paws family.</p>';
        form.appendChild(successDiv);
    }
    
    successDiv.classList.add('is-visible');
    form.classList.add('is-success');
    
    // Hide success message after 5 seconds
    setTimeout(() => {
        successDiv.classList.remove('is-visible');
        form.classList.remove('is-success');
    }, 5000);
}

function showEmailError(message) {
    const form = document.getElementById('email-form');
    let errorDiv = form.querySelector('.email-optin__error');
    
    if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.className = 'email-optin__error';
        form.appendChild(errorDiv);
    }
    
    errorDiv.textContent = message;
    errorDiv.classList.add('is-visible');
    
    // Hide error after 5 seconds
    setTimeout(() => {
        errorDiv.classList.remove('is-visible');
    }, 5000);
}

// Utility Functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Smooth scroll for anchor links
document.addEventListener('click', function(e) {
    if (e.target.matches('a[href^="#"]')) {
        e.preventDefault();
        const target = document.querySelector(e.target.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }
});

// Performance optimization: Lazy load images when they come into view
function initLazyLoading() {
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    if (img.dataset.src) {
                        img.src = img.dataset.src;
                        img.removeAttribute('data-src');
                        observer.unobserve(img);
                    }
                }
            });
        });
        
        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    }
}

// Initialize lazy loading when DOM is ready
document.addEventListener('DOMContentLoaded', initLazyLoading);
