# Solar Monitoring System - Backend API Specification

## Overview
This document defines the API contract for the Solar Energy Monitoring System backend.
The frontend (React + Vite) will consume these APIs.

---

## 1. Technology Stack

| Component | Technology |
|-----------|------------|
| Runtime | Node.js (LTS) |
| Framework | Express.js + TypeScript |
| Database | PostgreSQL 15 + TimescaleDB |
| ORM | Prisma |
| Realtime | Socket.io |
| MQTT | Eclipse Mosquitto |
| Auth | JWT |

---

## 2. Database Schema

### 2.1 Sites (Plants)
```sql
CREATE TABLE sites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  capacity_kwp DECIMAL(10,2),
  location VARCHAR(255),
  status VARCHAR(20) DEFAULT 'active', -- active, inactive
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 2.2 Devices
```sql
CREATE TABLE devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id UUID REFERENCES sites(id),
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL, -- INVERTER, METER, SENSOR
  protocol VARCHAR(50) NOT NULL, -- MODBUS_TCP, MODBUS_RTU
  ip_address VARCHAR(100),
  port INTEGER DEFAULT 502,
  slave_id INTEGER DEFAULT 1,
  status VARCHAR(20) DEFAULT 'offline', -- online, offline, warning, critical
  last_seen TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 2.3 Modbus Profiles
```sql
CREATE TABLE modbus_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_type VARCHAR(50) NOT NULL,
  name VARCHAR(255),
  registers_map JSONB NOT NULL
  -- Example JSONB:
  -- [
  --   {"name": "power", "address": 40001, "data_type": "uint16", "scale": 0.1, "unit": "kW"},
  --   {"name": "voltage", "address": 40003, "data_type": "uint16", "scale": 0.1, "unit": "V"}
  -- ]
);
```

### 2.4 Telemetry (TimescaleDB Hypertable)
```sql
CREATE TABLE telemetry (
  time TIMESTAMPTZ NOT NULL,
  device_id UUID NOT NULL,
  parameter_key VARCHAR(50) NOT NULL,
  value DOUBLE PRECISION,
  PRIMARY KEY (time, device_id, parameter_key)
);

-- Convert to TimescaleDB hypertable
SELECT create_hypertable('telemetry', 'time');
```

### 2.5 Alerts
```sql
CREATE TABLE alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id UUID REFERENCES devices(id),
  site_id UUID REFERENCES sites(id),
  level VARCHAR(20) NOT NULL, -- critical, major, minor, warning
  message TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'open', -- open, acknowledged, resolved
  acknowledged_by UUID,
  acknowledged_at TIMESTAMPTZ,
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 2.6 Users
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(100) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'operator', -- admin, engineer, operator, viewer
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 3. REST API Endpoints

### 3.1 Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login, returns JWT |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/auth/me` | Get current user |

**Login Request:**
```json
{
  "username": "admin",
  "password": "password123"
}
```

**Login Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid",
    "username": "admin",
    "role": "admin"
  }
}
```

---

### 3.2 Dashboard (System Overview)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/summary` | Global KPIs |
| GET | `/api/dashboard/plant-status` | Plant status distribution |
| GET | `/api/dashboard/alarm-summary` | Alarm distribution |

**Summary Response:**
```json
{
  "currentPower": 295.7,
  "yieldToday": 1750,
  "totalYield": 125800,
  "totalPlants": 4,
  "onlinePlants": 3,
  "totalAlarms": 8
}
```

---

### 3.3 Sites (Plants)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/sites` | List all sites |
| GET | `/api/sites/:id` | Get site details |
| GET | `/api/sites/:id/dashboard` | Site-level KPIs + energy flow |
| GET | `/api/sites/:id/devices` | Devices in site |
| POST | `/api/sites` | Create site |
| PUT | `/api/sites/:id` | Update site |
| DELETE | `/api/sites/:id` | Delete site |

**Site Response:**
```json
{
  "id": "uuid",
  "name": "Plant A - Roof",
  "capacityKwp": 100,
  "location": "Building A",
  "status": "active",
  "currentPower": 78.5,
  "yieldToday": 450,
  "deviceCount": 3,
  "alarmCount": 0
}
```

---

### 3.4 Devices

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/devices` | List all devices |
| GET | `/api/devices/:id` | Device details |
| GET | `/api/devices/:id/telemetry` | Historical data |
| GET | `/api/devices/:id/realtime` | Latest readings |
| POST | `/api/devices` | Create device |
| PUT | `/api/devices/:id` | Update device |
| DELETE | `/api/devices/:id` | Delete device |

**Telemetry Query Params:**
- `start_date`: ISO 8601 (e.g., `2026-01-01T00:00:00Z`)
- `end_date`: ISO 8601
- `interval`: `raw`, `1m`, `5m`, `1h`, `1d`
- `parameters`: comma-separated (e.g., `power,voltage,current`)

**Telemetry Response:**
```json
{
  "deviceId": "uuid",
  "interval": "5m",
  "data": [
    { "time": "2026-01-05T10:00:00Z", "power": 45.2, "voltage": 580 },
    { "time": "2026-01-05T10:05:00Z", "power": 46.1, "voltage": 582 }
  ]
}
```

---

### 3.5 Alerts

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/alerts` | List alerts (paginated, filterable) |
| GET | `/api/alerts/:id` | Alert detail |
| PUT | `/api/alerts/:id/acknowledge` | ACK alert |
| PUT | `/api/alerts/:id/resolve` | Resolve alert |
| PUT | `/api/alerts/:id/comment` | Add comment |

**Alert Query Params:**
- `level`: `critical`, `major`, `minor`, `warning`
- `status`: `open`, `acknowledged`, `resolved`
- `site_id`: UUID
- `start_date`, `end_date`: ISO 8601
- `page`, `limit`: pagination

---

### 3.6 Modbus Profiles

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/modbus-profiles` | List profiles |
| GET | `/api/modbus-profiles/:id` | Profile detail |
| POST | `/api/modbus-profiles` | Create profile |
| PUT | `/api/modbus-profiles/:id` | Update profile |

---

### 3.7 Reports

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/reports/daily` | Daily report data |
| GET | `/api/reports/monthly` | Monthly report data |
| GET | `/api/reports/custom` | Custom date range |
| GET | `/api/reports/export` | Export as Excel/PDF |

**Report Query Params:**
- `site_id`: UUID (optional, all sites if omitted)
- `start_date`, `end_date`: ISO 8601
- `format`: `json`, `xlsx`, `pdf`

---

### 3.8 Analytics API
**Base Path:** `/api/analytics`

#### GET /compare
Compare performance across sites.

**Parameters:**
- `time_range`: 'day' | 'month' | 'year' (default: 'day')
- `date`: ISO Date string (optional, defaults to now)

**Response:**
```json
{
  "timeRange": "day",
  "date": "2026-01-05T00:00:00.000Z",
  "sites": [
    {
      "id": "uuid",
      "name": "Plant A",
      "capacityKwp": 100,
      "specificYield": 4.2, // kWh/kWp
      "production": 420, // kWh
      "productionShare": 32.5, // %
      "criticalAlerts": 2,
      "downtimeHours": 0.5,
      "availability": 99.1 // %
    }
  ]
}
```

---

### 3.9 System Settings

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/settings/system-health` | CPU, RAM, Disk |
| GET | `/api/settings/data-retention` | Current retention settings |
| PUT | `/api/settings/data-retention` | Update retention |
| POST | `/api/settings/backup` | Trigger manual backup |
| GET | `/api/settings/backups` | List backups |

---

## 4. MQTT Topics

### 4.1 Telemetry Ingestion
```
solar/{device_id}/data
```

**Payload Example:**
```json
{
  "timestamp": "2026-01-05T19:58:30Z",
  "readings": {
    "power": 4520,
    "voltage": 5805,
    "current": 152,
    "energy_today": 28500
  }
}
```

### 4.2 Device Status
```
solar/{device_id}/status
```

**Payload:**
```json
{
  "status": "online",
  "timestamp": "2026-01-05T19:58:30Z"
}
```

### 4.3 Commands (to device)
```
solar/{device_id}/cmd
```

---

## 5. WebSocket Events (Socket.io)

| Event | Direction | Description |
|-------|-----------|-------------|
| `telemetry_update` | Server → Client | New telemetry data |
| `alert_new` | Server → Client | New alert created |
| `alert_update` | Server → Client | Alert status changed |
| `device_status` | Server → Client | Device online/offline |
| `subscribe_device` | Client → Server | Subscribe to device updates |
| `unsubscribe_device` | Client → Server | Unsubscribe |

**telemetry_update Payload:**
```json
{
  "deviceId": "uuid",
  "time": "2026-01-05T19:58:30Z",
  "data": { "power": 45.2, "voltage": 580 }
}
```

---

## 6. Docker Compose Structure

```yaml
version: '3.8'
services:
  postgres:
    image: timescale/timescaledb:latest-pg15
    environment:
      POSTGRES_DB: solar_monitor
      POSTGRES_USER: solar
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  mosquitto:
    image: eclipse-mosquitto:2
    volumes:
      - ./mosquitto/config:/mosquitto/config
      - mosquitto_data:/mosquitto/data
    ports:
      - "1883:1883"
      - "9001:9001"

  backend:
    build: ./backend
    environment:
      DATABASE_URL: postgresql://solar:${DB_PASSWORD}@postgres:5432/solar_monitor
      MQTT_BROKER: mqtt://mosquitto:1883
      JWT_SECRET: ${JWT_SECRET}
    ports:
      - "3000:3000"
    depends_on:
      - postgres
      - mosquitto

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  postgres_data:
  mosquitto_data:
```

---

## 7. Data Ingestion Flow

```
┌─────────────┐     MQTT      ┌─────────────┐
│   Devices   │──────────────▶│  Mosquitto  │
│ (Inverters) │               │   Broker    │
└─────────────┘               └──────┬──────┘
                                     │
                                     ▼
                              ┌─────────────┐
                              │   Backend   │
                              │  (Node.js)  │
                              └──────┬──────┘
                                     │
                    ┌────────────────┼────────────────┐
                    ▼                ▼                ▼
             ┌───────────┐   ┌───────────┐   ┌───────────┐
             │ Telemetry │   │  Alerts   │   │ Socket.io │
             │   Table   │   │   Table   │   │  Clients  │
             └───────────┘   └───────────┘   └───────────┘
```

---

## 8. Error Response Format

```json
{
  "error": {
    "code": "DEVICE_NOT_FOUND",
    "message": "Device with ID xyz not found",
    "details": {}
  }
}
```

HTTP Status Codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `500`: Internal Server Error
