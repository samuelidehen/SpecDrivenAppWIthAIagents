# Progress Tracker

Update this file after every meaningful implementation
change.

## Current Phase

- In progress

## Current Goal

- Editor chrome shell (`context/feature-specs/02-editor.md`): base navbar and floating project sidebar components reused across every editor screen.

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

## In Progress

- None. Editor chrome shell unit is complete; ready for the next feature unit.

## Next Up

- [Next editor feature unit — canvas surface, AI prompt sidebar, or dialogs built on the reviewed pattern]

## Open Questions

- [Any unresolved product or technical decisions]

## Architecture Decisions

- `app/globals.css` defines two parallel token layers, both required: (1) shadcn's standard semantic vars (`--background`, `--foreground`, `--card`, `--primary`, `--secondary`, `--muted`, `--accent`, `--destructive`, `--border`, `--input`, `--ring`) so generated `components/ui/*` files render correctly untouched, and (2) the custom brand utilities from `ui-context.md` (`bg-base`, `bg-surface`, `text-copy-primary`, `border-surface-border`, `text-brand`, `bg-accent-dim`, etc.) for use in app-level components. Both layers point at the same underlying `--bg-*`/`--text-*`/`--accent-*` values, so they always stay in sync — update the source variable, not each derived token, when the theme changes.

## Session Notes

- [Context needed to resume work in the next session]
