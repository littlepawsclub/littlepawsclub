// Small Paws Club - Product Detail Page
// Dynamic product loading and display

const ProductPage = {
  product: null,
  allProducts: [],
  
  // Initialize product page
  init() {
    this.loadProductData();
    this.initQuantitySelector();
    this.initAddToCart();
  },

  // Load products and find the specific product
  async loadProductData() {
    try {
      // Get product ID from URL parameter
      const urlParams = new URLSearchParams(window.location.search);
      const productId = urlParams.get('id');
      
      if (!productId) {
        this.showNotFound();
        return;
      }

      // Load product data
      const response = await fetch('data/featured-products.json');
      const data = await response.json();
      this.allProducts = data.products;
      
      // Find the specific product
      this.product = this.allProducts.find(p => p.id === productId || p.slug === productId);
      
      if (!this.product) {
        this.showNotFound();
        return;
      }

      this.renderProduct();
      this.loadRelatedProducts();
      
      // Replace feather icons after rendering
      if (window.feather) {
        feather.replace();
      }
      
    } catch (error) {
      console.error('Error loading product:', error);
      this.showNotFound();
    }
  },

  // Render the product details
  renderProduct() {
    if (!this.product) return;

    // Hide loading, show content
    document.getElementById('product-loading').style.display = 'none';
    document.getElementById('product-content').style.display = 'block';

    // Update page title and meta
    const pageTitle = `${this.product.title} - Small Paws Club`;
    document.getElementById('page-title').textContent = pageTitle;
    document.title = pageTitle;
    document.getElementById('page-description').setAttribute('content', this.product.description);

    // Update breadcrumb
    document.getElementById('breadcrumb-category').textContent = this.product.category;

    // Product category
    document.getElementById('product-category').textContent = this.product.category;

    // Product title
    document.getElementById('product-title').textContent = this.product.title;

    // Product description
    document.getElementById('product-description').textContent = this.product.description;

    // Product price
    const currentPriceEl = document.getElementById('product-price');
    currentPriceEl.textContent = `£${this.product.price}`;
    
    // Original price (if on sale)
    const originalPriceEl = document.getElementById('product-original-price');
    if (this.product.originalPrice && this.product.originalPrice !== this.product.price) {
      originalPriceEl.textContent = `£${this.product.originalPrice}`;
      originalPriceEl.style.display = 'inline';
    }

    // Stock status
    const stockEl = document.getElementById('product-stock');
    if (this.product.inStock) {
      stockEl.innerHTML = '<i data-feather="check-circle"></i> <span>In Stock</span>';
      stockEl.className = 'product-info__stock product-info__stock--in-stock';
    } else {
      stockEl.innerHTML = '<i data-feather="x-circle"></i> <span>Out of Stock</span>';
      stockEl.className = 'product-info__stock product-info__stock--out-of-stock';
    }

    // Product badge
    const badgeEl = document.getElementById('product-badge');
    if (this.product.badge) {
      badgeEl.textContent = this.product.badge;
      badgeEl.style.display = 'block';
      badgeEl.className = `product-info__badge product-info__badge--${this.product.badge.toLowerCase().replace(' ', '-')}`;
    }

    // Add to cart button
    const addToCartBtn = document.getElementById('add-to-cart-btn');
    if (!this.product.inStock) {
      addToCartBtn.innerHTML = '<span>Out of Stock</span>';
      addToCartBtn.disabled = true;
      addToCartBtn.classList.add('product-card__button--disabled');
    } else {
      addToCartBtn.addEventListener('click', () => this.addToCart());
    }

    // Product image (placeholder for now)
    this.setupProductImage();

    // Re-initialize feather icons for new content
    feather.replace();
  },

  // Setup product image
  setupProductImage() {
    const imagePlaceholder = document.getElementById('product-image-placeholder');
    const imageEl = document.getElementById('product-image');
    
    // For now, use placeholder. In future, check if image exists
    if (this.product.image) {
      imageEl.src = this.product.image;
      imageEl.alt = this.product.title;
      imageEl.style.display = 'block';
      imagePlaceholder.style.display = 'none';
    } else {
      // Keep placeholder visible
      imagePlaceholder.style.display = 'flex';
      imageEl.style.display = 'none';
    }
  },

  // Initialize quantity selector
  initQuantitySelector() {
    const quantityInput = document.getElementById('product-quantity');
    const minusBtn = document.querySelector('.quantity-selector__btn--minus');
    const plusBtn = document.querySelector('.quantity-selector__btn--plus');
    
    if (!quantityInput || !minusBtn || !plusBtn) return;
    
    // Minus button
    minusBtn.addEventListener('click', () => {
      const currentValue = parseInt(quantityInput.value);
      if (currentValue > 1) {
        quantityInput.value = currentValue - 1;
        this.updateQuantityButtons();
      }
    });
    
    // Plus button
    plusBtn.addEventListener('click', () => {
      const currentValue = parseInt(quantityInput.value);
      const maxValue = parseInt(quantityInput.max);
      if (currentValue < maxValue) {
        quantityInput.value = currentValue + 1;
        this.updateQuantityButtons();
      }
    });
    
    // Input change
    quantityInput.addEventListener('change', () => {
      this.updateQuantityButtons();
    });
    
    this.updateQuantityButtons();
  },
  
  // Update quantity button states
  updateQuantityButtons() {
    const quantityInput = document.getElementById('product-quantity');
    const minusBtn = document.querySelector('.quantity-selector__btn--minus');
    const plusBtn = document.querySelector('.quantity-selector__btn--plus');
    
    if (!quantityInput || !minusBtn || !plusBtn) return;
    
    const currentValue = parseInt(quantityInput.value);
    const minValue = parseInt(quantityInput.min);
    const maxValue = parseInt(quantityInput.max);
    
    minusBtn.disabled = currentValue <= minValue;
    plusBtn.disabled = currentValue >= maxValue;
  },
  
  // Initialize add to cart functionality
  initAddToCart() {
    const addToCartBtn = document.getElementById('add-to-cart-btn');
    if (addToCartBtn) {
      addToCartBtn.addEventListener('click', () => this.addToCart());
    }
  },

  // Add product to cart with quantity
  addToCart() {
    if (!this.product || !this.product.inStock) return;
    
    const quantityInput = document.getElementById('product-quantity');
    const quantity = quantityInput ? parseInt(quantityInput.value) : 1;
    
    const productData = {
      id: this.product.id,
      name: this.product.title,
      price: parseFloat(this.product.price),
      image: this.product.image,
      qty: quantity
    };
    
    if (window.SmallPawsCart && window.SmallPawsCart.addToCart) {
      window.SmallPawsCart.addToCart(productData);
    }

    // Show visual feedback
    const addToCartBtn = document.getElementById('add-to-cart-btn');
    const originalText = addToCartBtn.innerHTML;
    addToCartBtn.innerHTML = '<i data-feather="check"></i> Added to Cart';
    addToCartBtn.disabled = true;
    
    // Reset button after 2 seconds
    setTimeout(() => {
      addToCartBtn.innerHTML = originalText;
      addToCartBtn.disabled = false;
      feather.replace();
    }, 2000);
  },

  // Load related products (same category)
  loadRelatedProducts() {
    if (!this.product) return;

    const relatedProducts = this.allProducts
      .filter(p => p.category === this.product.category && p.id !== this.product.id)
      .slice(0, 3);

    if (relatedProducts.length === 0) return;

    // Show related products section
    document.querySelector('.related-products').style.display = 'block';

    const relatedGrid = document.getElementById('related-products-grid');
    relatedGrid.innerHTML = relatedProducts.map(product => this.createRelatedProductCard(product)).join('');
    
    // Re-initialize feather icons
    feather.replace();
  },

  // Create related product card with proper linking
  createRelatedProductCard(product) {
    const hasOriginalPrice = product.originalPrice && product.originalPrice !== product.price;
    const isOutOfStock = !product.inStock;
    
    return `
      <article class="product-card ${isOutOfStock ? 'product-card--out-of-stock' : ''}" data-product-id="${product.id}">
        <a href="product.html?id=${product.id}" class="product-card__link ${isOutOfStock ? 'product-card__link--disabled' : ''}" 
           ${isOutOfStock ? 'aria-disabled="true"' : ''}>
          <div class="product-card__image">
            ${product.badge ? `<span class="product-card__badge">${product.badge}</span>` : ''}
            <div class="product-card__image-placeholder">
              <i data-feather="package"></i>
            </div>
          </div>
          
          <div class="product-card__content">
            <div class="product-card__category">${product.category}</div>
            <h3 class="product-card__title">${product.title}</h3>
            <p class="product-card__description">${product.description.substring(0, 80)}...</p>
            
            <div class="product-card__footer">
              <div class="product-card__price">
                <span class="product-card__price-current">£${product.price}</span>
                ${hasOriginalPrice ? `<span class="product-card__price-original">£${product.originalPrice}</span>` : ''}
              </div>
              
              <span class="product-card__button ${isOutOfStock ? 'product-card__button--disabled' : ''}">
                ${isOutOfStock ? 'Out of Stock' : 'View Product'}
                ${!isOutOfStock ? '<i data-feather="arrow-right"></i>' : ''}
              </span>
            </div>
          </div>
        </a>
      </article>
    `;
  },

  // Show product not found state
  showNotFound() {
    document.getElementById('product-loading').style.display = 'none';
    document.getElementById('product-not-found').style.display = 'block';
    document.title = 'Product Not Found - Small Paws Club';
    
    // Replace feather icons
    if (window.feather) {
      feather.replace();
    }
  }
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    ProductPage.init();
  });
} else {
  ProductPage.init();
}

// Export for manual initialization
window.ProductPage = ProductPage;