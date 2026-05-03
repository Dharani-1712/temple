// =============================================
// login.js — Firebase Email/Password + Google Login
// =============================================

import { auth, googleProvider } from "./firebase.js";
import { signInWithEmailAndPassword, signInWithPopup } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { showToast, showSpinner, redirectIfLoggedIn, getFirebaseError } from "./auth-check.js";

// Redirect if already logged in
redirectIfLoggedIn("dashboard.html");

const loginForm = document.getElementById("loginForm");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const emailError = document.getElementById("emailError");
const passwordError = document.getElementById("passwordError");
const submitBtn = document.getElementById("submitBtn");

// ---- Form validation ----
function validateForm() {
  let valid = true;

  emailError.classList.remove("visible");
  passwordError.classList.remove("visible");
  emailInput.classList.remove("error");
  passwordInput.classList.remove("error");

  if (!emailInput.value.trim()) {
    emailError.textContent = "Email is required.";
    emailError.classList.add("visible");
    emailInput.classList.add("error");
    valid = false;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value)) {
    emailError.textContent = "Enter a valid email address.";
    emailError.classList.add("visible");
    emailInput.classList.add("error");
    valid = false;
  }

  if (!passwordInput.value) {
    passwordError.textContent = "Password is required.";
    passwordError.classList.add("visible");
    passwordInput.classList.add("error");
    valid = false;
  }

  return valid;
}

// ---- Submit handler ----
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!validateForm()) return;

  submitBtn.disabled = true;
  submitBtn.textContent = "Signing in…";
  showSpinner(true);

  try {
    await signInWithEmailAndPassword(auth, emailInput.value.trim(), passwordInput.value);
    showToast("Welcome back! Redirecting…", "success");
    setTimeout(() => {
      window.location.href = "../pages/dashboard.html";
    }, 800);
  } catch (err) {
    showSpinner(false);
    showToast(getFirebaseError(err.code), "error");
    submitBtn.disabled = false;
    submitBtn.textContent = "Sign In";
  }
});

// ---- Toggle password visibility ----
const togglePass = document.getElementById("togglePassword");
if (togglePass) {
  togglePass.addEventListener("click", () => {
    const type = passwordInput.type === "password" ? "text" : "password";
    passwordInput.type = type;
    togglePass.textContent = type === "password" ? "👁" : "🙈";
  });
}

// ---- Google Sign-In ----
const googleBtn = document.getElementById("googleSignInBtn");
if (googleBtn) {
  googleBtn.addEventListener("click", async () => {
    googleBtn.disabled = true;
    showSpinner(true);
    try {
      await signInWithPopup(auth, googleProvider);
      showToast("Signed in with Google! Redirecting…", "success");
      setTimeout(() => {
        window.location.href = "../pages/dashboard.html";
      }, 800);
    } catch (err) {
      showSpinner(false);
      showToast(getFirebaseError(err.code), "error");
      googleBtn.disabled = false;
    }
  });
}
