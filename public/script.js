// Navigation bar
"use strict";
const header = document.querySelector(".header");
const nav = document.querySelector(".nav-list");
const menuBtn = document.querySelector(".menu-btn");
const cancelBtn = document.querySelector(".cancel-btn");

menuBtn.addEventListener("click", () => {
  nav.classList.add("active");
  menuBtn.classList.add("hide");
});

cancelBtn.addEventListener("click", () => {
  nav.classList.remove("active");
  menuBtn.classList.remove("hide");
});

window.addEventListener("scroll", () => {
  this.scrollY > 20
    ? header.classList.add("sticky")
    : header.classList.remove("sticky");
});

// Order Form
document.addEventListener("DOMContentLoaded", () => {
  const orderBtn = document.getElementById("orderBtn");
  const closeOrderBtn = document.getElementById("close-order");
  const orderFormContainer = document.querySelector(".order-form");
  const orderForm = document.getElementById("orderForm");

  orderBtn.addEventListener("click", () => {
    orderFormContainer.style.display = "block";
  });

  closeOrderBtn.addEventListener("click", () => {
    orderFormContainer.style.display = "none";
  });

  orderForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const formData = new FormData(orderForm);
    formData.forEach((value, key) => {
      console.log(`${key}: ${value}`);
    });

    setTimeout(() => {
      orderForm.reset();
    }, 2000);
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("form");
  const btn = document.getElementById("button");

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    formData.forEach((value, key) => {
      console.log(`${key}: ${value}`);
    });

    btn.value = "Sending...";

    setTimeout(() => {
      form.reset();
      btn.value = "SEND";
    }, 2000);
  });
});

// footer
const year = document.getElementById("current-year");
year.innerHTML = new Date().getFullYear();
