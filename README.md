# DSP Portal Frontend

React and TypeScript implementation of the DSP operational homepage. The interface is optimized for widescreen desktop browsers and follows the approved homepage and DSP-health dropdown wireframes in `docs/wireframes/`.

## Release-one behavior

- Renders the complete future navigation so users can learn the portal's information architecture.
- Implements the operational homepage and DSP health dropdown.
- Loads homepage data from `GET /api/v1/home`.
- Falls back to bundled preview data when the backend is unavailable.
- Opens configured Confluence and Remedy destinations in a new tab.
- Explains that unconnected options are planned for phase two instead of navigating to dead pages.

Phase two can replace planned actions with real routes without changing the persistent application shell.

## Run locally

Requirements: Node.js 20+ and pnpm.

```bash
pnpm install
pnpm dev
```

The app runs at `http://localhost:5173`. Vite proxies `/api` and `/healthz` to `http://localhost:8000` during local development.

To use a backend on another origin:

```bash
cp .env.example .env
```

Then set `VITE_API_BASE_URL`, for example `http://localhost:8000`.

## Quality gates

```bash
pnpm test
pnpm build
```

## Important files

- `src/App.tsx` — API loading, preview fallback, and phase-two notices.
- `src/components/Topbar.tsx` — global search shell and DSP health dropdown.
- `src/components/Sidebar.tsx` — release-one external links and phase-two options.
- `src/components/Dashboard.tsx` — System Status, My DSP, Recent Activity, and Upcoming Changes.
- `src/types/dashboard.ts` — frontend representation of the backend contract.
- `src/data/fallback-dashboard.ts` — release-one preview data.

Confluence and Remedy URLs come from the backend response. They are not hard-coded into the frontend.
