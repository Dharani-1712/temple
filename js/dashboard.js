// =============================================
// dashboard.js — Dashboard Logic
// =============================================

import { auth } from "./firebase.js";
import { signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { requireAuth, showToast, formatDate } from "./auth-check.js";

requireAuth((user) => {
  // Set user info
  document.getElementById("userName").textContent = user.displayName || "Devotee";
  document.getElementById("userEmail").textContent = user.email;
  document.getElementById("userAvatar").textContent = (user.displayName || user.email)[0].toUpperCase();

  // Load bookings
  loadBookings(user.uid);
});

function loadBookings(userId) {
  const allBookings = JSON.parse(localStorage.getItem("templeBookings") || "[]");
  const userBookings = allBookings.filter(b => b.userId === userId);

  // Update stats
  document.getElementById("totalBookings").textContent = userBookings.length;
  document.getElementById("upcomingCount").textContent = userBookings.filter(b => new Date(b.date) >= new Date()).length;
  document.getElementById("templesVisited").textContent = new Set(userBookings.map(b => b.templeId)).size;

  // Render booking list
  const container = document.getElementById("bookingsList");
  if (!container) return;

  if (userBookings.length === 0) {
    container.innerHTML = `
      <div style="text-align:center; padding: 3rem 1rem; grid-column: 1/-1;">
        <div style="font-size:3rem; margin-bottom:1rem; opacity:0.5;">🛕</div>
        <h3 style="color:var(--text-muted); font-size:1.2rem;">No bookings yet</h3>
        <p class="mt-2">Begin your spiritual journey today.</p>
        <a href="./booking.html" class="btn btn-primary mt-3" style="display:inline-flex;">Book a Darshan</a>
      </div>
    `;
    return;
  }

  // Sort by date descending
  const sorted = [...userBookings].sort((a, b) => new Date(b.bookedAt) - new Date(a.bookedAt));

  container.innerHTML = sorted.map(b => {
    const isUpcoming = new Date(b.date) >= new Date();
    const statusClass = isUpcoming ? "badge-green" : "badge-red";
    const statusText = isUpcoming ? "Upcoming" : "Completed";

    return `
      <div class="card" style="animation: fadeInUp 0.4s ease;">
        <div class="card-body">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:12px;">
            <div>
              <span style="font-size:2rem;">${b.templeEmoji}</span>
              <h3 style="font-size:1.1rem; margin-top:6px;">${b.templeName}</h3>
              <p style="font-size:0.8rem; color:var(--saffron);">📍 ${b.templeLocation}</p>
            </div>
            <span class="badge ${statusClass}">${statusText}</span>
          </div>
          <div style="margin-top:1rem; display:grid; grid-template-columns:1fr 1fr; gap:8px;">
            <div style="background:var(--cream); border-radius:8px; padding:10px;">
              <div style="font-size:0.75rem; color:var(--text-muted); margin-bottom:2px;">Date</div>
              <div style="font-size:0.85rem; font-weight:500;">${formatDate(b.date)}</div>
            </div>
            <div style="background:var(--cream); border-radius:8px; padding:10px;">
              <div style="font-size:0.75rem; color:var(--text-muted); margin-bottom:2px;">Time</div>
              <div style="font-size:0.85rem; font-weight:500;">${b.slot.time}</div>
            </div>
            <div style="background:var(--cream); border-radius:8px; padding:10px;">
              <div style="font-size:0.75rem; color:var(--text-muted); margin-bottom:2px;">Devotees</div>
              <div style="font-size:0.85rem; font-weight:500;">${b.devotees} person${b.devotees > 1 ? "s" : ""}</div>
            </div>
            <div style="background:var(--cream); border-radius:8px; padding:10px;">
              <div style="font-size:0.75rem; color:var(--text-muted); margin-bottom:2px;">Booking ID</div>
              <div style="font-size:0.82rem; font-weight:600; color:var(--maroon);">${b.bookingId}</div>
            </div>
          </div>
          <div style="margin-top:1rem; display:flex; gap:8px;">
            <button class="btn btn-primary btn-sm" onclick="viewTicket('${b.bookingId}')">View Ticket</button>
            ${isUpcoming ? `<button class="btn btn-secondary btn-sm" onclick="cancelBooking('${b.bookingId}')">Cancel</button>` : ""}
          </div>
        </div>
      </div>
    `;
  }).join("");
}

// ---- View Ticket ----
window.viewTicket = (bookingId) => {
  const allBookings = JSON.parse(localStorage.getItem("templeBookings") || "[]");
  const booking = allBookings.find(b => b.bookingId === bookingId);
  if (!booking) { showToast("Booking not found.", "error"); return; }
  localStorage.setItem("currentBooking", JSON.stringify(booking));
  window.location.href = "./ticket.html";
};

// ---- Cancel Booking ----
window.cancelBooking = (bookingId) => {
  if (!confirm("Are you sure you want to cancel this booking?")) return;
  const all = JSON.parse(localStorage.getItem("templeBookings") || "[]");
  const updated = all.filter(b => b.bookingId !== bookingId);
  localStorage.setItem("templeBookings", JSON.stringify(updated));
  showToast("Booking cancelled.", "info");
  setTimeout(() => location.reload(), 800);
};

// ---- Logout ----
document.getElementById("logoutBtn")?.addEventListener("click", async () => {
  try {
    await signOut(auth);
    showToast("Logged out successfully.", "info");
    setTimeout(() => window.location.href = "../login.html", 700);
  } catch (err) {
    showToast("Error logging out. Please try again.", "error");
  }
});
