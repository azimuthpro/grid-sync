# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**GridSync** is a desktop web application for prosumers (energy producers-consumers) that automates energy balance calculations from photovoltaic installations and generates reports for grid operators. The app eliminates manual calculations by providing precise forecasts and ready-to-send CSV files, while offering intelligent advice through AI integration.

This is a Next.js 15 application using the App Router architecture with TypeScript and Tailwind CSS, integrated with Supabase for backend services and Google Gemini for AI assistance.

## Development Commands

- **Development server**: `npm run dev` (uses Turbopack for faster builds)
- **Build**: `npm run build`
- **Production server**: `npm start`
- **Linting**: `npm run lint`

## Architecture

- **Framework**: Next.js 15 with App Router
- **Backend & Database**: Supabase (PostgreSQL, Authentication, Edge Functions)
- **AI Integration**: Vercel AI SDK with Google Gemini
- **UI**: Tailwind CSS v4 with CSS custom properties, Radix UI components
- **Forms & Validation**: React Hook Form with Zod 4 schemas (branded types, pipeline validation)
- **State Management**: Zustand for client state
- **Charts & Visualization**: Recharts for energy balance charts
- **CSV Export**: PapaParse for report generation
- **Fonts**: Geist Sans and Geist Mono via `next/font/google`
- **TypeScript**: Strict mode enabled with path aliases (`@/*` → `./src/*`)
- **ESLint**: Using Next.js recommended config with TypeScript support

## Project Structure

```
src/
  app/                 # App Router pages and layouts
    (auth)/           # Authentication routes
      login/
      register/
    dashboard/      # Protected dashboard routes  
      layout.tsx      # Dashboard layout with sidebar
      page.tsx        # Dashboard overview
      locations/    # Location management
      reports/         # Report generation
      settings/     # User settings
    api/              # API routes
      chat/           # AI assistant endpoints
      locations/      # Location CRUD operations
    layout.tsx        # Root layout with font configuration
    globals.css       # Global styles and Tailwind imports
  components/         # React components
    ui/               # Basic UI components (Radix UI)
    locations/        # Location-related components
    reports/          # Report generation components
    ai-assistant/     # AI chat components
  lib/               # Utility libraries
    supabase/        # Supabase client and queries
    schemas/         # Zod validation schemas
    utils/           # Helper functions
  types/             # TypeScript type definitions
```

## Key Configuration

- TypeScript path aliases configured for `@/*` imports
- ESLint extends `next/core-web-vitals` and `next/typescript`
- Next.js config is minimal with no custom configurations
- Uses ES2017 target for TypeScript compilation
- Environment variables configured in `.env.local` for Supabase and AI API keys
- Desktop-first design with minimum width of 1024px

## Database Schema (Supabase)

### Tables
- **user_locations**: User's PV installation locations with power capacity and city
- **consumption_profiles**: Hourly energy consumption patterns (7 days × 24 hours)
- **insolation_data**: Solar irradiation forecasts by city, date, and hour

### Authentication
- Uses Supabase Auth with email/password
- Row Level Security (RLS) policies to protect user data
- Middleware protection for dashboard routes

## Core Features

1. **Multi-location Management**: Users can manage multiple PV installations
2. **Consumption Profiling**: 168-point weekly energy usage patterns per location
3. **Energy Balance Reports**: CSV exports with hourly production/consumption forecasts
4. **AI Assistant**: Context-aware energy optimization advice via Google Gemini
5. **Data Visualization**: Charts showing energy balance and optimization opportunities

## Development Guidelines

- Follow desktop-first responsive design (min-width: 1024px)
- Use Zod schemas for all data validation
- Implement proper loading states and error handling
- Maintain type safety throughout the application
- Use Supabase RLS for data security
- Structure components for reusability and maintainability

## Git Commit Guidelines

### Commit Message Format

Use conventional commit format for consistency:

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### Commit Types

- **feat**: New feature for the user
- **fix**: Bug fix for the user
- **docs**: Documentation changes
- **style**: Code formatting, missing semicolons, etc. (no production code change)
- **refactor**: Code change that neither fixes a bug nor adds a feature
- **test**: Adding missing tests or correcting existing tests
- **chore**: Changes to build process, dependencies, or auxiliary tools

### Commit Message Best Practices

- **Subject line**: Maximum 50 characters, imperative mood ("Add" not "Added" or "Adds")
- **Body**: Wrap at 72 characters, explain what and why vs. how
- **Scope**: Optional, indicates area of change (auth, dashboard, reports, api)

### Examples

Good commit messages:
```
feat(dashboard): add energy balance visualization charts
fix(auth): resolve login redirect loop on expired tokens
docs: update API documentation for location endpoints
refactor(reports): extract CSV generation logic to separate utility
```

Avoid:
```
Fixed stuff
Update code
WIP
Various changes
```

### Branch Naming Conventions

- **Feature branches**: `feature/description` (e.g., `feature/energy-balance-charts`)
- **Bug fixes**: `fix/description` (e.g., `fix/login-redirect-loop`)
- **Hotfixes**: `hotfix/description` (e.g., `hotfix/security-vulnerability`)
- **Chore/maintenance**: `chore/description` (e.g., `chore/update-dependencies`)

### Pre-Commit Checklist

Before creating any commit:

1. **Review changes** using git commands:
   - `git status` - see modified, added, or deleted files
   - `git diff` - review exact changes in modified files
   - `git diff --cached` - review staged changes
   - `git diff --name-only` - get quick list of changed files

2. **Validate code quality**:
   - Run `npm run build` to ensure no build errors
   - Run `npm run lint` to check for linting issues
   - Test affected functionality

3. **Stage and commit**:
   - `git add .` to stage all changes
   - `git commit` with descriptive message

### Pull Request Guidelines

- **Title**: Use same format as commit messages
- **Description**: Include summary, motivation, and testing notes
- **Reviewers**: Request review from appropriate team members
- **Labels**: Apply relevant labels (bug, enhancement, documentation)

### Clean Commit Policy

When creating commits, do NOT add any automatic information such as:

- Co-authored-by tags
- Generated with [tool name] messages
- Any automated signatures or metadata

Keep commit messages clean and focused only on describing all uncommitted changes made.

### Special Commands

**IMPORTANT**: When the user says "commit", this means:

1. **Check what has changed** using git commands (see Pre-Commit Checklist)
2. **Run build check** (`npm run build`) to ensure no build errors
3. **Add all files** to the repository (`git add .`)
4. **Commit all unsaved changes** in the repository (`git commit`)

**ALWAYS review the changes before committing** to ensure you understand what is being committed and can write an accurate commit message describing all modifications.

**IMPORTANT**: When the user says "bump v", this means:

1. **Update app version** in package.json
2. **Check git commit history** to understand changes since the last version
3. **Update README.md Version History** - Add new version section with:
   - Release date
   - Summary of major changes and features
   - Key improvements from commit history
   - Technical details relevant for users and developers
4. **Update CLAUDE.md Recent Update section** - **ONLY IF** changes contain important information for LLM model context:
   - New version number and date
   - Key architectural or technical changes that affect how LLM should work with the codebase
   - New API routes, database schema changes, or processing flow updates
   - Skip this step for minor updates, UI changes, or version bumps without architectural significance
5. **Update version numbers in UI components**:
   - `app/dashboard/settings/page.tsx` - Update version display at bottom
6. **Review commit titles** to accurately summarize all changes in documentation
7. After updating the version, documentation, and UI, commit all changes using the "commit" instructions.

## Recent Updates

### v0.1.0 (August 13, 2025) - Initial Release

**Complete application architecture implemented:**

- **Full Next.js 15 App Router structure** with authentication routes, dashboard, and API endpoints
- **Supabase integration** with PostgreSQL database, authentication, and Row Level Security policies
- **AI assistant implementation** using Vercel AI SDK with Google Gemini for energy optimization advice
- **Core database schema** with `user_locations`, `consumption_profiles`, and `insolation_data` tables
- **Comprehensive UI components** built with Radix UI and Tailwind CSS v4
- **Form validation** using React Hook Form with Zod 4 schemas throughout the application
- **State management** with Zustand for client-side state coordination
- **CSV export functionality** using PapaParse for energy balance reports
- **Interactive charts** with Recharts for data visualization

**Key API routes for LLM context:**
- `/api/chat` - AI assistant chat endpoints
- `/api/locations` - Location CRUD operations with RLS security
- Authentication middleware protecting dashboard routes

**Processing flows:**
- User authentication → Dashboard access → Location management → Consumption profiling → Report generation
- AI assistant integration with context-aware energy optimization recommendations
