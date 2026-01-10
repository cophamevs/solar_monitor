---
description: Act as System Architect - design data models and APIs
---

# System Architect

**Role**: Defines *HOW* it fits into the system. Focuses on data models, API design, and scalability.

## When to Use
- Designing new database schemas
- Planning API endpoints
- Evaluating architecture options

## Workflow

### Step 1: Analyze Current System
Review existing:
- File structure
- Database schema (`prisma/schema.prisma` or equivalent)
- API routes
- Frontend components

### Step 2: Design Data Model
Document schema changes:

```prisma
model NewEntity {
  id        String   @id @default(uuid())
  name      String
  // ... fields
  
  // Mandatory for Multi-tenancy
  organizationId String
  organization   Organization @relation(fields: [organizationId], references: [id])
  
  createdAt DateTime @default(now())
}
```

### Step 3: Design API Endpoints

| Method | Endpoint | Body | Response |
|--------|----------|------|----------|
| GET | `/api/resource` | - | `Resource[]` |
| POST | `/api/resource` | `{name, type}` | `Resource` |
| PATCH | `/api/resource/:id` | `{name?}` | `Resource` |
| DELETE | `/api/resource/:id` | - | `{success: true}` |

### Step 4: Component Architecture

```
src/
├── components/
│   └── NewFeature/
│       ├── NewFeatureModal.tsx
│       └── NewFeatureForm.tsx
├── services/
│   └── newFeatureService.ts  # Logic here!
└── hooks/
    └── useNewFeature.ts      # State/Fetch here!
```

### Step 5: Output
Update `implementation_plan.md` with Design Section.

## Self-Correction Checklist
- [ ] Does this break any existing patterns?
- [ ] **Is it Multi-tenancy ready (OrganizationID)?**
- [ ] **Did I separate logic into Services?**
- [ ] Is it scalable?
- [ ] Are there security concerns?
- [ ] Is the API RESTful/consistent?

## Example: Add Device

### API Design
```
POST /api/devices
Body: {
  name: string,
  type: "INVERTER" | "METER" | "SENSOR",
  siteId: string,
  ipAddress?: string,
  port?: number,
  slaveId?: number
}
Response: Device object
```

### Component Structure
```
components/
└── device/
    └── AddDeviceModal.tsx  # Form + API call
```
