export const tg = window.Telegram?.WebApp || null;
export const inTelegram = !!(tg && tg.initData);

export function initTg() {
  if (!tg) return;
  tg.ready();
  tg.expand();
  const p = tg.themeParams || {};
  if (p.bg_color) document.documentElement.style.background = p.bg_color;
  if (p.text_color) document.body.style.color = p.text_color;
}
