const PRODUCTS = [
  { name: "Baccarat Rouge",    price: 170, image: "Image/Baccarat Rouge.jpeg" },
  { name: "Burberry Her",      price: 150, image: "Image/Burberry Her.jpeg" },
  { name: "Khamra",            price: 170, image: "Image/Khamra.jpeg" },
  { name: "Olympea",           price: 150, image: "Image/Olympea.jpeg" },
  { name: "Victoria Coconut",  price: 150, image: "Image/Victoria Coconut.jpeg" },
  { name: "Yara Candy",        price: 150, image: "Image/Yara Candy.jpeg" },
];
// Roll Perfume section
const ROLL_PRODUCTS = [
  { name: "Musk Candy", price: 35, size: "30 ml", image: "Image/Musk Candy.jpeg" },
  { name: "Musk Roman", price: 35, size: "30 ml", image: "Image/Musk Roman.jpeg" },
];
const ALL_PRODUCTS = PRODUCTS.concat(ROLL_PRODUCTS);

const WHATSAPP_NUMBER = "+20 11 51557140";
const INSTAGRAM_ACCOUNT = "https://www.instagram.com/_wahmm._?stkn=Nzl4cmlxa3Nwa3c5&utm_source=qr";

const $ = (s) => document.querySelector(s);
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const money = (n) => `${n.toFixed(2)} ج`;

let cartItems = [];
try { cartItems = JSON.parse(localStorage.getItem("cartItems")) || []; } catch (e) { cartItems = []; }

function save() {
  try { localStorage.setItem("cartItems", JSON.stringify(cartItems)); } catch (e) {}
  updateCount();
}

function updateCount() {
  const el = $("#cart-count");
  if (el) {
    const count = cartItems.reduce((n, i) => n + i.quantity, 0);
    el.textContent = count;
    el.classList.add("pulse");
    setTimeout(() => el.classList.remove("pulse"), 300);
  }
}

function renderSkeletons(count = 8) {
  const list = $("#productlist");
  if (!list) return;
  list.innerHTML = Array.from({ length: count }, () => `
    <article class="product skeleton-card" aria-hidden="true">
      <div class="skeleton-img shimmer"></div>
      <div class="product-info">
        <div class="skeleton-line skeleton-title shimmer"></div>
        <div class="skeleton-line skeleton-sub shimmer"></div>
        <div class="skeleton-line skeleton-price shimmer"></div>
        <div class="skeleton-btn shimmer"></div>
      </div>
    </article>
  `).join("");
}

function preloadImage(url) {
  return new Promise((resolve) => {
    if (!url) return resolve();
    const img = new Image();
    img.src = url;
    if (img.complete) return resolve();
    img.onload = () => resolve();
    img.onerror = () => resolve();
  });
}

function loadProductsWithSkeleton() {
  // Show products immediately; each image fades in as it arrives (no blocking preload)
  renderProducts();
  renderProducts("#rolllist", ROLL_PRODUCTS, false);
}

function renderProducts(selector = "#productlist", items = PRODUCTS, priority = true) {
  const list = $(selector);
  if (!list) return;
  list.innerHTML = items.map((p, idx) => {
    const imgHtml = p.image
      ? `<div class="product-img-wrapper shimmer">
           <img src="${esc(encodeURI(p.image))}" alt="${esc(p.name)}" width="300" height="300" ${priority && idx < 4 ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async" onload="this.classList.add('loaded');this.parentNode.classList.remove('shimmer')" onerror="this.parentNode.classList.remove('shimmer');this.style.display='none'">
         </div>`
      : `<div class="no-img-placeholder"><i class="ri-image-line"></i><span>Coming Soon</span></div>`;
    return `
    <article class="product product-card-loaded" style="animation-delay: ${idx * 0.04}s">
      ${imgHtml}
      <div class="product-info">
        <h3 class="product-title">${esc(p.name)}</h3>
        <p class="product-size-text">${esc(p.size || "30 ml")}</p>
        <p class="product-price">${p.price} ج</p>
        <button class="add-to-cart" data-name="${esc(p.name)}">Add to cart</button>
      </div>
    </article>`;
  }).join("");
  list.querySelectorAll("img").forEach((im) => {
    if (im.complete && im.naturalWidth) { im.classList.add("loaded"); im.parentNode.classList.remove("shimmer"); }
  });
}

function addToCart(name) {
  const p = ALL_PRODUCTS.find((x) => x.name === name);
  if (!p) return;
  const found = cartItems.find((i) => i.name === name);
  if (found) found.quantity++;
  else cartItems.push({ ...p, quantity: 1 });
  save();
  showToast(`${name} added to cart`);
}

function changeQuantity(name, delta) {
  const item = cartItems.find((i) => i.name === name);
  if (!item) return;
  item.quantity += delta;
  if (item.quantity <= 0) return removeItem(name);
  save();
  renderCart();
}

function removeItem(name) {
  cartItems = cartItems.filter((i) => i.name !== name);
  save();
  renderCart();
  showToast(`${name} removed from cart`);
}

function renderCart() {
  const box = $("#cartItems");
  if (!box) return;
  const totalEl = $("#cartTotal");
  const btn = $("#checkout-btn");
  const instaBtn = $("#checkout-insta-btn");
  if (!cartItems.length) {
    box.innerHTML = `<div class="empty-cart"><p>Your cart is empty.</p><a href="index.html">Browse perfumes</a></div>`;
    if (totalEl) totalEl.textContent = "Total: 0.00 ج";
    if (btn) btn.disabled = true;
    if (instaBtn) instaBtn.disabled = true;
    return;
  }
  if (btn) btn.disabled = false;
  if (instaBtn) instaBtn.disabled = false;
  let total = 0;
  box.innerHTML = cartItems.map((i) => {
    total += i.price * i.quantity;
    const n = esc(i.name);
    const imgHtml = i.image
      ? `<img src="${esc(encodeURI(i.image))}" alt="${n}" width="80" height="80" loading="lazy" decoding="async">`
      : `<div class="cart-no-img"><i class="ri-image-line"></i></div>`;
    return `
    <div class="cart-item">
      ${imgHtml}
      <div>
        <div class="cart-item-title">${n}</div>
        <div class="cart-item-size">${esc(i.size || "30 ml")}</div>
        <div class="cart-item-price">${money(i.price * i.quantity)}</div>
        <div class="quantity-controls">
          <button data-action="dec" data-name="${n}" aria-label="Decrease quantity"><i class="ri-subtract-line"></i></button>
          <span class="qty">${i.quantity}</span>
          <button data-action="inc" data-name="${n}" aria-label="Increase quantity"><i class="ri-add-line"></i></button>
        </div>
      </div>
      <button class="remove-from-cart" data-action="remove" data-name="${n}" aria-label="Remove ${n}"><i class="ri-delete-bin-line"></i></button>
    </div>`;
  }).join("");
  if (totalEl) totalEl.textContent = `Total: ${money(total)}`;
}

function showToast(msg) {
  let c = $(".toast-container");
  if (!c) {
    c = document.createElement("div");
    c.className = "toast-container";
    c.setAttribute("aria-live", "polite");
    document.body.appendChild(c);
  }
  const t = document.createElement("div");
  t.className = "toast";
  t.textContent = msg;
  c.appendChild(t);
  requestAnimationFrame(() => t.classList.add("show"));
  setTimeout(() => {
    t.classList.remove("show");
    setTimeout(() => t.remove(), 300);
  }, 2800);
}

function buildOrderText() {
  let total = 0;
  let msg = "*New Order — Wahm*\n\n";
  cartItems.forEach((i, idx) => {
    const t = i.price * i.quantity;
    total += t;
    msg += `${idx + 1}. *${i.name}*\n   Quantity: ${i.quantity}\n   Price: ${money(t)}\n\n`;
  });
  msg += `*Total: ${money(total)}*`;
  return msg;
}

function checkout() {
  if (!cartItems.length) return showToast("Your cart is empty");
  const msg = buildOrderText();
  const cleanPhone = WHATSAPP_NUMBER.replace(/\D/g, "");
  window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`, "_blank", "noopener");
}

function checkoutInstagram() {
  if (!cartItems.length) return showToast("Your cart is empty");
  const msg = buildOrderText();
  if (navigator.clipboard) {
    navigator.clipboard.writeText(msg).catch(() => {});
  }
  showToast("Order copied! Paste it in Instagram DMs");
  const directDmUrl = "https://ig.me/m/_wahmm._";
  window.open(directDmUrl, "_blank", "noopener");
}

document.addEventListener("click", (e) => {
  const el = e.target.closest("[data-name], #checkout-btn, #checkout-insta-btn");
  if (!el) return;
  if (el.id === "checkout-btn") return checkout();
  if (el.id === "checkout-insta-btn") return checkoutInstagram();
  const { name, action } = el.dataset;
  if (el.classList.contains("add-to-cart")) addToCart(name);
  else if (action === "inc") changeQuantity(name, 1);
  else if (action === "dec") changeQuantity(name, -1);
  else if (action === "remove") removeItem(name);
});

// Run skeleton loader on index page immediately or on DOM ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}

window.addEventListener("pageshow", (e) => {
  if (!e.persisted) return;
  try { cartItems = JSON.parse(localStorage.getItem("cartItems")) || []; } catch (err) { cartItems = []; }
  updateCount();
  renderCart();
});

function init() {
  updateCount();
  renderCart();
  loadProductsWithSkeleton();
}