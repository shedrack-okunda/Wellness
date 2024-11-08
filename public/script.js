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

function takeToPayment() {
  localStorage.setItem("bookPrice", 1000);

  window.location.href = "/payment";
}

// footer
const year = document.getElementById("current-year");
year.innerHTML = new Date().getFullYear();
