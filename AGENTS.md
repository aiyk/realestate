<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

Key Next 16 rules:
- `params`, `searchParams`, `cookies()`, `headers()` are **async** — always `await`.
- The route-protection file is `proxy.ts` (root level), not `middleware.ts`.
- Use `loading.tsx`, `error.tsx`, `not-found.tsx` conventions inside route groups instead of inlining skeletons in pages.
<!-- END:nextjs-agent-rules -->

# Design System

The app is themed with CSS variables defined in `app/globals.css` and exposed as Tailwind utilities via `@theme inline`. **Never** hardcode `emerald-*`, `amber-*`, `stone-*`, `neutral-*`, `red-*`, or `rose-*` shades in feature components — use the tokens below. Hardcoded shades break dark mode.

## Color tokens

| Use this                  | When                                           |
| ------------------------- | ---------------------------------------------- |
| `bg-background`, `text-foreground`        | Page surface and primary body text       |
| `bg-card`, `text-card-foreground`         | Elevated cards, dropdowns, dialogs       |
| `bg-surface-1/2/3`        | Tonal layers from elevated → recessed          |
| `bg-muted`, `text-muted-foreground`       | Neutral chips, secondary text             |
| `border-border`, `border-input`           | Default borders, form inputs              |
| `ring-ring`               | Focus rings (use with `focus-visible:`)        |
| `bg-primary`, `text-primary-foreground`   | Primary buttons, active states            |
| `bg-primary-soft`, `text-primary-soft-foreground` | Tinted chips, "verified" badges  |
| `bg-accent`, `text-accent-foreground`     | Amber accent buttons / highlights         |
| `bg-success/warning/danger/info` (+ `-soft`, `-foreground`) | Semantic states           |
| `text-text-strong/default/muted/subtle`   | Type hierarchy (use cautiously — most cases want `text-foreground` or `text-muted-foreground`) |

## Typography

Use the typography classes — `t-display`, `t-h1`, `t-h2`, `t-h3`, `t-h4`, `t-body`, `t-body-lg`, `t-caption`, `t-eyebrow` — instead of one-off `text-3xl font-bold` combos. The classes use `clamp()` so they scale with viewport.

## Dark mode

Class-based, toggled on `<html>` by [components/theme/theme-provider.tsx](components/theme/theme-provider.tsx). The pre-hydration script in [components/theme/theme-script.tsx](components/theme/theme-script.tsx) sets the class before paint to avoid FOUC. Token values flip in the `.dark` block in [app/globals.css](app/globals.css).

To opt a component out of dark mode (rare — only for fixed-dark surfaces like a photo lightbox), use literal `text-white` / `bg-black/...` etc.

## Primitives

Reach for these before hand-rolling:

- [Button](components/ui/button.tsx) — `variant: default | destructive | outline | secondary | ghost | link | accent | soft`, `size: sm | default | lg | xl | icon | icon-sm`. Has `active:scale-[0.98]` for tactile feedback.
- [Input](components/ui/input.tsx) — `state: default | error | success`. Auto-mirrors `aria-invalid="true"` → error state.
- [Select](components/ui/select.tsx) — styled native `<select>` wrapper. Use instead of raw `<select>`.
- [Card](components/ui/card.tsx) — `padding: none | sm | md | lg`. Reduce to `sm` for listing-card-style dense surfaces.
- [Badge](components/ui/badge.tsx) — semantic variants (`success`, `warning`, `danger`, `info`, `accent`).
- [Toast](components/ui/toast.tsx) + [Toaster](components/ui/toaster.tsx) — mounted in `app/layout.tsx`. Call `useToast()` and use `toast.success/error/info/loading/promise`.
- [Skeleton](components/ui/skeleton.tsx) — `Skeleton`, `SkeletonCard` (listing-card shape), `SkeletonAgentCard`, `SkeletonRow`, `SkeletonGrid({ variant: "card" | "agent" | "row" })`.
- [Tooltip](components/ui/tooltip.tsx) — CSS-only, use for icon-button labels.
- [Dialog](components/ui/dialog.tsx) — native `<dialog>` element, ESC + backdrop dismiss.
- [ErrorState](components/ui/error-state.tsx) — shared fallback for every `error.tsx`.
- [Pagination](components/ui/pagination.tsx) — generic windowed control. Accepts `basePath`, `page`, `pages`, `searchParams`, optional `total` + `perPage` for "Showing X–Y of Z".

## Conventions

- **Every paginated list ships a `<Pagination>`.** Never silently `take: 100` and call it done — that hides data from users with > 100 rows. Use [`paginationSchema`](lib/schemas/pagination.ts) + [`pageBounds`](lib/pagination.ts) in the page, return `{ items, total, page, perPage, pages }` from APIs.
- **Every async route group has `loading.tsx`** built on `SkeletonGrid`, and **every protected one has `error.tsx`** built on `<ErrorState>`.
- **Every dynamic detail route has `not-found.tsx`** with branded copy and a back-to-list link.
- **Every mutation form surfaces feedback via toast** — never set an error state that the user has to scroll to see.
- **Active page indicator** lives in [components/layout/nav-link.tsx](components/layout/nav-link.tsx); when adding a new top-level route, add it to [SiteHeader](components/layout/site-header.tsx) and the active state is automatic.
- **Images on cards must use `next/image`** with `fill` + `sizes`. Hosts that need to be allowed go in `next.config.ts` `images.remotePatterns`.

## Re-running the colour codemod

If a contributor lands new emerald/stone shades, run:

```bash
node scripts/tokenize.mjs
```

The script is idempotent; the target tokens never match its patterns again.
