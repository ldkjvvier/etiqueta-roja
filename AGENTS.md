# AGENTS.md

## Project Snapshot

- Stack: Next.js 16 App Router, React 19, TypeScript, Supabase, Tailwind CSS v4, shadcn/ui.
- Package manager: `pnpm`.
- Runtime baseline: Node.js 18+.
- Start with [README.md](./README.md), then link out to [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) and [SUPABASE_POLICY_SETUP.md](./SUPABASE_POLICY_SETUP.md) instead of duplicating setup details.

## Commands

- `pnpm install`
- `pnpm dev`
- `pnpm build`
- `pnpm start`
- `pnpm lint`
- For TypeScript changes, run `pnpm exec tsc --noEmit` or use editor diagnostics. Do not rely on `pnpm build` for type safety because [next.config.mjs](./next.config.mjs) sets `typescript.ignoreBuildErrors = true`, and do not rely on `pnpm lint` for `*.ts` or `*.tsx` because [eslint.config.mjs](./eslint.config.mjs) excludes them.

## Architecture

- [app/](./app/) contains App Router routes and layouts. Treat route files as Server Components by default; add `'use client'` only for interactive stateful UI.
- [components/ui/](./components/ui/) holds shadcn primitives. Domain components live alongside feature areas such as [components/admin/](./components/admin/) and [components/hero-studio/](./components/hero-studio/).
- [lib/actions/](./lib/actions/) is the mutation boundary. Server Actions live here and should own write-path validation and authorization.
- [lib/services/](./lib/services/) holds server-side business logic and Supabase-backed reads. Keep RSC-facing reads and mapping logic here.
- [lib/validation/](./lib/validation/) contains Zod schemas. Prefer extending existing schemas over inlining ad hoc validation.
- [lib/supabase/](./lib/supabase/) contains the approved client, server, and middleware wrappers for Supabase access.
- [types/](./types/) and [lib/store-context.tsx](./lib/store-context.tsx) define domain shapes used across the storefront.

## Project-Specific Rules

- Admin work is multi-tenant. Resolve store context with [`getAdminStoreContext`](./lib/services/admin-context.ts) before admin reads or writes, and keep queries filtered by `store_id`.
- Respect Row Level Security as part of the product behavior. Missing policies or missing store scoping are real bugs, not environment noise.
- Prefer the existing `@/` path alias from [tsconfig.json](./tsconfig.json) and the shadcn aliases in [components.json](./components.json).
- Reuse Supabase-generated types from [lib/supabase/types.ts](./lib/supabase/types.ts) when possible.
- Image delivery is external and [next.config.mjs](./next.config.mjs) uses `images.unoptimized = true`; do not assume Next.js image optimization is available.
- UI and commerce formatting currently assume Spanish copy and CLP currency formatting; see [`formatPrice`](./lib/utils.ts).

## Good Reference Files

- [app/admin/(dashboard)/layout.tsx](./app/admin/(dashboard)/layout.tsx): protected admin route layout and store-context gate.
- [lib/services/admin-context.ts](./lib/services/admin-context.ts): cached admin store resolution.
- [lib/actions/products.ts](./lib/actions/products.ts): server action pattern plus store-scoped Supabase access.
- [components/admin/product-form.tsx](./components/admin/product-form.tsx): `react-hook-form` + Zod + admin mutation flow.
- [lib/validation/hero-cta.ts](./lib/validation/hero-cta.ts): reusable schema and parser pattern.
- [lib/store-context.tsx](./lib/store-context.tsx): client context, cart state, and shared storefront types.

## Practical Workflow For Agents

- Make the smallest possible change near the owning feature boundary.
- For UI-only changes, start in the closest route or feature component, then follow imports into shared primitives only if needed.
- For data bugs, inspect the service or action that owns the query before touching UI code.
- After edits, validate narrowly first. Prefer a focused runtime/type check over broad project commands.