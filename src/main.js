import { api } from "./api.js";
import { applyStaticI18n, setLang } from "./i18n.js";
import { route, run } from "./router.js";
import { initTg, inTelegram, tg } from "./tg.js";
import { renderDevLogin } from "./views/auth.js";
import { renderBookings } from "./views/bookings.js";
import { renderHotels } from "./views/hotels.js";
import { renderMetrics } from "./views/metrics.js";
import { renderUsers } from "./views/users.js";

initTg();
applyStaticI18n();

document.querySelectorAll("#lang-switch button").forEach((b) => {
  b.onclick = () => setLang(b.dataset.lang);
});
window.addEventListener("langchange", () => {
  applyStaticI18n();
  run();
});

route("/", renderMetrics);
route("/metrics", renderMetrics);
route("/users", renderUsers);
route("/hotels", renderHotels);
route("/bookings", renderBookings);

async function bootstrap() {
  if (api.hasToken()) { run(); return; }
  if (inTelegram) {
    try {
      const r = await api.authTg(tg.initData);
      api.setSession(r.token, r.user);
      run();
    } catch (e) {
      document.getElementById("app").innerHTML =
        `<div class="error">Auth failed: ${e.message}</div>`;
    }
  } else {
    renderDevLogin(() => {
      if (!location.hash) location.hash = "#/metrics";
      run();
    });
  }
}

bootstrap();
