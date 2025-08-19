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
    dashboard/               # Protected routes: locations, reports, settings
    api/chat,locations,insolation,cron  # API endpoints
  components/ui,locations,reports,ai-assistant
  lib/supabase,schemas,utils
  types/
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

### v0.1.7 (Current) - Latest Architecture Context

**API Routes**: `/api/insolation` (CRUD + CRON auth + aggregation functions), `/api/locations/[id]/consumption` (batch updates), `/api/chat` (AI), `/api/locations` (RLS)

**Key Components**: InsolationChart/Card/Overview, ConsumptionProfileEditor, AI assistant chat, MWE report generation system

**Data Flow**: Auth → Dashboard (`/dashboard/insolation`, `/locations/[id]/consumption`) → Location mgmt → Consumption profiling → CSV/MWE reports

**Utils**: `lib/utils/pv-production.ts` (energy calculations), `lib/utils/consumption.ts` (grid transformations)

**Processing**: Automated insolation data pipeline with CRON integration, 168-point consumption profiles, real-time PV production calculations, MWE report generation

**Analytics**: Vercel Analytics integration for comprehensive user behavior tracking and performance monitoring
