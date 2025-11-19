---
description: "Sync documentation files with actual codebase state"
allowed-tools: ["Bash", "Read", "Edit", "Grep", "Glob"]
---

# Update Documentation Command

This command synchronizes documentation files (README.md, CLAUDE.md) with the actual GridSync codebase state, ensuring documentation accurately reflects implemented features, dependencies, and project structure.

## Usage

- `/updatedocs` - Analyze codebase and sync all documentation files

## Process

**IMPORTANT**: When the user says "update docs" or runs `/updatedocs`, this means:

1. **Analyze the current codebase state** to gather accurate information:
   - Read `package.json` for dependencies, versions, and scripts
   - Scan folder structure (`src/app/`, `src/components/`, `src/lib/`, `src/types/`, `src/hooks/`, `supabase/`)
   - Count files by type and category (components by PV-specific areas, pages, API routes)
   - Identify implemented features, API endpoints, integrations
   - Verify configuration files (middleware.ts, vercel.json, etc.)
   - Check Supabase migrations and schema

2. **Update README.md** with accurate project information:
   - **Technology Stack**: Update all dependency versions from package.json
   - **Project Structure**: Update file counts and folder organization
   - **Component Counts**: Sync UI, locations, consumption, insolation, dashboard, reports component counts
   - **API Routes**: Update with actual route structure from `src/app/api/`
   - **Features List**: Add any newly implemented features not yet documented
   - **Missing Features**: Document features marked complete but not implemented
   - **Integration Status**: Document Supabase, Gemini Vision, Vercel CRON, Analytics status

3. **Update CLAUDE.md** (AI assistant instructions):
   - **Architecture Section**: Sync with actual implementation
   - **Component Structure**: Update counts and file locations
   - **API Routes**: Correct paths and structure
   - **Configuration**: Update tool versions and settings
   - **Implementation Status**: Reflect current completion state
   - **Recent Updates Section**: Add note about what was synced (v0.X.X)
   - **Integration Details**: Update Supabase schema, Gemini Vision, CRON jobs

4. After updating documentation, commit changes with clean message.

## Codebase Analysis Checklist

### Dependencies Analysis

Run these commands to gather accurate information:

```bash
# Get all dependencies with versions
cat package.json | grep -A 200 '"dependencies"'
cat package.json | grep -A 200 '"devDependencies"'

# Get project metadata
cat package.json | grep '"name"\|"version"\|"description"'
```

### Folder Structure Analysis

Use Glob and Bash to count files:

```bash
# Count pages
find src/app -name "page.tsx" | wc -l
find src/app/dashboard -name "page.tsx" | wc -l
find src/app/\(auth\) -name "page.tsx" | wc -l

# Count API routes
find src/app/api -name "route.ts" | wc -l
find src/app/api/locations -name "*.ts" | wc -l
find src/app/api/insolation -name "*.ts" | wc -l

# Count components by category
find src/components/ui -name "*.tsx" | wc -l
find src/components/locations -name "*.tsx" | wc -l
find src/components/consumption -name "*.tsx" | wc -l
find src/components/insolation -name "*.tsx" | wc -l
find src/components/dashboard -name "*.tsx" | wc -l
find src/components/reports -name "*.tsx" | wc -l
find src/components/ai-assistant -name "*.tsx" | wc -l

# Count library files by category
find src/lib/supabase -name "*.ts" | wc -l
find src/lib/services -name "*.ts" | wc -l
find src/lib/utils -name "*.ts" | wc -l
find src/lib/schemas -name "*.ts" | wc -l

# Count hooks
find src/hooks -name "*.ts" -o -name "*.tsx" | wc -l

# Count type files
find src/types -name "*.ts" | wc -l

# Count database migrations
find supabase/migrations -name "*.sql" | wc -l

# List all route pages
find src/app -name "page.tsx"

# List all API routes
find src/app/api -name "route.ts"
```

### Feature Detection

Check for implemented features:

- **Auth System**: Check `src/app/(auth)/`, `src/middleware.ts`, `src/lib/supabase/`
- **Supabase**: Check `src/lib/supabase/`, `supabase/schema.sql`, `supabase/migrations/`
- **Gemini AI Vision**: Check `src/lib/services/gemini-vision.ts`, `@ai-sdk/google` in package.json
- **PV Management**: Check `src/components/locations/`, `src/lib/utils/pv-production.ts`
- **Consumption Profiling**: Check `src/components/consumption/`, `src/lib/utils/consumption.ts`
- **Insolation Data**: Check `src/components/insolation/`, `src/lib/services/insolation-data.ts`
- **MWE Reports**: Check `src/components/reports/`, `src/lib/utils/mwe-report.ts`
- **Vercel CRON**: Check `vercel.json` for cron configuration
- **Analytics**: Check for `@vercel/analytics` in package.json
- **Middleware**: Check for `src/middleware.ts`

### Missing Features Check

Verify features mentioned in CLAUDE.md but potentially missing:

- **AI Chat Route**: Check if `src/app/api/chat/route.ts` exists
- **AI Assistant Components**: Check if `src/components/ai-assistant/` has files

## README.md Update Sections

### Technology Stack

Update these subsections with actual versions from package.json:

- **Core Framework**: Next.js 15.x, React 19.x, TypeScript ^5
- **UI & Styling**: Tailwind CSS v4, Radix UI components, Lucide icons
- **Forms & Validation**: react-hook-form, Zod 4.x schemas
- **Data Fetching & State**: SWR, Zustand
- **Database & Auth**: Supabase (@supabase/supabase-js, @supabase/ssr)
- **AI Integration**: Vercel AI SDK (ai), Google Gemini (@ai-sdk/google) for vision processing
- **Data Processing**: PapaParse (CSV export), Recharts (visualization), date-fns
- **Analytics**: Vercel Analytics
- **Environment**: @t3-oss/env-nextjs (type-safe env vars)
- **Code Quality**: ESLint, Prettier, TypeScript strict mode

### Project Structure

Update file counts in the structure tree:

```
src/
├── app/
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Landing page (Polish)
│   ├── globals.css             # Global styles
│   ├── (auth)/                 # X files - auth routes
│   │   ├── layout.tsx
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── dashboard/              # X files - protected routes
│   │   ├── layout.tsx
│   │   ├── page.tsx            # Overview
│   │   ├── locations/          # PV installations
│   │   │   ├── page.tsx
│   │   │   └── [id]/consumption/page.tsx
│   │   ├── insolation/page.tsx
│   │   ├── reports/page.tsx
│   │   └── settings/page.tsx
│   └── api/                    # X API routes
│       ├── locations/          # X routes
│       ├── insolation/         # X routes
│       ├── reports/
│       ├── production-summary/
│       └── cron/
├── components/
│   ├── ui/                     # X Radix UI components
│   ├── locations/              # X location components
│   ├── consumption/            # X consumption components
│   ├── insolation/             # X insolation components
│   ├── dashboard/              # X dashboard components
│   ├── reports/                # X report components
│   └── ai-assistant/           # X AI components
├── lib/
│   ├── supabase/               # X Supabase helpers
│   ├── services/               # X services (Gemini, insolation)
│   ├── utils/                  # X utility files
│   ├── schemas/                # X Zod schemas
│   └── Env.mjs                 # Environment config
├── types/                      # X type definition files
├── hooks/                      # X custom hooks (SWR)
└── middleware.ts               # Auth routing
supabase/
├── schema.sql                  # Database setup
└── migrations/                 # X SQL migration files
public/                         # X files (SVGs, manifest)
```

### Implementation Status

Update completion metrics:

- Current version (from package.json)
- Core features status (Auth, PV Management, Consumption Profiling, Insolation Data, MWE Reports)
- API route inventory (locations, insolation, reports, production-summary, cron)
- Component counts by category (UI, locations, consumption, insolation, dashboard, reports, ai-assistant)
- Integration status (Supabase, Gemini Vision, Vercel CRON, Analytics)

## CLAUDE.md Update Sections

### Architecture

- **API Routes**: Update paths to match actual structure (`/api/locations`, `/api/insolation`, etc.)
- **Component Structure**: Update counts and file listings by category
- **Data Flow**: Sync auth → dashboard → location management → consumption profiling → reports flow
- **AI Systems**: Update Gemini Vision integration for insolation data extraction

### Implementation Status

Update "Recent Updates" section with:

- Current version and deployment status
- Accurate feature completion list
- Actual component counts by category
- Technology stack versions
- Integration status (Supabase, Gemini Vision, CRON jobs, Analytics)

### Recent Updates Format

Add or update the version section:

```markdown
### vX.X.X (Current) - [Brief Description]

**API Routes**: List actual routes with descriptions

**Key Components**: List component categories with counts

**Data Flow**: Describe actual data flow

**Utils**: List key utility files

**Processing**: Describe data processing features

**Integration**: Note key integrations and their status

**Analytics**: Note analytics status
```

## Common Documentation Discrepancies to Fix

Based on GridSync-specific patterns, check and fix these items:

### 1. Component Counts

**Issue**: Documentation shows outdated component counts
**Actual**: Count files in each component category (ui, locations, consumption, insolation, dashboard, reports, ai-assistant)
**Fix**: Update all references to component counts in README.md and CLAUDE.md

### 2. API Route Paths

**Issue**: Documentation doesn't reflect actual API structure
**Actual**: Routes are in flat `/api/` structure with subcategories (locations, insolation, reports, etc.)
**Fix**: Update API Routes section in both README.md and CLAUDE.md with correct structure

### 3. Page Counts

**Issue**: Documentation shows outdated page counts
**Actual**: Count landing (1), auth pages (2), dashboard pages (6)
**Fix**: Update with specific numbers and paths

### 4. File Locations

**Issue**: Documentation references incorrect file paths
**Actual**: Verify actual locations (e.g., `src/middleware.ts`, `src/app/globals.css`, `vercel.json`)
**Fix**: Update file path references throughout documentation

### 5. Integration Status

**Issue**: Documentation doesn't reflect current integration state
**Examples**:
- Gemini Vision for insolation data extraction (not general chat)
- Vercel CRON for automated data fetching
- Analytics integration
- AI chat components (may be empty or missing)
**Fix**: Add clarifications about integration status and purposes

### 6. Dependency Versions

**Issue**: Documentation shows outdated versions
**Actual**: package.json has current versions (Next.js 15.x, React 19.x, Tailwind v4, Zod 4.x)
**Fix**: Sync all version numbers with package.json

### 7. Build Scripts

**Issue**: Documentation lists scripts that don't exist or misses new ones
**Actual**: package.json has current scripts (dev, build, lint, etc.)
**Fix**: Update npm scripts section with actual commands

### 8. Feature Implementation

**Issue**: Features marked as complete but not implemented, or vice versa
**Examples**:
- Middleware exists and protects dashboard routes
- CRON job configured in vercel.json
- AI chat route may be missing despite being mentioned
- ai-assistant components directory may be empty
**Fix**: Verify file existence and update feature status accordingly

### 9. Database Schema

**Issue**: Database table descriptions don't match actual schema
**Actual**: Check supabase/schema.sql for current tables (user_locations, consumption_profiles, insolation_data)
**Fix**: Update database section with correct table names and structures

### 10. Missing Features

**Issue**: Features mentioned in docs but not implemented
**Check**: AI chat functionality, sitemap.ts, robots.txt, complete AI assistant UI
**Fix**: Either note as "planned" or remove if not intended

## Analysis Process

### Step 1: Gather Data

Run commands and read files to collect:

- Package versions (package.json)
- File counts (find/glob commands for each component category, pages, API routes)
- Route structure (find src/app -name "page.tsx" and -name "route.ts")
- Component inventory (count by ui/locations/consumption/insolation/dashboard/reports/ai-assistant)
- Library files (count by supabase/services/utils/schemas categories)
- Hooks (count SWR data-fetching hooks)
- Configuration status (check for middleware.ts, vercel.json, etc.)
- Database migrations (count files in supabase/migrations/)

### Step 2: Compare with Documentation

For each documentation file, identify:

- Outdated version numbers
- Incorrect file counts
- Wrong file paths
- Missing features (implemented but not documented)
- Outdated features (documented but not implemented)
- Inconsistent descriptions
- Integration status mismatches

### Step 3: Update Files

Make precise edits to:

- README.md (Technology Stack, Project Structure, Implementation Status, Features)
- CLAUDE.md (Architecture, Implementation Status, API Routes, Recent Updates)

### Step 4: Verify Consistency

Check that all documentation files have:

- Same version number
- Same completion status
- Same feature implementation state
- Consistent component counts
- Consistent file paths
- Matching integration details

## Clean Commit Policy

Do NOT add any automatic information such as:

- Co-authored-by tags
- Generated with [tool name] messages
- Any automated signatures or metadata

Keep commit messages clean and focused:

```
docs: sync documentation with actual codebase state
```

Or more specific:

```
docs: update component counts and API routes in documentation
```

## Example Workflow

```bash
# 1. Analyze package.json
cat package.json

# 2. Count pages
find src/app -name "page.tsx" | wc -l
find src/app/dashboard -name "page.tsx" | wc -l

# 3. Count API routes
find src/app/api -name "route.ts" | wc -l

# 4. Count components by category
find src/components/ui -name "*.tsx" | wc -l
find src/components/locations -name "*.tsx" | wc -l
find src/components/consumption -name "*.tsx" | wc -l
find src/components/insolation -name "*.tsx" | wc -l
find src/components/dashboard -name "*.tsx" | wc -l
find src/components/reports -name "*.tsx" | wc -l
find src/components/ai-assistant -name "*.tsx" | wc -l

# 5. Count library files
find src/lib/supabase -name "*.ts" | wc -l
find src/lib/services -name "*.ts" | wc -l
find src/lib/utils -name "*.ts" | wc -l

# 6. Count hooks, types, migrations
find src/hooks -name "*.ts" -o -name "*.tsx" | wc -l
find src/types -name "*.ts" | wc -l
find supabase/migrations -name "*.sql" | wc -l

# 7. Check for specific files
ls src/middleware.ts 2>/dev/null || echo "middleware.ts not found"
ls vercel.json 2>/dev/null || echo "vercel.json not found"
ls src/app/api/chat/route.ts 2>/dev/null || echo "AI chat route not found"

# 8. Check integrations
ls -d src/lib/services/gemini-vision.ts 2>/dev/null && echo "Gemini Vision present"
ls -d supabase/migrations 2>/dev/null && echo "Supabase migrations present"
cat vercel.json | grep -A 5 '"crons"' && echo "CRON jobs configured"

# 9. Read current documentation
# (Read README.md, CLAUDE.md)

# 10. Update documentation files
# (Edit each file with corrections)

# 11. Commit changes
git add README.md CLAUDE.md
git commit -m "docs: sync documentation with actual codebase state"
```

## Notes

- Always verify counts by actually scanning the codebase
- Don't assume features exist - check for files
- Update all documentation files consistently
- Keep documentation concise but accurate
- When in doubt, check the actual code, not assumptions
- Pay special attention to version numbers across all files
- Verify API route structure (flat `/api/` with subcategories)
- Check integration status (what's configured vs. what's actively used)
- Note any missing features mentioned in docs but not implemented
- GridSync is a PV energy management app, NOT a blog/marketing site
- GridSync has Polish hardcoded UI, NOT i18n multi-language system
- Focus on PV-specific features: locations, consumption, insolation, reports
