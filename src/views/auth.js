import { api } from "../api.js";
import { t } from "../i18n.js";

export function renderDevLogin(onLoggedIn) {
  const app = document.getElementById("app");
  app.innerHTML = `
    <h1>${t("auth.dev_title")}</h1>
    <div class="form-row"><label>${t("auth.tg_id")}</label>
      <input id="dev-tg" type="number" value="777001" /></div>
    <div class="form-row"><label>${t("auth.first_name")}</label>
      <input id="dev-name" value="DevAdmin" /></div>
    <button class="primary full" id="dev-go">${t("auth.login")}</button>
    <div id="dev-err" class="error"></div>
    <p class="muted" style="margin-top:14px">${t("auth.hint")}</p>
  `;
  document.getElementById("dev-go").onclick = async () => {
    try {
      const r = await api.authDev(
        Number(document.getElementById("dev-tg").value),
        document.getElementById("dev-name").value || "DevAdmin",
      );
      api.setSession(r.token, r.user);
      onLoggedIn();
    } catch (e) {
      document.getElementById("dev-err").textContent = t("app.error", { msg: e.message });
    }
  };
}
