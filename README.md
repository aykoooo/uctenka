# uctenka

Webová aplikace pro správu účtenek a sledování výdajů.

## Stack

- Next.js (App Router)
- TypeScript (strict)
- Tailwind CSS
- shadcn/ui
- Recharts
- Supabase klient (připraveno pro budoucí backend)

## Spuštění lokálně

1. Nainstalujte závislosti: `npm install`
2. Připravte proměnné prostředí: zkopírujte `.env.example` do `.env.local`
3. Spusťte vývojový server: `npm run dev`
4. Otevřete `http://localhost:3000`

## Skripty

- `npm run dev` – vývoj
- `npm run build` – produkční build
- `npm run start` – spuštění buildu
- `npm run lint` – ESLint kontrola

## Environment variables

Použité proměnné:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Nikdy necommitujte reálné klíče do veřejného repozitáře.
