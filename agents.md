# uctenka – Receipt Tracking App

## Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript (strict, no `any`)
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui (installed via CLI)
- **Charts**: Recharts
- **Icons**: Lucide React
- **Date library**: date-fns (cs locale)
- **Validation**: Zod
- **Theme**: next-themes
- **Backend** (future): Supabase JS client

## Architecture

### Data Flow
```
Backend (Supabase) → BackendRow types → Mappers → Domain types → Repository → Components
```

- **Domain types** (`src/types/domain.ts`): Stable frontend types. All UI depends on these.
- **Backend types** (`src/types/backend.ts`): Placeholder snake_case types matching expected Supabase schema.
- **Mappers** (`src/lib/data/mappers.ts`): Convert backend rows to domain types. Only place that knows about backend field names.
- **Repository Interface** (`src/lib/data/repository.ts`): Interface for all data access (e.g., `getReceipts`, `updateReceipt`).
- **Mock Repository** (`src/lib/data/mock-repository.ts`): Default for v1, uses `mock-data.ts`. Supports fake mutations.
- **Supabase Repository** (`src/lib/data/supabase-repository.ts`): Placeholder, throws "not implemented".
- **Factory** (`src/lib/data/index.ts`): `getRepository()` returns the active data source.

### Folder Structure
```
src/
  app/                      # Next.js pages (App Router)
    page.tsx                 # Dashboard
    receipts/page.tsx        # Receipts list
    receipts/[id]/page.tsx   # Receipt detail
    review/page.tsx          # Review queue
    settings/page.tsx        # Settings
    layout.tsx               # Root layout with ThemeProvider + AppShell
  components/
    app-shell/               # Sidebar, mobile nav, shell wrapper
    dashboard/               # KPI cards, charts, recent/review lists
    receipts/                # Table, cards, toolbar, upload-dialog, detail components, detail-interactive wrapper
    review/                  # Review cards, summary
    settings/                # Profile setting forms, Telegram connection
    shared/                  # Page header, badges, empty/loading states
    ui/                      # shadcn/ui primitives (auto-generated)
  lib/
    data/                    # Repository, mock data, mappers
    formatters/              # Currency, date formatting (Czech)
    constants/               # Categories, navigation items
    auth.ts                  # getCurrentUser() – hardcoded demo user in v1
    utils.ts                 # shadcn cn() utility
  types/
    domain.ts                # Frontend domain types
    backend.ts               # Backend row type placeholders
```

## Conventions
- **Czech UI**: All labels in Czech; text is centralized in components (ready for i18n).
- **No real auth**: Single demo user via `getCurrentUser()`.
- **Components consume domain types only**, never raw backend shapes.
- **shadcn/ui components** live in `components/ui/` and are installed via CLI.
- **Domain components** (badges, page header, etc.) live in `components/shared/`.
- **Feature components** live in their feature folder (`dashboard/`, `receipts/`, `review/`, `settings/`).
- **Pages are thin**: Server components mostly. They compose feature components, data is fetched via repository.
- **Interactive Pages**: For pages requiring forms or local state (like Receipt Edit mode), wrap server-fetched data in a targeted Client Component (e.g., `ReceiptDetailInteractive`) rather than converting the entire page to `"use client"`.

## Adding Backend
1. Set Supabase env vars (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`).
2. Update `src/types/backend.ts` to match real schema.
3. Update `src/lib/data/mappers.ts` if field names changed.
4. Implement methods in `src/lib/data/supabase-repository.ts`.
5. Switch factory in `src/lib/data/index.ts` to return `SupabaseRepository`.
