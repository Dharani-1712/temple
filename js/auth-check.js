// =============================================
// auth-check.js — Shared auth guard & utilities
// =============================================

import { auth } from "./firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// ---- Toast Notifications ----
export function showToast(message, type = "info", duration = 3500) {
  const container = document.getElementById("toastContainer");
  if (!container) return;

  const icons = { success: "✓", error: "✕", info: "ℹ" };
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${icons[type] || "ℹ"}</span> ${message}`;

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("fade-out");
    setTimeout(() => toast.remove(), 400);
  }, duration);
}

// ---- Spinner ----
export function showSpinner(show = true) {
  const spinner = document.getElementById("spinnerOverlay");
  if (!spinner) return;
  spinner.classList.toggle("hidden", !show);
}

// ---- Auth Guard: requires login ----
export function requireAuth(callback) {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      showSpinner(false);
      if (callback) callback(user);
    } else {
      // Redirect to login — works on both localhost and GitHub Pages
      const base = window.location.pathname.replace(/\/pages\/.*$/, '');
      window.location.href = base + '/login.html';
    }
  });
}

// ---- Auth Guard: redirect if already logged in ----
export function redirectIfLoggedIn(redirectTo = "dashboard.html") {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      // Build correct path for GitHub Pages (/temple/pages/dashboard.html)
      const base = window.location.pathname.replace(/\/[^/]+\.html$/, '');
      window.location.href = base + '/pages/' + redirectTo;
    } else {
      showSpinner(false);
    }
  });
}

// ---- Firebase Error Messages ----
export function getFirebaseError(code) {
  const errors = {
    "auth/user-not-found": "No account found with this email.",
    "auth/wrong-password": "Incorrect password. Please try again.",
    "auth/email-already-in-use": "This email is already registered.",
    "auth/weak-password": "Password must be at least 6 characters.",
    "auth/invalid-email": "Please enter a valid email address.",
    "auth/too-many-requests": "Too many attempts. Please try again later.",
    "auth/network-request-failed": "Network error. Check your connection.",
    "auth/invalid-credential": "Invalid email or password.",
    "auth/popup-closed-by-user": "Sign-in popup was closed.",
  };
  return errors[code] || "Something went wrong. Please try again.";
}

// ---- Format date for display ----
export function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
}

// ---- Generate a random booking ID ----
export function generateBookingId() {
  return "TD" + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substr(2, 4).toUpperCase();
}
