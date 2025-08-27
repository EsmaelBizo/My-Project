

// npm install sweetalert2
import Swal from 'sweetalert2';

const API_URL = "https://fakestoreapi.com/products";

// حالة السلة في الذاكرة: Map<productId, { product, qty }>
const cart = new Map();



// عناصر DOM
const productsGrid = document.getElementById("products-grid");
const cartDrawer = document.getElementById("cart-drawer");
const overlay = document.getElementById("overlay");
const openCartBtn = document.getElementById("open-cart");
const closeCartBtn = document.getElementById("close-cart");
const cartCount = document.getElementById("cart-count");

const cartItemsEl = document.getElementById("cart-items");
const cartTotalEl = document.getElementById("cart-total");

// فتح/إغلاق السلة
openCartBtn.addEventListener("click", () => {
  cartDrawer.classList.remove("translate-x-full");
  overlay.classList.remove("hidden");
});


closeCartBtn.addEventListener("click", closeCart);

overlay.addEventListener("click", closeCart);

function closeCart() {
  cartDrawer.classList.add("translate-x-full");
  overlay.classList.add("hidden");
}

// جلب المنتجات
async function fetchProducts() {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error("Failed to fetch products");

  return res.json();
}

// توليد بطاقة منتج (مطابقة لقالبك قدر الإمكان)
function renderProductCard(product) {

  const price = `$${Number(product.price).toFixed(2)}`;
  return `
    <a class="max-w-[384px] mx-auto block">
      <div class="w-full max-w-sm aspect-square">
        <img src="${product.image}" 
             class="w-full h-full rounded-3xl object-contain bg-[#ECEDEF] p-4 md:p-8 border-white border-8">
      </div>
      <div class="mt:2 md:mt-5 flex flex-col font-semibold">
        <h2 class="h-12 md:h-20 text-black my-4 line-clamp-1 text-md md:text-3xl">${product.title}</h2>
        <button
          class="add-to-cart p-3 md:p-6 rounded-xl bg-black flex items-center justify-center group shadow-sm shadow-transparent transition-all duration-500 hover:bg-[#3f3d3b]"
          data-id="${product.id}"
          aria-label="إضافة للسلة">
          <h6 class="text-sm md:text-2xl text-white">Add To Cart - <span class="text text-[#e49126]">${price}</span></h6>
        </button>
      </div>
    </a>
  `;
}

// إضافة للسلة
function addToCart(product) {
  const existing = cart.get(product.id);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.set(product.id, { product, qty: 1 });
  }
  updateCartUI();

  // عرض Toast
  Swal.fire({
    toast: true,
    position: 'top-end',
    icon: 'success',
    title: 'Added to the cart',
    showConfirmButton: false,
    timer: 2000,
    timerProgressBar: true
  });
}


// إزالة عنصر من السلة تماماً
function removeFromCart(productId) {
  cart.delete(productId);
  updateCartUI();
}

// زيادة/تنقيص الكمية
function increment(productId) {
  const item = cart.get(productId);
  if (!item) return;
  item.qty += 1;
  updateCartUI();
}

function decrement(productId) {
  const item = cart.get(productId);
  if (!item) return;
  item.qty -= 1;
  if (item.qty <= 0) cart.delete(productId);
  updateCartUI();
}

// رسم عناصر السلة
function renderCartItem({ product, qty }) {
  const price = Number(product.price);
  const lineTotal = (price * qty).toFixed(2);
  const safeTitle = escapeHtml(product.title);

  return `
    <div class="border rounded-lg p-3 flex gap-3">
      <img src="${product.image}" alt="${safeTitle}" class="w-16 h-16 object-contain bg-white rounded">
      <div class="flex-1">
        <div class="flex items-start justify-between gap-2">
          <h4 class="font-medium line-clamp-2">${safeTitle}</h4>
          <button class="text-red-600 hover:underline remove-item" data-id="${product.id}">حذف</button>
        </div>
        <div class="mt-2 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <button class="decrement rounded border px-2" data-id="${product.id}">-</button>
            <span class="px-2">${qty}</span>
            <button class="increment rounded border px-2" data-id="${product.id}">+</button>
          </div>
          <div class="font-semibold">$${lineTotal}</div>
        </div>
      </div>
    </div>
  `;
}

// تحديث واجهة السلة والعداد والإجمالي
function updateCartUI() {
  // عدّاد السلة
  const count = Array.from(cart.values()).reduce((acc, it) => acc + it.qty, 0);
  cartCount.textContent = count;

  // عناصر السلة
  if (cart.size === 0) {
    cartItemsEl.innerHTML = `<p class="text-center text-gray-500">The basket is empty.</p>`;
  } else {
    cartItemsEl.innerHTML = Array.from(cart.values()).map(renderCartItem).join("");
  }

  // الإجمالي
  const total = Array.from(cart.values()).reduce((acc, it) => acc + it.product.price * it.qty, 0);
  cartTotalEl.textContent = `$${total.toFixed(2)}`;
}

// التعامل مع نقرات المنتجات (إضافة إلى السلة) عبر التفويض
productsGrid.addEventListener("click", (e) => {
  const btn = e.target.closest(".add-to-cart");
  if (!btn) return;
  const id = Number(btn.dataset.id);
  // الحصول على بيانات المنتج من بطاقة DOM (أو نخزن قائمة المنتجات)
  // الأفضل: نخزن المنتجات بعد الجلب
  const product = productsCache.find((p) => p.id === id);
  if (product) addToCart(product);
});

// التعامل مع نقرات السلة (حذف/زيادة/تنقيص) عبر التفويض
cartItemsEl.addEventListener("click", (e) => {
  const removeBtn = e.target.closest(".remove-item");
  const incBtn = e.target.closest(".increment");
  const decBtn = e.target.closest(".decrement");

  if (removeBtn) {
    removeFromCart(Number(removeBtn.dataset.id));
    return;
  }
  if (incBtn) {
    increment(Number(incBtn.dataset.id));
    return;
  }
  if (decBtn) {
    decrement(Number(decBtn.dataset.id));
    return;
  }
});

// كاش محلي للمنتجات بعد الجلب
let productsCache = [];

// حماية بسيطة للنص
function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// تشغيل
(async function init() {
  try {
    const products = await fetchProducts();
    productsCache = products;


    productsGrid.innerHTML = products.map(renderProductCard).join("");


    updateCartUI();


  } catch (err) {
    console.error(err);
    productsGrid.innerHTML = `<p class="text-red-600">حدث خطأ أثناء جلب المنتجات.</p>`;
  }
})();
