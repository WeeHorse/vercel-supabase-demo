# Vercel + Supabase – DevSecOps demo

Undervisningsdemo: Next.js på Vercel, Supabase Auth + PostgreSQL, Row Level Security (RLS), server-side admin route och GitHub Actions CI/CD.

## Arkitektur

- **Browser:** Supabase-klient med publik/publishable nyckel och inloggad användares JWT.
- **Supabase PostgreSQL:** `todos` skyddas av RLS för SELECT/INSERT/UPDATE/DELETE.
- **Next.js API route:** `POST /api/admin/reindex` använder server-only privilegierad nyckel och kräver separat adminhemlighet. Den är **avstängd** om `ADMIN_API_SECRET` saknas eller har färre än 32 tecken. I produktion bör detta ersättas med adminautentisering + rollkontroll (gärna MFA), inte ett delat lösenord.
- **GitHub Actions:** typecheck, automatiska tester, byggen, dependency audit och Vercel deployments.

## Kom igång

```bash
npm ci
cp .env.example .env.local
npm run dev
```

Skapa ett separat Supabase-projekt och kopiera relevanta värden från Supabase Dashboard till `.env.local`. Kör `sql/schema.sql` i SQL Editor för **en ny tom demodatabas**. Vid uppdatering av en befintlig tabell kan `CREATE TABLE IF NOT EXISTS` inte lägga till nya constraints; jämför och migrera schemat separat.

Supabase Auth kräver att användarna kan logga in; e-postbekräftelse och redirect-inställningar kan behöva konfigureras.

## Nycklar

- `NEXT_PUBLIC_SUPABASE_URL` och `NEXT_PUBLIC_SUPABASE_ANON_KEY`: synliga i browsern; använd Supabases publishable key (äldre anon key fungerar också).
- `SUPABASE_URL` och `SUPABASE_SERVICE_ROLE_KEY`: **endast server**, aldrig i `NEXT_PUBLIC_` eller i Git.
- `ADMIN_API_SECRET`: en slumpmässigt genererad hemlighet (minst 32 tecken) för demonstrations-endpointen, lagras server-side. Dela den aldrig i kursmaterial eller loggar.

Administrativa anrop görs med `Authorization: Bearer <ADMIN_API_SECRET>`, aldrig från klientkod. Lämna helst `ADMIN_API_SECRET` tom i publik demo så att routen förblir blockerad. Rotera tidigare hårdkodad adminhemlighet och eventuellt berörda credentials innan offentlig användning.

## Row Level Security

`sql/schema.sql` aktiverar RLS och tillåter bara att `auth.uid() = todos.user_id` för vanlig inloggad användare. `USING` kontrollerar existerande rader, `WITH CHECK` nya/ändrade värden. `audit_jobs` har ingen vanlig användaråtkomst. Observera: PostgreSQL-grants och RLS behövs båda.

### Säkerhetstester (isolera alltid)

```bash
npm test
npm run typecheck
npm run test:rls
```

`npm test` verifierar admin-autentiseringslogiken utan molnuppkoppling.

`npm run test:rls` kontrollerar i **ett separat Supabase-testprojekt** att användare B inte kan läsa, uppdatera, radera eller skapa en uppgift åt användare A. Sätt de sex `RLS_TEST_*`-variablerna i `.env.example` i din shell-miljö (Node läser dem inte automatiskt från `.env.local` vid `node --test`). Två befintliga testanvändare behövs. Testet lämnar testmiljön orörd om variabler saknas och rapporterar uttryckligen `SKIP`. Kör aldrig mot produktion.

För att dessa tester ska köras i CI: sätt motsvarande GitHub secrets till ett separat testprojekt. Kontrollera loggen och verifiera att RLS-testet verkligen kördes, inte skippades.

## GitHub Secrets och Vercel

I GitHub behövs:
- `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` (för deployment)
- `SUPABASE_URL`, `SUPABASE_ANON_KEY` (för CI-bygge)
- Vid RLS-tester: sex `RLS_TEST_*`-secrets för en isolerad testmiljö.

Om du använder GitHub Environments (`preview` och `production`), konfigurera Vercel-secrets för respektive environment och lämpliga skyddsregler. Repo-secrets fungerar också som fallback om environment-secrets saknas. Begränsa vilka brancher som får använda produktionsmiljön.

I Vercel: konfigurera publika Supabase-variabler och servervariabler under Project Settings → Environment Variables. Använd helst separata Supabase-projekt för Preview och Production. Kontrollera att Vercels **automatiska Git-deployment** inte kör en andra parallell deployment om GitHub Actions ansvarar för deploy.

## HTTP-säkerhet och CDN

`vercel.json` innehåller CSP, HSTS och andra headers. CSP begränsar nu script-källor till samma origin men behåller `'unsafe-inline'` eftersom Next.js kan behöva inline-skript. För produktionshärdning rekommenderas en nonce-baserad CSP och tester mot den verkliga applikationen. `connect-src` tillåter endast same-origin samt Supabases HTTPS/WSS-domäner; utöka endast vid konkret behov. HSTS preload är avsiktligt inte påslaget utan domänvalidering.

Tidigare README visade ett SRI-skript med en falsk hash. Det exemplet har tagits bort från den körande demonstrationen; om ni verkligen lägger till ett externt CDN-skript måste ni pinna exakt version och beräkna korrekt `integrity`-hash för filens bytes.

## Att visa på lektionen

1. Testa två användare och observera att deras todo-rader är separerade av RLS, inte av en browser-filterregel.
2. Försök med användare B att manipulera A:s uppgift. Studera vad databasen faktiskt tillåter.
3. Visa skillnaden mellan klientens publishable key och serverns privilegierade nyckel.
4. Följ en pull request via GitHub Actions till Vercel Preview, och visa en main-push till Production.
5. Jämför testlogg med och utan konfigurerade RLS-testhemligheter.

**Obs:** denna demo är ett undervisningsexempel, inte en färdig produktionsmall för adminautentisering, CSP, incidentövervakning eller härdad deployment.
