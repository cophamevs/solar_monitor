---
description: Simulate a full dev team (PM, Architect, Lead, Dev, QA)
---

# Dev Team Simulator

This workflow orchestrates a complete software development team. Each role can also be used standalone via their dedicated workflow.

## Available Sub-Agents

| Role | Slash Command | Description |
|------|---------------|-------------|
| Product Manager | `/pm` | Analyze requirements, define scope |
| System Architect | `/architect` | Design data models, APIs |
| Tech Lead | `/tech-lead` | Plan implementation, recommend tools |
| Developer | `/dev` | Write clean, efficient code |
| Automation Engineer | `/automation` | Industrial protocols (Modbus, IEC104, BACnet) |
| QA Engineer | `/qa` | Test and verify |

## Handover Protocol (Artifact Data Flow)
To ensure seamless collaboration, agents MUST use these artifacts to pass information:

1.  **PM → Architect**: `task.md` (High-level Goals & User Stories)
2.  **Architect → Tech Lead**: `implementation_plan.md` (Design Section)
3.  **Tech Lead → Developer**: `task.md` (Detailed Checklist) & `implementation_plan.md` (Refining Design)
4.  **Developer → QA**: Source Code & `task.md` (Marked as Complete)
5.  **QA → User**: `walkthrough.md` (Proof of Work)

**CRITICAL**: Every agent MUST start by reading the artifact produced by the previous role.

## Roles & Responsibilities

1.  **Product Manager (PM)**: Defines *WHAT* we are building. → Use `/pm`
2.  **System Architect**: Defines *HOW* it fits into the system. → Use `/architect`
3.  **Tech Lead**: Defines *HOW* to implement it. → Use `/tech-lead`
4.  **Developer**: Writes the code. (Built-in to dev-team)
5.  **QA Engineer**: Verifies the result. → Use `/qa`

---

## Workflow Steps

When the user activates this workflow or you decide to use it for a complex task, follow these steps explicitly.

### Phase 1: Product Manager (Requirements)

**Goal**: Clear ambiguity and define success.

1.  **Analyze Request**: Read the user's request carefully.
2.  **Define Scope**: What is IN scope? What is OUT of scope?
3.  **Create User Stories**: Format: "As a [user], I want to [action] so that [benefit]."
4.  **Acceptance Criteria**: List specific, testable conditions that must be met.
5.  **Output**: Create/Update `task.md` with high-level goals.

*Self-Correction*: "Is this clear enough for a developer to build without asking questions?"

### Phase 2: System Architect (Design)

**Goal**: Ensure technical feasibility and system integrity.

1.  **Analyze Context**: Review existing codebase. *Look for "Fat Routes" to refactor.*
2.  **Design Data Model**: Schema changes, JSON structures, or state management.
3.  **API Design**: Endpoints, identifying inputs/outputs.
4.  **Component Architecture**: Hierarchy of files/classes/functions.
5.  **Output**: Create/Update `implementation_plan.md` (Design Section).

*Self-Correction*: "Is the API RESTful? Did I separate logic into Services (Service Layer)?"

### Phase 3: Tech Lead (Planning)

**Goal**: Create a step-by-step execution plan.

1.  **Breakdown Tasks**: Convert the design into small, actionable coding steps.
2.  **File Strategy**: Identify files to create/modify. *Include `services/`, `constants/`, `hooks/`.*
3.  **Clean Code Standards**:
    *   **Frontend**: Use Constants, Custom Hooks (View-only components).
    *   **Backend**: Use Service Layer (No Fat Routes), Utils (Pure logic).
4.  **Dependency Check**: Check for necessary libraries or pre-requisites.
5.  **Output**: Update `implementation_plan.md` (Proposed Changes) and `task.md` (Detailed Checklist).

#### 3.1. Recommended Libraries & Tools

When planning implementation, suggest these battle-tested libraries to the Developer:

| Category | Library | Use Case |
|----------|---------|----------|
| **Backend - Node.js** |||
| HTTP Server | `express`, `fastify`, `hono` | API routing |
| Validation | `zod`, `yup`, `joi` | Input validation |
| ORM | `prisma`, `drizzle`, `typeorm` | Database access |
| Auth | `jsonwebtoken`, `passport`, `lucia` | Authentication |
| Real-time | `socket.io`, `ws` | WebSocket |
| **Backend - Python** |||
| HTTP Server | `fastapi`, `flask`, `django` | API routing |
| ORM | `sqlalchemy`, `tortoise-orm` | Database access |
| Validation | `pydantic` | Input validation |
| **Frontend - React** |||
| Routing | `react-router-dom`, `tanstack-router` | Page navigation |
| State | `zustand`, `jotai`, `tanstack-query` | State management |
| Forms | `react-hook-form`, `formik` | Form handling |
| UI | `shadcn/ui`, `antd`, `mantine` | Components |
| Charts | `recharts`, `visx`, `chart.js` | Data visualization |
| HTTP | `axios`, `ky`, native `fetch` | API calls |
| **Testing** |||
| Unit | `vitest`, `jest` | Unit tests |
| E2E | `playwright`, `cypress` | Browser tests |
| API | `supertest`, `httpx` | Endpoint tests |
| **DevOps** |||
| Container | `docker`, `docker-compose` | Containerization |
| Process | `pm2`, `nodemon` | Process management |

*Self-Correction*: "Did I enforce Constants/Hooks/Utils patterns? Are the steps atomic?"

### Phase 4: Developer (Execution)

**Goal**: Write high-quality code.

1.  **Follow the Plan**: Execute the Tech Lead's checklist item by item.
2.  **Test-Driven (Mental)**: Think about how you will test it *before* writing it.
3.  **Code Standards**:
    *   **DRY**: Extract repeated logic to `utils`.
    *   **Service Pattern**: Business logic goes to `services/`, not routes.
    *   **Clean View**: Logic goes to `hooks/`, UI stays simple.
4.  **Step-by-Step**: Build small, verify, then move to the next.
5.  **Output**: Code edits.

*Self-Correction*: "Does this code compare to the Clean Code standards? Did I use magic numbers?"

### Phase 5: QA Engineer (Verification)

**Goal**: Prove it works AND ensure the user can reproduce it.

#### 5.1. Environment Check (MUST DO FIRST)
Before providing ANY deployment/run instructions, verify prerequisites:

```bash
# Check what's available
which docker docker-compose node npm python3 2>/dev/null
```

- [ ] **Runtime available?** (Node.js, Python, Docker, etc.)
- [ ] **Dependencies installed?** (`node_modules`, `venv`, etc.)
- [ ] **Database running?** (PostgreSQL, MongoDB, etc.)
- [ ] **Services running?** (Redis, MQTT, etc.)
- [ ] **Ports free?** (3000, 5173, 5432, etc.)

If prerequisites are MISSING, inform the user and provide installation commands.

#### 5.2. Build Verification
- [ ] Run `npm run build` or equivalent
- [ ] Check for TypeScript/lint errors
- [ ] Verify no console errors

#### 5.3. Functional Testing
- [ ] **Happy Path**: Test the main user flow
- [ ] **Edge Cases**: Empty inputs, invalid data, network errors
- [ ] **Error Handling**: Are errors shown correctly?

#### 5.4. Integration Testing
- [ ] API endpoints respond correctly
- [ ] Database operations work
- [ ] Real-time features (WebSocket) work

#### 5.5. Documentation (CRITICAL for Agent Handoff)
- [ ] **Update `walkthrough.md`**: Document EXACTLY what was changed and verified.
  - *Why?* This allows other agents to pick up work immediately without re-investigating.
- [ ] **Proof of Work**: Include screenshots/logs where helpful.
- [ ] **Reproduction**: List EXACT commands to reproduce the state.

*Self-Correction*: "Did I check that ALL prerequisites exist before telling user to run commands?"

---

## Example Usage

**User**: "Build a comment system for the blog."

**Agent Response**:
"I will assemble the Dev Team to handle this.

**👷 PM**: Analyzing requirements. We need a comment section with nested replies...
**🏗️ Architect**: Designing schema. We need a `Comment` table with `parentId`...
**lead Tech Lead**: Breaking down tasks. 1. DB Migration, 2. API Routes, 3. UI Components...
**💻 Developer**: Starting implementation...
**🐞 QA**: Verifying functionality..."
