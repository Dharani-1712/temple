// =============================================
// booking.js — Temple Slot Booking Logic
// =============================================

import { auth } from "./firebase.js";
import { requireAuth, showToast, generateBookingId, formatDate } from "./auth-check.js";

// ---- Temple Data ----
const TEMPLES = [
  {
    id: "tirupati",
    name: "Tirupati Balaji",
    location: "Tirumala, Andhra Pradesh",
    deity: "Lord Venkateswara",
    emoji: "🏛️",
    description: "One of the most visited pilgrimage sites in the world, known for its magnificent architecture."
  },
  {
    id: "vaishno-devi",
    name: "Vaishno Devi",
    location: "Katra, Jammu & Kashmir",
    deity: "Goddess Vaishno Devi",
    emoji: "⛰️",
    description: "Nestled in the Trikuta Mountains, this cave shrine receives millions of devotees annually."
  },
  {
    id: "somnath",
    name: "Somnath Temple",
    location: "Prabhas Patan, Gujarat",
    deity: "Lord Shiva",
    emoji: "🌊",
    description: "One of the twelve Jyotirlinga shrines of Shiva, standing majestically by the Arabian Sea."
  },
  {
    id: "golden-temple",
    name: "Golden Temple",
    location: "Amritsar, Punjab",
    deity: "Waheguru",
    emoji: "✨",
    description: "The holiest Gurdwara of Sikhism, its gilded dome reflecting peacefully in the sacred pool."
  },
  {
    id: "kashi-vishwanath",
    name: "Kashi Vishwanath",
    location: "Varanasi, Uttar Pradesh",
    deity: "Lord Shiva",
    emoji: "🕉️",
    description: "One of the most famous temples dedicated to Lord Shiva, located on the sacred Ganges."
  },
  {
    id: "rameshwaram",
    name: "Rameshwaram",
    location: "Tamil Nadu",
    deity: "Lord Shiva & Rama",
    emoji: "🌺",
    description: "A sacred pilgrimage site at the tip of the Indian peninsula, surrounded by the sea."
  }
];

// ---- Time Slots ----
const TIME_SLOTS = [
  { id: "s1", time: "05:30 AM", label: "Mangal Aarti", full: false },
  { id: "s2", time: "07:00 AM", label: "Pratha Darshan", full: false },
  { id: "s3", time: "09:00 AM", label: "Morning Puja", full: true },
  { id: "s4", time: "11:00 AM", label: "Madhyan Aarti", full: false },
  { id: "s5", time: "01:00 PM", label: "Afternoon", full: false },
  { id: "s6", time: "03:30 PM", label: "Sandhya Puja", full: true },
  { id: "s7", time: "05:00 PM", label: "Sandhya Aarti", full: false },
  { id: "s8", time: "07:00 PM", label: "Saptah Puja", full: false },
  { id: "s9", time: "08:30 PM", label: "Shayana Aarti", full: false },
];

// State
let selectedTemple = null;
let selectedSlot = null;
let selectedDate = null;
let currentUser = null;

// ---- Init on auth ----
requireAuth((user) => {
  currentUser = user;
  renderTemples();
  setupDatePicker();
  setupForm();
  updateUserGreeting(user);
});

function updateUserGreeting(user) {
  const el = document.getElementById("userGreeting");
  if (el) el.textContent = user.displayName || user.email;
}

// ---- Render Temple Cards ----
function renderTemples() {
  const grid = document.getElementById("templeGrid");
  if (!grid) return;
  grid.innerHTML = "";

  TEMPLES.forEach(temple => {
    const card = document.createElement("div");
    card.className = "card temple-card";
    card.dataset.id = temple.id;
    card.innerHTML = `
      <div class="temple-img" style="background: linear-gradient(135deg, rgba(232,131,26,0.12), rgba(201,168,76,0.18)); border-radius: 12px 12px 0 0;">
        <span style="font-size: 3.5rem;">${temple.emoji}</span>
      </div>
      <div class="selected-indicator">✓</div>
      <div class="card-body">
        <h3 style="font-size:1.2rem; margin-bottom:4px;">${temple.name}</h3>
        <p style="font-size:0.8rem; margin-bottom:6px; color: var(--saffron);">📍 ${temple.location}</p>
        <p style="font-size:0.82rem;">${temple.description}</p>
        <div class="mt-2">
          <span class="badge badge-saffron">${temple.deity}</span>
        </div>
      </div>
    `;
    card.addEventListener("click", () => selectTemple(temple, card));
    grid.appendChild(card);
  });
}

function selectTemple(temple, cardEl) {
  document.querySelectorAll(".temple-card").forEach(c => c.classList.remove("selected"));
  cardEl.classList.add("selected");
  selectedTemple = temple;

  document.getElementById("bookingFormSection").style.display = "block";
  document.getElementById("bookingFormSection").scrollIntoView({ behavior: "smooth", block: "start" });
  document.getElementById("selectedTempleName").textContent = temple.name;
}

// ---- Date Picker Setup ----
function setupDatePicker() {
  const dateInput = document.getElementById("visitDate");
  if (!dateInput) return;

  // Set min date to tomorrow, max 30 days ahead
  const today = new Date();
  const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
  const maxDate = new Date(today); maxDate.setDate(today.getDate() + 30);

  dateInput.min = tomorrow.toISOString().split("T")[0];
  dateInput.max = maxDate.toISOString().split("T")[0];

  dateInput.addEventListener("change", () => {
    selectedDate = dateInput.value;
    renderSlots();
  });
}

// ---- Render Time Slots ----
function renderSlots() {
  const container = document.getElementById("slotsContainer");
  if (!container) return;
  container.innerHTML = "";
  selectedSlot = null;

  TIME_SLOTS.forEach(slot => {
    const btn = document.createElement("button");
    btn.className = `slot-btn${slot.full ? " full" : ""}`;
    btn.disabled = slot.full;
    btn.innerHTML = `<strong>${slot.time}</strong><br><span style="font-size:0.75rem; opacity:0.8">${slot.label}</span>`;
    if (!slot.full) {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".slot-btn").forEach(b => b.classList.remove("selected"));
        btn.classList.add("selected");
        selectedSlot = slot;
      });
    }
    container.appendChild(btn);
  });

  document.getElementById("slotSection").style.display = "block";
}

// ---- Form submission ----
function setupForm() {
  const form = document.getElementById("bookingForm");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    if (!selectedTemple) { showToast("Please select a temple first.", "error"); return; }
    if (!selectedDate) { showToast("Please select a visit date.", "error"); return; }
    if (!selectedSlot) { showToast("Please select a time slot.", "error"); return; }

    const devotees = parseInt(document.getElementById("devotees").value) || 1;
    if (devotees < 1 || devotees > 10) { showToast("Devotees must be between 1 and 10.", "error"); return; }

    const booking = {
      bookingId: generateBookingId(),
      templeId: selectedTemple.id,
      templeName: selectedTemple.name,
      templeLocation: selectedTemple.location,
      templeEmoji: selectedTemple.emoji,
      deity: selectedTemple.deity,
      date: selectedDate,
      slot: selectedSlot,
      devotees,
      userEmail: currentUser.email,
      userName: currentUser.displayName || currentUser.email,
      userId: currentUser.uid,
      bookedAt: new Date().toISOString(),
      status: "confirmed"
    };

    // Save to localStorage
    const existing = JSON.parse(localStorage.getItem("templeBookings") || "[]");
    existing.push(booking);
    localStorage.setItem("templeBookings", JSON.stringify(existing));

    // Save current booking for ticket page
    localStorage.setItem("currentBooking", JSON.stringify(booking));

    showToast("Booking confirmed! 🙏 Generating your ticket…", "success");
    setTimeout(() => {
      window.location.href = "./ticket.html";
    }, 1200);
  });
}
