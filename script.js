/* --------- API CONFIGURATION -------- */
const API_BASE_URL = 'http://localhost:5000/api';

// Global state
let currentUser = null;
let authToken = localStorage.getItem('authToken');
let categories = [];
let products = [];
let cart = [];
let wishlist = [];

/* --------- ELEMENTS -------- */
const categoriesEl = document.getElementById('categories');
const productsListEl = document.getElementById('productsList');
const bannerSliderEl = document.getElementById('bannerSlider');
const searchInputEl = document.getElementById('searchInput');
const cartBtnEl = document.getElementById('cartBtn');
const wishlistBtnEl = document.getElementById('wishlistBtn');

/* --------- UTILITY FUNCTIONS -------- */
function getLS(key, def) {
  try {
    return JSON.parse(localStorage.getItem(key)) || def;
  } catch {
    return def;
  }
}

function setLS(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function showToast(msg, type = 'success') {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.className = `toast show ${type}`;
  setTimeout(() => {
    toast.classList.remove('show');
  }, 1700);
}

function showError(msg) {
  showToast(msg, 'error');
}

/* --------- API FUNCTIONS -------- */
async function apiCall(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(authToken && { 'Authorization': `Bearer ${authToken}` })
    },
    ...options
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'API request failed');
    }
    
    return data;
  } catch (error) {
    console.error('API Error:', error);
    showError(error.message);
    throw error;
  }
}

/* --------- AUTHENTICATION -------- */
async function login(email, password) {
  try {
    const data = await apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    
    authToken = data.access_token;
    localStorage.setItem('authToken', authToken);
    currentUser = { email };
    
    showToast('Login successful!');
    hideAuthModal();
    updateAuthButtons();
    loadUserData();
    return true;
  } catch (error) {
    showError('Login failed: ' + error.message);
    return false;
  }
}

async function register(name, email, password) {
  try {
    await apiCall('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password })
    });
    
    showToast('Registration successful! Please login.');
    return true;
  } catch (error) {
    showError('Registration failed: ' + error.message);
    return false;
  }
}

function logout() {
  authToken = null;
  currentUser = null;
  localStorage.removeItem('authToken');
  cart = [];
  wishlist = [];
  updateIcons();
  updateAuthButtons();
  showToast('Logged out successfully');
}

function updateAuthButtons() {
  const loginBtn = document.getElementById('loginBtn');
  const logoutBtn = document.getElementById('logoutBtn');
  
  if (authToken) {
    loginBtn.style.display = 'none';
    logoutBtn.style.display = 'block';
  } else {
    loginBtn.style.display = 'block';
    logoutBtn.style.display = 'none';
  }
}

/* --------- DATA LOADING -------- */
async function loadCategories() {
  try {
    categories = await apiCall('/categories');
    renderCategories();
  } catch (error) {
    console.error('Failed to load categories:', error);
  }
}

async function loadProducts(categoryId = null, searchTerm = null) {
  try {
    let endpoint = '/products';
    const params = new URLSearchParams();
    
    if (categoryId) params.append('category', categoryId);
    if (searchTerm) params.append('search', searchTerm);
    
    if (params.toString()) {
      endpoint += '?' + params.toString();
    }
    
    products = await apiCall(endpoint);
    renderProducts();
  } catch (error) {
    console.error('Failed to load products:', error);
  }
}

async function loadUserData() {
  if (!authToken) return;
  
  try {
    await loadCart();
    await loadWishlist();
  } catch (error) {
    console.error('Failed to load user data:', error);
  }
}

async function loadCart() {
  if (!authToken) return;
  
  try {
    cart = await apiCall('/cart');
    updateIcons();
  } catch (error) {
    console.error('Failed to load cart:', error);
  }
}

async function loadWishlist() {
  if (!authToken) return;
  
  try {
    wishlist = await apiCall('/wishlist');
    updateIcons();
  } catch (error) {
    console.error('Failed to load wishlist:', error);
  }
}

/* --------- BANNER SLIDER -------- */
const banners = [
  'Festive Sale! 🎉 Buy 2 Get 1 Free!',
  'New Arrivals: Plushies & Stationery 🐰🖊️',
  'Free Shipping on Orders Over ₹499 🚚',
  'Limited Edition Pastel Gifts — Until Sunday!',
  'Kawaii Restocks: Cats, Bears, Bunnies! 🐱🐻🐰',
];

let bannerIdx = 0;
function showBanner(idx) {
  bannerSliderEl.innerHTML = `<div class="banner-slide">${banners[idx]}</div>`;
}

showBanner(bannerIdx);
setInterval(() => {
  bannerIdx = (bannerIdx + 1) % banners.length;
  showBanner(bannerIdx);
}, 3600);

/* --------- RENDER FUNCTIONS -------- */
let currentCategory = 'All';

function renderCategories() {
  categoriesEl.innerHTML = '';
  
  // All categories button
  const allBtn = document.createElement('div');
  allBtn.className = 'category-card' + (currentCategory === 'All' ? ' active' : '');
  allBtn.innerHTML = `<span style="font-size:1.5rem;">&#127872;</span> All`;
  allBtn.onclick = () => {
    currentCategory = 'All';
    renderCategories();
    loadProducts();
  };
  categoriesEl.appendChild(allBtn);
  
  // Category buttons
  categories.forEach(cat => {
    const btn = document.createElement('div');
    btn.className = 'category-card' + (currentCategory === cat.Name ? ' active' : '');
    btn.innerHTML = `<span style="font-size:1.5rem;">&#127872;</span> ${cat.Name}`;
    btn.onclick = () => {
      currentCategory = cat.Name;
      renderCategories();
      loadProducts(cat.CategoryID);
    };
    categoriesEl.appendChild(btn);
  });
}

function renderProducts() {
  let term = searchInputEl.value.toLowerCase().trim();
  let filtered = products.filter(p => {
    let matchCat = currentCategory === 'All' || p.CategoryName === currentCategory;
    let matchSearch = !term || 
      p.Name.toLowerCase().includes(term) || 
      p.CategoryName?.toLowerCase().includes(term);
    return matchCat && matchSearch;
  });
  
  productsListEl.innerHTML = '';
  filtered.forEach(p => {
    const inWishlist = wishlist.some(w => w.ProductID === p.ProductID);
    const cartItem = cart.find(ci => ci.ProductID === p.ProductID);
    
    const card = document.createElement('div');
    card.className = 'product-card';
    card.onclick = () => showProductModal(p.ProductID);
    card.innerHTML = `
      <img src="${p.img_url}" alt="${p.Name}" class="product-img">
      <div class="product-category">${p.CategoryName || 'Uncategorized'}</div>
      <div class="product-title">${p.Name}</div>
      <div class="product-price">₹${p.Price}</div>
      <div class="card-actions" onclick="event.stopPropagation()">
        <button class="wishlist-btn${inWishlist ? ' active' : ''}" 
                title="Add to Wishlist" 
                onclick="toggleWishlist(${p.ProductID}, event)">
          &#10084;
        </button>
        <button class="cart-btn" onclick="addToCart(${p.ProductID}, event)">
          ${cartItem ? 'Add More' : 'Add to Cart'}
        </button>
      </div>
      ${cartItem ? `<div style="font-size:0.97rem;margin-top:3px;color:#b47fc5;">In Cart: ${cartItem.Quantity}</div>` : ''}
    `;
    productsListEl.appendChild(card);
  });
}

/* --------- CART FUNCTIONS -------- */
async function addToCart(productId, evt) {
  evt.stopPropagation();
  
  if (!authToken) {
    showError('Please login to add items to cart');
    showAuthModal();
    return;
  }
  
  try {
    await apiCall('/cart', {
      method: 'POST',
      body: JSON.stringify({ productId, quantity: 1 })
    });
    
    showToast('Added to cart!');
    loadCart();
    renderProducts();
  } catch (error) {
    showError('Failed to add to cart: ' + error.message);
  }
}

async function removeFromCart(cartItemId) {
  try {
    await apiCall(`/cart/item/${cartItemId}`, { method: 'DELETE' });
    showToast('Item removed from cart');
    loadCart();
    renderProducts();
  } catch (error) {
    showError('Failed to remove item: ' + error.message);
  }
}

async function toggleWishlist(productId, evt) {
  evt.stopPropagation();
  
  if (!authToken) {
    showError('Please login to manage wishlist');
    showAuthModal();
    return;
  }
  
  try {
    const inWishlist = wishlist.some(w => w.ProductID === productId);
    
    if (inWishlist) {
      await apiCall(`/wishlist/${productId}`, { method: 'DELETE' });
      showToast('Removed from wishlist!');
    } else {
      await apiCall('/wishlist', {
        method: 'POST',
        body: JSON.stringify({ productId })
      });
      showToast('Added to wishlist!');
    }
    
    loadWishlist();
    renderProducts();
  } catch (error) {
    showError('Failed to update wishlist: ' + error.message);
  }
}

/* --------- MODAL FUNCTIONS -------- */
function showProductModal(productId) {
  const product = products.find(p => p.ProductID === productId);
  if (!product) return;
  
  document.getElementById('productModal').classList.add('active');
  document.getElementById('modalContent').innerHTML = `
    <img src="${product.img_url}" alt="${product.Name}" />
    <div class="modal-details">
      <div class="modal-title">${product.Name}</div>
      <div class="modal-category">${product.CategoryName || 'Uncategorized'}</div>
      <div class="modal-price">₹${product.Price}</div>
    </div>
    <div class="modal-description">${product.Description || 'No description available.'}</div>
  `;
}

function showCart() {
  const modal = document.getElementById('cartModal');
  modal.classList.add('active');
  const cartItemsEl = document.getElementById('cartItems');
  
  if (!cart.length) {
    cartItemsEl.innerHTML = `<div>Your cart is empty!</div>`;
    return;
  }
  
  cartItemsEl.innerHTML = cart.map(item => `
    <div style="margin:1rem 0;">
      <img src="${item.img_url}" alt="" style="width:33px;height:33px;border-radius:12px;vertical-align:middle;margin-right:12px;">
      <span>${item.Name}</span> 
      (<span style="font-weight:bold;">${item.Quantity}</span> x ₹${item.Price}) 
      <button onclick="removeFromCart(${item.CartItemID})" style="background:var(--accent);color:#fff;border:none;outline:none;border-radius:5px;font-size:0.9rem;padding:0.15rem 0.7rem;margin-left:8px;cursor:pointer;">✗</button>
    </div>
  `).join('') + 
  `<div style="margin-top:1.3rem;font-weight:bold;color:#d79be2;">Subtotal: ₹${cart.reduce((sum, item) => sum + (item.Price * item.Quantity), 0)}</div>`;
}

function showWishlist() {
  const modal = document.getElementById('wishlistModal');
  modal.classList.add('active');
  const wishlistItemsEl = document.getElementById('wishlistItems');
  
  if (!wishlist.length) {
    wishlistItemsEl.innerHTML = `<div>Your wishlist is empty!</div>`;
    return;
  }
  
  wishlistItemsEl.innerHTML = wishlist.map(item => `
    <div style="margin:1rem 0;">
      <img src="${item.img_url}" alt="" style="width:37px;height:37px;border-radius:12px;vertical-align:middle;margin-right:10px;">
      <span>${item.Name}</span>
      <button onclick="toggleWishlist(${item.ProductID}, event)" style="background:var(--primary);color:#fff;border:none;outline:none;border-radius:5px;font-size:0.9rem;padding:0.13rem 0.65rem;margin-left:9px;cursor:pointer;">♥</button>
    </div>
  `).join('');
}

function showCheckout() {
  closeModal('cartModal');
  const modal = document.getElementById('checkoutModal');
  modal.classList.add('active');
  const orderSummaryEl = document.getElementById('orderSummary');
  
  if (!cart.length) {
    orderSummaryEl.innerHTML = 'Your cart is empty!';
    return;
  }
  
  const subtotal = cart.reduce((sum, item) => sum + (item.Price * item.Quantity), 0);
  const delivery = subtotal >= 499 ? 0 : 59;
  
  orderSummaryEl.innerHTML = cart.map(item => `
    <div style="margin:9px 0;">
      <img src="${item.img_url}" style="width:32px;height:32px;border-radius:10px;vertical-align:middle;margin-right:11px;">
      ${item.Name} × ${item.Quantity} = <span style="font-weight:bold;">₹${item.Price * item.Quantity}</span>
    </div>
  `).join('') + `
    <div style="margin:13px 0 0 0;font-size:1.08rem;">
      <div>Subtotal: <strong>₹${subtotal}</strong></div>
      <div>Delivery: <strong>₹${delivery}</strong></div>
      <div style="color:#d79be2;font-weight:700;">Total: ₹${subtotal + delivery}</div>
    </div>
  `;
}

async function placeOrder() {
  try {
    const result = await apiCall('/orders', { method: 'POST' });
    showToast('Order placed successfully! Thank you 💜');
    loadCart();
    closeModal('checkoutModal');
    renderProducts();
  } catch (error) {
    showError('Failed to place order: ' + error.message);
  }
}

function closeModal(id) {
  document.getElementById(id).classList.remove('active');
}

/* --------- AUTH MODAL FUNCTIONS -------- */
function showAuthModal() {
  document.getElementById('authModal').classList.add('active');
}

function hideAuthModal() {
  document.getElementById('authModal').classList.remove('active');
}

function showLoginForm() {
  document.getElementById('loginForm').style.display = 'block';
  document.getElementById('registerForm').style.display = 'none';
}

function showRegisterForm() {
  document.getElementById('loginForm').style.display = 'none';
  document.getElementById('registerForm').style.display = 'block';
}

async function handleLogin() {
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  
  if (!email || !password) {
    showError('Please fill in all fields');
    return;
  }
  
  await login(email, password);
}

async function handleRegister() {
  const name = document.getElementById('registerName').value;
  const email = document.getElementById('registerEmail').value;
  const password = document.getElementById('registerPassword').value;
  
  if (!name || !email || !password) {
    showError('Please fill in all fields');
    return;
  }
  
  await register(name, email, password);
}

/* --------- ICON UPDATES -------- */
function updateIcons() {
  wishlistBtnEl.setAttribute('data-count', wishlist.length);
  cartBtnEl.setAttribute('data-count', cart.reduce((sum, item) => sum + item.Quantity, 0));
  wishlistBtnEl.style.setProperty('--afterDisplay', wishlist.length ? 'block' : 'none');
  cartBtnEl.style.setProperty('--afterDisplay', cart.length ? 'block' : 'none');
}

/* --------- EVENT LISTENERS -------- */
searchInputEl.oninput = () => {
  const term = searchInputEl.value.toLowerCase().trim();
  loadProducts(null, term);
};

searchInputEl.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    const term = searchInputEl.value.toLowerCase().trim();
    loadProducts(null, term);
  }
});

cartBtnEl.onclick = () => {
  if (!authToken) {
    showError('Please login to view cart');
    showAuthModal();
    return;
  }
  showCart();
};

wishlistBtnEl.onclick = () => {
  if (!authToken) {
    showError('Please login to view wishlist');
    showAuthModal();
    return;
  }
  showWishlist();
};

/* --------- INITIALIZATION -------- */
async function initializeApp() {
  try {
    await loadCategories();
    await loadProducts();
    
    updateAuthButtons();
    
    if (authToken) {
      await loadUserData();
    }
    
    updateIcons();
  } catch (error) {
    console.error('Failed to initialize app:', error);
    showError('Failed to load application data');
  }
}

// Start the app
document.addEventListener('DOMContentLoaded', initializeApp);