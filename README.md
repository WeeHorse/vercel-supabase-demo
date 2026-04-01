# Vercel-supabase-demo

Demo-repo för kursmomentet om:

- Vercel och Continuous Deployment
- Supabase Auth och JWT-baserade sessioner
- säker hantering av API-nycklar
- Row Level Security (RLS)
- jsDelivr + Subresource Integrity (SRI)
- säkerhetsheaders i Vercel
- GitHub Actions CI/CD

## Vad appen visar

- Enkel login/sign-up med Supabase Auth
- Todo CRUD direkt från frontend via `anon key`
- Dataskydd med RLS så att varje användare bara ser sina egna rader
- Server-side admin route som använder `SUPABASE_SERVICE_ROLE_KEY`
- GitHub Actions för CI och Vercel CLI för preview/production deployment

## 1. Installera

```bash
npm install
```

## 2. Lägg in miljövariabler

Kopiera `.env.example` till `.env.local`.

```bash
cp .env.example .env.local
```

Fyll sedan i riktiga värden från Supabase.

## 3. Kör lokalt

```bash
npm run dev
```

## 4. Skapa tabeller i Supabase

Kör SQL från `sql/schema.sql` i Supabase SQL Editor.

## GitHub Secrets

Lägg till dessa varibler (med värden) i GitHub.
_Kan läggas som repository secrets, eller som environment variables, men då per environment._

- `VERCEL_TOKEN` - från Vercel account token settings, skapa ett token med detta namnet
- `VERCEL_ORG_ID` - från Vercel team (team id) eller organisation (org id)
- `VERCEL_PROJECT_ID` - från Vercel projektet
- `SUPABASE_URL` - från Supabase environment variables
- `SUPABASE_ANON_KEY` - från Supabase environment variables


## Vercel Environment Variables

Preview och Production bör ha separata värden där det behövs:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_APP_ENV`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

## Viktiga säkerhetsregler

- `NEXT_PUBLIC_SUPABASE_ANON_KEY` får användas i frontend
- `SUPABASE_SERVICE_ROLE_KEY` får aldrig exponeras i klientkod
- `anon key` är inte hemlig, men den måste begränsas av RLS
- preview-URL:er kan vara exponerade och ska inte innehålla oskyddade adminfunktioner
- CDN-skript ska versionspinnas och skyddas med SRI

## Demo

1. Se att två olika användare bara ser sina egna todos.
2. Ta tillfälligt bort en RLS-policy och undersök varför det blir farligt.
3. Undersök GitHub Actions-flödet på en pull request.
4. Se skillnaden mellan preview och production i Vercel.
5. Varför används `service_role` bara på serversidan.

## Obs

- Byt ut Supabase-domänen i `vercel.json` så att `connect-src` pekar på rätt URL.
- SRI-hashen i CDN-exemplet är en platshållare och behöver ersättas med riktig hash för vald filversion.

