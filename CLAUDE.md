# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**GridSync** is a Next.js 15 desktop web application for prosumers that automates PV energy balance calculations and generates grid operator reports. Uses App Router, TypeScript, Tailwind CSS v4, Supabase backend, and Google Gemini AI integration.

**Commands**: `npm run dev` | `npm run build` | `npm run lint`

## Architecture

**Core Stack**: Next.js 15, Supabase (PostgreSQL/Auth), Vercel AI SDK + Google Gemini, Tailwind v4 + Radix UI
**Forms & Data**: React Hook Form + Zod 4 schemas, Zustand state, Recharts visualization, PapaParse CSV export
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
  lib/
    supabase/                # 3 Supabase helpers (client, queries, service)
    schemas/                 # Zod validation schemas
    services/                # 3 services (gemini-vision, image-processor, insolation-data)
    utils/                   # 5 utility files (consumption, cron-auth, index, mwe-report, pv-production)
  types/                     # 1 type definition file
  middleware.ts              # Route protection
```

## Database & Features

**Tables**: `user_locations` (PV installations), `consumption_profiles` (168-point weekly patterns), `insolation_data` (solar forecasts)
**Auth**: Supabase Auth + RLS policies + middleware protection

**Key Features**: Multi-location PV management, consumption profiling, CSV report generation, AI optimization advice, interactive data visualization

**Guidelines**: Desktop-first design, Zod validation, type safety, proper error handling, component reusability

## Git Commit Guidelines

**Format**: `<type>(<scope>): <description>` - 50 chars max, imperative mood
**Types**: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`
**Branches**: `feature/`, `fix/`, `hotfix/`, `chore/` + description

**Good**: `feat(dashboard): add energy balance charts`
**Avoid**: "Fixed stuff", "WIP", "Various changes"

**Pre-commit**: `git status/diff` → `npm run build/lint` → test → `git add . && git commit`
**Clean commits**: No co-authored tags, generated signatures, or automated metadata

## Custom Commands

Available slash commands for this project:

- `/commit` - Review changes and create git commit with validation
- `/bumpv [major|minor|patch]` - Bump version following semantic versioning

Use `/help` to see all available commands.

## Recent Updates

### v0.5.0 (Current) - Manual Insolation Data Management

**Last Documentation Sync**: 2025-11-20 - Documentation updated to reflect actual codebase state

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

**Data Flow**: Auth (via middleware) → Dashboard → Location mgmt → Consumption profiling (`/dashboard/locations/[id]/consumption`) → Insolation monitoring (`/dashboard/insolation`) → CSV/MWE reports

**Services**: `gemini-vision.ts` (AI image processing), `image-processor.ts` (image handling), `insolation-data.ts` (data fetch operations)

**Utils**: `pv-production.ts` (energy calculations), `consumption.ts` (grid transformations), `mwe-report.ts` (report generation), `cron-auth.ts` (CRON authentication)

**Processing**: Manual + automated insolation data pipeline with CRON integration, 168-point consumption profiles, real-time PV production calculations, streamlined MWE report generation

**MWE Integration**: Enhanced location schema with MWE code field, auto-populated reports with tracking codes, simplified report generation workflow

**Analytics**: Vercel Analytics integration for comprehensive user behavior tracking and performance monitoring
