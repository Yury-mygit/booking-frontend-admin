import { api } from "../api.js";
import { t } from "../i18n.js";

export async function renderMetrics() {
  const app = document.getElementById("app");
  app.innerHTML = `<h1>${t("metrics.title")}</h1><div id="m">${t("app.loading")}</div>`;
  try {
    const m = await api.metrics();
    const cell = (k, v) => `<div class="metric"><div class="v">${v}</div><div class="k">${t(k)}</div></div>`;
    document.getElementById("m").innerHTML = `
      <div class="metric-grid">
        ${cell("metrics.users_total", m.users_total)}
        ${cell("metrics.verified_partners", m.verified_partners)}
        ${cell("metrics.hotels_total", m.hotels_total)}
        ${cell("metrics.rooms_total", m.rooms_total)}
        ${cell("metrics.bookings_total", m.bookings_total)}
        ${cell("metrics.revenue_paid", m.revenue_kgs_paid)}
      </div>
      <h2>${t("metrics.by_role")}</h2>
      <div>${Object.entries(m.users_by_role).map(([k, v]) => `<span class="status-pill ${k}">${k}: ${v}</span>`).join(" ")}</div>
      <h2>${t("metrics.by_hotel_status")}</h2>
      <div>${Object.entries(m.hotels_by_status).map(([k, v]) => `<span class="status-pill ${k}">${k}: ${v}</span>`).join(" ")}</div>
      <h2>${t("metrics.by_booking_status")}</h2>
      <div>${Object.entries(m.bookings_by_status).map(([k, v]) => `<span class="status-pill ${k}">${k}: ${v}</span>`).join(" ")}</div>
    `;
  } catch (e) {
    document.getElementById("m").innerHTML = `<div class="error">${t("app.error", { msg: e.message })}</div>`;
  }
}
