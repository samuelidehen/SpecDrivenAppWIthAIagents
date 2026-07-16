# Progress Tracker

Update this file after every meaningful implementation
change.

## Current Phase

- In progress

## Current Goal

- Authentication (`context/feature-specs/03-auth.md`): wire Clerk into the app — provider, auth pages, route protection, redirects, and user menu.

## Completed

- Design system and UI primitives (`context/feature-specs/01-design-system.md`):
  - Installed shadcn/ui (`components.json`, style `new-york`) and added Button, Card, Dialog, Input, Tabs, Textarea, ScrollArea to `components/ui/`.
  - Installed `lucide-react` and `radix-ui`, `class-variance-authority`, `clsx`, `tailwind-merge`.
  - Added `lib/utils.ts` with the `cn()` helper.
  - Rewrote `app/globals.css` with the full dark theme token set from `ui-context.md` (`--bg-*`, `--text-*`, `--accent-*`, `--state-*`) mapped to Tailwind utilities via `@theme inline`.
  - Verified with `tsc --noEmit`, `next build`, and a temporary Playwright smoke render of all seven components (screenshot + zero console errors) before reverting `app/page.tsx` to its placeholder content.
- Editor chrome shell (`context/feature-specs/02-editor.md`):
  - Added `components/editor/editor-navbar.tsx`: fixed-height (`h-14`) navbar with left/center/right sections, `bg-surface` + bottom border, sidebar toggle button swapping `PanelLeftOpen`/`PanelLeftClose` based on an `isSidebarOpen` prop. Right section left empty per spec.
  - Added `components/editor/project-sidebar.tsx`: floating overlay panel (`position: fixed`, own rounded-2xl surface with shadow) that slides in/out via `translate-x` transitions driven by an `isOpen` prop — never affects document flow. Header with "Projects" title and close button, shadcn `Tabs` (My Projects / Shared) each with an empty placeholder state, and a full-width `New Project` button with a `Plus` icon pinned to the bottom.
  - Dialog pattern requirement reviewed against the existing `components/ui/dialog.tsx` (protected shadcn foundation component): it already supports `DialogTitle`, `DialogDescription`, and `DialogFooter`, and its colors resolve through the same `--background`/`--border` tokens defined in `globals.css`. No changes made — left as-is per the "do not build actual dialogs yet" instruction and the rule against modifying foundation components without explicit need.
  - Verified with `tsc --noEmit`, `eslint`, `next build`, and a temporary wiring into `app/page.tsx` + Playwright smoke render (toggle open/close, switch tabs, zero console errors) before reverting `app/page.tsx` to its placeholder content.
  - Added `components/editor/editor-shell.tsx`: client component composing `EditorNavbar` + `ProjectSidebar`, owning the `isSidebarOpen` toggle state, rendering `children` in a `<main>` canvas area.
  - Added `app/editor/layout.tsx` (route layout wrapping `EditorShell`) and a placeholder `app/editor/page.tsx` ("Canvas coming soon.") so the `/editor` segment is reachable and future editor chapters (canvas, AI sidebar, dialogs) can build inside it.
  - Verified with `tsc --noEmit`, `eslint`, `next build` (confirms `/editor` route emitted), and a Playwright smoke render of `/editor` (toggle sidebar open, zero console errors).
- Authentication (`context/feature-specs/03-auth.md`):
  - Added `lib/clerk-appearance.ts`: `ClerkProvider` appearance config using `@clerk/ui/themes` `dark` as the base theme, with every `variables.*` entry pointing at the app's own `var(--bg-*/--text-*/--accent-*/--state-*)` tokens — no hardcoded colors, `borderRadius: "1.5rem"` to match the `rounded-3xl` modal scale.
  - Wrapped `app/layout.tsx` in `ClerkProvider appearance={clerkAppearance}`.
  - Added `proxy.ts` at the project root (this Next.js version renamed `middleware.ts` → `proxy.ts`) using `clerkMiddleware` + `createRouteMatcher`: public routes are `NEXT_PUBLIC_CLERK_SIGN_IN_URL`/`NEXT_PUBLIC_CLERK_SIGN_UP_URL` (read from env, not hardcoded), everything else calls `auth.protect()`. Matcher excludes `_next`/static assets, includes `/api`.
  - Added `NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in` and `NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up` to `.env.local` (standard Clerk env var names — `clerkMiddleware` reads these automatically for unauthenticated redirects).
  - Added `app/(auth)/layout.tsx`: two-panel shell (left: compact "Ghost AI" wordmark + tagline + 4-item text-only feature list, right: centered form slot). Left panel hidden below `lg`, no gradients/hero/cards.
  - Redesigned `app/(auth)/layout.tsx` to match an approved mockup: left panel is a true 50/50 split (`w-1/2` vs `flex-1`) with logo pinned to the top, content vertically centered, and copyright pinned to the bottom (`flex-col` + `justify-center` on a `flex-1` middle section) instead of one block centered as a whole. Feature list changed from 4 plain text lines to 3 `icon + title + description` rows (`Sparkles`/`Share2`/`FileText` from `lucide-react`, each in a `bg-accent-dim`/`text-brand` chip) to read as scannable feature cards rather than a bullet list. Left panel background got a subtle brand-tinted radial-gradient overlay (`var(--accent-primary-dim)` top-left, `var(--accent-ai-text)` bottom-right, both from `ui-context.md`'s token set, `opacity: 0.16`) so it reads as distinct from the plain `bg-base` right panel without breaking the dark-only theme rule (no hardcoded hex, no light surface). Confirmed via Playwright `getComputedStyle` that both the page body and Clerk's rendered heading already resolve to `Geist, "Geist Fallback"` — the font token wiring from the original auth unit was already correct, nothing to fix there beyond the type-scale bump (`text-4xl font-bold` heading) that made it visually read as "the wrong font" against the denser original layout.
  - Added `app/(auth)/sign-in/[[...sign-in]]/page.tsx` and `app/(auth)/sign-up/[[...sign-up]]/page.tsx` rendering Clerk's `<SignIn />` / `<SignUp />` (default flows untouched, styled entirely through `clerkAppearance`).
  - Updated `app/page.tsx` to a server component: authenticated (`auth()` → `userId`) redirects to `/editor`; proxy's `auth.protect()` handles the unauthenticated case by redirecting to `/sign-in` before the page component even runs.
  - Added Clerk's `UserButton` to `components/editor/editor-navbar.tsx`'s right section.
  - Recreated `components/editor/editor-shell.tsx` and `app/editor/{layout,page}.tsx` (present in a prior session but absent from disk at the start of this unit) since the auth redirect target and the navbar's `UserButton` both depend on the `/editor` route existing.
  - **Security note**: found Clerk's publishable + secret key pasted directly into `.gitignore` (tracked file) instead of `.env.local` (which was empty) before this unit started — fixed by moving both keys into `.env.local` and restoring `.gitignore`. Confirmed via `git log -p` the keys were never committed, so no rotation was needed.
  - Verified with `tsc --noEmit`, `eslint`, `npm run build` (emits `ƒ Proxy (Middleware)` and all five routes), and Playwright screenshots of `/sign-in` (desktop two-panel + mobile form-only) and `/sign-up` (desktop), plus a curl check confirming `/` and `/editor` both 307-redirect to `/sign-in` when signed out. Did not test the authenticated path (sign-in → `/editor` → `UserButton`) since that requires real Clerk credentials.

## In Progress

- None. Auth unit is complete; ready for the next feature unit.

## Next Up

- [Next feature unit — likely project creation/listing, since auth now gates `/editor` and the sidebar's "My Projects" tab is still a placeholder]

## Open Questions

- Clerk's `createRouteMatcher` logs a deprecation warning in this version, recommending resource-based auth checks (per-page/layout) instead of path-based middleware matching. Spec explicitly asked for the path-based public-routes pattern, so implemented as specified — worth revisiting if Clerk removes `createRouteMatcher` in a future major version.

## Architecture Decisions

- `app/globals.css` defines two parallel token layers, both required: (1) shadcn's standard semantic vars (`--background`, `--foreground`, `--card`, `--primary`, `--secondary`, `--muted`, `--accent`, `--destructive`, `--border`, `--input`, `--ring`) so generated `components/ui/*` files render correctly untouched, and (2) the custom brand utilities from `ui-context.md` (`bg-base`, `bg-surface`, `text-copy-primary`, `border-surface-border`, `text-brand`, `bg-accent-dim`, etc.) for use in app-level components. Both layers point at the same underlying `--bg-*`/`--text-*`/`--accent-*` values, so they always stay in sync — update the source variable, not each derived token, when the theme changes.
- This Next.js version renamed the `middleware.ts` file convention to `proxy.ts` (same behavior, new filename/export name). Route protection lives in `proxy.ts` at the project root via `@clerk/nextjs/server`'s `clerkMiddleware` + `createRouteMatcher`, not a `middleware.ts` file.
- Clerk's appearance API in the installed `@clerk/ui`/`@clerk/nextjs` versions uses `appearance.theme` (not the older `appearance.baseTheme`). All Clerk theme variables are defined once in `lib/clerk-appearance.ts` and referenced via `var(--token)` so they stay in sync with `globals.css` — never hardcode a color for Clerk components.

## Session Notes

- [Context needed to resume work in the next session]
