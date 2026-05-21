const BASE = "/api/v1";

let _token = localStorage.getItem("booking_token") || "";
let _user = JSON.parse(localStorage.getItem("booking_user") || "null");

async function call(method, path, body) {
  const headers = { "Content-Type": "application/json" };
  if (_token) headers.Authorization = `Bearer ${_token}`;
  const opts = { method, headers };
  if (body !== undefined) opts.body = JSON.stringify(body);
  const r = await fetch(BASE + path, opts);
  if (r.status === 204) return null;
  const data = await r.json();
  if (!r.ok) {
    const err = new Error(data.message || r.statusText);
    err.code = data.error || "http_error";
    err.status = r.status;
    throw err;
  }
  return data;
}

export const api = {
  hasToken: () => !!_token,
  user: () => _user,
  setSession(token, user) {
    _token = token;
    _user = user;
    localStorage.setItem("booking_token", token);
    localStorage.setItem("booking_user", JSON.stringify(user));
  },
  clearSession() {
    _token = "";
    _user = null;
    localStorage.removeItem("booking_token");
    localStorage.removeItem("booking_user");
  },

  authTg: (initData) => call("POST", "/auth/tg", { init_data: initData, requested_role: "admin" }),
  authDev(tgId, name) {
    const qs = new URLSearchParams({
      telegram_id: String(tgId),
      first_name: name,
      role: "admin",
    });
    return call("POST", `/auth/dev-login?${qs}`);
  },

  metrics: () => call("GET", "/admin/metrics"),

  listUsers(filters = {}) {
    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries(filters)) {
      if (v !== "" && v != null) qs.set(k, v);
    }
    return call("GET", `/admin/users${qs.toString() ? "?" + qs : ""}`);
  },
  verifyPartner(userId, companyName, legalInn) {
    const qs = new URLSearchParams({ company_name: companyName });
    if (legalInn) qs.set("legal_inn", legalInn);
    return call("POST", `/admin/users/${userId}/verify-partner?${qs}`);
  },
  promoteAdmin: (userId) => call("POST", `/admin/users/${userId}/promote-admin`),
  revokePartner: (userId) => call("POST", `/admin/users/${userId}/revoke-partner`),
  demoteAdmin: (userId) => call("POST", `/admin/users/${userId}/demote-admin`),

  listHotels(status) {
    return call("GET", `/admin/hotels${status ? "?status=" + status : ""}`);
  },
  setHotelStatus: (hotelId, status) =>
    call("PUT", `/admin/hotels/${hotelId}/status`, { status }),

  listBookings(filters = {}) {
    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries(filters)) {
      if (v !== "" && v != null) qs.set(k, v);
    }
    return call("GET", `/admin/bookings${qs.toString() ? "?" + qs : ""}`);
  },
  cancelBooking: (code) => call("POST", `/admin/bookings/${code}/cancel`),
};
