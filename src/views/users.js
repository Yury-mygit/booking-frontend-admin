import { api } from "../api.js";
import { t } from "../i18n.js";
import { escapeHtml } from "../util.js";

export async function renderUsers() {
  const app = document.getElementById("app");
  app.innerHTML = `<h1>${t("users.title")}</h1>
    <div class="filter-row">
      <div>
        <label>${t("users.filter.role")}</label>
        <select id="f-role">
          <option value="">${t("users.filter.role_any")}</option>
          <option value="client">client</option>
          <option value="partner">partner</option>
          <option value="admin">admin</option>
        </select>
      </div>
      <div>
        <label>${t("users.filter.verified")}</label>
        <select id="f-verified">
          <option value="">${t("users.filter.verified_any")}</option>
          <option value="true">${t("users.filter.verified_yes")}</option>
          <option value="false">${t("users.filter.verified_no")}</option>
        </select>
      </div>
    </div>
    <div id="list">${t("app.loading")}</div>
    <div id="modal-mount"></div>`;

  document.getElementById("f-role").onchange = load;
  document.getElementById("f-verified").onchange = load;
  load();
}

async function load() {
  const role = document.getElementById("f-role").value;
  const verified = document.getElementById("f-verified").value;
  const list = document.getElementById("list");
  list.innerHTML = t("app.loading");
  try {
    const users = await api.listUsers({ role, verified });
    if (!users.length) {
      list.innerHTML = `<p class="muted">${t("users.empty")}</p>`;
      return;
    }
    list.innerHTML = users
      .map(
        (u) => `
        <div class="card">
          <div><b>${escapeHtml(u.first_name || "—")}</b>
            <span class="status-pill ${u.role}">${u.role}</span>
            ${u.is_verified_partner ? `<span class="status-pill verified">verified</span>` : ""}
          </div>
          <div class="meta">${t("users.tg", { tg: u.telegram_id })} · uid=${u.id}</div>
          <div class="meta">${t("users.created", { dt: u.created_at.slice(0, 10) })}</div>
          <div class="row-actions">
            ${u.role === "partner" ? `<button class="secondary" data-verify="${u.id}">${t("users.btn_verify")}</button>` : ""}
            ${u.role !== "admin" ? `<button class="secondary" data-promote="${u.id}">${t("users.btn_promote")}</button>` : ""}
          </div>
        </div>`,
      )
      .join("");
    list.querySelectorAll("[data-verify]").forEach((b) => {
      b.onclick = () => openVerify(b.dataset.verify);
    });
    list.querySelectorAll("[data-promote]").forEach((b) => {
      b.onclick = async () => {
        try {
          await api.promoteAdmin(b.dataset.promote);
          load();
        } catch (e) { alert(e.message); }
      };
    });
  } catch (e) {
    list.innerHTML = `<div class="error">${t("app.error", { msg: e.message })}</div>`;
  }
}

function openVerify(userId) {
  const mount = document.getElementById("modal-mount");
  mount.innerHTML = `
    <div class="modal-bg">
      <div class="modal">
        <h2>${t("verify.title")}</h2>
        <div class="form-row"><label>${t("verify.company")}</label><input id="v-c" /></div>
        <div class="form-row"><label>${t("verify.inn")}</label><input id="v-i" /></div>
        <div style="display:flex;gap:8px;margin-top:12px">
          <button class="secondary" id="v-cancel">${t("app.cancel")}</button>
          <button class="primary" id="v-ok">${t("app.save")}</button>
        </div>
        <div id="v-err" class="error"></div>
      </div>
    </div>`;
  document.getElementById("v-cancel").onclick = () => (mount.innerHTML = "");
  document.getElementById("v-ok").onclick = async () => {
    const c = document.getElementById("v-c").value.trim();
    const i = document.getElementById("v-i").value.trim();
    if (!c) {
      document.getElementById("v-err").textContent = t("verify.company");
      return;
    }
    try {
      await api.verifyPartner(userId, c, i || null);
      mount.innerHTML = "";
      load();
    } catch (e) {
      document.getElementById("v-err").textContent = t("app.error", { msg: e.message });
    }
  };
}
