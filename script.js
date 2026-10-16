
"use strict";

// SHOPPING CART DATA
let cart = [];
let favorites = [];

// HTML ELEMENTS
const cartButton = document.getElementById("cart-button");
const cartCount = document.getElementById("cart-count");
const cartOverlay = document.getElementById("cart-overlay");
const closeCartButton = document.getElementById("close-cart");
const cartItemsContainer = document.getElementById("cart-items");
const cartTotal = document.getElementById("cart-total");
const checkoutButton = document.getElementById("checkout-button");

// ADD BURGERS TO CART
// querySelectorAll selects buttons from ALL four burger cards.
document.querySelectorAll(".add-to-cart").forEach((button) => {
    button.addEventListener("click", () => {
        const card = button.closest(".burger-card");

        if (!card) {
            return;
        }

        const name = card.querySelector("h2").textContent.trim();
        const priceText = card.querySelector(".price").textContent;
        const price = Number(priceText.replace(/[₱,\s]/g, ""));

        if (!Number.isFinite(price)) {
            alert("Unable to read the price of this burger.");
            return;
        }

        // Check whether this burger is already in the cart.
        const existingItem = cart.find((item) => item.name === name);

        if (existingItem) {
            existingItem.quantity++;
        } else {
            cart.push({
                name: name,
                price: price,
                quantity: 1
            });
        }

        updateCart();

        // Give feedback on the clicked button.
        const originalText = "Add to Cart";
        button.textContent = "Added!";

        setTimeout(() => {
            button.textContent = originalText;
        }, 800);
    });
});

// FAVORITE BURGERS
document.querySelectorAll(".heart").forEach((button) => {
    button.addEventListener("click", () => {
        const card = button.closest(".burger-card");

        if (!card) {
            return;
        }

        const name = card.querySelector("h2").textContent.trim();
        const isFavorite = favorites.includes(name);

        if (isFavorite) {
            favorites = favorites.filter((item) => item !== name);
            button.textContent = "♡";
            button.classList.remove("active");
            button.setAttribute("aria-pressed", "false");
        } else {
            favorites.push(name);
            button.textContent = "♥";
            button.classList.add("active");
            button.setAttribute("aria-pressed", "true");
        }
    });
});

// UPDATE CART COUNT, ITEMS, AND TOTAL
function updateCart() {
    const totalQuantity = cart.reduce(
        (total, item) => total + item.quantity,
        0
    );

    const totalPrice = cart.reduce(
        (total, item) => total + item.price * item.quantity,
        0
    );

    cartCount.textContent = totalQuantity;
    cartTotal.textContent = formatCurrency(totalPrice);

    renderCartItems();

    checkoutButton.disabled = cart.length === 0;
}

// FORMAT PRICES IN PHILIPPINE PESOS
function formatCurrency(amount) {
    return "₱" + amount.toLocaleString("en-PH", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

// DISPLAY CART CONTENTS
function renderCartItems() {
    if (cart.length === 0) {
        cartItemsContainer.innerHTML =
            '<p class="empty-cart">Your cart is empty.</p>';
        return;
    }

    cartItemsContainer.innerHTML = "";

    cart.forEach((item) => {
        const itemElement = document.createElement("div");
        itemElement.className = "cart-item";

        const details = document.createElement("div");
        details.className = "cart-item-details";

        const name = document.createElement("h3");
        name.textContent = item.name;

        const subtotal = document.createElement("p");
        subtotal.textContent = formatCurrency(
            item.price * item.quantity
        );

        details.append(name, subtotal);

        const controls = document.createElement("div");
        controls.className = "quantity-controls";

        const minusButton = document.createElement("button");
        minusButton.type = "button";
        minusButton.textContent = "−";
        minusButton.setAttribute(
            "aria-label",
            "Decrease " + item.name + " quantity"
        );
        minusButton.dataset.action = "decrease";
        minusButton.dataset.name = item.name;

        const quantity = document.createElement("span");
        quantity.textContent = item.quantity;

        const plusButton = document.createElement("button");
        plusButton.type = "button";
        plusButton.textContent = "+";
        plusButton.setAttribute(
            "aria-label",
            "Increase " + item.name + " quantity"
        );
        plusButton.dataset.action = "increase";
        plusButton.dataset.name = item.name;

        const removeButton = document.createElement("button");
        removeButton.type = "button";
        removeButton.textContent = "Remove";
        removeButton.className = "remove-item";
        removeButton.dataset.action = "remove";
        removeButton.dataset.name = item.name;

        controls.append(
            minusButton,
            quantity,
            plusButton,
            removeButton
        );

        itemElement.append(details, controls);
        cartItemsContainer.appendChild(itemElement);
    });
}

// CHANGE QUANTITY OR REMOVE A BURGER
cartItemsContainer.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-action]");

    if (!button) {
        return;
    }

    const name = button.dataset.name;
    const action = button.dataset.action;
    const item = cart.find((burger) => burger.name === name);

    if (!item) {
        return;
    }

    if (action === "increase") {
        item.quantity++;
    } else if (action === "decrease") {
        item.quantity--;

        if (item.quantity <= 0) {
            cart = cart.filter((burger) => burger.name !== name);
        }
    } else if (action === "remove") {
        cart = cart.filter((burger) => burger.name !== name);
    }

    updateCart();
});

// OPEN THE SHOPPING CART
cartButton.addEventListener("click", () => {
    cartOverlay.hidden = false;
    document.body.classList.add("cart-open");
    closeCartButton.focus();
});

// CLOSE THE SHOPPING CART
function closeCart() {
    cartOverlay.hidden = true;
    document.body.classList.remove("cart-open");
    cartButton.focus();
}

closeCartButton.addEventListener("click", closeCart);

// CLOSE IF THE USER CLICKS THE DARK BACKGROUND
cartOverlay.addEventListener("click", (event) => {
    if (event.target === cartOverlay) {
        closeCart();
    }
});

// CLOSE WITH THE ESCAPE KEY
document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !cartOverlay.hidden) {
        closeCart();
    }
});

// DEMO CHECKOUT
checkoutButton.addEventListener("click", () => {
    if (cart.length === 0) {
        alert("Your cart is empty!");
        return;
    }

    const total = cart.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    );

    const orderSummary = cart
        .map((item) => {
            return `${item.name} x ${item.quantity}`;
        })
        .join("\n");

    const confirmed = confirm(
        "Confirm your order?\n\n" +
        orderSummary +
        "\n\nTotal: " + formatCurrency(total)
    );

    if (confirmed) {
        alert(
            "Thank you for ordering from Tasty Burger!\n" +
            "Your demo order has been placed."
        );

        cart = [];
        updateCart();
        closeCart();
    }
});

// INITIALIZE THE CART
updateCart();
