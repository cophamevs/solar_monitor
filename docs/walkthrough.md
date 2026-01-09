# Solar Monitor - Product Walkthrough

This guide provides a comprehensive overview of the Solar Monitor system, including setup instructions and a detailed walkthrough of all product features.

## 1. Project Overview

Solar Monitor is a comprehensive web-based monitoring system for solar power plants. It features real-time data visualization, advanced analytics, and device management capabilities.

**Key Components:**
*   **Frontend**: React (Vite) + TailwindCSS + Zustand + Recharts.
*   **Backend**: Node.js (Express) + Socket.io + Prisma + PostgreSQL.
*   **IoT Layer**: MQTT Broker (Mosquitto) + Simulation Script.

## 2. Prerequisites

Ensure you have the following installed:
*   **Node.js** (v18+)
*   **PostgreSQL** (running on port 5432)
*   **Mosquitto MQTT Broker** (running on port 1883)

## 3. Setup Instructions

### 3.1. Database Setup
1.  Ensure PostgreSQL is running and create a database named `solar_monitor` (or configured in `.env`).
2.  Navigate to `solar-backend` and install dependencies:
    ```bash
    cd solar-backend
    npm install
    ```
3.  Configure `.env` file (if not exists, copy from `.env.example`):
    ```env
    DATABASE_URL="postgresql://user:password@localhost:5432/solar_monitor"
    MQTT_BROKER_URL="mqtt://localhost:1883"
    ```
4.  Run migration and seed data:
    ```bash
    npm run db:push    # Create tables
    npm run db:seed    # Populate with Mock Data (30 days history)
    ```

### 3.2. Frontend Setup
1.  Navigate to `solar-dashboard` and install dependencies:
    ```bash
    cd solar-dashboard
    npm install
    ```

## 4. Running the System

You need to run 3 processes in parallel (separate terminals):

**Terminal 1: Backend**
```bash
cd solar-backend
npm run dev
```
*Server runs on http://localhost:3000*

**Terminal 2: Frontend**
```bash
cd solar-dashboard
npm run dev
```
*Dashboard accessible at http://localhost:5173*

**Terminal 3: MQTT Simulator (Real-time Mock Data)**
```bash
cd solar-backend
npx tsx scripts/mqtt-simulator.ts
```
*This script simulates onsite inverters sending telemetry every 5 seconds.*

## 5. Product Features

This section provides a detailed guide to the application's key modules and features.

### 5.1. System Overview (Dashboard)
The landing page provides a high-level view of your entire portfolio.
*   **KPI Cards**: Real-time metrics for:
    *   **Current Power**: Instantaneous power generation across all plants (kW).
    *   **Yield Today**: Energy produced since midnight (kWh).
    *   **Total Yield**: Lifetime energy production (MWh).
    *   **Status Counts**: Number of plants, online devices, and active alarms.
*   **Plant Status**: Donut chart showing the distribution of plant health (Normal, Warning, Offline).
*   **Alarm Summary**: Breakdown of active alarms by severity (Critical, Major, Minor).
*   **Plant Table**: Searchable list of all solar sites with:
    *   Status indicators (Online/Warning/Offline).
    *   Installed Capacity (kWp).
    *   Connected Devices count.
    *   Active Alarms badge.

### 5.2. Device Management
Drill down into specific hardware assets.
*   **Device List**: Filterable table of all inverters, meters, and sensors.
*   **Device Detail View**:
    *   **Overview Tab**: Static information (Model, SN, IP) and "Quick Stats" cards for 6 key metrics.
    *   **Realtime Tab**: A live dashboard displaying all available telemetry points (Voltage, Current, Power, Frequency) updated every 5 seconds via WebSockets.
    *   **History Tab**: Interactive line charts visualizing 24-hour trends for Power, Voltage, and Temperature using `recharts`.
    *   **Configuration Tab**:
        *   **Connection Settings**: Edit IP address, Port, and Slave ID.
        *   **Modbus Mapping**: View protocol scaling factors (e.g., Reg 40001 = Power * 0.1).

### 5.3. Analytics
Compare performance across different sites over time.
*   **Time Ranges**: Toggle between "Day", "Month", and "Year" views.
*   **Specific Yield Comparison**: Bar chart comparing normalized production (kWh/kWp) to identify underperforming sites regardless of size.
*   **Production Share**: Pie chart showing each site's contribution to the total portfolio generation.
*   **Critical Alerts Density**: Bar chart correlating sites with the number of critical errors, helping prioritize maintenance.
*   **System Availability**: Tabular report showing:
    *   Total Production (kWh).
    *   Downtime Hours.
    *   Availability % (Automatically flagged red if < 98%).

### 5.4. Settings
System-wide configurations and health monitoring.
*   **System Health**: Real-time server stats (CPU Usage, RAM Usage, Disk Space, Uptime) and status of backend services (Database, MQTT Broker, Redis).
*   **Backup & Restore**: Controls to trigger manual DB backups or upload restore files.
*   **Data Retention**: Configure how long to keep high-resolution telemetry data.

## 6. Verification Checklist

### ✅ Dashboard (Real-time)
*   Open **Dashboard** page.
*   **Current Power** should update every 5 seconds.
*   **Today's Yield** should increment slightly with every update.

### ✅ Device Detail (Real-time Chart)
*   Go to **Devices**, select an Inverter (e.g., `Inv-A-01`).
*   Click **Realtime** tab.
*   Initial chart should load 4 hours of history (from DB) immediately.
*   New points should append to the chart every 5 seconds (from Socket.io).

### ✅ Analytics (Historical Data)
*   Go to **Analytics** page.
*   Select "Month" view.
*   Verify that "Specific Yield" and "Production Share" charts display data based on the seeded 30-day history.

### ✅ Alarms
*   Go to **Alarms** page.
*   Verify presence of seeded alerts (Critical, Warning, etc.).

## 7. Architecture Highlights

*   **Logic Layer**: "Headless" implementation using Custom Hooks (`useRealtimeChart`, `useSystemSummary`) and Services (`deviceService`), decoupling logic from UI.
*   **Data Consistency**: Real-time simulator is synchronized with Database logic to ensure "Today's Yield" matches historical aggregations.
*   **Performance**: Uses `date_trunc` for efficient time-series aggregation on standard PostgreSQL.

---
*Created by Antigravity Agent*
