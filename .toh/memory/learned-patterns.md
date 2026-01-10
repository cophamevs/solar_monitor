# 🎓 Learned Patterns

## Source: solar_monitor
## Learned: 2026-01-10 20:05
## Path: solar-dashboard/src/, solar-backend/src/

---

## Hook Patterns

| Pattern | Example | When to Use |
|---------|---------|-------------|
| `use{Feature}` naming | `useDeviceList`, `useSystemSummary` | All custom hooks |
| Return `{ data, loading, error }` | `return { devices, loading, error }` | Data fetching hooks |
| Optional `refetch` | `return { data, loading, refetch }` | When refresh needed |
| Service integration | `await deviceService.list(filters)` | API calls inside useEffect |
| Socket subscription | `socket.on('event', handler)` in useEffect | Real-time updates |
| Cleanup on unmount | `socket.off('event')` in useEffect return | Always clean up sockets |

---

## Service Patterns

| Pattern | Example | When to Use |
|---------|---------|-------------|
| Object literal export | `export const deviceService = { ... }` | All services |
| Method naming | `list`, `getRealtime`, `getTelemetry` | CRUD operations |
| `async` methods | `async list(filters)` | All API methods |
| `apiClient` wrapper | `apiClient.get<T>('/path', { params })` | HTTP requests |
| Return `response.data` | `return response.data` | Always unwrap response |
| Local token storage | `localStorage.setItem('token', ...)` | Auth service only |

---

## Page Patterns

| Pattern | Example | When to Use |
|---------|---------|-------------|
| `useApi` hook | `const { data, loading, refetch } = useApi(() => api.getFoo(), [])` | Data fetching |
| `useInterval` for refresh | `useInterval(() => refetch(), 30000)` | Auto-refresh |
| Loading skeleton | `if (loading) return <Skeleton ... />` | Loading states |
| Props interface | `interface PageProps { onNavigate?: () => void }` | Navigation callbacks |
| Column definitions | `const columns: Column<T>[] = [...]` | DataTable usage |

---

## Component Patterns

| Pattern | Example | When to Use |
|---------|---------|-------------|
| PascalCase file names | `KPICard.tsx`, `StatusDonut.tsx` | All components |
| `{Component}Props` interface | `interface KPICardProps { ... }` | Props typing |
| Functional components | `export function KPICard(props) {}` | All components |
| Named exports | `export function Badge() {}` | Prefer named over default |
| Import from base | `import { Icon } from '../components/base/Icon'` | UI primitives |

---

## Backend Route Patterns

| Pattern | Example | When to Use |
|---------|---------|-------------|
| Express Router | `const router = Router()` | All route files |
| `async (req, res, next)` | Route handlers | Always async |
| `try/catch/next` | `try {} catch (e) { next(e) }` | Error handling |
| `createError()` helper | `throw createError('Not found', 404, 'NOT_FOUND')` | API errors |
| Prisma queries | `prisma.device.findMany({ where, include })` | Database access |
| `res.json(data)` | Response | Always JSON response |
| `res.status(201/204)` | `res.status(201).json(...)` | Create/Delete |
| Default export router | `export default router` | All route files |

---

## Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Hooks | `use{Feature}` | `useDeviceList`, `useSocket` |
| Services | `{feature}Service` | `deviceService`, `authService` |
| Pages | `{Feature}.tsx` | `SystemOverview.tsx`, `Login.tsx` |
| Components | `{Feature}.tsx` | `KPICard.tsx`, `Badge.tsx` |
| Backend Routes | `{feature}.ts` | `devices.ts`, `auth.ts` |
| Interfaces | `{Feature}` or `{Feature}Props` | `Device`, `KPICardProps` |
| API responses | `{Feature}Response` | `TelemetryResponse` |

---

## File Structure

```
solar-dashboard/src/
├── api/            # API client + types
├── hooks/          # Custom hooks (use{Feature}.ts)
├── services/       # API services ({feature}Service.ts)
├── pages/          # Page components ({Feature}.tsx)
├── components/     # Reusable UI
│   ├── base/       # Primitives (Icon, Badge, Button)
│   ├── cards/      # Card components (KPICard)
│   ├── data/       # Data display (DataTable, StatusDonut)
│   ├── layout/     # Layout wrappers
│   └── energy/     # Domain-specific (EnergyFlow)
├── store/          # State management
└── utils/          # Helpers

solar-backend/src/
├── routes/         # Express routers ({feature}.ts)
├── services/       # Business logic
├── middleware/     # Auth, error handling
├── types/          # TypeScript types
└── utils/          # Helpers (aggregators)
```

---

## Error Handling

| Layer | Pattern | Example |
|-------|---------|---------|
| Frontend Hook | `setError(err as Error)` | Catch and expose |
| Frontend Service | Let error propagate | Caught by hook |
| Backend Route | `next(error)` | Pass to middleware |
| Backend Create Error | `throw createError(msg, status, code)` | Structured errors |
| Global Handler | `errorHandler` middleware | Centralized response |
