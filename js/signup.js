// =============================================
// signup.js — Firebase Email/Password + Google Signup
// =============================================

import { auth, googleProvider } from "./firebase.js";
import { createUserWithEmailAndPassword, updateProfile, signInWithPopup } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { showToast, showSpinner, redirectIfLoggedIn, getFirebaseError } from "./auth-check.js";

// Redirect if already logged in
redirectIfLoggedIn("dashboard.html");

const signupForm = document.getElementById("signupForm");
const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const confirmInput = document.getElementById("confirmPassword");
const submitBtn = document.getElementById("submitBtn");

const nameError = document.getElementById("nameError");
const emailError = document.getElementById("emailError");
const passwordError = document.getElementById("passwordError");
const confirmError = document.getElementById("confirmError");

// Password strength indicator
passwordInput.addEventListener("input", () => {
  const val = passwordInput.value;
  const strength = document.getElementById("passwordStrength");
  if (!strength) return;
  if (val.length === 0) { strength.textContent = ""; return; }
  if (val.length < 6) { strength.textContent = "Weak"; strength.style.color = "#e74c3c"; }
  else if (val.length < 10 || !/[A-Z]/.test(val) || !/[0-9]/.test(val)) {
    strength.textContent = "Moderate"; strength.style.color = "#e67e22";
  } else {
    strength.textContent = "Strong"; strength.style.color = "#27ae60";
  }
});

// ---- Form validation ----
function validateForm() {
  let valid = true;
  [nameError, emailError, passwordError, confirmError].forEach(el => el.classList.remove("visible"));
  [nameInput, emailInput, passwordInput, confirmInput].forEach(el => el.classList.remove("error"));

  if (!nameInput.value.trim() || nameInput.value.trim().length < 2) {
    nameError.textContent = "Please enter your full name (min 2 chars).";
    nameError.classList.add("visible"); nameInput.classList.add("error"); valid = false;
  }
  if (!emailInput.value.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value)) {
    emailError.textContent = "Enter a valid email address.";
    emailError.classList.add("visible"); emailInput.classList.add("error"); valid = false;
  }
  if (passwordInput.value.length < 6) {
    passwordError.textContent = "Password must be at least 6 characters.";
    passwordError.classList.add("visible"); passwordInput.classList.add("error"); valid = false;
  }
  if (confirmInput.value !== passwordInput.value) {
    confirmError.textContent = "Passwords do not match.";
    confirmError.classList.add("visible"); confirmInput.classList.add("error"); valid = false;
  }
  return valid;
}

// ---- Submit handler ----
signupForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!validateForm()) return;

  submitBtn.disabled = true;
  submitBtn.textContent = "Creating account…";
  showSpinner(true);

  try {
    const cred = await createUserWithEmailAndPassword(auth, emailInput.value.trim(), passwordInput.value);
    await updateProfile(cred.user, { displayName: nameInput.value.trim() });
    showToast("Account created! Welcome to Temple Darshan 🙏", "success");
    setTimeout(() => {
      const base = window.location.pathname.replace(/\/[^/]+\.html$/, '');
      window.location.href = base + '/pages/dashboard.html';
    }, 1000);
  } catch (err) {
    showSpinner(false);
    showToast(getFirebaseError(err.code), "error");
    submitBtn.disabled = false;
    submitBtn.textContent = "Create Account";
  }
});

// Toggle password visibility
document.querySelectorAll("[data-toggle-password]").forEach(btn => {
  btn.addEventListener("click", () => {
    const targetId = btn.getAttribute("data-toggle-password");
    const input = document.getElementById(targetId);
    input.type = input.type === "password" ? "text" : "password";
    btn.textContent = input.type === "password" ? "👁" : "🙈";
  });
});

// ---- Google Sign-In ----
const googleBtn = document.getElementById("googleSignInBtn");
if (googleBtn) {
  googleBtn.addEventListener("click", async () => {
    googleBtn.disabled = true;
    showSpinner(true);
    try {
      await signInWithPopup(auth, googleProvider);
      showToast("Account ready! Welcome to Temple Darshan 🙏", "success");
      setTimeout(() => {
        const base = window.location.pathname.replace(/\/[^/]+\.html$/, '');
        window.location.href = base + '/pages/dashboard.html';
      }, 1000);
    } catch (err) {
      showSpinner(false);
      showToast(getFirebaseError(err.code), "error");
      googleBtn.disabled = false;
    }
  });
}
