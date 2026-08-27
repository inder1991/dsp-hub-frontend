# DSP Portal Frontend

React and TypeScript implementation of the DSP operational homepage. The interface is optimized for widescreen desktop browsers and follows the approved homepage and DSP-health dropdown wireframes in `docs/wireframes/`.

## Release-one behavior

- Renders the complete future navigation so users can learn the portal's information architecture.
- Implements the operational homepage, DSP health dropdown, troubleshooting, onboarding, devspace inventory, Kedro jobs, governed data access, resource-detail dashboards, and a distinct platform-admin control plane.
- Loads homepage data from `GET /api/v1/home`.
- Loads devspace ownership, VM placement, images, health, capacity, running age, and VM incident history from `GET /api/v1/devspaces`.
- Correlates Kedro runs with their owner, devspace, and host VM through `GET /api/v1/jobs`.
- Loads the VM fleet inventory from `GET /api/v1/vms`, including host capacity, users, devspaces, active jobs, and issues.
- Loads drill-down observability views from `GET /api/v1/devspaces/{id}` and `GET /api/v1/vms/{id}`.
- Loads user-scoped Hive table entitlements, morning ingestion status, and team YARN queues from `GET /api/v1/data-access`.
- Loads cross-team platform administration, VM allocation workflows, Hive ingestion, YARN status, integrations, and publishing summaries from `GET /api/v1/admin/control-plane`.
- Implements the DSP login page, single-use Ping callback exchange, governed local login/password setup, session restoration, sign-out, and authenticated user menu.
- Keeps access JWTs in memory, refreshes before expiry, and performs one refresh/retry after an API `401`; session restoration uses backend-managed secure cookies.
- Shows platform administration only to `ADMIN`; `READ_ONLY` users receive an access-denied state for direct admin routes.
- Shows an explicit unavailable state when an API cannot provide current data; bundled demo data is never used as a production fallback.
- Opens configured Confluence and Remedy destinations in a new tab.
- Explains that unconnected options are planned for phase two instead of navigating to dead pages.

Phase two can replace planned actions with real routes without changing the persistent application shell.

Hive surfaces are intentionally metadata-only. The frontend has no route or component for table rows, samples, column values, query results, or data downloads.

## Run locally

Requirements: Node.js 20+ and pnpm.

```bash
pnpm install
pnpm dev
```

The app runs at `http://localhost:5173`. Vite proxies `/auth`, `/api`, and `/healthz` to `http://localhost:8000` during local development.

To use a backend on another origin:

```bash
cp .env.example .env
```

Then set `VITE_API_BASE_URL`, for example `http://localhost:8000`.

For the preferred deployment, leave the value empty and route `/`, `/auth/*`,
and `/api/*` through one public origin. The frontend container contains only
static assets; Ping, JWT, certificate, and database settings belong exclusively
to the backend runtime.

```bash
docker build -t dsp-portal-frontend:local .
docker run -p 5173:8080 dsp-portal-frontend:local
```

## Quality gates

```bash
pnpm test
pnpm build
```

## Important files

- `src/App.tsx` — authenticated API loading, unavailable states, and phase-two notices.
- `src/auth/` — login experience, Ping callback, local login, session lifecycle, and memory-only token store.
- `src/components/Topbar.tsx` — global search shell and DSP health dropdown.
- `src/components/Sidebar.tsx` — release-one external links and phase-two options.
- `src/components/Dashboard.tsx` — System Status, My DSP, Recent Activity, and Upcoming Changes.
- `src/components/DevspacesPage.tsx` — filtered devspace inventory and selected runtime/VM detail.
- `src/components/JobsPage.tsx` — filtered Kedro runs with node progress, resource peaks, and failure context.
- `src/components/DevspaceDashboard.tsx` — devspace metrics, jobs, processes, runtime configuration, and VM issues.
- `src/components/VmsPage.tsx` — searchable VM fleet inventory with host capacity and workload relationships.
- `src/components/VmDashboard.tsx` — VM capacity, hosted devspaces, associated users, issue history, and top processes.
- `src/components/DataAccessPage.tsx` — a user's Hive entitlements, morning ingestion, and team YARN queues.
- `src/components/AdminOverviewPage.tsx` — cross-platform admin attention, integrations, allocations, and operational publishing.
- `src/components/AdminDataPlatformPage.tsx` — cross-team Hive access, ingestion, LDAP mappings, and YARN queue status.
- `src/components/AdminSidebar.tsx` — distinct platform administration navigation.
- `src/types/dashboard.ts` — frontend representation of the backend contract.
- `src/types/devspaces.ts` — devspace, VM, utilisation, image, and issue-history contract.
- `src/types/observability.ts` — job runs and devspace/VM drill-down contracts.
- `src/types/data-platform.ts` — governed Hive, morning ingestion, YARN, and administration contracts.
- `src/data/fallback-*.ts` — test/demo fixtures only; they are not imported by the production application.

Confluence and Remedy URLs come from the backend response. They are not hard-coded into the frontend.
