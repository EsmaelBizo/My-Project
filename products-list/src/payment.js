// payment.js

import Swal from 'sweetalert2';

const CART_KEY = "my_cart";
const form = document.getElementById("payment-form");

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());
    console.log("Payment payload (demo only):", payload);

    // Clear the cart
    localStorage.removeItem(CART_KEY);

    // Payment success notification
    await Swal.fire({
        icon: "success",
        title: "Payment successful",
        text: "Thank you! We will contact you when your order is ready.",
        confirmButtonText: "OK",
        confirmButtonColor: "#ffa52f",
    });

    // Redirect to homepage
    window.location.href = "/";
});
