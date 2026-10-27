# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**GridSync** is a Next.js 16 desktop web application for prosumers that automates PV energy balance calculations and generates grid operator reports. Uses App Router, TypeScript, Tailwind CSS v4, Supabase backend, and Google Gemini AI integration.

**Commands**: `bun install` | `bun run dev` | `bun run build` | `bun run lint`

## Architecture

**Core Stack**: Next.js 16, Supabase (PostgreSQL/Auth), Vercel AI SDK + Google Gemini, Tailwind v4 + Radix UI
**Forms & Data**: React Hook Form + Zod 4 schemas, Zustand state, Recharts visualization, PapaParse CSV export
**Runtime**: Node.js 24.x (`.nvmrc`, `engines.node`), Bun 1.2 as package manager (`bun.lock`)
**Config**: TypeScript strict mode, `@/*` path aliases, ESLint Next.js config, desktop-first (min 1024px)

## Project Structure

```
src/
  app/
    (auth)/login,register     # Auth routes
    dashboard/               # Protected routes: locations, reports, settings, insolation
    api/                     # API endpoints: locations, insolation, reports, production-summary, cron
  components/
    ui/                      # 4 basic UI components
    locations/               # 3 location management components
    reports/                 # 1 report generation component
    consumption/             # 4 consumption profile components
    dashboard/               # 1 dashboard widget component
    insolation/              # 3 insolation data components
    ai-assistant/            # Empty (reserved for future use)
  hooks/                     # 4 data hooks (useLocations, useInsolation, useConsumptionProfile, useSupabase)
  lib/
    Env.mjs                  # Env var validation (@t3-oss/env-nextjs)
    supabase/                # 3 Supabase helpers (client, queries, service)
    schemas/                 # Zod validation schemas
    services/                # 3 services (gemini-vision, image-processor, insolation-data)
    utils/                   # 5 utility files (consumption, cron-auth, index, mwe-report, pv-production)
  types/                     # 1 type definition file
  proxy.ts                   # Route protection (Next.js 16 middleware)
```

## Database & Features

**Tables**: `user_locations` (PV installations), `consumption_profiles` (168-point weekly patterns), `insolation_data` (solar forecasts)
**Auth**: Supabase Auth + RLS policies + proxy protection (Next.js 16 middleware)

**Key Features**: Multi-location PV management, consumption profiling, CSV report generation, AI optimization advice, interactive data visualization

**Guidelines**: Desktop-first design, Zod validation, type safety, proper error handling, component reusability

## Git Commit Guidelines

**Format**: `<type>(<scope>): <description>` - 50 chars max, imperative mood
**Types**: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`
**Branches**: `feature/`, `fix/`, `hotfix/`, `chore/` + description

**Good**: `feat(dashboard): add energy balance charts`
**Avoid**: "Fixed stuff", "WIP", "Various changes"

**Pre-commit**: `git status/diff` → `bun run build/lint` → test → `git add . && git commit`
**Clean commits**: No co-authored tags, generated signatures, or automated metadata

## Custom Commands

Available slash commands for this project:

- `/commit` - Review changes and create git commit with validation
- `/bumpv [major|minor|patch]` - Bump version following semantic versioning

Use `/help` to see all available commands.

## Recent Updates

### v2.0.0 (Current) - Supabase API Keys & Local Stack

**Last Documentation Sync**: 2026-10-27

- **Supabase keys** - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` for browser and user-scoped clients, `SUPABASE_SECRET_KEY` for the service client (`lib/supabase/service.ts`); legacy anon/service_role keys are no longer read.
- **Local Supabase** - `supabase start` runs the stack from `supabase/config.toml`; migrations replay from a baseline and `supabase/seed.sql` seeds a test account and data.
- **production-summary** - Uses the user's session client so RLS applies; never use the service client for user-scoped reads.

### v1.1.0 - IMGW Map Source & Gemini 3.8

**Last Documentation Sync**: 2026-10-26

- **IMGW source moved** - Maps come from `https://modele.imgw.pl/wp-content/uploads/production/ecmwf/oze_sun/mapa_png/ECMWF_PPv_sun_{1..72}_percent.png` (the site shows them as `blob:` URLs). Step N covers local hour N % 24; night steps are skipped in `image-processor.ts`.
- **AI SDK 7 / Gemini 3.8** - `gemini-vision.ts` uses `generateText` + `Output.object` with `gemini-3.8-flash`; date/hour read from the map header, year from the "Aktualizacja" footer.

### v1.0.2 - Toolchain Modernization

**Last Documentation Sync**: 2026-09-07

- **Node.js 24 + Bun** - Runtime pinned via `.nvmrc`/`engines.node`; Bun replaces npm as the package manager (`bun.lock`). Use `bun install` and `bun run <script>` — never `npm`.
- **AI SDK v6 / Gemini 3** - `gemini-vision.ts` and `image-processor.ts` rewritten against AI SDK 6.x, using `gemini-3-flash-preview`.
- **IMGW headers** - Insolation fetches now send explicit request headers to avoid 403s.

### v1.0.0 - Major Framework Upgrade

**Documentation Sync**: 2025-12-12 - Documentation updated to reflect Next.js 16 and React 19.2 upgrade

**Breaking Changes**:
- **Next.js 16 migration** - Upgraded from 15.4.6 to 16.0.10 with architectural changes
- **React 19.2 upgrade** - Updated from 19.1.0 to 19.2.3
- **Middleware renamed** - `middleware.ts` → `proxy.ts` per Next.js 16 convention
- **Config model change** - Individual `maxDuration` exports instead of config objects
- **Turbopack config** - Added `turbopack.root` for workspace detection

**API Routes**:
- `/api/insolation` (CRUD + manual fetch + charts aggregation)
- `/api/insolation/fetch` (manual data fetch)
- `/api/insolation/charts` (chart data aggregation)
- `/api/cron/fetch-insolation` (automated CRON updates with auth)
- `/api/locations` (location CRUD with RLS)
- `/api/locations/[id]` (single location operations)
- `/api/locations/[id]/consumption` (consumption profile batch updates)
- `/api/production-summary` (PV production calculations)
- `/api/reports/generate` (MWE report generation)

**Key Components**:
- **Insolation**: InsolationChart, InsolationDataTable, InsolationFilters (3 components)
- **Consumption**: ConsumptionProfileEditor, ConsumptionCell, ConsumptionToolbar, ConsumptionGrid (4 components)
- **Locations**: LocationForm, LocationProductionCard, LocationList (3 components)
- **Reports**: ReportGenerator (1 component)
- **Dashboard**: ProductionSummaryWidget (1 component)
- **UI**: dialog, button, select, input (4 components)

**Data Flow**: Auth (via proxy.ts) → Dashboard → Location mgmt → Consumption profiling (`/dashboard/locations/[id]/consumption`) → Insolation monitoring (`/dashboard/insolation`) → CSV/MWE reports

**Services**: `gemini-vision.ts` (AI image processing), `image-processor.ts` (image handling), `insolation-data.ts` (data fetch operations)

**Utils**: `pv-production.ts` (energy calculations), `consumption.ts` (grid transformations), `mwe-report.ts` (report generation), `cron-auth.ts` (CRON authentication)

**Processing**: Manual + automated insolation data pipeline with CRON integration, 168-point consumption profiles, real-time PV production calculations, streamlined MWE report generation

**MWE Integration**: Enhanced location schema with MWE code field, auto-populated reports with tracking codes, simplified report generation workflow

**Analytics**: Vercel Analytics integration for comprehensive user behavior tracking and performance monitoring
