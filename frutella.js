const WHATSAPP_NUMBER = "573053036580";

const PRODUCTS = [
  {
    id: "fresas-especial",
    name: "Postre de Fresas con Crema",
    desc: "Fresas frescas en trozos, crema dulce y chocolate derretido. Nuestro clásico.",
    price: 10000,
    category: "fresa",
    image: "images/Copa de fresas con chocolate y crema.png",
    cutout: false
  },
  {
    id: "banano-choco",
    name: "Postre de Banano con Chocolate",
    desc: "Rodajas de banano, crema y chocolate. Dulce y reconfortante.",
    price: 12000,
    category: "banano",
    image: "images/Parfait de plátano, chocolate y crema.png",
    cutout: false
  },
  {
    id: "arandanos-choco",
    name: "Postre de Arándanos con Chocolate",
    desc: "Arándanos jugosos con crema y Nutella. Un toque diferente.",
    price: 12000,
    category: "arandano",
    image: "images/Parfait de chocolate, crema y arándanos.png",
    cutout: false
  },
  {
    id: "arandanos-crunch",
    name: "Postre de Arándanos Crunch",
    desc: "Crema en espiral, arándanos, chocolate y galleta crujiente.",
    price: 16000,
    category: "arandano",
    image: "images/kgyfytudrtshjrstdlitguyoñ8kjv.png",
    cutout: false
  },
  {
    id: "trio-frutella",
    name: "Trío de Postres Frutella",
    desc: "Tres postres para compartir: fresa, banano y arándanos.",
    price: 38000,
    category: "combo",
    image: "images/Vasitos de postre con frutas y chocolate.png",
    cutout: false
  }
];

const SIZES = [
  { id: "pequeno", label: "Pequeño (8 oz)", extra: 0 },
  { id: "mediano", label: "Mediano (12 oz)", extra: 3000 },
  { id: "grande", label: "Grande (16 oz)", extra: 6000 }
];

const TOPPINGS = [
  { id: "galleta", label: "Galleta triturada", extra: 1500 },
  { id: "choco", label: "Extra chocolate", extra: 2000 },
  { id: "fruta", label: "Extra fruta", extra: 2500 }
];

const $ = (id) => document.getElementById(id);
const money = (n) => "$" + n.toLocaleString("es-CO");

let toastTimer;
function showToast(msg) {
  const t = $("toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 2200);
}

const grid = $("productGrid");

function renderProducts(filter = "todos") {
  const list = filter === "todos" ? PRODUCTS : PRODUCTS.filter(p => p.category === filter);

  grid.innerHTML = list.map((p, i) => `
    <article class="card" style="animation-delay:${i * 70}ms">
      <div class="card__img">
        <img src="${p.image}" alt="${p.name}" loading="lazy" class="${p.cutout ? "" : "is-photo"}" />
      </div>
      <div class="card__body">
        <h3>${p.name}</h3>
        <p>${p.desc}</p>
        <span class="card__price">${money(p.price)}</span>
        <div class="card__actions">
          <button class="btn btn--small-ghost" data-custom="${p.id}">Personalizar</button>
          <button class="btn btn--primary" data-add="${p.id}">Añadir</button>
        </div>
      </div>
    </article>
  `).join("");
}

$("filters").addEventListener("click", (e) => {
  const btn = e.target.closest(".filter");
  if (!btn) return;
  document.querySelectorAll(".filter").forEach(f => f.classList.remove("is-active"));
  btn.classList.add("is-active");
  renderProducts(btn.dataset.filter);
});

grid.addEventListener("click", (e) => {
  const addBtn = e.target.closest("[data-add]");
  const customBtn = e.target.closest("[data-custom]");

  if (addBtn) {
    const p = PRODUCTS.find(x => x.id === addBtn.dataset.add);
    addToCart(p, SIZES[0], [], 1);
  }
  if (customBtn) {
    openCustom(customBtn.dataset.custom);
  }
});

const overlay = $("overlay");
const customModal = $("customModal");
let currentProduct = null;
let customQty = 1;

function openCustom(productId) {
  currentProduct = PRODUCTS.find(p => p.id === productId);
  customQty = 1;
  $("customTitle").textContent = currentProduct.name;
  $("customQty").textContent = 1;

  $("sizeOptions").innerHTML = SIZES.map((s, i) => `
    <label class="option">
      <span><input type="radio" name="size" value="${s.id}" ${i === 0 ? "checked" : ""}/> ${s.label}</span>
      <small>${s.extra ? "+" + money(s.extra) : "Incluido"}</small>
    </label>
  `).join("");

  $("toppingOptions").innerHTML = TOPPINGS.map(t => `
    <label class="option">
      <span><input type="checkbox" name="topping" value="${t.id}"/> ${t.label}</span>
      <small>+${money(t.extra)}</small>
    </label>
  `).join("");

  updateCustomTotal();
  overlay.hidden = false;
  customModal.hidden = false;
}

function closeCustom() {
  customModal.hidden = true;
  if ($("drawer").hidden) overlay.hidden = true;
}

function readCustomSelection() {
  const sizeId = document.querySelector('input[name="size"]:checked').value;
  const size = SIZES.find(s => s.id === sizeId);
  const toppings = [...document.querySelectorAll('input[name="topping"]:checked')]
    .map(c => TOPPINGS.find(t => t.id === c.value));
  return { size, toppings };
}

function updateCustomTotal() {
  const { size, toppings } = readCustomSelection();
  const unit = currentProduct.price + size.extra + toppings.reduce((s, t) => s + t.extra, 0);
  $("customTotal").textContent = money(unit * customQty);
}

$("customForm").addEventListener("change", updateCustomTotal);

$("customMinus").addEventListener("click", () => {
  customQty = Math.max(1, customQty - 1);
  $("customQty").textContent = customQty;
  updateCustomTotal();
});
$("customPlus").addEventListener("click", () => {
  customQty++;
  $("customQty").textContent = customQty;
  updateCustomTotal();
});

$("customForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const { size, toppings } = readCustomSelection();
  addToCart(currentProduct, size, toppings, customQty);
  closeCustom();
});
$("closeCustom").addEventListener("click", closeCustom);

let cart = [];

try {
  cart = JSON.parse(localStorage.getItem("frutella_cart")) || [];
} catch (_) { cart = []; }

function saveCart() {
  try { localStorage.setItem("frutella_cart", JSON.stringify(cart)); } catch (_) {}
}

function addToCart(product, size, toppings, qty) {
  const unitPrice = product.price + size.extra + toppings.reduce((s, t) => s + t.extra, 0);
  const key = [product.id, size.id, ...toppings.map(t => t.id).sort()].join("|");

  const existing = cart.find(i => i.key === key);
  if (existing) {
    existing.qty += qty;
  } else {
    cart.push({
      key,
      id: product.id,
      name: product.name,
      image: product.image,
      size: size.label,
      toppings: toppings.map(t => t.label),
      unitPrice,
      qty
    });
  }

  saveCart();
  renderCart();
  showToast("🍓 Añadido al carrito");

  const btn = $("openCart");
  btn.classList.remove("bump");
  void btn.offsetWidth;
  btn.classList.add("bump");
}

const cartTotal = () => cart.reduce((s, i) => s + i.unitPrice * i.qty, 0);
const cartCount = () => cart.reduce((s, i) => s + i.qty, 0);

function renderCart() {
  $("cartCount").textContent = cartCount();
  $("cartTotal").textContent = money(cartTotal());
  $("checkoutTotal").textContent = money(cartTotal());

  const box = $("cartItems");

  if (cart.length === 0) {
    box.innerHTML = `<div class="empty"><span>🍓</span><p>Tu carrito está vacío.<br/>¡Elige un postre del menú!</p></div>`;
    $("goCheckout").disabled = true;
    $("goCheckout").style.opacity = 0.5;
    return;
  }

  $("goCheckout").disabled = false;
  $("goCheckout").style.opacity = 1;

  box.innerHTML = cart.map(item => `
    <div class="cart-item">
      <div class="cart-item__img"><img src="${item.image}" alt="" /></div>
      <div>
        <h4>${item.name}</h4>
        <small>${item.size}${item.toppings.length ? " · " + item.toppings.join(", ") : ""}</small>
        <div class="qty">
          <button data-minus="${item.key}" aria-label="Menos">−</button>
          <output>${item.qty}</output>
          <button data-plus="${item.key}" aria-label="Más">+</button>
        </div>
      </div>
      <div>
        <div class="cart-item__price">${money(item.unitPrice * item.qty)}</div>
        <button class="cart-item__remove" data-remove="${item.key}">Quitar</button>
      </div>
    </div>
  `).join("");
}

$("cartItems").addEventListener("click", (e) => {
  const minus = e.target.closest("[data-minus]");
  const plus = e.target.closest("[data-plus]");
  const remove = e.target.closest("[data-remove]");

  if (plus) {
    cart.find(i => i.key === plus.dataset.plus).qty++;
  }
  if (minus) {
    const item = cart.find(i => i.key === minus.dataset.minus);
    item.qty--;
    if (item.qty <= 0) cart = cart.filter(i => i !== item);
  }
  if (remove) {
    cart = cart.filter(i => i.key !== remove.dataset.remove);
  }
  saveCart();
  renderCart();
});

$("clearCart").addEventListener("click", () => {
  cart = [];
  saveCart();
  renderCart();
});

const drawer = $("drawer");

function openCart() {
  showStep("cart");
  overlay.hidden = false;
  drawer.hidden = false;
  document.body.style.overflow = "hidden";
}
function closeCart() {
  drawer.hidden = true;
  overlay.hidden = true;
  document.body.style.overflow = "";
}
$("openCart").addEventListener("click", openCart);
$("closeCart").addEventListener("click", closeCart);

overlay.addEventListener("click", () => { closeCustom(); closeCart(); });
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") { closeCustom(); closeCart(); }
});

function showStep(step) {
  $("stepCart").hidden = step !== "cart";
  $("stepCheckout").hidden = step !== "checkout";
  $("drawerTitle").textContent = step === "cart" ? "Tu pedido" : "Datos de entrega";
}
$("goCheckout").addEventListener("click", () => showStep("checkout"));
$("backToCart").addEventListener("click", () => showStep("cart"));

function buildTicket({ name, address, payment, notes }) {
  const line = "----------------------------------";

  const items = cart.map(i => {
    const extras = [i.size, ...i.toppings].join(", ");
    return `- ${i.qty}x ${i.name} (${money(i.unitPrice * i.qty)})\n   ${extras}`;
  }).join("\n");

  return [
    "¡Hola Frutella!  Tengo un nuevo pedido:",
    line,
    `*Cliente:* ${name}`,
    `*Dirección:* ${address}`,
    `*Método de Pago:* ${payment}`,
    line,
    "*Pedido:*",
    items,
    line,
    `*Total:* ${money(cartTotal())}`,
    `*Notas:* ${notes || "Sin notas"}`
  ].join("\n");
}

$("stepCheckout").addEventListener("submit", (e) => {
  e.preventDefault();

  const nameInput = $("cName");
  const addressInput = $("cAddress");
  const error = $("formError");

  [nameInput, addressInput].forEach(i => i.classList.remove("invalid"));
  const name = nameInput.value.trim();
  const address = addressInput.value.trim();

  if (!name || !address) {
    if (!name) nameInput.classList.add("invalid");
    if (!address) addressInput.classList.add("invalid");
    error.textContent = "Por favor completa tu nombre y dirección.";
    error.hidden = false;
    return;
  }
  if (cart.length === 0) {
    error.textContent = "Tu carrito está vacío.";
    error.hidden = false;
    return;
  }
  error.hidden = true;

  const ticket = buildTicket({
    name,
    address,
    payment: $("cPayment").value,
    notes: $("cNotes").value.trim()
  });
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(ticket)}`;

  window.open(url, "_blank", "noopener");

  cart = [];
  saveCart();
  renderCart();
  $("stepCheckout").reset();
  closeCart();
  showToast("¡Pedido listo! Envíalo desde WhatsApp 💬");
});

const burger = $("burger");
const nav = $("nav");
burger.addEventListener("click", () => {
  const open = nav.classList.toggle("is-open");
  burger.setAttribute("aria-expanded", open);
});
nav.addEventListener("click", (e) => {
  if (e.target.tagName === "A") {
    nav.classList.remove("is-open");
    burger.setAttribute("aria-expanded", "false");
  }
});

window.addEventListener("scroll", () => {
  $("header").classList.toggle("is-scrolled", window.scrollY > 10);
});

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });
document.querySelectorAll(".reveal").forEach(el => observer.observe(el));

$("year").textContent = new Date().getFullYear();

renderProducts();
renderCart();