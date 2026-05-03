// =============================================
// ticket.js — QR Ticket Display & Download
// =============================================

import { requireAuth, formatDate } from "./auth-check.js";

requireAuth(() => {
  const booking = JSON.parse(localStorage.getItem("currentBooking"));

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

  renderTicket(booking);
  generateQR(booking);
});

function renderTicket(b) {
  document.getElementById("ticketTempleName").textContent = b.templeName;
  document.getElementById("ticketTempleLocation").textContent = b.templeLocation;
  document.getElementById("ticketEmoji").textContent = b.templeEmoji;
  document.getElementById("ticketBookingId").textContent = b.bookingId;
  document.getElementById("ticketDate").textContent = formatDate(b.date);
  document.getElementById("ticketTime").textContent = `${b.slot.time} — ${b.slot.label}`;
  document.getElementById("ticketDevotees").textContent = b.devotees;
  document.getElementById("ticketName").textContent = b.userName;
  document.getElementById("ticketEmail").textContent = b.userEmail;
  document.getElementById("ticketDeity").textContent = b.deity;
  document.getElementById("ticketBookedAt").textContent = new Date(b.bookedAt).toLocaleString("en-IN");
}

function generateQR(b) {
  const qrData = [
    `BOOKING:${b.bookingId}`,
    `TEMPLE:${b.templeName}`,
    `DATE:${b.date}`,
    `TIME:${b.slot.time}`,
    `DEVOTEES:${b.devotees}`,
    `USER:${b.userEmail}`
  ].join("|");

  // Use qrcode.js library loaded via CDN in HTML
  const qrContainer = document.getElementById("qrCode");
  if (typeof QRCode === "undefined") {
    qrContainer.innerHTML = `<div style="font-size:0.8rem; color:var(--text-muted); padding:1rem; text-align:center;">QR code requires internet connection</div>`;
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
}

// ---- Download Ticket as PNG ----
document.getElementById("downloadBtn")?.addEventListener("click", () => {
  const ticket = document.getElementById("ticketCard");

  // Use html2canvas if available (loaded via CDN)
  if (typeof html2canvas === "undefined") {
    alert("Download requires internet connection. Please try again.");
    return;
  }

  html2canvas(ticket, {
    backgroundColor: "#FFFFFF",
    scale: 2,
    useCORS: true
  }).then(canvas => {
    const link = document.createElement("a");
    const booking = JSON.parse(localStorage.getItem("currentBooking"));
    link.download = `Temple-Darshan-Ticket-${booking?.bookingId || "ticket"}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  });
});

// ---- Share ticket ----
document.getElementById("shareBtn")?.addEventListener("click", async () => {
  const booking = JSON.parse(localStorage.getItem("currentBooking"));
  const text = `🙏 I have a Darshan booking at ${booking?.templeName}!\nDate: ${formatDate(booking?.date)}\nTime: ${booking?.slot?.time}\nBooking ID: ${booking?.bookingId}`;

  if (navigator.share) {
    try {
      await navigator.share({ title: "Temple Darshan Ticket", text });
    } catch (_) {}
  } else {
    navigator.clipboard.writeText(text).then(() => {
      alert("Ticket details copied to clipboard!");
    });
  }
});
