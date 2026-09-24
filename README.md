# KRDrama

Стриминг коротких ИИ-сериалов: веб-приложение (React + Vite) и iOS-приложение (Capacitor).

| Слой | Технология |
|---|---|
| Бэкенд, БД, авторизация, файлы | Supabase (Postgres + RLS, Auth, Storage, Edge Functions) |
| Подписки (In-App Purchase) | RevenueCat → StoreKit |
| Реклама за монеты | AdMob Rewarded + серверная проверка (SSV) |
| iOS-оболочка | Capacitor 8 (Swift Package Manager, без CocoaPods) |
| Сборка iOS без Mac | Codemagic → TestFlight |

## Как устроена безопасность

- Клиент **только читает** свои данные. Монеты, разблокировки и VIP меняются только в SQL-функциях (`unlock_episode`, `award_ad_coins`) или в edge-функциях с сервисным ключом.
- Ссылки на видео хранятся в таблице `episode_media`, которую читают только админы. Зритель получает временную ссылку из `episode-stream` и только если имеет право: бесплатная серия, VIP или открыта за монеты.
- VIP нельзя подделать: `revenuecat-webhook` и `sync-subscription` сами запрашивают статус у RevenueCat по секретному ключу.
- Монеты за рекламу начисляет только `admob-ssv` после проверки подписи Google. Повтор одного и того же колбэка ничего не даёт, лимит — 20 роликов в сутки.
- Гости — это анонимные пользователи Supabase: их кошелёк хранится на сервере. При регистрации аккаунт «превращается» в обычный, и монеты, покупки и список сохраняются.

## Локальный запуск

```bash
npm install
cp .env.example .env.local   # заполнить VITE_SUPABASE_URL и VITE_SUPABASE_ANON_KEY
npm run dev
```

## Первичная настройка

### 1. Supabase

1. Создать проект на supabase.com.
2. Связать и накатить схему:
   ```bash
   npx supabase login
   npx supabase link --project-ref <project-ref>
   npx supabase db push
   ```
3. Настройки авторизации в `supabase/config.toml` (анонимный вход, ручная привязка аккаунтов, коды в письмах). Перед применением поменять `site_url` на адрес сайта, потом:
   ```bash
   npx supabase config push
   ```
   Или вручную в Dashboard → Authentication: включить **Anonymous sign-ins** и **Manual linking**, в Email Templates вставить `{{ .Token }}` (шаблоны лежат в `supabase/templates`), в Redirect URLs добавить `krdrama://auth-callback` и `https://<сайт>/auth/callback`.
4. Провайдеры: **Apple** (Client IDs = `com.krdrama.app`), **Google** (OAuth-клиент типа Web из Google Cloud).
5. Для рассылки писем подключить свой SMTP (Resend, Postmark и т.п.). Встроенный отправляет всего несколько писем в час.
6. Секреты edge-функций и деплой:
   ```bash
   npx supabase secrets set \
     REVENUECAT_SECRET_KEY=sk_... \
     REVENUECAT_WEBHOOK_AUTH=<случайная строка> \
     REVENUECAT_ENTITLEMENT_ID=vip \
     ADMOB_REWARDED_AD_UNIT_IDS=ca-app-pub-xxx/yyy \
     APPLE_TEAM_ID=XXXXXXXXXX \
     APPLE_KEY_ID=XXXXXXXXXX \
     APPLE_CLIENT_ID=com.krdrama.app \
     APPLE_PRIVATE_KEY="$(cat AuthKey_XXXXXXXXXX.p8)"
   npx supabase functions deploy
   ```
   `APPLE_*` — ключ с включённым Sign in with Apple (Apple Developer → Keys); нужен для отзыва токенов при удалении аккаунта.
7. Назначить себя админом (SQL Editor):
   ```sql
   update profiles set role = 'admin' where id = (select id from auth.users where email = 'you@example.com');
   ```

### 2. App Store Connect и RevenueCat

1. Apple Developer → Identifiers: App ID `com.krdrama.app` с возможностями **Sign in with Apple** и **In-App Purchase**.
2. App Store Connect: создать приложение, группу подписок, продукты (неделя, месяц, год). Заполнить Paid Apps Agreement и банковские данные, иначе покупки не заработают.
3. RevenueCat: проект → приложение App Store (bundle id, In-App Purchase Key из App Store Connect) → entitlement `vip` → продукты → offering `default` с пакетами Weekly, Monthly, Annual.
4. RevenueCat → Integrations → Webhooks: URL `https://<project>.supabase.co/functions/v1/revenuecat-webhook`, Authorization header `Bearer <REVENUECAT_WEBHOOK_AUTH>`.
5. Публичный ключ `appl_...` вписать в `VITE_REVENUECAT_IOS_KEY`.

### 3. AdMob

1. Создать iOS-приложение и Rewarded-блок.
2. В настройках блока → Server-side verification: URL `https://<project>.supabase.co/functions/v1/admob-ssv`.
3. App ID (`ca-app-pub-...~...`) → переменная `ADMOB_APP_ID_IOS` в Codemagic; ID блока → `VITE_ADMOB_REWARDED_IOS`.
4. Настроить сообщение GDPR (Privacy & messaging), чтобы в ЕС показывалось окно согласия.
5. При разработке оставить `VITE_ADMOB_TESTING=true` и тестировать на своём блоке: на демо-блоке Google колбэк SSV к нам не придёт, и монеты не начислятся.

### 4. Сборка iOS в Codemagic

1. Залить репозиторий на GitHub и подключить его в codemagic.io.
2. Team → Integrations → App Store Connect: добавить API-ключ (App Store Connect → Users and Access → Keys) с именем `KRDrama ASC key`.
3. Code signing: Codemagic сам создаст сертификат и профиль для `com.krdrama.app`.
4. Environment variables → группа `krdrama_production`: все `VITE_*` из `.env.example` (с `VITE_ADMOB_TESTING=false`) и `ADMOB_APP_ID_IOS`.
5. В `codemagic.yaml` вписать `APP_STORE_APPLE_ID`.
6. Запуск: `git tag v1.0.0 && git push --tags` или вручную из интерфейса. Готовая сборка уходит в TestFlight.

## Работа с iOS-проектом

```bash
npm run cap:sync   # сборка с .env.native + копирование в ios/
npm run assets     # пересоздать иконку и сплэш из assets/
```

Папка `ios/` в репозитории. Info.plist, `App.entitlements` и `PrivacyInfo.xcprivacy` правятся руками.

## Видео

- **MP4 в Supabase Storage** (бакет `videos`, загрузка из админки). Отдаётся по подписанной ссылке на 3 часа. Бесплатный план ограничивает файл 50 МБ.
- **HLS / большие объёмы**: Mux, Bunny Stream или Cloudflare Stream. В поле видео у серии вставляется https-ссылка. Её видят только те, кому серия открыта. Для полной защиты используйте подписанные ссылки CDN.

## Перед отправкой в App Review

- [ ] Работающие Privacy Policy и Terms (`VITE_PRIVACY_URL`, `VITE_TERMS_URL`), те же ссылки — в App Store Connect.
- [ ] App Privacy: email, имя, User ID, история покупок; реклама — Identifiers/Usage Data для рекламы (AdMob).
- [ ] Демо-аккаунт для ревьюера в App Review Information.
- [ ] Возрастной рейтинг и в описании пометка, что сериалы сгенерированы ИИ.
- [ ] Протестировать покупку в Sandbox/TestFlight, восстановление покупок, удаление аккаунта.
