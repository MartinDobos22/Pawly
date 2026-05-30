# Notifikačný cron — nastavenie a troubleshooting

Tento dokument popisuje, ako je zapojený denný notifikačný sweep a ako ho
správne nakonfigurovať, keď padá (typicky `503 Service Unavailable` z
cron-job.org).

## Čo endpoint robí

`POST /api/cron/notifications` spustí `runSweep()`
(`server/src/services/notificationsService.ts`):

1. Načíta zvieratá a používateľov zo Supabase.
2. Prejde nadchádzajúce vakcinácie / odčervenia / ektoparazity / kontroly /
   lieky a porovná ich s `leadDays` (default `[30, 7, 1]` dní vopred).
3. Deduplikuje voči `notification_log` (neposiela tú istú pripomienku dvakrát).
4. Pošle e-mail cez **Resend** a zapíše odoslané do `notification_log`.

Endpoint nepoužíva Firebase auth — je registrovaný v `server/src/index.ts`
**pred** `firebaseAuth` a autentifikuje sa shared secretom cez hlavičku
`x-cron-secret` (`server/src/routes/cron.ts`, timing-safe porovnanie voči
`CRON_SECRET`).

> Bez `RESEND_API_KEY` beží sweep v **dry-run** režime — prejde celou logikou,
> ale e-maily reálne neodošle (vhodné na test).

## Povinný config na Render

Všetky premenné sú už deklarované v `render.yaml` (`sync: false` → hodnotu
nastav v Render dashboarde → **Environment**):

| Premenná            | Účel                                                                                                         |
| ------------------- | ------------------------------------------------------------------------------------------------------------ |
| `CRON_SECRET`       | Tajný token; musí sa zhodovať s hlavičkou `x-cron-secret`. **Bez neho endpoint vracia 503 `CRON_DISABLED`.** |
| `RESEND_API_KEY`    | Kľúč na odosielanie e-mailov. Bez neho dry-run.                                                              |
| `NOTIFY_FROM_EMAIL` | Odosielateľ, napr. `Pawport <noreply@tvojadomena.sk>` (overená doména v Resend).                             |
| `APP_URL`           | Plná URL appky (bez koncového `/`) pre odkazy v e-mailoch.                                                   |

## Nastavenie cron-job.org

| Položka             | Hodnota                                                      |
| ------------------- | ------------------------------------------------------------ |
| **Metóda**          | `POST` (nie GET — GET by dal 401)                            |
| **URL**             | `https://animalpassport.onrender.com/api/cron/notifications` |
| **Custom header**   | `x-cron-secret: <rovnaká hodnota ako CRON_SECRET na Render>` |
| **Schedule**        | napr. denne 06:00                                            |
| **Request timeout** | nastav na maximum (free plan = 30 s)                         |
| **Retry / success** | zapni retry; ako úspech ber len `2xx`                        |

## Cold start na Render free tier

`render.yaml` má `plan: free`. **Free inštancia po ~15 minútach nečinnosti
zaspí.** Keď ju cron o 06:00 budí, Render vracia `503` počas studeného štartu
(spustenie trvá ~30–60 s, čo môže prekročiť 30 s timeout cron-job.org).

Príznak v maile od cron-job.org: veľký odstup medzi `scheduled` a `attempt`
(napr. `06:00:00` → `06:00:28`) = čas studeného štartu, nie okamžité zlyhanie.

### Odporúčané riešenia (vyber jedno)

1. **Warm-up ping (najjednoduchšie):** pridaj druhý cron-job.org job, ktorý
   ~2–3 minúty pred 06:00 spraví `GET /api/health` (verejný endpoint bez auth,
   `server/src/index.ts`). Inštancia sa zobudí a hlavný call o 06:00 trafí už
   bežiaci server.
2. **Keep-alive:** externý monitor (napr. UptimeRobot) pinguje `/api/health`
   každých ~10 min, takže inštancia nikdy nezaspí.
3. **Platený Render plán:** inštancia nezaspáva (žiadny cold start).

## Troubleshooting

| Symptóm                                                        | Príčina                                                  | Riešenie                                      |
| -------------------------------------------------------------- | -------------------------------------------------------- | --------------------------------------------- |
| `503` s telom `{"code":"CRON_DISABLED"}`, **okamžite**         | `CRON_SECRET` nie je nastavený na Render                 | Doplň `CRON_SECRET` v Render → Environment    |
| `503` bez tela / až po ~30 s, veľký `scheduled→attempt` odstup | Render free-tier cold start                              | Pridaj warm-up ping / keep-alive (viď vyššie) |
| `401` `{"code":"UNAUTHORIZED"}`                                | Chýbajúca/zlá hlavička `x-cron-secret`, alebo metóda GET | Skontroluj POST + správnu hodnotu hlavičky    |
| `429` `{"code":"RATE_LIMITED"}`                                | Prekročený rate limit (120 req/min na `/api/`)           | Zníž frekvenciu cronu                         |

## Ručné overenie

Na zobudenej inštancii:

```bash
curl -i -X POST https://animalpassport.onrender.com/api/cron/notifications \
  -H "x-cron-secret: <CRON_SECRET>"
```

Očakávané: `200` + JSON summary z `runSweep`. V Render logoch sa objaví
`Cron: spúšťam notifikačný sweep`.
