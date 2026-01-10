---
description: Self-learning from codebase - extract patterns and conventions to improve code generation
---

# /toh-learn - Self-Learning Command

**Purpose**: Analyze codebase or external repos to learn patterns, conventions, and best practices. Updates `.toh/memory/learned-patterns.md`.

## Syntax

```bash
/toh-learn                    # Learn from entire project
/toh-learn src/hooks          # Learn from specific folder
/toh-learn <github-url>       # Learn from external repository
```

## Workflow

### Step 1: Load Learn Skill
// turbo
```bash
# Read the learn-skill SKILL.md first
```
Read `.toh/skills/learn-skill/SKILL.md` to understand the full protocol.

### Step 2: Identify Learning Scope

Determine what to analyze based on input:

| Input | Action |
|-------|--------|
| No args | Analyze entire `src/` or project root |
| Folder path | Analyze only that folder |
| GitHub URL | Clone/fetch and analyze |

### Step 3: Sample Files by Category

For each category, select 3-5 representative files:

```
Categories to analyze:
├── Hooks      → src/hooks/*.ts
├── Services   → src/services/*.ts, lib/api/*.ts
├── Components → src/components/**/*.tsx
├── Pages      → src/pages/*.tsx, app/**/page.tsx
└── Types      → src/types/*.ts, types/*.ts
```

### Step 4: Extract Patterns

For each file, identify:
- [ ] Naming conventions (function/variable/file names)
- [ ] Import/export patterns
- [ ] Code structure (order of declarations)
- [ ] Error handling approach
- [ ] State management patterns
- [ ] API integration patterns

### Step 5: Update Memory

Update `.toh/memory/learned-patterns.md` with extracted patterns:

```markdown
# 🎓 Learned Patterns

## Source: {project_name}
## Learned: {YYYY-MM-DD HH:mm}
## Path: {analyzed_path}

### Hook Patterns
| Pattern | Example | When to Use |
|---------|---------|-------------|

### Service Patterns
| Pattern | Example | When to Use |
|---------|---------|-------------|

### Component Patterns
| Pattern | Example | When to Use |
|---------|---------|-------------|

### Naming Conventions
| Type | Convention | Example |
|------|------------|---------|

### File Structure
```

### Step 6: Report Results

Output summary to user:

```
✅ Learning Complete!

📊 Analyzed:
- X hooks
- Y services
- Z components

💾 Saved to: .toh/memory/learned-patterns.md

📝 Key Patterns Found:
- Hooks: use{Feature} pattern
- Services: {feature}Service pattern
- Components: Card + skeleton loading

💡 These patterns will now be applied when generating new code.
```

---

## Example Session

```
User: /toh-learn src/hooks

Agent Response:
📚 **Skills Loaded:**
- learn-skill ✅ (code analysis protocol)

🔍 Analyzing `src/hooks/`...

Found 5 hook files:
- useDevice.ts
- useAlarms.ts
- useSystemSummary.ts
- useTelemetry.ts
- useSocket.ts

📊 **Extracted Patterns:**

### Hook Patterns
| Pattern | Example | When to Use |
|---------|---------|-------------|
| useData + Service | `useSystemSummary` → calls `systemService` | Data fetching |
| Return { data, loading, error } | All hooks return this tuple | Consistent API |
| useEffect cleanup | Socket hooks clean up subscriptions | Subscriptions |

### Naming
- Files: `use{Feature}.ts`
- Functions: `use{Feature}`
- Return type: `{Feature}Data` or inline object

💾 Saved to `.toh/memory/learned-patterns.md`

✅ These patterns will now be used when creating new hooks!
```

---

## Integration

After learning, all agents will:
1. Load `learned-patterns.md` with other memory files
2. Apply patterns when generating matching code types
3. Follow naming conventions from learned patterns
