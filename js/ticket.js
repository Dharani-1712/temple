// =============================================
// ticket.js — Ticket Display with Payment States
// pre-booked  → TEMPORARY ticket (blurred QR)
// confirmed   → VALID ticket (clear QR)
// cancelled   → CANCELLED banner
// =============================================

import { requireAuth, formatDate } from "./auth-check.js";

requireAuth(() => {
  let booking = JSON.parse(localStorage.getItem("currentBooking"));

  if (!booking) {
    document.getElementById("ticketContainer").innerHTML = `
      <div style="text-align:center; padding: 3rem 1rem;">
        <div style="font-size: 3rem; margin-bottom: 1rem;">🙏</div>
        <h2>No Booking Found</h2>
        <p class="mt-2">Please make a booking first.</p>
        <a href="./booking.html" class="btn btn-primary mt-3" style="display:inline-flex;">Book a Darshan</a>
      </div>
    `;
    return;
  }

  // ── Auto-cancel check ──────────────────────────────────────────
  // If pre-booked AND visit date has passed → auto-cancel
  if (booking.paymentStatus === "pre-booked") {
    const today     = new Date(); today.setHours(0,0,0,0);
    const visitDate = new Date(booking.date); visitDate.setHours(0,0,0,0);

    if (visitDate < today) {
      booking.paymentStatus = "cancelled";
      booking.status        = "cancelled";

      // Update in localStorage
      const all = JSON.parse(localStorage.getItem("templeBookings") || "[]");
      const idx = all.findIndex(b => b.bookingId === booking.bookingId);
      if (idx !== -1) all[idx] = booking;
      localStorage.setItem("templeBookings", JSON.stringify(all));
      localStorage.setItem("currentBooking", JSON.stringify(booking));
    }
  }

  // Expose booking to the inline script for full-pay modal
  if (typeof window.initFullPayModal === "function") {
    window.initFullPayModal(booking);
  }

  renderTicket(booking);
  renderStatusUI(booking);
});

// ── Render ticket fields ───────────────────────────────────────
function renderTicket(b) {
  document.getElementById("ticketTempleName").textContent    = b.templeName;
  document.getElementById("ticketTempleLocation").textContent = b.templeLocation;
  document.getElementById("ticketEmoji").textContent         = b.templeEmoji;
  document.getElementById("ticketBookingId").textContent     = b.bookingId;
  document.getElementById("ticketDate").textContent          = formatDate(b.date);
  document.getElementById("ticketTime").textContent          = `${b.slot.time} — ${b.slot.label}`;
  document.getElementById("ticketDevotees").textContent      = b.devotees;
  document.getElementById("ticketName").textContent          = b.userName;
  document.getElementById("ticketEmail").textContent         = b.userEmail;
  document.getElementById("ticketDeity").textContent         = b.deity;
  document.getElementById("ticketBookedAt").textContent      = new Date(b.bookedAt).toLocaleString("en-IN");
}

// ── Render status-specific UI ──────────────────────────────────
function renderStatusUI(b) {
  const status      = b.paymentStatus || b.status || "confirmed";
  const isTemp      = status === "pre-booked";
  const isCancelled = status === "cancelled";
  const isConfirmed = status === "confirmed";

  const statusEl = document.getElementById("statusBadge");

  if (isConfirmed) {
    // ✅ VALID TICKET
    document.getElementById("heroTitle").textContent    = "🎟️ Darshan Ticket";
    document.getElementById("heroSubtitle").textContent = "Present this QR code at the temple entrance";

    statusEl.innerHTML = `
      <div class="status-badge status-confirmed">
        <div class="status-dot dot-green"></div>
        Booking Confirmed — Ticket Active
      </div>`;

    document.getElementById("ticketPayInfo").textContent =
      `Paid ₹${b.paidAmount || b.fullAmountDue || ""} — Fully Paid`;

    generateQR(b, false);
    document.getElementById("qrCaption").textContent = "Scan QR at the temple entrance";

  } else if (isTemp) {
    // ⏳ TEMPORARY TICKET
    document.getElementById("heroTitle").textContent    = "⏳ Temporary Ticket";
    document.getElementById("heroSubtitle").textContent = "Pay full amount to activate your ticket";

    statusEl.innerHTML = `
      <div class="status-badge status-pending">
        <div class="status-dot dot-orange"></div>
        Pre-Booked — Full Payment Pending
      </div>`;

    const visitStr = new Date(b.date).toLocaleDateString("en-IN", {day:"numeric", month:"short", year:"numeric"});
    document.getElementById("ticketPayInfo").textContent =
      `₹1 pre-booking paid · Full ₹${b.fullAmountDue} due by ${visitStr}`;

    generateQR(b, true); // blurred
    document.getElementById("qrCaption").textContent = "🔒 QR locked — pay full amount to unlock";
    document.getElementById("tempWatermark").style.display = "flex";

    // Show pay full banner
    const banner = document.getElementById("payFullBanner");
    banner.style.display = "block";
    document.getElementById("fullAmountBanner").textContent = `₹${b.fullAmountDue}`;

  } else if (isCancelled) {
    // ❌ CANCELLED
    document.getElementById("heroTitle").textContent    = "❌ Booking Cancelled";
    document.getElementById("heroSubtitle").textContent = "Full payment was not made before visit date";

    statusEl.innerHTML = `
      <div class="status-badge status-cancelled">
        <div class="status-dot dot-red"></div>
        Auto-Cancelled
      </div>`;

    document.getElementById("ticketPayInfo").textContent = "Cancelled — full payment not made";
    generateQR(b, true); // blurred
    document.getElementById("qrCaption").textContent = "❌ This ticket is no longer valid";
    document.getElementById("tempWatermark").style.display = "flex";
    document.getElementById("tempWatermark").querySelector("span").textContent = "CANCELLED";
    document.getElementById("cancelledBanner").style.display = "block";
    document.getElementById("ticketActions").style.display = "none";
  }
}

// ── Generate QR ────────────────────────────────────────────────
function generateQR(b, blurred = false) {
  const qrData = [
    `BOOKING:${b.bookingId}`,
    `TEMPLE:${b.templeName}`,
    `DATE:${b.date}`,
    `TIME:${b.slot.time}`,
    `DEVOTEES:${b.devotees}`,
    `USER:${b.userEmail}`,
    `STATUS:${b.paymentStatus || "confirmed"}`
  ].join("|");

  const qrContainer = document.getElementById("qrCode");
  if (typeof QRCode === "undefined") {
    qrContainer.innerHTML = `<div style="font-size:0.8rem;color:var(--text-muted);padding:1rem;">QR code requires internet</div>`;
    return;
  }

  new QRCode(qrContainer, {
    text: qrData,
    width: 180,
    height: 180,
    colorDark: "#2C1A0E",
    colorLight: "#FFFFFF",
    correctLevel: QRCode.CorrectLevel.H
  });

  if (blurred) {
    setTimeout(() => {
      const canvas = qrContainer.querySelector("canvas");
      const img    = qrContainer.querySelector("img");
      if (canvas) canvas.classList.add("qr-blurred");
      if (img)    img.classList.add("qr-blurred");
    }, 100);
  }
}

// ── Download ────────────────────────────────────────────────────
document.getElementById("downloadBtn")?.addEventListener("click", () => {
  const ticket = document.getElementById("ticketCard");
  if (typeof html2canvas === "undefined") {
    alert("Download requires internet connection.");
    return;
  }
  html2canvas(ticket, { backgroundColor: "#FFFFFF", scale: 2, useCORS: true }).then(canvas => {
    const link     = document.createElement("a");
    const booking  = JSON.parse(localStorage.getItem("currentBooking"));
    link.download  = `Temple-Darshan-Ticket-${booking?.bookingId || "ticket"}.png`;
    link.href      = canvas.toDataURL("image/png");
    link.click();
  });
});

// ── Share ───────────────────────────────────────────────────────
document.getElementById("shareBtn")?.addEventListener("click", async () => {
  const booking = JSON.parse(localStorage.getItem("currentBooking"));
  const status  = booking?.paymentStatus === "confirmed" ? "✅ Confirmed" : "⏳ Pre-Booked";
  const text    = `🙏 Temple Darshan Booking\nTemple: ${booking?.templeName}\nDate: ${formatDate(booking?.date)}\nTime: ${booking?.slot?.time}\nStatus: ${status}\nBooking ID: ${booking?.bookingId}`;

  if (navigator.share) {
    try { await navigator.share({ title: "Temple Darshan Ticket", text }); } catch (_) {}
  } else {
    navigator.clipboard.writeText(text).then(() => alert("Ticket details copied to clipboard!"));
  }
});
