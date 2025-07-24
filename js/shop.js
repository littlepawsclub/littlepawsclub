// Small Paws Club - Shop Page Functionality
// Product filtering and display logic

const Shop = {
  products: [],
  filteredProducts: [],
  
  // Initialize shop functionality
  init() {
    this.loadProducts();
    this.bindEvents();
  },

  // Load products from JSON
  async loadProducts() {
    try {
      const response = await fetch('data/featured-products.json');
      const data = await response.json();
      this.products = data.products;
      this.filteredProducts = [...this.products];
      this.renderProducts();
      this.updateResultsCount();
    } catch (error) {
      console.error('Error loading products:', error);
      this.showError();
    }
  },

  // Bind event listeners
  bindEvents() {
    const categoryFilter = document.getElementById('category-filter');
    const priceFilter = document.getElementById('price-filter');
    const clearFilters = document.getElementById('clear-filters');

    if (categoryFilter) {
      categoryFilter.addEventListener('change', () => this.applyFilters());
    }

    if (priceFilter) {
      priceFilter.addEventListener('change', () => this.applyFilters());
    }

    if (clearFilters) {
      clearFilters.addEventListener('click', () => this.clearAllFilters());
    }
  },

  // Apply current filter settings
  applyFilters() {
    const categoryFilter = document.getElementById('category-filter');
    const priceFilter = document.getElementById('price-filter');
    
    const selectedCategory = categoryFilter ? categoryFilter.value : 'all';
    const selectedPrice = priceFilter ? priceFilter.value : 'all';

    this.filteredProducts = this.products.filter(product => {
      // Category filter
      const categoryMatch = selectedCategory === 'all' || 
        product.category.toLowerCase().includes(selectedCategory.toLowerCase()) ||
        this.mapCategory(product.category) === selectedCategory;

      // Price filter
      const price = parseFloat(product.price);
      let priceMatch = true;
      
      switch (selectedPrice) {
        case 'under-10':
          priceMatch = price < 10;
          break;
        case '10-20':
          priceMatch = price >= 10 && price <= 20;
          break;
        case 'over-20':
          priceMatch = price > 20;
          break;
        default:
          priceMatch = true;
      }

      return categoryMatch && priceMatch;
    });

    this.renderProducts();
    this.updateResultsCount();
  },

  // Map product categories to filter options
  mapCategory(category) {
    const categoryMap = {
      'Enrichment': 'enrichment',
      'Dental Care': 'grooming',
      'Care Tools': 'grooming', 
      'Comfort': 'comfort',
      'Puzzle Toys': 'enrichment',
      'Outdoor': 'enrichment',
      'Novelty': 'enrichment',
      'Exercise': 'enrichment',
      'Habitat': 'comfort',
      'Bundles': 'enrichment'
    };
    return categoryMap[category] || 'enrichment';
  },

  // Clear all filters
  clearAllFilters() {
    const categoryFilter = document.getElementById('category-filter');
    const priceFilter = document.getElementById('price-filter');

    if (categoryFilter) categoryFilter.value = 'all';
    if (priceFilter) priceFilter.value = 'all';

    this.filteredProducts = [...this.products];
    this.renderProducts();
    this.updateResultsCount();
  },

  // Render products to the grid
  renderProducts() {
    const grid = document.getElementById('products-grid');
    if (!grid) return;

    if (this.filteredProducts.length === 0) {
      grid.innerHTML = this.getEmptyState();
      return;
    }

    grid.innerHTML = this.filteredProducts.map(product => this.createProductCard(product)).join('');
    
    // Add event listeners for add-to-cart buttons
    this.attachCartEventListeners();
    
    // Replace feather icons after rendering
    if (window.feather) {
      feather.replace();
    }
  },

  // Create individual product card HTML
  createProductCard(product) {
    const hasOriginalPrice = product.originalPrice && product.originalPrice !== product.price;
    const isOutOfStock = !product.inStock;
    
    return `
      <article class="product-card ${isOutOfStock ? 'product-card--out-of-stock' : ''}" data-product-id="${product.id}">
        <div class="product-card__container">
          <div class="product-card__image">
            ${product.badge ? `<span class="product-card__badge">${product.badge}</span>` : ''}
            <div class="product-card__image-placeholder">
              <i data-feather="package"></i>
            </div>
          </div>
          
          <div class="product-card__content">
            <div class="product-card__category">${product.category}</div>
            <h3 class="product-card__title">${product.title}</h3>
            <p class="product-card__description">${product.description}</p>
            
            <div class="product-card__footer">
              <div class="product-card__price">
                <span class="product-card__price-current">£${product.price}</span>
                ${hasOriginalPrice ? `<span class="product-card__price-original">£${product.originalPrice}</span>` : ''}
              </div>
              
              <span class="product-card__button ${isOutOfStock ? 'product-card__button--disabled' : 'add-to-cart'}" 
                    ${!isOutOfStock ? `data-product-id="${product.id}" data-product-name="${product.title}" data-product-price="${product.price}" data-product-image="${product.image || ''}"` : ''}>
                ${isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                ${!isOutOfStock ? '<i data-feather="shopping-cart"></i>' : ''}
              </span>
            </div>
          </div>
        </div>
      </article>
    `;
  },

  // Get empty state HTML
  getEmptyState() {
    return `
      <div class="products-empty">
        <i data-feather="search"></i>
        <h3>No products found</h3>
        <p>Try adjusting your filters to see more products</p>
      </div>
    `;
  },

  // Update results count
  updateResultsCount() {
    const countElement = document.getElementById('results-count');
    if (!countElement) return;

    const count = this.filteredProducts.length;
    const total = this.products.length;
    
    if (count === total) {
      countElement.textContent = `Showing all ${total} products`;
    } else {
      countElement.textContent = `Showing ${count} of ${total} products`;
    }
  },

  // Show error state
  showError() {
    const grid = document.getElementById('products-grid');
    if (!grid) return;

    grid.innerHTML = `
      <div class="products-empty">
        <i data-feather="alert-circle"></i>
        <h3>Unable to load products</h3>
        <p>Please try refreshing the page</p>
      </div>
    `;
  },

  // No need for individual event listeners - handled globally
  attachCartEventListeners() {
    // Event listeners now handled by global cart delegation in cart.js
    console.log('Shop products rendered - global cart handlers will manage add-to-cart');
  }
};

// Initialize shop when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    if (document.body.getAttribute('data-page') !== 'shop') return;
    Shop.init();
  });
} else {
  // DOM already loaded
  if (document.body.getAttribute('data-page') !== 'shop' && window.location.pathname.includes('shop.html')) {
    Shop.init();
  }
}

// Export for manual initialization
window.Shop = Shop;