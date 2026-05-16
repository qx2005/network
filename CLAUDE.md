# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

5G-A Private Network Intelligent Configuration Platform (5G-A 专网智能配置平台) — a demo console for configuring 5G-Advanced network capabilities (network slicing, RedCap terminals, MEC offload, 5G LAN/VN). No real network elements; all northbound calls go through a mock adapter that simulates NE acknowledgements.

Full product spec: [docs/product-spec.md](docs/product-spec.md)

## Commands

```bash
# Development (both API + web concurrently)
npm run dev

# Individual dev servers
npm run dev:web          # Vite dev server on :5173
npm run dev:api          # NestJS on :3000, watches and rebuilds

# Web build & lint
npm run dev -w web -- lint
npm run build            # builds both API and web

# API only
npm run start:dev -w api
npm run build -w api
```

The API runs on `http://localhost:3000` with global prefix `/api`. The Vite dev server proxies `/api` to the backend.

## Architecture

Monorepo with two npm workspaces under `apps/`:

### `apps/api` — NestJS backend

- **In-memory stores** — no database. Each service module (`slices`, `redcap`, `mec`, `five-glan`, `provisioning`, `audit`) manages its own array of domain objects. Audit trail is in-memory too, capped at 500 entries.
- **Feature modules** mirror the product spec modules: `SlicesModule`, `RedcapModule`, `MecModule`, `FiveGlanModule`, `ProvisioningModule`, `AuditModule`, `SystemModule`.
- **Northbound adapter** — `apps/api/src/adapters/` uses a token-based DI pattern. `NORTHBOUND_ADAPTER` token is bound to `MockNorthboundAdapter` in `AdaptersModule` (a `@Global()` module). To swap in a real vendor adapter, implement `Northbound5GcAdapter` interface and change the provider binding.
- **Domain layer** — `apps/api/src/domain/` contains shared types ([types.ts](apps/api/src/domain/types.ts)), slice semantic validation ([slice-semantics.ts](apps/api/src/domain/slice-semantics.ts)), and provision report builders ([provision-report.builder.ts](apps/api/src/domain/provision-report.builder.ts)). Semantic checks are shared between the service layer and the mock adapter.
- **RBAC** — Guard-based (`RbacGuard` in `core/`). Reads `x-user-role` header (`viewer` | `operator` | `admin`). Use `@Roles(...)` decorator on controllers. Defaults to `operator` when header is absent.
- **Audit** — `AuditService` logs actions with actor, action, resourceType, resourceId, diff, result, traceId. All services inject it and call `append()` on mutations.
- **API convention** — Slice provisioning is async (`POST /api/slices/:id/provision` returns terminal `ProvisioningJob`). MEC rules, 5G LAN VN, and RedCap profile application return synchronous `CommitResult<T> = { data, report }` with a `ProvisionReport` attached.

### `apps/web` — Vite + React 19 + Ant Design 6

- **Routing** — React Router v7. Routes defined in [App.tsx](apps/web/src/App.tsx), all wrapped in `MainLayout` (sidebar nav + header + content area).
- **API client** — [apps/web/src/api/client.ts](apps/web/src/api/client.ts) is a minimal fetch wrapper that injects `x-user-role` and `x-user-id` headers. Role is stored in `localStorage` and switchable from the header dropdown.
- **Domain types** — [apps/web/src/domain/types.ts](apps/web/src/domain/types.ts) mirrors the backend types.
- **Theme** — Custom Ant Design token overrides in [theme/antdTheme.ts](apps/web/src/theme/antdTheme.ts). Chinese locale (`zhCN`).

### Key data flow

1. User edits a slice in the SPA → `PATCH /api/slices/:id`
2. User clicks "Provision" → `POST /api/slices/:id/provision`
3. `SlicesService.provision()` validates via `getSlicePayloadSemanticIssues()`, then delegates to `ProvisioningService.runSliceProvisionToCompletion()`
4. `ProvisioningService` calls `northbound.provisionSlice()` (mock adapter runs the same semantic checks, returns synthetic NE steps)
5. Result (including `ProvisionReport` with simulated NSSF/PCF/SMF/UPF/AMF steps) is returned and displayed in a truth-feedback modal
6. Audit trail records every mutation

### UI design system

- **CSS variables** — [index.css](apps/web/src/index.css) defines the design surface: slate-teal palette, shadows, transition tokens, skeleton colors, status colors. All custom components reference these variables.
- **Ant Design theme** — [antdTheme.ts](apps/web/src/theme/antdTheme.ts) extends Ant Design 6 tokens for Breadcrumb, Statistic, Table, Card, etc.
- **Dashboard charts** — [DashboardChart.tsx](apps/web/src/components/DashboardChart.tsx) provides `TrendIndicator` and `StatusDistributionBar` (inline SVG, zero dependencies).
- **Layout** — `MainLayout` renders sidebar nav + sticky header with breadcrumbs + content paper (constrained to `max-width: 1400px`). Mobile sidebar overlay at <992px.
- **Form pattern** — Group fields with `<Card className="form-section-card" size="small" title="...">`.
- **Skeleton/empty pattern** — `loading && no-data → <Skeleton>` / `empty → <Empty + CTA>` / `else → <Table>`.
- No CSS-in-JS runtime; all custom styles live in [index.css](apps/web/src/index.css).
- No animation library; CSS `@view-transition` for page transitions, `@keyframes` for micro-interactions.

### Chinese/English convention

The UI and user-facing messages are in Chinese. Code identifiers, type names, audit log keys, and report fields are in English. Comments are bilingual (English + Chinese).
