# 🎓 Learn Skill

> Khả năng tự học từ codebase và repositories, extract patterns và conventions để cải thiện chất lượng code generation.

---

## Overview

Skill này cho phép agents:
- 📖 Phân tích source code để extract patterns
- 🔍 Nhận diện conventions (naming, structure, imports)
- 💾 Lưu learned patterns vào memory
- 🔄 Apply learned patterns khi generate code

---

## ⚠️ ENFORCEMENT RULES

```
┌─────────────────────────────────────────────────────────────────┐
│  🚨 RULE 1: MUST analyze before learning                        │
│     - Never assume patterns, always verify from code            │
│     - Read minimum 3-5 files per category                       │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  🚨 RULE 2: MUST save learned patterns                          │
│     - Always update .toh/memory/learned-patterns.md             │
│     - Include source and timestamp                              │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  🚨 RULE 3: MUST apply learned patterns                         │
│     - Load learned-patterns.md with other memory files          │
│     - Use patterns when generating new code                     │
└─────────────────────────────────────────────────────────────────┘
```

---

## Learning Protocol

### Phase 1: Source Analysis

```
STEP 1: Identify Learning Targets
        ├── Hooks (src/hooks/, hooks/)
        ├── Services (src/services/, lib/api/)
        ├── Components (src/components/, components/)
        ├── Pages (src/pages/, app/)
        └── Types (src/types/, types/)

STEP 2: Sample Representative Files
        ├── Pick 3-5 files from each category
        ├── Prefer files with most imports/usage
        └── Include both simple and complex examples

STEP 3: Analyze Each Category
        ├── Naming patterns (useDevice, deviceService)
        ├── Import patterns (relative vs absolute)
        ├── Export patterns (named vs default)
        ├── Code structure (function order, comments)
        └── Error handling patterns
```

### Phase 2: Pattern Extraction

```
FOR EACH CATEGORY:

1. Hook Patterns
   - Naming: use{Feature}
   - Dependencies: useEffect, useState usage
   - Return structure: { data, loading, error, actions }
   - Service integration pattern

2. Service Patterns
   - Naming: {feature}Service or {Feature}Service
   - Method naming: getAll, getById, create, update, delete
   - Error handling approach
   - API client usage

3. Component Patterns
   - File naming: PascalCase.tsx
   - Props interface naming: {Component}Props
   - Composition patterns
   - State management integration

4. Page Patterns
   - Layout usage
   - Data fetching approach
   - Loading/error states
   - Route parameter handling

5. Type Patterns
   - Entity interfaces
   - Input/Output types
   - API response types
```

### Phase 3: Save to Memory

```
UPDATE: .toh/memory/learned-patterns.md

FORMAT:
# 🎓 Learned Patterns

## Source: {project_name}
## Learned: {YYYY-MM-DD HH:mm}
## Path: {analyzed_path}

### Hook Patterns
| Pattern | Example | When to Use |
|---------|---------|-------------|
| ...     | ...     | ...         |

### Service Patterns
...

### Component Patterns
...

### Naming Conventions
| Type | Convention | Example |
|------|------------|---------|
| ...  | ...        | ...     |

### File Structure
```
{extracted structure}
```
```

---

## External Repository Learning

### When Learning from GitHub URL

```
STEP 1: Clone/Fetch Repository
        └── Extract relevant source folders

STEP 2: Identify Project Type
        ├── Next.js (app/, pages/)
        ├── React (src/)
        ├── Node.js (src/, lib/)
        └── Generic TypeScript

STEP 3: Apply Standard Learning Protocol
        └── Same as Phase 1-3 above

STEP 4: Tag Source
        └── Mark patterns with [External: repo-name]
```

---

## Integration with Other Agents

### Loading Learned Patterns

All agents MUST include in their memory read:
```
Read .toh/memory/learned-patterns.md alongside:
- active.md
- summary.md
- decisions.md
- architecture.md
- components.md
```

### Applying Learned Patterns

When generating code:
```
1. Check learned patterns for matching category
2. Follow naming conventions from patterns
3. Use same code structure
4. Match import/export style
5. Apply error handling patterns
```

---

## Example Output

After learning from `solar_monitor/solar-dashboard/src/`:

```markdown
# 🎓 Learned Patterns

## Source: solar_monitor
## Learned: 2026-01-10 19:30
## Path: solar-dashboard/src/

### Hook Patterns
| Pattern | Example | When to Use |
|---------|---------|-------------|
| useData + Service | `useSystemSummary` → `systemService.getSummary()` | Data fetching |
| useSocket | `useSocket('telemetry', callback)` | Real-time data |
| Return tuple | `{ data, loading, error, refetch }` | Standard return |

### Service Patterns
| Pattern | Example | When to Use |
|---------|---------|-------------|
| Static methods | `DeviceService.getAll()` | API calls |
| apiClient wrapper | `apiClient.get('/devices')` | HTTP requests |

### Component Patterns
| Pattern | Example | When to Use |
|---------|---------|-------------|
| Card wrapper | `<Card><CardHeader>...<CardContent>` | Dashboard cards |
| Skeleton loading | `<Skeleton className="h-32" />` | Loading states |

### Naming Conventions
| Type | Convention | Example |
|------|------------|---------|
| Hooks | `use{Feature}` | `useDevice`, `useAlarms` |
| Services | `{feature}Service` | `deviceService`, `authService` |
| Pages | `{Feature}.tsx` | `Dashboard.tsx`, `Settings.tsx` |
| Components | `{Feature}{Type}.tsx` | `DeviceCard.tsx`, `AlarmTable.tsx` |

### File Structure
```
src/
├── hooks/           # Custom hooks
├── services/        # API services
├── pages/           # Page components
├── components/      # Reusable UI
│   ├── ui/          # shadcn/ui components
│   └── layout/      # Layout components
└── types/           # TypeScript types
```
```

---

## Quick Reference

### Learn Command Syntax
```bash
/toh-learn                    # Learn from entire codebase
/toh-learn src/hooks          # Learn from specific folder
/toh-learn <github-url>       # Learn from external repo
```

### Memory Files After Learning
```
.toh/memory/
├── active.md
├── summary.md
├── decisions.md
├── architecture.md
├── components.md
└── learned-patterns.md   ← NEW
```
