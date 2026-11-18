
(function() {
  function init() {
    "use strict";

    const cart = JSON.parse(localStorage.getItem("computex_cart")) || {};
    const CART_KEY = "computex_cart";

    const addButtons = document.querySelectorAll("[data-add-to-cart]");
    const cartCountEl = document.getElementById("cart-count");
    const cartValueEl = document.getElementById("cart-value");
    const cartBodyEl = document.getElementById("cart-body");
    const cartEmptyEl = document.getElementById("cart-empty");
    const cartTotalEl = document.getElementById("cart-total");

    const products = [];
    const productCards = document.querySelectorAll(".product-card");

    productCards.forEach((card) => {
      const id = card.dataset.productId;
      const name = card.dataset.productName;
      const price = parseFloat(card.dataset.productPrice);
      const img = card.querySelector(".product-img")?.src || "";
      if (id && name && price) {
        products.push({ id: id, name: name, price: price, img: img });
      }
    });

    function saveCart() {
      localStorage.setItem(CART_KEY, JSON.stringify(cart));
    }

    function getCartCount() {
      let count = 0;
      for (const key in cart) {
        count += cart[key] || 0;
      }
      return count;
    }

    function getCartValue() {
      let value = 0;
      for (const key in cart) {
        const qty = cart[key] || 0;
        const product = products.find(p => p.id === key);
        if (product) {
          value += product.price * qty;
        }
      }
      return value;
    }

    function buildCartItemHTML(product, qty) {
      const lineTotal = product.price * qty;
      const html =
        '<div class="col-md-3">' +
          '<a href="' + product.img + '" target="_blank">' +
            '<img src="' + product.img + '" alt="' + product.name + '" class="w-100 rounded img-fluid" style="max-height:60px; object-fit:contain;">' +
          '</a>' +
        '</div>' +
        '<div class="col-md-4">' +
          '<a href="#top" class="text-decoration-none">' +
            '<strong class="text-dark">' + product.name + '</strong>' +
          '</a>' +
          '<small class="text-secondary">' + formatCurrency(product.price) + '</small>' +
        '</div>' +
        '<div class="col-md-2">' +
          '<input type="number" min="1" value="' + qty + '" class="form-control form-control-sm qty-input" style="width:50px;" />' +
        '</div>' +
        '<div class="col-md-2 text-md-end">' +
          '<span class="me-2">' + formatCurrency(lineTotal) + '</span>' +
          '<button type="button" class="btn btn-sm btn-outline-danger remove-item" data-product-id="' + product.id + '">Remove</button>' +
        '</div>';
      return html;
    }

    function renderCart() {
      const count = getCartCount();
      const value = getCartValue();

      if (cartCountEl) cartCountEl.textContent = count;
      if (cartValueEl) cartValueEl.textContent = formatCurrency(value);

      if (cartBodyEl) {
        cartBodyEl.innerHTML = "";
        cartEmptyEl.style.display = Object.keys(cart).length === 0 ? "block" : "none";
        let total = 0;

        for (const key in cart) {
          const qty = cart[key] || 0;
          if (qty === 0) continue;

          const product = products.find(p => p.id === key);
          if (!product) continue;

          const lineTotal = product.price * qty;
          total += lineTotal;

          const row = document.createElement("div");
          row.className = "row align-items-center g-2 cart-item py-2 border-bottom";
          row.dataset.productId = product.id;
          row.innerHTML = buildCartItemHTML(product, qty);
          cartBodyEl.appendChild(row);
        }

        // Total row
        const totalRow = document.createElement("div");
        totalRow.className = "row align-items-center g-2 cart-item py-2";
        cartBodyEl.appendChild(totalRow);

        // Attach events to quantity inputs
        document.querySelectorAll(".qty-input").forEach((input) => {
          input.addEventListener("change", function() {
            const cartItem = this.parentElement.closest(".cart-item");
            const id = cartItem.dataset.productId;
            const qty = parseInt(this.value) || 0;
            if (qty <= 0) {
              removeItem(id);
            } else {
              updateQuantity(id, qty);
            }
            saveCart();
            renderCart();
          });
        });

        // Attach events to remove buttons
        document.querySelectorAll(".remove-item").forEach((btn) => {
          btn.addEventListener("click", function() {
            const id = this.dataset.productId;
            removeItem(id);
            saveCart();
            renderCart();
          });
        });
      }

      if (cartTotalEl) cartTotalEl.textContent = formatCurrency(total);
    }

    function addItem(id) {
      cart[id] = (cart[id] || 0) + 1;
      saveCart();
      renderCart();
    }

    function removeItem(id) {
      delete cart[id];
      saveCart();
      renderCart();
    }

    function updateQuantity(id, qty) {
      if (qty <= 0) {
        delete cart[id];
      } else {
        cart[id] = qty;
      }
      saveCart();
      renderCart();
    }

    function clearCart() {
      cart = {};
      saveCart();
      renderCart();
    }

    function formatCurrency(amount) {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD"
      }).format(amount);
    }

    // Attach add-to-cart event listeners
    addButtons.forEach((btn) => {
      btn.addEventListener("click", function() {
        const id = this.dataset.addToCart;
        const product = products.find(p => p.id === id);
        if (product) {
          addItem(id);
        }
      });
    });

    renderCart();
    window.__cart = { cart: cart, addItem: addItem, removeItem: removeItem, clearCart: clearCart };
  }

  // Wait for DOM to be ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
