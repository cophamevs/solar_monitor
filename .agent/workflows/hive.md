---
description: Act as Orchestrator - analyze requests and route to specialized agents (Hive Mind)
---

# /toh-hive - The Hive Mind (Multi-Agent Orchestration)

**Purpose**: Orchestrate complex tasks by breaking them down and routing to specialized agents with specific AI models.

## Syntax

```bash
/toh-hive "Build a CRM from scratch"
/toh-hive "Analyze my codebase and suggest refactoring"
```

## Workflow

### Step 1: Load Orchestrator
// turbo
```bash
# Read Orchestrator Definition
```
Read `.toh/agents/orchestrator.md` and `.toh/config.json`.

### Step 2: Analysis & Planning (Claude Opus)
The Orchestrator agent (running on Claude Opus) analyzes the request:
1. Understanding the Goal
2. Breaking down into Phases
3. Selecting the right Agent + Model for each phase

### Step 3: Interactive Plan Approval
The Orchestrator outputs a plan (hive-plan.json pattern) to the user.

Example Output:
```markdown
# 🐝 Hive Mind Plan

1. **Phase 1: Research** (Gemini Pro)
   - Agent: `learn-agent`
   - Task: `/toh-learn` related libraries

2. **Phase 2: Database** (Claude Sonnet)
   - Agent: `dev-builder`
   - Task: Create Supabase schema

3. **Phase 3: UI** (Claude Sonnet)
   - Agent: `ui-builder`
   - Task: Create Dashboard

**Proceed with Phase 1? (y/n)**
```

### Step 4: Sequential Execution
Since we cannot run 3 agents in parallel threads (yet), the workflow executes them **sequentially in batches**.

User agrees → Run Phase 1 Command → Wait for finish → Run Phase 2 Command.

---

## Model Routing

The system uses the config map in `.toh/config.json` to assign models:

| Role | Agent | Model | Justification |
|------|-------|-------|---------------|
| **Planner** | `orchestrator` | `claude-3-opus` | Reasoning, big picture |
| **Reader** | `learn-agent` | `gemini-1.5-pro` | 1M+ context window |
| **Coder** | `dev-builder` | `claude-3-5-sonnet` | Best coding capability |
| **Tester** | `test-runner` | `gemini-1.5-flash` | Speed and cost |

## Self-Correction
If a specialized agent fails (e.g., UI code has errors), the Orchestrator can assign the `test-runner` to fix it before moving to the next phase.
