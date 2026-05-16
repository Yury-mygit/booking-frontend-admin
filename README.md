# booking-frontend-admin

Telegram WebApp админ-фронт.

## Стек
- vite 5 + ванильный JS на :5190
- i18n ru/ky/en
- TG WebApp; вне Telegram — dev-форма (role=admin, требует пред-назначенного admin-юзера в БД)

## Локально
```bash
docker compose up -d --build
# http://localhost:5190/
```

## Views
- `/` → `/metrics` — dashboard с counts и распределениями
- `/users` — список с фильтрами role+verified, кнопки verify (модал с company/inn) и promote-admin
- `/hotels` — все отели с фильтром status, кнопки смены статуса
- `/bookings` — все брони с фильтром status, кнопка cancel (только pending/paid)

Использует `/admin/*` endpoints, требует session с `role=admin`.
