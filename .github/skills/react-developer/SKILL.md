---
name: react-developer
description: Develops React frontend in the backoffice/ directory using React 19, React Router v7, React Query v5, Zustand v5, and ShadCN UI. Use when creating pages, components, query hooks, mutations, routes, or working with the frontend. Handles API type syncing, state management, and UI patterns.
---

# React Frontend Development

Work exclusively in the `backoffice/` directory. Only write comments that provide business context not inferable from code.

## Tech Stack

| Layer         | Technology                |
| ------------- | ------------------------- |
| UI Framework  | React 19+ with TypeScript |
| Routing       | React Router v7           |
| Server State  | TanStack React Query v5   |
| Client State  | Zustand v5                |
| UI Components | ShadCN/UI                 |
| HTTP Client   | Axios                     |
| Build Tool    | Vite                      |
| Validation    | Zod                       |
| Tables        | TanStack React Table      |

## Project Structure

```
backoffice/src/
├── main.tsx                    # App entry point, providers setup
├── Router.tsx                  # Route definitions with <Authorize> wrappers
├── components/
│   ├── ui/                     # ShadCN components (DON'T MODIFY)
│   ├── Authorize.tsx           # Role-based access control wrapper
│   └── app-sidebar.tsx         # Navigation sidebar
├── routes/App/                 # Feature pages (OrganizationsPage/, etc.)
├── services/
│   ├── apiClient.ts            # Axios instance + QueryClient
│   ├── auth.tsx                # Auth hooks + JWT handling
│   ├── [domain].ts             # Query hooks per domain
│   └── store/                  # Zustand slices (authSlice, menuSlice)
├── types/api.d.ts              # Auto-generated from OpenAPI
├── consts/roles.ts             # ROLES constant + role hierarchy
└── utils/                      # Pure utilities with tests
```

## Critical First Step

Before any frontend work involving API calls:

```bash
cd backoffice && npm run sync-schema
```

**ALWAYS use generated types from `types/api.d.ts` — NEVER create manual API types.**

## Patterns

See [patterns.md](patterns.md) for:
- API type extraction from OpenAPI
- React Query hooks (queries + mutations)
- Page component structure
- Zustand store usage
- Route authorization

## Adding New Features

1. `npm run sync-schema` if backend changed
2. Create `src/services/feature.ts` with query/mutation hooks
3. Extract types from `types/api.d.ts`
4. Create `src/routes/App/FeaturePage/` with `index.tsx`
5. Add route in `Router.tsx` with `<Authorize>` if needed
6. Update `src/components/sidebar-menu-config.tsx` for navigation

## ShadCN Components

Use the **ShadCN MCP** to discover components and usage examples.

## Role System



```typescript
export const ROLES = {
  SUPER_ADMIN: "super_admin",
  COMPANY_ADMIN: "company_admin",
  COMPANY_USER: "company_user",
  NORMAL_USER: "normal_user",
  DRIVER: "driver",
} as const;
```

Use `useHasAccess(policy)` from `services/auth.tsx` for conditional rendering.

## Import Alias

Always use `@/` for imports:
```typescript
import { Button } from "@/components/ui/button";
import { useLocations } from "@/services/locations";
import type { paths } from "@/types/api";
```

## Rules

✅ Use generated types, invalidate queries after mutations, show `toast` on actions, place hooks in `services/`, handle loading + error states

❌ No server data in Zustand, no inline selectors, no manual API types, no `useEffect` for fetching, never modify `components/ui/`

## Commands

```bash
cd backoffice
npm run dev         
npm run sync-schema  # Generate API types from backend
npm run build        # Production build
npm run lint         # ESLint
vitest               # Tests
```
