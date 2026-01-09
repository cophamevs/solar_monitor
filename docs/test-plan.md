# Solar Monitoring System - Feature Test Plan

## Test Environment
- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:3000
- **Database**: PostgreSQL (localhost:5432)
- **MQTT**: Mosquitto (localhost:1883)

---

## 1️⃣ Dashboard (System Overview)

### 1.1 KPI Bar
| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| TC-D01 | Load Dashboard | 6 KPI cards display (Current Power, Yield Today, Total Yield, Plants, Online, Alarms) |
| TC-D02 | Wait 30 seconds | KPI values auto-refresh |
| TC-D03 | API returns error | Show error state or fallback values |

### 1.2 Status Donut Charts
| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| TC-D04 | Load Dashboard | Plant Status donut shows Normal/Warning/Offline distribution |
| TC-D05 | Load Dashboard | Alarm Summary donut shows Critical/Major/Minor/Warning counts |
| TC-D06 | Hover on donut segment | Tooltip shows count and percentage |

### 1.3 Plant Table
| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| TC-D07 | Load Dashboard | Table shows all plants with Status, Name, Capacity, Devices, Alarms |
| TC-D08 | Type in search box | Table filters by plant name |
| TC-D09 | Click Status dropdown | Table filters by selected status |
| TC-D10 | Click plant name | Navigate to Plant Overview (future) |

---

## 2️⃣ Plants (Plant Overview)

### 2.1 Site Selection
| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| TC-P01 | Load Plants page | First plant auto-selected |
| TC-P02 | Click site dropdown | Show all available plants |
| TC-P03 | Select different plant | Page reloads with selected plant data |

### 2.2 KPI Row
| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| TC-P04 | Load Plants page | Shows Capacity, Devices, Online, Alarms for selected plant |

### 2.3 Energy Flow Diagram
| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| TC-P05 | Load Plants page | Energy Flow diagram renders with PV, Grid, Load nodes |
| TC-P06 | Observe animation | Flow lines animate correctly |

### 2.4 Alarm Summary Panel
| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| TC-P07 | Plant has open alarms | Critical/Warning counts display with recent alarm list |
| TC-P08 | Plant has no alarms | "No active alarms" message with checkmark icon |

### 2.5 Device List
| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| TC-P09 | Load Plants page | Table shows devices belonging to selected plant |
| TC-P10 | Click device name | Navigate to Device Detail page |

---

## 3️⃣ Devices (Device Management)

### 3.1 Device Stats
| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| TC-DV01 | Load Devices page | Shows count cards for Inverters, Meters, Sensors, Online |

### 3.2 Device Table
| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| TC-DV02 | Load Devices page | Table shows all devices with Status, Name, Plant, Type, Protocol, Last Seen, Alarms |
| TC-DV03 | Type in search box | Table filters by device name |
| TC-DV04 | Select type filter | Table filters by device type (Inverter/Meter/Sensor) |
| TC-DV05 | Click device name | Navigate to Device Detail page |

### 3.3 Device Detail - Overview Tab
| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| TC-DV06 | Click device → Overview | Shows Device Information (Name, Type, Protocol, IP, Port, Slave ID, Status) |
| TC-DV07 | Check Quick Stats | Shows 6 realtime measurements |

### 3.4 Device Detail - Realtime Tab
| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| TC-DV08 | Click Realtime tab | Shows all telemetry parameters in grid |
| TC-DV09 | Wait 5 seconds | Values auto-refresh |
| TC-DV10 | Device offline | Show "No realtime data available" |

### 3.5 Device Detail - History Tab
| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| TC-DV11 | Click History tab | Shows Power/Voltage/Temperature chart (last 24h) |
| TC-DV12 | No history data | Show "No history data available" |

### 3.6 Device Detail - Configuration Tab
| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| TC-DV13 | Click Configuration tab | Shows Connection Settings form (IP, Port, Slave ID) |
| TC-DV14 | View Modbus Mapping | Shows register mapping table |

---

## 4️⃣ Alarms (Alarm Management)

### 4.1 Alarm Summary Cards
| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| TC-A01 | Load Alarms page | 4 cards show Critical/Major/Minor/Warning counts |

### 4.2 Filter Bar
| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| TC-A02 | Select level filter | Table shows only alarms of selected level |
| TC-A03 | Select status filter | Table shows only alarms of selected status (Open/Acknowledged/Resolved) |
| TC-A04 | Clear filters | Table shows all alarms |

### 4.3 Alarm Table
| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| TC-A05 | Load Alarms page | Table shows Time, Plant, Device, Level, Message, Status, Actions |
| TC-A06 | Open alarm visible | ACK button (checkmark) appears in Actions column |
| TC-A07 | Click ACK button | Alarm status changes to ACKNOWLEDGED |
| TC-A08 | After ACK | ACK button disappears, status updates |

---

## 5️⃣ Reports

### 5.1 Report Configuration
| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| TC-R01 | Load Reports page | Report Type selector shows Daily/Monthly/Custom |
| TC-R02 | Select report type | UI updates accordingly |
| TC-R03 | Select plant | Dropdown shows all plants |
| TC-R04 | Select date range | Date pickers work correctly |
| TC-R05 | Toggle metrics checkboxes | Checkboxes are interactive |

### 5.2 Report Preview
| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| TC-R06 | Click "Generate Report" | Loading state shows, then preview renders |
| TC-R07 | View preview | Shows Total Generation, Consumption, Export, Self-use ratio |
| TC-R08 | View daily breakdown table | Table shows date, generation, consumption, export |

### 5.3 Export
| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| TC-R09 | Click Excel button | (Future) Downloads .xlsx file |
| TC-R10 | Click PDF button | (Future) Downloads .pdf file |

---

## 6️⃣ Settings

### 6.1 Tab Navigation
| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| TC-S01 | Load Settings page | System Health tab selected by default |
| TC-S02 | Click Backup tab | Backup content displays |
| TC-S03 | Click Data Retention tab | Data Retention content displays |

### 6.2 System Health
| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| TC-S04 | View Resource Usage | CPU, RAM, Disk progress bars display |
| TC-S05 | View Services | List shows PostgreSQL, MQTT, Backend status |

### 6.3 Backup & Restore
| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| TC-S06 | Click "Backup Now" | (Future) Creates backup |
| TC-S07 | Toggle Auto Backup | Switch toggles on/off |
| TC-S08 | View backup history | Table shows Date, Size, Type, Status |

### 6.4 Data Retention
| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| TC-S09 | Adjust Raw Data slider | Value updates (1-365 days) |
| TC-S10 | Select Aggregated retention | Dropdown works (1m/3m/6m/1y/Forever) |
| TC-S11 | Click "Save Changes" | (Future) Saves settings |

---

## 7️⃣ Cross-Cutting Features

### 7.1 Navigation
| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| TC-X01 | Click each sidebar item | Correct page loads |
| TC-X02 | Active tab highlighted | Current page highlighted in sidebar |

### 7.2 Loading States
| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| TC-X03 | Slow network | Skeleton loading states appear |
| TC-X04 | Data loaded | Skeletons replaced with real content |

### 7.3 Error Handling
| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| TC-X05 | Backend down | Error message or empty state shows |
| TC-X06 | Refresh page | Retry fetches data |

### 7.4 Responsiveness
| Test Case | Steps | Expected Result |
|-----------|-------|-----------------|
| TC-X07 | Resize to mobile (< 768px) | Layout adapts, sidebar collapses |
| TC-X08 | Resize to tablet (768-1024px) | Grid columns adjust |

---

## API Verification

| Endpoint | Method | Test |
|----------|--------|------|
| `/api/dashboard/summary` | GET | Returns KPI data |
| `/api/dashboard/plant-status` | GET | Returns status counts |
| `/api/dashboard/alarm-summary` | GET | Returns alarm counts |
| `/api/sites` | GET | Returns site list |
| `/api/sites/:id` | GET | Returns site with devices/alerts |
| `/api/devices` | GET | Returns device list |
| `/api/devices/:id` | GET | Returns device detail |
| `/api/devices/:id/telemetry` | GET | Returns history data |
| `/api/devices/:id/realtime` | GET | Returns latest readings |
| `/api/alerts` | GET | Returns paginated alerts |
| `/api/alerts/:id/acknowledge` | PUT | Updates alert status |
| `/api/auth/login` | POST | Returns JWT token |

---

## Quick Smoke Test Checklist

- [ ] Dashboard loads with data
- [ ] Plants page shows energy flow
- [ ] Devices table populated
- [ ] Device detail shows tabs
- [ ] Alarms table with ACK working
- [ ] Reports preview generates
- [ ] Settings tabs switch correctly
- [ ] Backend health check passes
- [ ] No console errors
