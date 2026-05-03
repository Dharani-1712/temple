# 🛕 Temple Darshan — Booking Website

A modern, fully static temple darshan booking system with Firebase Authentication and QR ticket generation.

## ✨ Features

- 🔐 Firebase Email/Password Authentication (v9 Modular SDK)
- 📅 Book darshan slots at 6 famous temples
- 🎟️ QR Code ticket generation
- ⬇️ Download ticket as image (html2canvas)
- 📱 Fully responsive (mobile-friendly)
- 💾 Bookings stored in localStorage
- 🎨 Beautiful sacred-themed UI design

## 📁 File Structure

```
temple-darshan/
├── index.html              ← Home page
├── login.html              ← Sign in page
├── signup.html             ← Create account page
│
├── pages/
│   ├── dashboard.html      ← User dashboard (auth required)
│   ├── booking.html        ← Slot booking page (auth required)
│   └── ticket.html         ← QR ticket display (auth required)
│
├── css/
│   └── style.css           ← Main stylesheet
│
└── js/
    ├── firebase.js         ← Firebase config & init
    ├── auth-check.js       ← Shared auth utilities, toast, spinner
    ├── login.js            ← Login logic
    ├── signup.js           ← Signup logic
    ├── dashboard.js        ← Dashboard & bookings
    ├── booking.js          ← Temple selection & slot booking
    └── ticket.js           ← QR generation & download
```

## 🚀 Setup Guide

### 1. Create a Firebase Project

1. Go to [https://console.firebase.google.com/](https://console.firebase.google.com/)
2. Click **Add Project** → Follow setup steps
3. In the project dashboard, click the **Web** icon (`</>`) to register your app
4. Copy your Firebase config object

### 2. Add Your Firebase Config

Open `js/firebase.js` and replace the placeholder config:

```js
const firebaseConfig = {
  apiKey: "YOUR_ACTUAL_API_KEY",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

### 3. Enable Email/Password Authentication

1. In Firebase Console → **Authentication** → **Sign-in method**
2. Enable **Email/Password**
3. Save

### 4. Deploy to GitHub Pages

1. Push all files to a GitHub repository
2. Go to **Settings → Pages**
3. Set source to `main` branch, root folder
4. Your site will be live at `https://yourusername.github.io/repository-name/`

> ⚠️ **Important**: Firebase's CDN modules require the page to be served over HTTP/S — not opened directly as a `file://` URL. Use GitHub Pages, Netlify, or a local dev server like VS Code's Live Server extension.

## 🔧 Local Development

Use VS Code with the **Live Server** extension:
1. Right-click `index.html` → **Open with Live Server**
2. Site opens at `http://localhost:5500`

Or use Python:
```bash
python -m http.server 8000
# Open http://localhost:8000
```

## 📦 External Libraries Used (CDN)

| Library | Purpose |
|---------|---------|
| QRCode.js | QR ticket generation |
| html2canvas | Download ticket as image |
| Firebase v10 | Auth & SDK |
| Google Fonts | Cormorant Garamond + Jost |

## 🙏 Notes

- Bookings are stored in browser `localStorage` — no backend needed
- Each user only sees their own bookings (filtered by `userId`)
- The booking system is frontend-only — ideal for GitHub Pages
- QR contains: Booking ID, Temple, Date, Time, Devotees, Email

---

*Jai Shri Ram 🙏 — Made with devotion*
