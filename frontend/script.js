/**
 * =============================================================================
 * MEVUKA - Artisanal Dry Fruits Web Application
 * Frontend JavaScript Controller (ES6+ with Fetch API)
 * =============================================================================
 * This script connects the frontend UI to the Flask backend API:
 *   - /api/products : Fetch and filter product catalog
 *   - /api/cart     : Add, update, delete, and inspect cart state
 *   - /api/contact  : Validate and submit inquiries
 * 
 * Includes graceful offline fallback in case the server is starting up.
 * =============================================================================
 */

(function () {
  'use strict';

  // ---------------------------------------------------------------------------
  // CONFIGURATION & CONSTANTS
  // ---------------------------------------------------------------------------
  
  // Base URL configuration:
  // If served directly via Flask (http://localhost:5000), relative path works.
  // If opened via VS Code Live Server or static file, point to default Flask port 5000.
  const API_BASE_URL = (window.location.port === '5000' || window.location.origin.includes('5000'))
    ? ''
    : 'http://127.0.0.1:5000';

  // Fallback products dataset (matches backend/products.json)
  // Ensures UI preview works seamlessly even before the Flask server is launched.
  const FALLBACK_PRODUCTS = [
    {
      id: 1,
      name: "Almonds (California)",
      category: "nuts",
      category_name: "Premium Nuts",
      price: 340,
      weight: "250gm",
      rating: 4.9,
      reviews_count: 128,
      in_stock: true,
      badge: "Best Seller",
      origin: "California, USA",
      description: "Hand-selected, jumbo-sized California almonds known for their delicate sweet crunch and rich vitamin E content.",
      benefits: ["Rich in Vitamin E", "Heart Healthy", "Brain Vitality"],
      image: "assets/almonds.jpg"
    },
    {
      id: 2,
      name: "Cashews (Whole)",
      category: "nuts",
      category_name: "Premium Nuts",
      price: 390,
      weight: "250gm",
      rating: 4.8,
      reviews_count: 94,
      in_stock: true,
      badge: "Grade W-240",
      origin: "Mangalore, India",
      description: "Whole, ivory-white gourmet cashews with a natural buttery texture and melt-in-the-mouth creaminess.",
      benefits: ["Zero Cholesterol", "High Plant Protein", "Zinc Rich"],
      image: "assets/cashews.jpg"
    },
    {
      id: 3,
      name: "Walnuts (Kernels)",
      category: "nuts",
      category_name: "Premium Nuts",
      price: 420,
      weight: "250gm",
      rating: 4.9,
      reviews_count: 86,
      in_stock: true,
      badge: "Extra Light Halves",
      origin: "Kashmir Valley",
      description: "Premium extra-light Kashmiri walnut halves. Prized for their mild, non-bitter flavor and abundant plant Omega-3.",
      benefits: ["Omega-3 ALA", "Enhances Memory", "Anti-inflammatory"],
      image: "assets/walnuts.jpg"
    },
    {
      id: 4,
      name: "Pistachios (Roasted & Salted)",
      category: "nuts",
      category_name: "Premium Nuts",
      price: 380,
      weight: "250gm",
      rating: 4.8,
      reviews_count: 112,
      in_stock: true,
      badge: "Slow Roasted",
      origin: "California / Iran",
      description: "Naturally opened, slow-roasted in small batches and gently tossed with pink Himalayan rock salt.",
      benefits: ["Complete Protein", "Lutein Rich", "Satisfying Crunch"],
      image: "assets/pistachios.jpg"
    },
    {
      id: 5,
      name: "Raisins (Golden)",
      category: "dried_fruits",
      category_name: "Sun-Dried Fruits",
      price: 190,
      weight: "250gm",
      rating: 4.7,
      reviews_count: 76,
      in_stock: true,
      badge: "100% Seedless",
      origin: "Nashik Orchards",
      description: "Juicy, amber-gold seedless raisins gently sun-dried to concentrate their natural honeyed sweetness.",
      benefits: ["Natural Energy", "High Iron", "Aids Digestion"],
      image: "assets/raisins.jpg"
    },
    {
      id: 6,
      name: "Dates (Medjool)",
      category: "dried_fruits",
      category_name: "Sun-Dried Fruits",
      price: 490,
      weight: "250gm",
      rating: 5.0,
      reviews_count: 152,
      in_stock: true,
      badge: "King of Dates",
      origin: "Jordan Valley",
      description: "Celebrated as the King of Dates, our premium Medjool dates are remarkably large with soft caramel flesh.",
      benefits: ["Potassium Rich", "Zero Added Sugar", "Natural Stamina"],
      image: "assets/dates.jpg"
    },
    {
      id: 7,
      name: "Dried Apricots",
      category: "dried_fruits",
      category_name: "Sun-Dried Fruits",
      price: 320,
      weight: "250gm",
      rating: 4.8,
      reviews_count: 68,
      in_stock: true,
      badge: "Sun-Ripened",
      origin: "Malatya, Turkey",
      description: "Whole sun-dried Turkish apricots with a vibrant tangy-sweet flavor profile and soft chewy texture.",
      benefits: ["Radiant Skin", "High Fiber", "Vitamin A Rich"],
      image: "assets/apricots.jpg"
    },
    {
      id: 8,
      name: "Dried Figs (Anjeer)",
      category: "dried_fruits",
      category_name: "Sun-Dried Fruits",
      price: 460,
      weight: "250gm",
      rating: 4.9,
      reviews_count: 104,
      in_stock: true,
      badge: "Artisanal String",
      origin: "Aydın, Turkey",
      description: "Naturally string-dried Turkish Anjeer packed with natural crunch and sweet floral nectar. Sulphur-free.",
      benefits: ["Calcium for Bones", "Blood Pressure", "Gut Prebiotic"],
      image: "assets/figs.jpg"
    },
    {
      id: 9,
      name: "Black Currants",
      category: "dried_fruits",
      category_name: "Sun-Dried Fruits",
      price: 280,
      weight: "250gm",
      rating: 4.7,
      reviews_count: 59,
      in_stock: true,
      badge: "Antioxidant Rich",
      origin: "Pacific Northwest",
      description: "Tart, intense, and deeply pigmented dried black currants bursting with plant anthocyanins.",
      benefits: ["Mega Anthocyanins", "Eye Health", "Low Glycemic"],
      image: "assets/black_currants.jpg"
    },
    {
      id: 10,
      name: "Pine Nuts",
      category: "seeds_gourmet",
      category_name: "Gourmet & Rare",
      price: 1150,
      weight: "250gm",
      rating: 5.0,
      reviews_count: 43,
      in_stock: true,
      badge: "Himalayan Chilgoza",
      origin: "Kinnaur, Himalayas",
      description: "Ultra-rare wild harvested Himalayan Chilgoza pine nuts with a delicate resinous aroma and silky buttery taste.",
      benefits: ["Pinolenic Acid", "Satiety Control", "Monounsaturated Fats"],
      image: "assets/pine_nuts.jpg"
    }
  ];

  // ---------------------------------------------------------------------------
  // APPLICATION STATE
  // ---------------------------------------------------------------------------
  const state = {
    products: [],
    filteredProducts: [],
    activeCategory: 'all',
    searchQuery: '',
    cart: {
      items: [],
      total_items: 0,
      subtotal: 0,
      shipping_fee: 60,
      grand_total: 0,
      free_shipping_threshold: 999
    },
    isBackendOnline: false
  };

  // ---------------------------------------------------------------------------
  // DOM REFERENCES
  // ---------------------------------------------------------------------------
  const DOM = {
    // Header & Nav
    siteHeader: document.getElementById('site-header'),
    serverStatus: document.getElementById('server-status'),
    cartTriggerBtn: document.getElementById('cart-trigger-btn'),
    cartCount: document.getElementById('cart-count'),
    mobileToggleBtn: document.getElementById('mobile-toggle-btn'),
    mainNav: document.getElementById('main-nav'),

    // Catalog controls
    filterPills: document.getElementById('filter-pills'),
    searchInput: document.getElementById('product-search-input'),
    clearSearchBtn: document.getElementById('clear-search-btn'),
    productCountDisplay: document.getElementById('product-count-display'),
    activeFilterLabel: document.getElementById('active-filter-label'),
    productsGrid: document.getElementById('products-grid'),
    noResultsState: document.getElementById('no-results-state'),
    resetFilterBtn: document.getElementById('reset-filter-btn'),

    // Cart Drawer
    cartDrawer: document.getElementById('cart-drawer'),
    cartBackdrop: document.getElementById('cart-backdrop'),
    drawerCloseBtn: document.getElementById('drawer-close-btn'),
    drawerItemsList: document.getElementById('drawer-items-list'),
    drawerCountBadge: document.getElementById('drawer-count-badge'),
    drawerSubtotal: document.getElementById('drawer-subtotal'),
    drawerShipping: document.getElementById('drawer-shipping'),
    drawerTotal: document.getElementById('drawer-total'),
    meterFill: document.getElementById('meter-fill'),
    meterText: document.getElementById('meter-text'),
    clearCartBtn: document.getElementById('clear-cart-btn'),
    checkoutBtn: document.getElementById('checkout-btn'),

    // Checkout Modal
    checkoutModal: document.getElementById('checkout-modal'),
    checkoutModalBackdrop: document.getElementById('checkout-modal-backdrop'),
    modalCloseBtn: document.getElementById('modal-close-btn'),
    modalItemCount: document.getElementById('modal-item-count'),
    modalItemsPreview: document.getElementById('modal-items-preview'),
    modalPayableAmount: document.getElementById('modal-payable-amount'),

    // Contact Form
    contactForm: document.getElementById('contact-form'),
    contactSubmitBtn: document.getElementById('contact-submit-btn'),
    formStatusBox: document.getElementById('form-status-box'),

    // Toasts
    toastContainer: document.getElementById('toast-container')
  };

  // ---------------------------------------------------------------------------
  // INITIALIZATION
  // ---------------------------------------------------------------------------
  async function init() {
    setupEventListeners();
    await checkServerAndLoadProducts();
    await syncCart();
  }

  // ---------------------------------------------------------------------------
  // BACKEND API CLIENT
  // ---------------------------------------------------------------------------

  /**
   * Fetch products from Flask backend API (/api/products)
   * Falls back to FALLBACK_PRODUCTS if offline.
   */
  async function checkServerAndLoadProducts() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/products`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();
      if (data.success && Array.isArray(data.products) && data.products.length > 0) {
        state.products = data.products;
        setServerStatus(true);
      } else {
        state.products = FALLBACK_PRODUCTS;
        setServerStatus(false);
      }
    } catch (err) {
      console.warn('[Mevuka] Backend API offline or starting. Using fallback product database.', err);
      state.products = FALLBACK_PRODUCTS;
      setServerStatus(false);
    }

    applyFilters();
  }

  /**
   * Sync Cart with Backend API (/api/cart)
   */
  async function syncCart() {
    if (state.isBackendOnline) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/cart`);
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.cart) {
            state.cart = data.cart;
            renderCart();
            return;
          }
        }
      } catch (e) {
        console.warn('[Mevuka] Could not sync cart with backend:', e);
      }
    }

    // Fallback: local cart state calculation
    calculateLocalCart();
    renderCart();
  }

  /**
   * Send Add to Cart request to backend (/api/cart, POST)
   */
  async function apiAddToCart(productId, quantity = 1) {
    if (state.isBackendOnline) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/cart`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ product_id: productId, quantity: quantity })
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.cart) {
            state.cart = data.cart;
            renderCart();
            triggerBadgeBump();
            return;
          }
        }
      } catch (err) {
        console.warn('[Mevuka] API add to cart error, falling back to local state:', err);
      }
    }

    // Local cart fallback
    const product = state.products.find(p => p.id === productId);
    if (!product) return;

    const existing = state.cart.items.find(item => item.product_id === productId);
    if (existing) {
      existing.quantity += quantity;
    } else {
      state.cart.items.push({
        product_id: productId,
        product: product,
        quantity: quantity
      });
    }

    calculateLocalCart();
    renderCart();
    triggerBadgeBump();
  }

  /**
   * Update Cart Item Quantity (/api/cart/<id>, PUT)
   */
  async function apiUpdateCartQty(productId, newQty) {
    if (state.isBackendOnline) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/cart/${productId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ quantity: newQty })
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.cart) {
            state.cart = data.cart;
            renderCart();
            return;
          }
        }
      } catch (err) {
        console.warn('[Mevuka] API update cart error:', err);
      }
    }

    // Local fallback
    const itemIndex = state.cart.items.findIndex(item => item.product_id === productId);
    if (itemIndex > -1) {
      if (newQty <= 0) {
        state.cart.items.splice(itemIndex, 1);
      } else {
        state.cart.items[itemIndex].quantity = newQty;
      }
    }

    calculateLocalCart();
    renderCart();
  }

  /**
   * Remove item from Cart (/api/cart/<id>, DELETE)
   */
  async function apiRemoveFromCart(productId) {
    if (state.isBackendOnline) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/cart/${productId}`, {
          method: 'DELETE'
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.cart) {
            state.cart = data.cart;
            renderCart();
            return;
          }
        }
      } catch (err) {
        console.warn('[Mevuka] API remove error:', err);
      }
    }

    // Local fallback
    state.cart.items = state.cart.items.filter(item => item.product_id !== productId);
    calculateLocalCart();
    renderCart();
  }

  /**
   * Clear entire cart (/api/cart, DELETE)
   */
  async function apiClearCart() {
    if (state.isBackendOnline) {
      try {
        await fetch(`${API_BASE_URL}/api/cart`, { method: 'DELETE' });
      } catch (e) {
        console.warn('[Mevuka] Could not clear backend cart:', e);
      }
    }

    state.cart.items = [];
    calculateLocalCart();
    renderCart();
    showToast('Your harvest bag has been cleared.', 'info');
  }

  /**
   * Submit Contact Form (/api/contact, POST)
   */
  async function apiSubmitContact(formData) {
    if (state.isBackendOnline) {
      const response = await fetch(`${API_BASE_URL}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        const errMessage = result.errors ? result.errors.join(', ') : (result.error || 'Submission failed');
        throw new Error(errMessage);
      }

      return result;
    }

    // Simulated local response when offline
    await new Promise(resolve => setTimeout(resolve, 600));
    return {
      success: true,
      message: `Thank you, ${formData.name}! Your message has been noted (local demo mode). We will reach out to ${formData.email} soon.`
    };
  }

  // ---------------------------------------------------------------------------
  // LOCAL HELPER CALCULATIONS
  // ---------------------------------------------------------------------------
  function calculateLocalCart() {
    const total_items = state.cart.items.reduce((sum, it) => sum + it.quantity, 0);
    const subtotal = state.cart.items.reduce((sum, it) => sum + (it.product.price * it.quantity), 0);
    const free_shipping_threshold = 999;
    const shipping_fee = (subtotal >= free_shipping_threshold || subtotal === 0) ? 0 : 60;
    const grand_total = subtotal + shipping_fee;

    state.cart = {
      items: state.cart.items,
      total_items,
      subtotal,
      shipping_fee,
      free_shipping_threshold,
      grand_total
    };
  }

  function setServerStatus(online) {
    state.isBackendOnline = online;
    if (!DOM.serverStatus) return;

    const dot = DOM.serverStatus.querySelector('.status-dot');
    const label = DOM.serverStatus.querySelector('.status-label');

    if (online) {
      dot.classList.remove('offline');
      label.textContent = 'Flask API Live';
      DOM.serverStatus.title = 'Connected to Flask Backend at http://127.0.0.1:5000';
    } else {
      dot.classList.add('offline');
      label.textContent = 'Demo Mode (Offline)';
      DOM.serverStatus.title = 'Flask Backend offline. Run "python backend/app.py" to connect live.';
    }
  }

  // ---------------------------------------------------------------------------
  // FILTERING & SEARCHING
  // ---------------------------------------------------------------------------
  function applyFilters() {
    const query = state.searchQuery.trim().toLowerCase();
    const category = state.activeCategory;

    state.filteredProducts = state.products.filter(product => {
      // Category check
      const matchesCategory = (category === 'all') || (product.category === category);

      // Search query check
      const matchesSearch = !query || 
        product.name.toLowerCase().includes(query) ||
        (product.description && product.description.toLowerCase().includes(query)) ||
        (product.origin && product.origin.toLowerCase().includes(query));

      return matchesCategory && matchesSearch;
    });

    renderProducts();
  }

  // ---------------------------------------------------------------------------
  // RENDERING FUNCTIONS
  // ---------------------------------------------------------------------------

  /**
   * Render Product Cards into #products-grid
   */
  function renderProducts() {
    if (!DOM.productsGrid) return;

    // Update count display
    if (DOM.productCountDisplay) {
      DOM.productCountDisplay.textContent = state.filteredProducts.length;
    }

    // Toggle No Results View
    if (state.filteredProducts.length === 0) {
      DOM.productsGrid.innerHTML = '';
      if (DOM.noResultsState) DOM.noResultsState.classList.remove('hidden');
      return;
    }

    if (DOM.noResultsState) DOM.noResultsState.classList.add('hidden');

    // Generate HTML for each dry fruit card
    const cardsHtml = state.filteredProducts.map(product => {
      const benefitsHtml = (product.benefits || [])
        .slice(0, 3)
        .map(b => `<span class="benefit-tag">${escapeHtml(b)}</span>`)
        .join('');

      return `
        <article class="product-card" data-product-id="${product.id}">
          <!-- Image and Badges -->
          <div class="product-image-container">
            <img 
              src="${product.image}" 
              alt="${escapeHtml(product.name)}" 
              class="product-img" 
              loading="lazy"
              onerror="this.onerror=null; this.src='assets/hero_banner.jpg';"
            >
            <span class="card-badge-left">${escapeHtml(product.weight || '250gm')}</span>
            ${product.badge ? `<span class="card-badge-right">${escapeHtml(product.badge)}</span>` : ''}
          </div>

          <!-- Card Body -->
          <div class="product-body">
            <div class="product-meta-row">
              <span class="product-category-tag">${escapeHtml(product.category_name || product.category)}</span>
              <div class="product-rating">
                <i class="fa-solid fa-star"></i>
                <span>${product.rating || 4.9}</span>
                <span class="review-count">(${product.reviews_count || 50}+)</span>
              </div>
            </div>

            <h3 class="product-title">${escapeHtml(product.name)}</h3>
            
            <div class="product-origin">
              <i class="fa-solid fa-location-dot"></i>
              <span>${escapeHtml(product.origin || 'Heritage Orchards')}</span>
            </div>

            <p class="product-desc">${escapeHtml(product.description || '')}</p>

            <div class="product-tags">
              ${benefitsHtml}
            </div>

            <!-- Price and Actions -->
            <div class="product-footer">
              <div class="price-row">
                <div class="price-wrap">
                  <span class="price-currency">₹</span>
                  <span class="price-value">${product.price}</span>
                  <span class="price-weight">/ 250g packet</span>
                </div>
                <span class="in-stock-badge">In Stock</span>
              </div>

              <div class="card-actions-row">
                <!-- Quantity Stepper -->
                <div class="qty-stepper" data-card-stepper="${product.id}">
                  <button type="button" class="qty-btn qty-minus" aria-label="Decrease Quantity">
                    <i class="fa-solid fa-minus"></i>
                  </button>
                  <input type="number" class="qty-input" value="1" min="1" max="20" readonly>
                  <button type="button" class="qty-btn qty-plus" aria-label="Increase Quantity">
                    <i class="fa-solid fa-plus"></i>
                  </button>
                </div>

                <!-- Add to Cart Button -->
                <button type="button" class="add-to-cart-btn" data-add-btn="${product.id}">
                  <i class="fa-solid fa-bag-shopping"></i>
                  <span>Add to Bag</span>
                </button>
              </div>
            </div>

          </div>
        </article>
      `;
    }).join('');

    DOM.productsGrid.innerHTML = cardsHtml;
    attachCardEventListeners();
  }

  /**
   * Attach card button listeners (steppers and add to cart)
   */
  function attachCardEventListeners() {
    // Steppers inside cards
    const steppers = DOM.productsGrid.querySelectorAll('.qty-stepper');
    steppers.forEach(stepper => {
      const input = stepper.querySelector('.qty-input');
      const minus = stepper.querySelector('.qty-minus');
      const plus = stepper.querySelector('.qty-plus');

      minus.addEventListener('click', () => {
        let val = parseInt(input.value, 10) || 1;
        if (val > 1) input.value = val - 1;
      });

      plus.addEventListener('click', () => {
        let val = parseInt(input.value, 10) || 1;
        if (val < 20) input.value = val + 1;
      });
    });

    // Add to Bag buttons
    const addButtons = DOM.productsGrid.querySelectorAll('[data-add-btn]');
    addButtons.forEach(btn => {
      btn.addEventListener('click', async () => {
        const productId = parseInt(btn.getAttribute('data-add-btn'), 10);
        const card = btn.closest('.product-card');
        const qtyInput = card ? card.querySelector('.qty-input') : null;
        const qty = qtyInput ? (parseInt(qtyInput.value, 10) || 1) : 1;

        // Visual feedback
        const originalText = btn.innerHTML;
        btn.classList.add('added');
        btn.innerHTML = `<i class="fa-solid fa-check"></i> Added!`;
        setTimeout(() => {
          btn.classList.remove('added');
          btn.innerHTML = originalText;
        }, 1200);

        const product = state.products.find(p => p.id === productId);
        await apiAddToCart(productId, qty);
        
        showToast(`Added ${qty} × 250g ${product ? product.name : 'Packet'} to harvest bag.`, 'success');
      });
    });
  }

  /**
   * Render Cart Drawer & Header Counter Badge
   */
  function renderCart() {
    const { items, total_items, subtotal, shipping_fee, grand_total, free_shipping_threshold } = state.cart;

    // Header counter badge
    if (DOM.cartCount) {
      DOM.cartCount.textContent = total_items;
    }

    // Drawer header count
    if (DOM.drawerCountBadge) {
      DOM.drawerCountBadge.textContent = `${total_items} ${total_items === 1 ? 'item' : 'items'}`;
    }

    // Summary numbers
    if (DOM.drawerSubtotal) DOM.drawerSubtotal.textContent = `₹${subtotal.toLocaleString('en-IN')}`;
    if (DOM.drawerShipping) {
      DOM.drawerShipping.textContent = (shipping_fee === 0) ? 'FREE' : `₹${shipping_fee}`;
    }
    if (DOM.drawerTotal) DOM.drawerTotal.textContent = `₹${grand_total.toLocaleString('en-IN')}`;

    // Free Shipping Progress Meter
    if (DOM.meterFill && DOM.meterText) {
      if (subtotal >= free_shipping_threshold) {
        DOM.meterFill.style.width = '100%';
        DOM.meterText.innerHTML = `<i class="fa-solid fa-circle-check" style="color:#2E7D32;"></i> <strong>Congratulations!</strong> You have unlocked FREE Express Delivery!`;
      } else {
        const remaining = free_shipping_threshold - subtotal;
        const percentage = Math.min(100, Math.round((subtotal / free_shipping_threshold) * 100));
        DOM.meterFill.style.width = `${percentage}%`;
        DOM.meterText.innerHTML = `Add <strong>₹${remaining.toLocaleString('en-IN')}</strong> more to unlock <strong>FREE Express Shipping</strong>!`;
      }
    }

    // Render items inside drawer
    if (!DOM.drawerItemsList) return;

    if (items.length === 0) {
      DOM.drawerItemsList.innerHTML = `
        <div class="empty-cart-view">
          <i class="fa-solid fa-basket-shopping"></i>
          <h4>Your Harvest Bag is Empty</h4>
          <p>Explore our premium single-origin 250g packets and treat yourself to nature's purest harvest.</p>
          <button class="btn btn-primary" id="drawer-shop-now-btn">
            Explore Collection
          </button>
        </div>
      `;
      const shopBtn = document.getElementById('drawer-shop-now-btn');
      if (shopBtn) {
        shopBtn.addEventListener('click', () => {
          closeCartDrawer();
          const target = document.getElementById('products');
          if (target) target.scrollIntoView({ behavior: 'smooth' });
        });
      }
      return;
    }

    // Items list HTML
    const itemsHtml = items.map(item => {
      const prod = item.product;
      const itemSubtotal = prod.price * item.quantity;

      return `
        <div class="drawer-item" data-item-id="${item.product_id}">
          <img 
            src="${prod.image}" 
            alt="${escapeHtml(prod.name)}" 
            class="drawer-item-thumb"
            onerror="this.onerror=null; this.src='assets/hero_banner.jpg';"
          >
          <div class="drawer-item-info">
            <span class="drawer-item-title">${escapeHtml(prod.name)}</span>
            <span class="drawer-item-pack">250g Fresh-Pack</span>
            <span class="drawer-item-price">₹${prod.price} × ${item.quantity} = ₹${itemSubtotal}</span>
          </div>
          <div class="drawer-item-actions">
            <button class="drawer-remove-btn" data-remove-item="${item.product_id}" title="Remove item">
              <i class="fa-regular fa-trash-can"></i>
            </button>
            <div class="drawer-item-stepper">
              <button class="drawer-stepper-btn" data-qty-dec="${item.product_id}">−</button>
              <span class="drawer-stepper-qty">${item.quantity}</span>
              <button class="drawer-stepper-btn" data-qty-inc="${item.product_id}">+</button>
            </div>
          </div>
        </div>
      `;
    }).join('');

    DOM.drawerItemsList.innerHTML = itemsHtml;
    attachDrawerItemListeners();
  }

  /**
   * Attach listeners for drawer items (+, -, remove)
   */
  function attachDrawerItemListeners() {
    // Increment quantity
    DOM.drawerItemsList.querySelectorAll('[data-qty-inc]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.getAttribute('data-qty-inc'), 10);
        const item = state.cart.items.find(it => it.product_id === id);
        if (item) apiUpdateCartQty(id, item.quantity + 1);
      });
    });

    // Decrement quantity
    DOM.drawerItemsList.querySelectorAll('[data-qty-dec]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.getAttribute('data-qty-dec'), 10);
        const item = state.cart.items.find(it => it.product_id === id);
        if (item) apiUpdateCartQty(id, item.quantity - 1);
      });
    });

    // Remove item
    DOM.drawerItemsList.querySelectorAll('[data-remove-item]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.getAttribute('data-remove-item'), 10);
        const item = state.cart.items.find(it => it.product_id === id);
        apiRemoveFromCart(id);
        showToast(`Removed ${item ? item.product.name : 'Item'} from harvest bag.`, 'info');
      });
    });
  }

  // ---------------------------------------------------------------------------
  // CART DRAWER & CHECKOUT MODAL CONTROLS
  // ---------------------------------------------------------------------------
  function openCartDrawer() {
    if (DOM.cartDrawer) DOM.cartDrawer.classList.add('open');
    if (DOM.cartBackdrop) DOM.cartBackdrop.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeCartDrawer() {
    if (DOM.cartDrawer) DOM.cartDrawer.classList.remove('open');
    if (DOM.cartBackdrop) DOM.cartBackdrop.classList.remove('open');
    document.body.style.overflow = '';
  }

  function openCheckoutModal() {
    if (state.cart.items.length === 0) {
      showToast('Your harvest bag is currently empty!', 'error');
      return;
    }

    closeCartDrawer();

    // Populate modal preview
    if (DOM.modalItemCount) DOM.modalItemCount.textContent = state.cart.total_items;
    if (DOM.modalPayableAmount) DOM.modalPayableAmount.textContent = `₹${state.cart.grand_total.toLocaleString('en-IN')}`;

    if (DOM.modalItemsPreview) {
      DOM.modalItemsPreview.innerHTML = state.cart.items.map(it => `
        <div class="preview-row">
          <span>${it.quantity} × ${escapeHtml(it.product.name)} (250g)</span>
          <strong>₹${it.product.price * it.quantity}</strong>
        </div>
      `).join('');
    }

    if (DOM.checkoutModal) DOM.checkoutModal.classList.add('open');
    if (DOM.checkoutModalBackdrop) DOM.checkoutModalBackdrop.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeCheckoutModal() {
    if (DOM.checkoutModal) DOM.checkoutModal.classList.remove('open');
    if (DOM.checkoutModalBackdrop) DOM.checkoutModalBackdrop.classList.remove('open');
    document.body.style.overflow = '';
  }

  function completeCheckout() {
    closeCheckoutModal();
    apiClearCart();
    showToast('🎉 Order Placed Successfully! Your artisanal dry fruits will be dispatched today.', 'success');
  }

  function triggerBadgeBump() {
    if (!DOM.cartCount) return;
    DOM.cartCount.classList.remove('bump');
    void DOM.cartCount.offsetWidth; // Trigger reflow
    DOM.cartCount.classList.add('bump');
  }

  // ---------------------------------------------------------------------------
  // TOAST NOTIFICATIONS
  // ---------------------------------------------------------------------------
  function showToast(message, type = 'info') {
    if (!DOM.toastContainer) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    let iconClass = 'fa-solid fa-circle-info';
    if (type === 'success') iconClass = 'fa-solid fa-circle-check';
    if (type === 'error') iconClass = 'fa-solid fa-circle-exclamation';

    toast.innerHTML = `
      <i class="${iconClass} toast-icon"></i>
      <span class="toast-msg">${escapeHtml(message)}</span>
    `;

    DOM.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('removing');
      setTimeout(() => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 300);
    }, 3800);
  }

  // ---------------------------------------------------------------------------
  // CONTACT FORM LOGIC
  // ---------------------------------------------------------------------------
  function handleContactSubmit(e) {
    e.preventDefault();
    if (!DOM.contactForm) return;

    const nameInput = document.getElementById('contact-name');
    const emailInput = document.getElementById('contact-email');
    const subjectInput = document.getElementById('contact-subject');
    const messageInput = document.getElementById('contact-message');

    const nameError = document.getElementById('name-error');
    const emailError = document.getElementById('email-error');
    const messageError = document.getElementById('message-error');

    // Reset error messages
    if (nameError) { nameError.textContent = ''; nameError.classList.remove('visible'); }
    if (emailError) { emailError.textContent = ''; emailError.classList.remove('visible'); }
    if (messageError) { messageError.textContent = ''; messageError.classList.remove('visible'); }
    if (DOM.formStatusBox) { DOM.formStatusBox.className = 'form-status-box hidden'; DOM.formStatusBox.textContent = ''; }

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const subject = subjectInput ? subjectInput.value : 'General Inquiry';
    const message = messageInput.value.trim();

    let hasError = false;

    if (!name) {
      if (nameError) { nameError.textContent = 'Please provide your full name.'; nameError.classList.add('visible'); }
      hasError = true;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      if (emailError) { emailError.textContent = 'Please enter a valid email address.'; emailError.classList.add('visible'); }
      hasError = true;
    }

    if (!message) {
      if (messageError) { messageError.textContent = 'Message field cannot be empty.'; messageError.classList.add('visible'); }
      hasError = true;
    }

    if (hasError) return;

    // Submit via API
    const submitBtn = DOM.contactSubmitBtn;
    const originalText = submitBtn ? submitBtn.innerHTML : '';
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Submitting...`;
    }

    apiSubmitContact({ name, email, subject, message })
      .then(res => {
        if (DOM.formStatusBox) {
          DOM.formStatusBox.className = 'form-status-box success';
          DOM.formStatusBox.innerHTML = `<i class="fa-solid fa-check"></i> ${escapeHtml(res.message)}`;
          DOM.formStatusBox.classList.remove('hidden');
        }
        showToast('Inquiry received! Our concierge will contact you shortly.', 'success');
        DOM.contactForm.reset();
      })
      .catch(err => {
        if (DOM.formStatusBox) {
          DOM.formStatusBox.className = 'form-status-box error';
          DOM.formStatusBox.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> ${escapeHtml(err.message || 'Error sending inquiry.')}`;
          DOM.formStatusBox.classList.remove('hidden');
        }
        showToast('Error submitting form. Please check your details.', 'error');
      })
      .finally(() => {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalText;
        }
      });
  }

  // ---------------------------------------------------------------------------
  // EVENT LISTENERS SETUP
  // ---------------------------------------------------------------------------
  function setupEventListeners() {
    // Sticky header shadow
    window.addEventListener('scroll', () => {
      if (window.scrollY > 40) {
        DOM.siteHeader?.classList.add('scrolled');
      } else {
        DOM.siteHeader?.classList.remove('scrolled');
      }
    });

    // Mobile nav toggle
    if (DOM.mobileToggleBtn && DOM.mainNav) {
      DOM.mobileToggleBtn.addEventListener('click', () => {
        DOM.mainNav.classList.toggle('open');
      });

      // Close menu when clicking nav links
      DOM.mainNav.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
          DOM.mainNav.classList.remove('open');
        });
      });
    }

    // Category filter pills
    if (DOM.filterPills) {
      DOM.filterPills.addEventListener('click', (e) => {
        const pill = e.target.closest('.filter-pill');
        if (!pill) return;

        DOM.filterPills.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');

        state.activeCategory = pill.getAttribute('data-category');
        if (DOM.activeFilterLabel) {
          DOM.activeFilterLabel.textContent = pill.textContent.trim();
        }

        applyFilters();
      });
    }

    // Search input
    if (DOM.searchInput) {
      DOM.searchInput.addEventListener('input', (e) => {
        state.searchQuery = e.target.value;
        if (DOM.clearSearchBtn) {
          if (state.searchQuery.length > 0) {
            DOM.clearSearchBtn.classList.add('visible');
          } else {
            DOM.clearSearchBtn.classList.remove('visible');
          }
        }
        applyFilters();
      });
    }

    // Clear search button
    if (DOM.clearSearchBtn) {
      DOM.clearSearchBtn.addEventListener('click', () => {
        if (DOM.searchInput) {
          DOM.searchInput.value = '';
          state.searchQuery = '';
          DOM.clearSearchBtn.classList.remove('visible');
          applyFilters();
        }
      });
    }

    // Reset filter button in empty state
    if (DOM.resetFilterBtn) {
      DOM.resetFilterBtn.addEventListener('click', () => {
        state.searchQuery = '';
        state.activeCategory = 'all';
        if (DOM.searchInput) DOM.searchInput.value = '';
        if (DOM.clearSearchBtn) DOM.clearSearchBtn.classList.remove('visible');
        if (DOM.filterPills) {
          DOM.filterPills.querySelectorAll('.filter-pill').forEach(p => {
            p.classList.toggle('active', p.getAttribute('data-category') === 'all');
          });
        }
        if (DOM.activeFilterLabel) DOM.activeFilterLabel.textContent = 'All Categories';
        applyFilters();
      });
    }

    // Cart Drawer triggers
    if (DOM.cartTriggerBtn) DOM.cartTriggerBtn.addEventListener('click', openCartDrawer);
    if (DOM.drawerCloseBtn) DOM.drawerCloseBtn.addEventListener('click', closeCartDrawer);
    if (DOM.cartBackdrop) DOM.cartBackdrop.addEventListener('click', closeCartDrawer);

    // Clear Cart button
    if (DOM.clearCartBtn) DOM.clearCartBtn.addEventListener('click', apiClearCart);

    // Checkout button inside drawer
    if (DOM.checkoutBtn) DOM.checkoutBtn.addEventListener('click', openCheckoutModal);

    // Checkout modal close triggers
    if (DOM.modalCloseBtn) DOM.modalCloseBtn.addEventListener('click', closeCheckoutModal);
    if (DOM.checkoutModalBackdrop) DOM.checkoutModalBackdrop.addEventListener('click', closeCheckoutModal);

    // Contact Form submission
    if (DOM.contactForm) DOM.contactForm.addEventListener('submit', handleContactSubmit);

    // Escape key closes modals and drawers
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeCartDrawer();
        closeCheckoutModal();
      }
    });
  }

  // ---------------------------------------------------------------------------
  // UTILITY HELPERS
  // ---------------------------------------------------------------------------
  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Expose methods for inline calls if needed
  window.MevukaApp = {
    showToast,
    completeCheckout,
    openCartDrawer,
    closeCartDrawer
  };

  // Launch on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
