import { api } from "./api.js";
import { applyStaticI18n, cycleLang } from "./i18n.js";
import { route, run } from "./router.js";
import { applyTheme, watchTheme } from "./theme.js";
import { initTg, inTelegram, tg } from "./tg.js";
import { renderDevLogin } from "./views/auth.js";
import { renderBookings } from "./views/bookings.js";
import { renderHotels } from "./views/hotels.js";
import { renderMetrics } from "./views/metrics.js";
import { renderUsers } from "./views/users.js";

initTg();
applyTheme();
watchTheme();
applyStaticI18n();

document.getElementById("lang-cycle").onclick = cycleLang;
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
  // TG Desktop выкидывает cross-domain navigation из hub в системный браузер,
  // и initData на admin-домене не приходит. Hub в этом случае кладёт session
  // token в URL fragment (#auth=<t>) — поднимаем сессию через /auth/whoami.
  const authMatch = location.hash.match(/(?:^#|&)auth=([^&]+)/);
  if (authMatch) {
    api.adoptToken(decodeURIComponent(authMatch[1]));
    history.replaceState(null, "", location.pathname + location.search);
    try {
      const w = await api.whoami();
      const user = {
        id: w.user_id,
        telegram_id: w.telegram_id,
        role: w.role,
        lang: w.lang,
        first_name: w.first_name,
        is_superadmin: w.is_superadmin,
      };
      api.setSession(api.authToken(), user);
    } catch {
      api.clearSession();
    }
  }
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
