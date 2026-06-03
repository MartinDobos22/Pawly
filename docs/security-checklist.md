# Bezpečnostný checklist (operatívny)

Tento dokument je living checklist pre prevádzkovateľa Pawly. Pred produkčným nasadením odškrtni všetko v sekcii „Pred launchom". Sekcie „Pravidelne" rob v uvedenej frekvencii.

---

## Pred launchom (jednorazovo)

### Účty a prístupy

- [ ] **2FA** zapnuté na Google účte, ktorý vlastní Firebase + GCP projekt (TOTP + hardware key ak možné).
- [ ] **2FA** zapnuté na Supabase účte (Account → Security → MFA).
- [ ] **2FA** zapnuté na GitHub účte (passkey alebo TOTP, recovery codes uložené offline).
- [ ] **2FA** zapnuté na Render (alebo inom hosting) účte.
- [ ] **2FA** zapnuté u doménového registrátora (`pawly.sk`).
- [ ] **2FA** zapnuté na e-mailovom účte spojenom s `support@pawly.sk` (najčastejšie prepad cez password reset).
- [ ] Recovery kódy zo všetkých vyššie uvedených uložené offline (papierová kópia v trezore alebo password manager s vlastnou 2FA).

### Supabase dev vs prod

- [ ] Vytvorený samostatný **dev Supabase projekt** (`animalpassport-dev`).
- [ ] Všetky migrácie z `supabase/migrations/` spustené na dev projekte v poradí.
- [ ] Lokálny `server/.env` používa **dev** `SUPABASE_URL` a `SUPABASE_SERVICE_ROLE_KEY`.
- [ ] Produkčný `SUPABASE_SERVICE_ROLE_KEY` nie je nikde okrem Render env premenných.
- [ ] V prod Supabase projekte zapnuté **Point-in-Time Recovery** (Settings → Database → PITR; vyžaduje Pro tier).
- [ ] V prod Supabase projekte overené, že **Storage bucket `health-attachments` je privátny** (nie public).

### Hosting & secrets

- [ ] Render: `OPENAI_API_KEY`, `GOOGLE_VISION_API_KEY`, `SUPABASE_*`, `FIREBASE_*` nastavené v dashboarde, **NIE v repo**.
- [ ] Render: `CORS_ORIGIN` nastavený na produkčný frontend host bez koncového `/`.
- [ ] Render: `NODE_ENV=production`.
- [ ] `.env`, `.env.local` overené v `.gitignore` (`git check-ignore .env`).
- [ ] `git log -p --all | grep -E "(OPENAI|SUPABASE|FIREBASE)_(API|SERVICE|PRIVATE)_KEY"` — žiadne historické leaky.

### Funkčný test ochrany dát

- [ ] Vytvor dvoch testovacích userov A a B. Z A spusti CRUD operácie nad pet/health dátami. Z B over, že **NEVIDÍ** žiadne dáta A.
- [ ] Skús priame curl volania s tokenom B na resource ID patriaci A → musí vrátiť 403/404.
- [ ] V Supabase SQL editori: `SELECT * FROM app.audit_log ORDER BY id DESC LIMIT 10;` → vidíš zápisy pre operácie z testovacích userov.
- [ ] `GET /api/account/export` ako user A → JSON obsahuje len jeho dáta.
- [ ] `DELETE /api/account` ako user A → po refreshi: pets, vaccinations, health_episodes prázdne.

### Legal

- [ ] Privacy Policy publikovaná na `/ochrana-sukromia` a linkovaná z Layout a z RegisterPage.
- [ ] Súhlas v registračnom formulári vyžadovaný (checkbox nezaškrtnutý → submit disabled).
- [ ] Supabase DPA stiahnutý a archivovaný (Account → Legal → DPA).
- [ ] Firebase/Google DPA archivovaný.
- [ ] OpenAI DPA podpísaný (ak hovoríš o produkčnom použití s reálnymi userskými dátami; bez DPA si v sivej zóne).

---

## Pravidelne

### Týždenne

- [ ] Skontroluj `app.audit_log` pre anomálie (vysoký počet `list` operácií, prístupy mimo bežnej hodiny).

### Mesačne

- [ ] Manuálny SQL export produkčnej DB do externého storage (S3, Backblaze) — `pg_dump`.
- [ ] Rotácia `CRON_SHARED_SECRET` (ak je nasadený).
- [ ] `npm audit` na klientovi aj na serveri, fixni high/critical.

### Štvrťročne

- [ ] **Restore drill**: na dev projekte obnov najnovší PITR snapshot, over že dáta sú konzistentné, že login + CRUD funguje.
- [ ] Audit prístupov: ktoré všetky účty majú prístup k Supabase / Firebase / Render? Odstráň nepoužité.
- [ ] Refresh recovery kódov pre 2FA.

### Pri každom deploy

- [ ] Ak sa menili statické aktíva alebo `client/public/sw.js`, **bumpni `CACHE_VERSION`** v `sw.js`.
- [ ] Smoke test po deploy: login, vytvorenie vakcinácie, export, logout.

---

## Postup pri incidente (leak service_role kľúča)

1. Okamžite **rotuj** `SUPABASE_SERVICE_ROLE_KEY` v Supabase Dashboarde (Settings → API → Reset).
2. Updatni nový kľúč v Render env premenných, redeploy.
3. Pozri `app.audit_log` za okno medzi (predpokladaný leak) a (rotácia) — zoznam dotknutých `app_user_id`.
4. Notifikuj dotknutých používateľov (GDPR 72h breach notification).
5. Post-mortem: kde sa kľúč objavil (git history, screenshot, log, .env commit)?

---

## Implementované technické kontroly (referencia)

Pre kontext: čo z bezpečnosti je dnes v kóde.

- **Firebase ID token** verifikácia na všetkých `/api/*` okrem `/api/health`, `/api/cron/*`, `/api/auth/*` (`server/src/middleware/firebaseAuth.ts`).
- **Email verification gate** pre password-provider accounts.
- **`ensureUser` middleware** mapuje Firebase UID na DB user ID (`server/src/middleware/ensureUser.ts`).
- **Row Level Security** zapnuté na všetkých tabuľkách (`supabase/migrations/0006_data_ownership_rls.sql`).
- **SECURITY DEFINER RPC** funkcie s explicitným `assert_pet_owner` (tamtiež).
- **Audit log** zapisuje sa pri každom `list/create/update/delete/export` zdravotných dát (`supabase/migrations/0008_audit_log_and_export.sql`).
- **GDPR export** endpoint `GET /api/account/export`.
- **Account delete** endpoint `DELETE /api/account` (kaskáda cez FK).
- **Privacy guard** stripuje identifikátory pred AI volaniami (`server/src/services/privacyGuard.ts`).
- **OCR sanitizer** chráni pred prompt injection (`server/src/utils/sanitizeOcrText.ts`).
- **Helmet CSP**, **CORS allowlist**, **rate limiting** (global 120/min, AI 20/min) v `server/src/index.ts`.
- **Private storage bucket** + sanitizácia attachments na metadáta-only (`supabase/migrations/0007_health_attachments_storage.sql`).
