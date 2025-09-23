# Copilot Instructions for AI Agents

## Project Overview
- **Purpose:** Figma plugin for managing and renaming nodes (Frames/Groups) in a Figma document, with a React-based UI and Figma plugin API integration.
- **Structure:**
  - `src/canvas.ts`: Figma plugin main script (runs in Figma context, communicates with UI via postMessage)
  - `src/plugin.tsx` + `src/plugin.html`: React UI entrypoint, rendered in Figma plugin iframe
  - `src/components/`, `src/pages/`: React UI components and pages
  - `manifest.ts`: Figma plugin manifest (edit name/id here)
  - `vite.config.canvas.ts`, `vite.config.plugin.ts`: Separate Vite configs for plugin backend (canvas) and UI (plugin)

## Key Workflows
- **Build:**
  - `yarn build` (runs both canvas and plugin builds)
  - `yarn build:canvas` / `yarn build:plugin` for individual targets
- **Dev (hot reload UI):**
  - `yarn dev` (watches both canvas and plugin)
- **Lint/Format:**
  - `yarn lint:js` (ESLint, auto-fix)
  - `yarn lint:css` (Stylelint)
  - Pre-commit hooks via Lefthook (`lefthook.yml`)
- **Figma Integration:**
  - After build, import `dist/manifest.json` in Figma

## Communication Patterns
- **Figma <-> UI:**
  - Use `parent.postMessage` (UI → plugin) and `figma.ui.postMessage` (plugin → UI)
  - Message types: `get-selection`, `selection`, `rename`
  - See `src/canvas.ts` and `src/pages/MainPage.tsx` for message structure

## Naming & UI Conventions
- **Node Naming Rule:** Frame/Group children must start with uppercase and end with `s` (e.g., `Beacons`)
- **Rename UI:** Use `RenameButtons` component for quick renaming (see `src/components/RenameButtons.tsx`)
- **Styling:** Uses Reshaped UI library and custom inline styles; no global CSS except for plugin.html

## Project-Specific Patterns
- **React Components:**
  - Pages: `src/pages/MainPage.tsx`, `src/pages/SecondPage.tsx`
  - Shared UI: `src/components/Message.tsx`, `src/components/Navbar.tsx`, `src/components/RenameButtons.tsx`
- **TypeScript:** Strict mode, modern module resolution, JSX via React 18
- **Aliases:** `services`, `utilities`, `types` (see Vite configs)

## External Dependencies
- **Figma Plugin API** (backend)
- **React 18**, **Reshaped** (UI)
- **Vite** (build), **Lefthook** (git hooks), **ESLint/Stylelint/Prettier** (lint/format)

## Examples
- To add a new message type between UI and plugin, update both `src/canvas.ts` and the relevant React page/component.
- To enforce naming rules, see the validation logic in `src/pages/MainPage.tsx`.

---

If you are unsure about a workflow or convention, check the README or the relevant config file. For Figma plugin API usage, see https://www.figma.com/plugin-docs/intro/.