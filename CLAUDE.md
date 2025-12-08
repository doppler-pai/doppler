# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start development server (localhost:3000)
npm run build        # Production build
npm run lint         # Run ESLint
npm run format       # Format with Prettier
npm run format:check # Check formatting
```

## Architecture

Next.js 16 App Router application with Firebase backend (Firestore + Realtime Database + Auth). This is a multiplayer game platform with distinct host and player flows.

### Directory Structure

- `src/app/` - App Router pages (server components by default)
- `src/features/` - Feature modules with components, services, and models
- `src/shared/` - Shared UI components, hooks, context, and lib utilities

### Feature Module Pattern

Features under `src/features/<featureName>/` contain:

- `components/` - React components
- `services/` - Business logic and Firebase operations (one file per operation)
- `models/` - TypeScript types

Key features: `hostFlow/`, `playerFlow/`, `auth/`, `sets/`, `market/`

### Firebase

`src/shared/lib/firebase.ts` exports `auth`, `db` (Firestore), `rtdb` (Realtime Database). Environment variables: `NEXT_PUBLIC_FIREBASE_*`.

---

## Components: Server vs Client

- **Default to server components** - Components in `src/app` and feature `components/` should be server components by default (no `"use client"`).
- Use **async server components** for SSR data fetching.

**When to use client components (`"use client"`):**

- Browser APIs (`window`, `document`, `localStorage`, etc.)
- Client-only React hooks (`useState`, `useEffect`, `useRef`, `useContext` for client state)
- Direct DOM manipulation or event handlers (forms, buttons, drag & drop)

Put `"use client"` at the top of the file and keep these components as small and focused as possible.

**Pattern:** Server component fetches data via services → passes data via props to client component for interactivity.

---

## Data Flow Rules

- **NEVER** fetch data directly from the browser if you can fetch it on the server and pass it down.
- Server component (SSR) → calls `services/*` → passes data to children.
- Client components only call services for actions that truly require browser context (optimistic updates, form submissions depending on client-only state).
- Real-time updates use Firebase Realtime Database via hooks like `useLobbyState`.

---

## Services

**Location:** `src/features/<featureName>/services/` with one file per operation (e.g. `getProducts.ts`, `addProduct.ts`).

**Contracts:**

- Input/output shapes must be defined in `models/` and imported into services.
- No raw `any` for service output; always type results with proper models.

**Environment:**

- Services are environment-aware but UI-agnostic.
- They can call Firestore, HTTP APIs, or other infra from `shared/lib`.
- They must **not** import React or deal with JSX/HTML.
- Services must be safe to call from server components, API routes, server actions, or occasionally client components.

**Error handling:**

- Return structured results: `{ success: true, data: ... }` or `{ success: false, error: string }`.
- Log unexpected errors inside the service and return a safe error message.

---

## Models

**Location:** `src/features/<featureName>/models/` with files like `product.types.ts`, `user.types.ts`.

- **Domain models** (e.g. `Product`) represent core entities.
- **Service contracts** (e.g. `NewProductData`) define input/output of services.
- Keep them pure TypeScript (no imports from React or services).
- Components and services must import from `models` instead of redefining types locally.

---

## Next.js Data Fetching

- Use App Router patterns (async server components, layouts).
- Prefer async server components over client-side fetching when possible.

**Use SSR when:** Content is SEO-relevant, data needs to be fresh on each request, or page should render without JS.

**Use SSG/ISR when:** Data changes rarely (marketing pages). Use `revalidate` to control regeneration.

**Use client-side fetching when:** Data is highly user-specific and not cacheable, or you need real-time updates. Even then, render an initial SSR shell and hydrate on client.

---

## Shared Layer

**`src/shared/lib`** - Firebase initialization, common utilities, config, constants, non-React helpers. Must not depend on feature-specific code.

**`src/shared/components/ui`** - Generic, reusable UI components (buttons, inputs, modals). Feature-agnostic and customizable via props.

---

## Styling

- Use Tailwind with **only the custom colors** defined in `globals.css`. Do not use shadcn or base colors.
- Backgrounds: `bg-very-dark`, `bg-dark`, `bg`, `bg-light`, `bg-very-light`
- Text: `text-muted`, `text`, `text-unmuted`
- Text is already styled in `globals.css`. Use pre-styled `h1`, `h2`, `h3`, `h4`, `p`, `small` tags - avoid custom text styling.
- Use Shadcn components from `src/shared/components/ui/`.

---

## Import Boundaries

- **No circular dependencies** between `components`, `models`, and `services`.
- `components` can import from `models`, `services`, and `shared/*`.
- `services` can import from `models` and `shared/lib`, but **not** from `components` or `shared/ui`.
- `models` should only depend on other `models`.
- Import alias: `@/*` → `./src/*`

---

## Code Style

- Avoid `any`; prefer explicit types and interfaces from `models`.
- Type service responses and error objects.
- Keep files small and focused (single responsibility).
- Prefer composition over large, multi-purpose components or services.
- Comment only when intent is not obvious from the code.
