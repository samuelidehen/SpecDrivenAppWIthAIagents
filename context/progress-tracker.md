# Progress Tracker

Update this file after every meaningful implementation
change.

## Current Phase

- In progress

## Current Goal

- Design system and UI primitives (`context/feature-specs/01-design-system.md`): install and configure shadcn/ui, add base components, install lucide-react, add the `cn()` helper, and wire up the dark theme tokens from `ui-context.md`.

## Completed

- Design system and UI primitives (`context/feature-specs/01-design-system.md`):
  - Installed shadcn/ui (`components.json`, style `new-york`) and added Button, Card, Dialog, Input, Tabs, Textarea, ScrollArea to `components/ui/`.
  - Installed `lucide-react` and `radix-ui`, `class-variance-authority`, `clsx`, `tailwind-merge`.
  - Added `lib/utils.ts` with the `cn()` helper.
  - Rewrote `app/globals.css` with the full dark theme token set from `ui-context.md` (`--bg-*`, `--text-*`, `--accent-*`, `--state-*`) mapped to Tailwind utilities via `@theme inline`.
  - Verified with `tsc --noEmit`, `next build`, and a temporary Playwright smoke render of all seven components (screenshot + zero console errors) before reverting `app/page.tsx` to its placeholder content.

## In Progress

- None. Design system unit is complete; ready for the next feature unit.

## Next Up

- [First unit to build]

## Open Questions

- [Any unresolved product or technical decisions]

## Architecture Decisions

- `app/globals.css` defines two parallel token layers, both required: (1) shadcn's standard semantic vars (`--background`, `--foreground`, `--card`, `--primary`, `--secondary`, `--muted`, `--accent`, `--destructive`, `--border`, `--input`, `--ring`) so generated `components/ui/*` files render correctly untouched, and (2) the custom brand utilities from `ui-context.md` (`bg-base`, `bg-surface`, `text-copy-primary`, `border-surface-border`, `text-brand`, `bg-accent-dim`, etc.) for use in app-level components. Both layers point at the same underlying `--bg-*`/`--text-*`/`--accent-*` values, so they always stay in sync — update the source variable, not each derived token, when the theme changes.

## Session Notes

- [Context needed to resume work in the next session]
