/* --------- DATA -------- */
const categories = [
  { name: 'Stationery', icon: '&#128396;' },
  { name: 'Plush Toys', icon: '&#128059;' },
  { name: 'Beauty', icon: '&#127872;' },
  { name: 'Home Decor', icon: '&#127968;' },
];
const products = [
  {
    id: 'p1',
    title: 'Kawaii Cat Pen',
    category: 'Stationery',
    price: 79,
    img: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80',
    desc: 'Cute and comfy cat-shaped pen for your class notes or journal. Writes smoothly in blue ink.',
  },
  {
    id: 'p2',
    title: 'Pastel Bunny Plush',
    category: 'Plush Toys',
    price: 349,
    img: 'https://images.pexels.com/photos/1462636/pexels-photo-1462636.jpeg?auto=compress&w=400',
    desc: 'Soft, huggable bunny plush with pastel colors. Perfect for gifts and cozy naps.',
  },
  {
    id: 'p3',
    title: 'Lavender Hand Cream',
    category: 'Beauty',
    price: 139,
    img: 'https://images.pexels.com/photos/2270834/pexels-photo-2270834.jpeg?auto=compress&w=400',
    desc: 'Light lavender-scented hand cream. Moisturizes and softens for silky smooth hands.',
  },
  {
    id: 'p4',
    title: 'Cloud Pillow',
    category: 'Home Decor',
    price: 260,
    img: 'https://images.unsplash.com/photo-1526178613658-3e1f28221885?auto=format&fit=crop&w=400&q=80',
    desc: 'Dreamy pillow in cloud shape with smiley face. Ultra-soft for beds and sofas.',
  },
  {
    id: 'p5',
    title: 'Sakura Sticky Notes',
    category: 'Stationery',
    price: 59,
    img: 'https://images.pexels.com/photos/3754067/pexels-photo-3754067.jpeg?auto=compress&w=400',
    desc: 'Floral sticky notes inspired by Sakura blossoms. Make lists, bookmarks, or reminders cuter!',
  },
  {
    id: 'p6',
    title: 'Chubby Bear Plush',
    category: 'Plush Toys',
    price: 399,
    img: 'https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?auto=compress&w=400',
    desc: 'Super cuddly chubby bear plush—your best friend for hugs. Great for kids and grown-ups.',
  },
  {
    id: 'p7',
    title: 'Cute Cosmetics Bag',
    category: 'Beauty',
    price: 210,
    img: 'https://images.unsplash.com/photo-1585386959984-a4155224c3b5?auto=format&fit=crop&w=400&q=80',
    desc: 'Organize your beauty must-haves with this pastel zip bag. Waterproof lining.',
  },
  {
    id: 'p8',
    title: 'Rainbow Mug',
    category: 'Home Decor',
    price: 179,
    img: 'https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?auto=compress&w=400',
    desc: 'Ceramic cup with rainbow print and glossy finish. Sip tea and coffee with joy each day.',
  },
  {
    id: 'p9',
    title: 'Pink Gel Highlighter',
    category: 'Stationery',
    price: 49,
    img: 'https://images.pexels.com/photos/461429/pexels-photo-461429.jpeg?auto=compress&w=400',
    desc: 'Smooth pink highlighter for pretty notes, planners, and creative art.',
  },
  {
    id: 'p10',
    title: 'Stars Plush',
    category: 'Plush Toys',
    price: 359,
    img: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80',
    desc: 'Twinkling stars plush for dreaming big at night. Perfect for decorations or snuggles.',
  },
  {
    id: 'p11',
    title: 'Blush Heart Pillow',
    category: 'Home Decor',
    price: 249,
    img: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80',
    desc: 'Soft pink heart-shaped pillow, perfect for your couch or bedroom retreat.',
  },
  {
    id: 'p12',
    title: 'Candy Compact Mirror',
    category: 'Beauty',
    price: 99,
    img: 'https://images.unsplash.com/photo-1600259444028-0af6cfa4e4ae?auto=format&fit=crop&w=400&q=80',
    desc: 'Pocket compact mirror with candy color shell. See your reflection anywhere, anytime.',
  },
];
const banners = [
  'Festive Sale! 🎉 Buy 2 Get 1 Free!',
  'New Arrivals: Plushies & Stationery 🐰🖊️',
  'Free Shipping on Orders Over ₹499 🚚',
  'Limited Edition Pastel Gifts — Until Sunday!',
  'Kawaii Restocks: Cats, Bears, Bunnies! 🐱🐻🐰',
];
/* --------- ELEMENTS -------- */
const categoriesEl = document.getElementById('categories');
const productsListEl = document.getElementById('productsList');
const bannerSliderEl = document.getElementById('bannerSlider');
const searchInputEl = document.getElementById('searchInput');
const cartBtnEl = document.getElementById('cartBtn');
const wishlistBtnEl = document.getElementById('wishlistBtn');
/* --------- RENDER BANNERS -------- */
let bannerIdx = 0;
function showBanner(idx) {
  bannerSliderEl.innerHTML = `<div class="banner-slide">${banners[idx]}</div>`;
}
showBanner(bannerIdx);
setInterval(() => {
  bannerIdx = (bannerIdx + 1) % banners.length;
  showBanner(bannerIdx);
}, 3600);
/* --------- RENDER CATEGORIES -------- */
let currentCategory = 'All';
function renderCategories() {
  categoriesEl.innerHTML = '';
  const allBtn = document.createElement('div');
  allBtn.className =
    'category-card' + (currentCategory === 'All' ? ' active' : '');
  allBtn.innerHTML = `<span style="font-size:1.5rem;">&#127872;</span> All`;
  allBtn.onclick = () => {
    currentCategory = 'All';
    renderCategories();
    renderProducts();
  };
  categoriesEl.appendChild(allBtn);
  categories.forEach(cat => {
    const btn = document.createElement('div');
    btn.className =
      'category-card' + (currentCategory === cat.name ? ' active' : '');
    btn.innerHTML = `<span style="font-size:1.5rem;">${cat.icon}</span> ${cat.name}`;
    btn.onclick = () => {
      currentCategory = cat.name;
      renderCategories();
      renderProducts();
    };
    categoriesEl.appendChild(btn);
  });
}
renderCategories();
/* --------- WISHLIST/CART (localStorage sync) -------- */
function getLS(key, def) {
  try {
    return JSON.parse(localStorage.getItem(key)) || def;
  } catch {
    return def;
  }
}
let wishlist = getLS('wishlist', []);
let cart = getLS('cart', []);
/* --------- RENDER PRODUCTS -------- */
function renderProducts() {
  let term = searchInputEl.value.toLowerCase().trim();
  let filtered = products.filter(p => {
    let matchCat =
      currentCategory === 'All' || p.category === currentCategory;
    let matchSearch =
      !term ||
      p.title.toLowerCase().includes(term) ||
      p.category.toLowerCase().includes(term);
    return matchCat && matchSearch;
  });
  productsListEl.innerHTML = '';
  filtered.forEach(p => {
    const inWishlist = wishlist.includes(p.id);
    const cartItem = cart.find(ci => ci.id === p.id);
    const card = document.createElement('div');
    card.className = 'product-card';
    card.onclick = () => showProductModal(p.id);
    card.innerHTML = `
    <img src="${p.img}" alt="${p.title}" class="product-img">
    <div class="product-category">${p.category}</div>
    <div class="product-title">${p.title}</div>
    <div class="product-price">₹${p.price}</div>
    <div class="card-actions" onclick="event.stopPropagation()">
      <button class="wishlist-btn${
        inWishlist ? ' active' : ''
      }" title="Add to Wishlist" onclick="toggleWishlist('${
      p.id
    }', event)">
        &#10084;
      </button>
      <button class="cart-btn" onclick="addToCart('${p.id}', event)">
        ${cartItem ? 'Add More' : 'Add to Cart'}
      </button>
    </div>
    ${
      cartItem
        ? '<div style="font-size:0.97rem;margin-top:3px;color:#b47fc5;">In Cart: ' +
          cartItem.qty +
          '</div>'
        : ''
    }
  `;
    productsListEl.appendChild(card);
  });
}
// Prevent inner button clicks from closing modal
function toggleWishlist(id, evt) {
  evt.stopPropagation();
  if (wishlist.includes(id)) {
    wishlist = wishlist.filter(wid => wid !== id);
    showToast('Removed from wishlist!');
  } else {
    wishlist.push(id);
    showToast('Added to wishlist!');
  }
  localStorage.setItem('wishlist', JSON.stringify(wishlist));
  updateIcons();
  renderProducts();
}
function addToCart(id, evt) {
  evt.stopPropagation();
  let cartItem = cart.find(ci => ci.id === id);
  if (cartItem) {
    cartItem.qty++;
    showToast('Added more to cart!');
  } else {
    cart.push({ id: id, qty: 1 });
    showToast('Added to cart!');
  }
  localStorage.setItem('cart', JSON.stringify(cart));
  updateIcons();
  renderProducts();
}
searchInputEl.oninput = () => renderProducts();
renderProducts();
/* --------- PRODUCT MODAL -------- */
function showProductModal(pid) {
  const prod = products.find(p => p.id === pid);
  if (!prod) return;
  document.getElementById('productModal').classList.add('active');
  let html = `
    <img src="${prod.img}" alt="${prod.title}" />
    <div class="modal-details">
      <div class="modal-title">${prod.title}</div>
      <div class="modal-category">${prod.category}</div>
      <div class="modal-price">₹${prod.price}</div>
    </div>
    <div class="modal-description">${
      prod.desc || 'No description available.'
    }</div>
  `;
  document.getElementById('modalContent').innerHTML = html;
}
/* --------- WISHLIST -------- */
function updateIcons() {
  wishlistBtnEl.setAttribute('data-count', wishlist.length);
  cartBtnEl.setAttribute(
    'data-count',
    cart.reduce((sum, ci) => sum + ci.qty, 0)
  );
  wishlistBtnEl.style.setProperty(
    '--afterDisplay',
    wishlist.length ? 'block' : 'none'
  );
  cartBtnEl.style.setProperty(
    '--afterDisplay',
    cart.length ? 'block' : 'none'
  );
}
updateIcons();
wishlistBtnEl.onclick = () => showWishlist();
cartBtnEl.onclick = () => showCart();
function showCart() {
  const modal = document.getElementById('cartModal');
  modal.classList.add('active');
  const cartItemsEl = document.getElementById('cartItems');
  if (!cart.length) {
    cartItemsEl.innerHTML = `<div>Your cart is empty!</div>`;
    return;
  }
  cartItemsEl.innerHTML =
    cart
      .map(ci => {
        const prod = products.find(p => p.id === ci.id);
        return `
      <div style="margin:1rem 0;">
        <img src="${prod.img}" alt="" style="width:33px;height:33px;border-radius:12px;vertical-align:middle;margin-right:12px;">
        <span>${prod.title}</span> 
        (<span style="font-weight:bold;">${ci.qty}</span> x ₹${prod.price}) 
        <button onclick="removeCart('${prod.id}')" style="background:var(--accent);color:#fff;border:none;outline:none;border-radius:5px;font-size:0.9rem;padding:0.15rem 0.7rem;margin-left:8px;cursor:pointer;">✗</button>
      </div>`;
      })
      .join('') +
    `<div style="margin-top:1.3rem;font-weight:bold;color:#d79be2;">Subtotal: ₹${cart.reduce(
      (sum, ci) =>
        sum + products.find(p => p.id === ci.id).price * ci.qty,
      0
    )}</div>`;
}
function showWishlist() {
  const modal = document.getElementById('wishlistModal');
  modal.classList.add('active');
  const wishlistItemsEl = document.getElementById('wishlistItems');
  if (!wishlist.length) {
    wishlistItemsEl.innerHTML = `<div>Your wishlist is empty!</div>`;
    return;
  }
  wishlistItemsEl.innerHTML = wishlist
    .map(wid => {
      const prod = products.find(p => p.id === wid);
      return `
    <div style="margin:1rem 0;">
      <img src="${prod.img}" alt="" style="width:37px;height:37px;border-radius:12px;vertical-align:middle;margin-right:10px;">
      <span>${prod.title}</span>
      <button onclick="toggleWishlist('${prod.id}', event)" style="background:var(--primary);color:#fff;border:none;outline:none;border-radius:5px;font-size:0.9rem;padding:0.13rem 0.65rem;margin-left:9px;cursor:pointer;">♥</button>
    </div>
  `;
    })
    .join('');
}
function closeModal(id) {
  document.getElementById(id).classList.remove('active');
}
function removeCart(id) {
  cart = cart.filter(ci => ci.id !== id);
  localStorage.setItem('cart', JSON.stringify(cart));
  updateIcons();
  showCart();
  renderProducts();
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
  let subtotal = cart.reduce(
    (sum, ci) => sum + products.find(p => p.id === ci.id).price * ci.qty,
    0
  );
  let delivery = subtotal >= 499 ? 0 : 59;
  orderSummaryEl.innerHTML =
    cart
      .map(ci => {
        const prod = products.find(p => p.id === ci.id);
        return `
      <div style="margin:9px 0;">
        <img src="${
          prod.img
        }" style="width:32px;height:32px;border-radius:10px;vertical-align:middle;margin-right:11px;">
        ${prod.title} × ${ci.qty} = <span style="font-weight:bold;">₹${
        prod.price * ci.qty
      }</span>
      </div>
    `;
      })
      .join('') +
    `<div style="margin:13px 0 0 0;font-size:1.08rem;">
    <div>Subtotal: <strong>₹${subtotal}</strong></div>
    <div>Delivery: <strong>₹${delivery}</strong></div>
    <div style="color:#d79be2;font-weight:700;">Total: ₹${
      subtotal + delivery
    }</div>
  </div>
  `;
}
function placeOrder() {
  showToast('Order placed! Thank you 💜');
  cart = [];
  localStorage.setItem('cart', JSON.stringify([]));
  updateIcons();
  closeModal('checkoutModal');
  renderProducts();
}
function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 1700);
}
renderProducts();
searchInputEl.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    renderProducts();
  }
});
