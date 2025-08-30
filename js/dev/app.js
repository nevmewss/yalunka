(function polyfill() {
  const relList = document.createElement("link").relList;
  if (relList && relList.supports && relList.supports("modulepreload")) {
    return;
  }
  for (const link of document.querySelectorAll('link[rel="modulepreload"]')) {
    processPreload(link);
  }
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== "childList") {
        continue;
      }
      for (const node of mutation.addedNodes) {
        if (node.tagName === "LINK" && node.rel === "modulepreload")
          processPreload(node);
      }
    }
  }).observe(document, { childList: true, subtree: true });
  function getFetchOpts(link) {
    const fetchOpts = {};
    if (link.integrity) fetchOpts.integrity = link.integrity;
    if (link.referrerPolicy) fetchOpts.referrerPolicy = link.referrerPolicy;
    if (link.crossOrigin === "use-credentials")
      fetchOpts.credentials = "include";
    else if (link.crossOrigin === "anonymous") fetchOpts.credentials = "omit";
    else fetchOpts.credentials = "same-origin";
    return fetchOpts;
  }
  function processPreload(link) {
    if (link.ep)
      return;
    link.ep = true;
    const fetchOpts = getFetchOpts(link);
    fetch(link.href, fetchOpts);
  }
})();
let bodyLockStatus = true;
let bodyLockToggle = (delay = 500) => {
  if (document.documentElement.hasAttribute("data-fls-scrolllock")) {
    bodyUnlock(delay);
  } else {
    bodyLock(delay);
  }
};
let bodyUnlock = (delay = 500) => {
  if (bodyLockStatus) {
    const lockPaddingElements = document.querySelectorAll("[data-fls-lp]");
    setTimeout(() => {
      lockPaddingElements.forEach((lockPaddingElement) => {
        lockPaddingElement.style.paddingRight = "";
      });
      document.body.style.paddingRight = "";
      document.documentElement.removeAttribute("data-fls-scrolllock");
    }, delay);
    bodyLockStatus = false;
    setTimeout(function() {
      bodyLockStatus = true;
    }, delay);
  }
};
let bodyLock = (delay = 500) => {
  if (bodyLockStatus) {
    const lockPaddingElements = document.querySelectorAll("[data-fls-lp]");
    const lockPaddingValue = window.innerWidth - document.body.offsetWidth + "px";
    lockPaddingElements.forEach((lockPaddingElement) => {
      lockPaddingElement.style.paddingRight = lockPaddingValue;
    });
    document.body.style.paddingRight = lockPaddingValue;
    document.documentElement.setAttribute("data-fls-scrolllock", "");
    bodyLockStatus = false;
    setTimeout(function() {
      bodyLockStatus = true;
    }, delay);
  }
};
function menuInit() {
  document.addEventListener("click", function(e) {
    if (bodyLockStatus && e.target.closest("[data-fls-menu]")) {
      bodyLockToggle();
      document.documentElement.toggleAttribute("data-fls-menu-open");
    }
  });
}
document.querySelector("[data-fls-menu]") ? window.addEventListener("load", menuInit) : null;
const searchBox = document.querySelector(".top-header__search-box");
const searchBtn = document.querySelector(".top-header__search");
const searchInput = document.querySelector(".top-header__input");
const catalogItems = document.querySelectorAll(".catalog__item");
const searchResultsContainer = document.createElement("div");
searchResultsContainer.className = "search-results";
searchBox.appendChild(searchResultsContainer);
function searchProducts(query) {
  const lowerQuery = query.toLowerCase();
  searchResultsContainer.innerHTML = "";
  let matches = [];
  catalogItems.forEach((item) => {
    const title = item.querySelector(".item-catalog__title").textContent.trim().toLowerCase();
    const price = item.querySelector(".item-catalog__price span").textContent.trim();
    if (title.includes(lowerQuery)) {
      matches.push({ title, price });
    }
  });
  if (matches.length > 0) {
    matches.forEach((match) => {
      const resultItem = document.createElement("div");
      resultItem.className = "search-results__item";
      resultItem.textContent = `${match.title} - ${match.price} грн`;
      searchResultsContainer.appendChild(resultItem);
    });
    searchResultsContainer.classList.add("active");
  } else {
    searchResultsContainer.innerHTML = `<div class="search-results__item">Нічого не знайдено</div>`;
    searchResultsContainer.classList.add("active");
  }
}
searchInput.addEventListener("input", () => {
  const query = searchInput.value.trim();
  if (query.length > 0) {
    searchProducts(query);
  } else {
    searchResultsContainer.classList.remove("active");
  }
});
searchBtn.addEventListener("click", (e) => {
  e.preventDefault();
  if (!searchBox.classList.contains("active")) {
    searchBox.classList.add("active");
    searchInput.focus();
  } else if (searchInput.value.trim() !== "") {
    searchProducts(searchInput.value.trim());
  }
});
document.addEventListener("click", (e) => {
  if (!searchBox.contains(e.target)) {
    searchBox.classList.remove("active");
    searchResultsContainer.classList.remove("active");
    searchInput.value = "";
  }
});
const cartBtn = document.querySelector(".cart-btn");
const cartPopup = document.querySelector(".cart-popup");
const cartClose = document.querySelector(".cart-popup__close");
const removeButtons = document.querySelectorAll(".remove-item");
const cartCount = document.querySelector(".cart-count");
const cartTotal = document.querySelector(".cart-total");
cartBtn.addEventListener("click", () => {
  cartPopup.classList.add("active");
});
cartClose.addEventListener("click", () => {
  cartPopup.classList.remove("active");
});
window.addEventListener("click", (e) => {
  if (e.target === cartPopup) {
    cartPopup.classList.remove("active");
  }
});
removeButtons.forEach((btn) => {
  btn.addEventListener("click", function() {
    const item = this.closest(".cart-item");
    item.remove();
    updateCart();
  });
});
function updateCart() {
  const items = document.querySelectorAll(".cart-item");
  let total = 0;
  items.forEach((item) => {
    total += parseInt(item.querySelector("strong").innerText);
  });
  cartCount.innerText = items.length;
  cartTotal.innerText = `Всього: ${total} ₴`;
  if (!items.length) {
    document.querySelector(".cart-items").innerHTML = '<p class="cart-empty">Корзина пуста</p>';
  }
}
const checkoutBtn = document.querySelector(".cart-checkout");
const orderPopup$1 = document.querySelector(".order-popup");
const orderClose = document.querySelector(".order-popup__close");
const paymentRadios = document.querySelectorAll('input[name="payment"]');
const cardSection = document.querySelector(".order-card");
checkoutBtn.addEventListener("click", () => {
  cartPopup.classList.remove("active");
  orderPopup$1.classList.add("active");
});
orderClose.addEventListener("click", () => {
  orderPopup$1.classList.remove("active");
});
window.addEventListener("click", (e) => {
  if (e.target === orderPopup$1) {
    orderPopup$1.classList.remove("active");
  }
});
paymentRadios.forEach((radio) => {
  radio.addEventListener("change", () => {
    if (radio.value === "card") {
      cardSection.style.display = "block";
    } else {
      cardSection.style.display = "none";
    }
  });
});
const orderSubmit = document.querySelector(".order-submit");
orderSubmit.addEventListener("click", () => {
  alert("Ваше замовлення відправлене! Ми зв’яжемося з вами для підтвердження.");
  orderPopup$1.classList.remove("active");
});
class DynamicAdapt {
  constructor() {
    this.type = "max";
    this.init();
  }
  init() {
    this.objects = [];
    this.daClassname = "--dynamic";
    this.nodes = [...document.querySelectorAll("[data-fls-dynamic]")];
    this.nodes.forEach((node) => {
      const data = node.dataset.flsDynamic.trim();
      const dataArray = data.split(`,`);
      const object = {};
      object.element = node;
      object.parent = node.parentNode;
      object.destinationParent = dataArray[3] ? node.closest(dataArray[3].trim()) || document : document;
      dataArray[3] ? dataArray[3].trim() : null;
      const objectSelector = dataArray[0] ? dataArray[0].trim() : null;
      if (objectSelector) {
        const foundDestination = object.destinationParent.querySelector(objectSelector);
        if (foundDestination) {
          object.destination = foundDestination;
        }
      }
      object.breakpoint = dataArray[1] ? dataArray[1].trim() : `767.98`;
      object.place = dataArray[2] ? dataArray[2].trim() : `last`;
      object.index = this.indexInParent(object.parent, object.element);
      this.objects.push(object);
    });
    this.arraySort(this.objects);
    this.mediaQueries = this.objects.map(({ breakpoint }) => `(${this.type}-width: ${breakpoint / 16}em),${breakpoint}`).filter((item, index, self) => self.indexOf(item) === index);
    this.mediaQueries.forEach((media) => {
      const mediaSplit = media.split(",");
      const matchMedia = window.matchMedia(mediaSplit[0]);
      const mediaBreakpoint = mediaSplit[1];
      const objectsFilter = this.objects.filter(({ breakpoint }) => breakpoint === mediaBreakpoint);
      matchMedia.addEventListener("change", () => {
        this.mediaHandler(matchMedia, objectsFilter);
      });
      this.mediaHandler(matchMedia, objectsFilter);
    });
  }
  mediaHandler(matchMedia, objects) {
    if (matchMedia.matches) {
      objects.forEach((object) => {
        if (object.destination) {
          this.moveTo(object.place, object.element, object.destination);
        }
      });
    } else {
      objects.forEach(({ parent, element, index }) => {
        if (element.classList.contains(this.daClassname)) {
          this.moveBack(parent, element, index);
        }
      });
    }
  }
  moveTo(place, element, destination) {
    element.classList.add(this.daClassname);
    const index = place === "last" || place === "first" ? place : parseInt(place, 10);
    if (index === "last" || index >= destination.children.length) {
      destination.append(element);
    } else if (index === "first") {
      destination.prepend(element);
    } else {
      destination.children[index].before(element);
    }
  }
  moveBack(parent, element, index) {
    element.classList.remove(this.daClassname);
    if (parent.children[index] !== void 0) {
      parent.children[index].before(element);
    } else {
      parent.append(element);
    }
  }
  indexInParent(parent, element) {
    return [...parent.children].indexOf(element);
  }
  arraySort(arr) {
    if (this.type === "min") {
      arr.sort((a, b) => {
        if (a.breakpoint === b.breakpoint) {
          if (a.place === b.place) {
            return 0;
          }
          if (a.place === "first" || b.place === "last") {
            return -1;
          }
          if (a.place === "last" || b.place === "first") {
            return 1;
          }
          return 0;
        }
        return a.breakpoint - b.breakpoint;
      });
    } else {
      arr.sort((a, b) => {
        if (a.breakpoint === b.breakpoint) {
          if (a.place === b.place) {
            return 0;
          }
          if (a.place === "first" || b.place === "last") {
            return 1;
          }
          if (a.place === "last" || b.place === "first") {
            return -1;
          }
          return 0;
        }
        return b.breakpoint - a.breakpoint;
      });
      return;
    }
  }
}
if (document.querySelector("[data-fls-dynamic]")) {
  window.addEventListener("load", () => new DynamicAdapt());
}
document.addEventListener("DOMContentLoaded", () => {
  const sortBlock = document.querySelector(".catalog__sort");
  sortBlock.addEventListener("click", (e) => {
    sortBlock.classList.toggle("active");
  });
  document.addEventListener("click", (e) => {
    if (!sortBlock.contains(e.target)) {
      sortBlock.classList.remove("active");
    }
  });
});
document.addEventListener("DOMContentLoaded", () => {
  const filterBtn = document.querySelector(".catalog__filter");
  const filterModal = document.querySelector(".catalog__filter-modal");
  const filterClose = document.querySelector(".catalog__filter-close");
  if (filterBtn && filterModal && filterClose) {
    filterBtn.addEventListener("click", () => {
      filterModal.classList.add("active");
      document.body.style.overflow = "hidden";
    });
    filterClose.addEventListener("click", () => {
      filterModal.classList.remove("active");
      document.body.style.overflow = "";
    });
    filterModal.addEventListener("click", (e) => {
      if (e.target === filterModal) {
        filterModal.classList.remove("active");
        document.body.style.overflow = "";
      }
    });
  }
});
document.addEventListener("DOMContentLoaded", () => {
  const itemsPerPage = 15;
  const items = document.querySelectorAll(".catalog__row .catalog__item");
  const paginationContainer = document.querySelector(".catalog__pagination");
  const totalPages = Math.ceil(items.length / itemsPerPage);
  let currentPage = 1;
  function showPage(page) {
    items.forEach((item, index) => {
      item.style.display = "none";
      const start = (page - 1) * itemsPerPage;
      const end = page * itemsPerPage;
      if (index >= start && index < end) {
        item.style.display = "block";
      }
    });
    document.querySelectorAll(".pagination-btn").forEach((btn) => {
      btn.classList.remove("active");
    });
    const activeBtn = document.querySelector(`.pagination-btn[data-page="${page}"]`);
    if (activeBtn) activeBtn.classList.add("active");
  }
  function createPagination() {
    paginationContainer.innerHTML = "";
    for (let i = 1; i <= totalPages; i++) {
      const button = document.createElement("button");
      button.classList.add("pagination-btn");
      if (i === currentPage) button.classList.add("active");
      button.dataset.page = i;
      button.textContent = i;
      button.addEventListener("click", () => {
        currentPage = i;
        showPage(currentPage);
      });
      paginationContainer.appendChild(button);
    }
  }
  if (totalPages > 1) {
    createPagination();
    showPage(currentPage);
  }
});
document.addEventListener("DOMContentLoaded", () => {
  const itemsPerPage = 6;
  const items = document.querySelectorAll(".blog__row .blog__column");
  const paginationContainer = document.querySelector(".blog__pagination");
  const totalPages = Math.ceil(items.length / itemsPerPage);
  let currentPage = 1;
  function showPage(page) {
    items.forEach((item, index) => {
      item.style.display = "none";
      const start = (page - 1) * itemsPerPage;
      const end = page * itemsPerPage;
      if (index >= start && index < end) {
        item.style.display = "block";
      }
    });
    document.querySelectorAll(".blog-pagination-btn").forEach((btn) => {
      btn.classList.remove("active");
    });
    const activeBtn = document.querySelector(`.blog-pagination-btn[data-page="${page}"]`);
    if (activeBtn) activeBtn.classList.add("active");
  }
  function createPagination() {
    paginationContainer.innerHTML = "";
    for (let i = 1; i <= totalPages; i++) {
      const button = document.createElement("button");
      button.classList.add("blog-pagination-btn");
      if (i === currentPage) button.classList.add("active");
      button.dataset.page = i;
      button.textContent = i;
      button.addEventListener("click", () => {
        currentPage = i;
        showPage(currentPage);
      });
      paginationContainer.appendChild(button);
    }
  }
  if (totalPages > 1) {
    createPagination();
    showPage(currentPage);
  }
});
document.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    const target = tab.dataset.tab;
    document.querySelectorAll(".tab").forEach((btn) => btn.classList.remove("active"));
    document.querySelectorAll(".tab-pane").forEach((pane) => pane.classList.remove("active"));
    tab.classList.add("active");
    document.getElementById(target).classList.add("active");
  });
});
function activateOptions(selector) {
  document.querySelectorAll(selector).forEach((group) => {
    group.addEventListener("click", (e) => {
      if (e.target.tagName === "BUTTON") {
        group.querySelectorAll("button").forEach((btn) => btn.classList.remove("active"));
        e.target.classList.add("active");
      }
    });
  });
}
activateOptions(".option__colors");
activateOptions(".option__sizes");
const mainImage = document.querySelector(".product__main img");
const thumbs = document.querySelectorAll(".product__thumbs img");
thumbs.forEach((thumb) => {
  thumb.addEventListener("click", () => {
    mainImage.src = thumb.src;
    thumbs.forEach((t) => t.classList.remove("active"));
    thumb.classList.add("active");
  });
});
let cart = JSON.parse(localStorage.getItem("cart")) || [];
document.addEventListener("click", (e) => {
  const btn = e.target.closest(".btn-buy, .add-to-cart");
  if (!btn) return;
  const product = {
    id: btn.dataset.id,
    title: btn.dataset.title,
    price: parseFloat(btn.dataset.price.replace(/\s/g, "")),
    // видаляємо пробіли
    image: btn.dataset.image,
    quantity: 1
  };
  addToCart(product);
});
function addToCart(product) {
  const existing = cart.find((item) => item.id === product.id);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push(product);
  }
  localStorage.setItem("cart", JSON.stringify(cart));
  renderCartPopup();
}
function renderCartPopup() {
  const container = document.querySelector(".cart-items");
  const totalEl = document.querySelector(".cart-total");
  const countEl = document.querySelector(".header__count");
  container.innerHTML = "";
  if (cart.length === 0) {
    container.innerHTML = "<p>Кошик порожній</p>";
    totalEl.textContent = "Всього: 0 ₴";
    if (countEl) countEl.textContent = 0;
    return;
  }
  let total = 0;
  let totalCount = 0;
  cart.forEach((item) => {
    total += item.price * item.quantity;
    totalCount += item.quantity;
    const div = document.createElement("div");
    div.classList.add("cart-item");
    div.innerHTML = `
            <img src="${item.image}" alt="${item.title}" class="cart-item__img">
            <div class="cart-item__info">
                <span class="cart-item__title">${item.title}</span>
                <span class="cart-item__quantity">× ${item.quantity}</span>
                <span class="cart-item__price">${item.price} ₴ / шт</span>
            </div>
            <strong class="cart-item__total">${item.price * item.quantity} ₴</strong>
            <button class="remove-item" data-id="${item.id}">✖</button>
        `;
    container.appendChild(div);
  });
  totalEl.textContent = `Всього: ${total} ₴`;
  if (countEl) countEl.textContent = totalCount;
  bindRemoveButtons();
}
function bindRemoveButtons() {
  document.querySelectorAll(".remove-item").forEach((btn) => {
    btn.onclick = () => {
      cart = cart.filter((item) => item.id !== btn.dataset.id);
      localStorage.setItem("cart", JSON.stringify(cart));
      renderCartPopup();
    };
  });
}
document.addEventListener("DOMContentLoaded", renderCartPopup);
const orderPopup = document.querySelector(".order-popup");
const orderItemsContainer = document.querySelector(".order-items");
const orderTotalEl = document.querySelector(".order-total__sum");
const orderConfirmBtn = document.querySelector(".order-confirm");
const orderCloseBtn = document.querySelector(".order-popup__close");
const orderForm = document.querySelector(".order-form");
orderCloseBtn.addEventListener("click", () => {
  orderPopup.classList.remove("open");
});
document.querySelector(".cart-checkout").addEventListener("click", (e) => {
  e.preventDefault();
  renderOrderPopup(cart);
  orderPopup.classList.add("open");
});
document.querySelectorAll(".item-catalog__btn:not(.btn-buy)").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    const item = btn.closest(".item-catalog");
    const title = item.querySelector(".item-catalog__title").textContent;
    const price = parseFloat(item.querySelector(".item-catalog__price span").textContent.replace(/\s/g, ""));
    const image = item.querySelector(".item-catalog__img img").src;
    const quickCart = [
      {
        id: "quick_" + Date.now(),
        title,
        price,
        quantity: 1,
        image
      }
    ];
    renderOrderPopup(quickCart);
    orderPopup.classList.add("open");
  });
});
function renderOrderPopup(products) {
  orderItemsContainer.innerHTML = "";
  let total = 0;
  products.forEach((item) => {
    total += item.price * item.quantity;
    const div = document.createElement("div");
    div.classList.add("order-item");
    div.style.display = "flex";
    div.style.alignItems = "center";
    div.style.marginBottom = "10px";
    div.innerHTML = `
            <img src="${item.image}" alt="${item.title}" style="width:50px;height:50px;object-fit:cover;margin-right:10px;border-radius:5px;">
            <span style="flex:1;">${item.title} × ${item.quantity}</span>
            <strong>${item.price * item.quantity} ₴</strong>
        `;
    orderItemsContainer.appendChild(div);
  });
  orderTotalEl.textContent = `${total} ₴`;
}
orderConfirmBtn.addEventListener("click", () => {
  if (!orderForm.checkValidity()) {
    alert("Заповніть всі поля!");
    return;
  }
  alert("Дякуємо! Ваше замовлення прийнято.");
  orderPopup.classList.remove("open");
  orderForm.reset();
});
