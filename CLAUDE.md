# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 15 application using the App Router architecture with TypeScript and Tailwind CSS. The project was bootstrapped with `create-next-app` and uses React 19.

## Development Commands

- **Development server**: `npm run dev` (uses Turbopack for faster builds)
- **Build**: `npm run build`
- **Production server**: `npm start`
- **Linting**: `npm run lint`

## Architecture

- **Framework**: Next.js 15 with App Router
- **UI**: Tailwind CSS v4 with CSS custom properties
- **Fonts**: Geist Sans and Geist Mono via `next/font/google`
- **TypeScript**: Strict mode enabled with path aliases (`@/*` → `./src/*`)
- **ESLint**: Using Next.js recommended config with TypeScript support

## Project Structure

```
src/
  app/                 # App Router pages and layouts
    layout.tsx         # Root layout with font configuration
    page.tsx           # Home page
    globals.css        # Global styles and Tailwind imports
```

## Key Configuration

- TypeScript path aliases configured for `@/*` imports
- ESLint extends `next/core-web-vitals` and `next/typescript`
- Next.js config is minimal with no custom configurations
- Uses ES2017 target for TypeScript compilation