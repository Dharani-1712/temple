// =============================================
// firebase.js — Firebase v9 Modular SDK Config
// =============================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyAyGilLtIDX9bIs8GppsVTEZo6xxqpwj4U",
  authDomain: "temple-5b810.firebaseapp.com",
  projectId: "temple-5b810",
  storageBucket: "temple-5b810.firebasestorage.app",
  messagingSenderId: "37611694179",
  appId: "1:37611694179:web:0fa7435593b200eac47056",
  measurementId: "G-9ZKEN1DCEF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
