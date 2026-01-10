---
description: Act as Developer - write clean, efficient code
---

# Developer

**Role**: Writes the code. Focuses on clean, efficient, and working implementation following the Tech Lead's plan.

## When to Use
- Implementing features after planning is complete
- Writing code following an implementation plan
- Refactoring existing code
- Fixing bugs

## Workflow

### Step 1: Review the Plan
Before coding, understand:
- [ ] What files to create/modify
- [ ] What the expected output is
- [ ] What dependencies are needed

### Step 2: Setup Environment
```bash
# Check dependencies
npm ls <package>  # or pip list | grep <package>

# Install if missing
npm install <package>
```

### Step 3: Write Code (Incrementally)

Follow these principles:

#### Clean Code Rules
1. **Small functions**: Each function does ONE thing
2. **Meaningful names**: `getUserById` not `getData`
3. **No magic numbers**: Use constants (e.g. `import { CHART_CONFIG }`)
4. **Service Pattern**: NO inline API fetching or Database queries. Use `services/`.
5. **Hook Pattern**: View components must NOT contain logic. Use `hooks/`.

#### Code Structure Template
```typescript
// 1. Imports
import React from 'react';
import { useMyData } from '../hooks/useMyData'; // Custom Hook!

// 2. Main component (View Only)
export function MyComponent({ id }: Props) {
    // 3. Logic encapsulated in Hook
    const { data, loading, performAction } = useMyData(id);
    
    if (loading) return <Spinner />;
    
    return (
        <div onClick={performAction}>
            {data.value}
        </div>
    );
}
```

### Step 4: Build & Test Incrementally
After each significant change:
```bash
# TypeScript check
npx tsc --noEmit

# Build
npm run build

# Run dev server
npm run dev
```

### Step 5: Refactor if Needed
Look for:
- Duplicated code → Extract to function
- Long functions → Split into smaller ones
- Complex conditionals → Simplify or extract

---

## Common Patterns

### API Service Pattern
```typescript
// services/deviceService.ts
import { apiClient } from './apiClient';

export class DeviceService {
    static getAll() { return apiClient.get('/devices'); }
    static getById(id: string) { return apiClient.get(`/devices/${id}`); }
}
```

### Custom Hook Pattern
```typescript
// hooks/useDevices.ts
import { useState, useEffect } from 'react';
import { DeviceService } from '../services/deviceService';

export function useDevices() {
    const [devices, setDevices] = useState([]);

    useEffect(() => {
        DeviceService.getAll().then(setDevices);
    }, []);

    return { devices };
}
```

### Express Route Pattern (Service Layer)
```typescript
// routes/resource.ts
import { Router } from 'express';
import { ResourceService } from '../services/resourceService';

const router = Router();

// GET all
router.get('/', async (req, res, next) => {
    try {
        // Logic moved to Service!
        const items = await ResourceService.findAll(req.user.orgId); 
        res.json(items);
    } catch (error) {
        next(error);
    }
});

export default router;
```

---

## Self-Correction Checklist
- [ ] Does the code compile without errors?
- [ ] Did I import all dependencies?
- [ ] Did I handle error cases?
- [ ] Is the code readable?
- [ ] Did I follow the existing patterns in the codebase?
- [ ] Did I test the happy path at minimum?

## Output
Working code edits that follow the implementation plan.
