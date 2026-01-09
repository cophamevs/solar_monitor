I. PHÂN TÍCH NHANH LOGIC PHẦN MỀM TRONG ẢNH (FusionSolar)

FusionSolar đang dùng 3 tầng UX chính:

Level 0 – Global Overview (đa plant)
Level 1 – Plant Overview (1 plant)
Level 2 – Device / Energy Detail


👉 Đây là logic rất đúng cho hệ giám sát năng lượng, và mình sẽ giữ lại flow này.

II. UX FLOW TỔNG THỂ (ON-PREMISE VERSION)
1. Global Flow (từ đăng nhập)
Login
 └── System Overview
      ├── Plant List
      │    └── Plant Overview
      │         ├── Energy Flow
      │         ├── Energy Charts
      │         ├── Alarm Summary
      │         ├── Device List
      │         │    └── Device Detail
      │         └── Reports
      ├── Alarms (Global)
      ├── Reports (Global)
      ├── Device Management
      └── System Settings


👉 Flow này giữ 100% logic vận hành của FusionSolar nhưng đơn giản hơn.

III. TEMPLATE UX/UI CHI TIẾT TỪNG MÀN HÌNH

(Mình viết theo dạng wireframe logic, dev có thể code thẳng)

1️⃣ SYSTEM OVERVIEW (TƯƠNG ĐƯƠNG “HOME”)
🎯 Mục tiêu UX

Nhìn 5 giây biết: hệ thống đang ổn không? plant nào có vấn đề?

🔲 Layout Template
[ Top KPI Bar ]
--------------------------------------------------
| Current Power | Yield Today | Total Yield |
| Total Plants  | Online | Alarm |
--------------------------------------------------

[ Plant Status Donut ]      [ Alarm Donut ]
--------------------------------------------------
| Normal | Faulty | Offline | Critical/Major |
--------------------------------------------------

[ Plant Filter ]
--------------------------------------------------
| Plant name | Region | Device type | Search |
--------------------------------------------------

[ Plant Table ]
--------------------------------------------------
| Status | Plant | Capacity | Power | Yield |
| Alarm  | Grid date | Action(View) |
--------------------------------------------------

🔁 UX Flow

Click Plant name → Plant Overview

Click Alarm donut → Alarm list (global)

Click Status icon → Filter plant list

2️⃣ PLANT OVERVIEW (MÀN QUAN TRỌNG NHẤT)

👉 Đây là màn hình thứ 2 bạn gửi
👉 Là xương sống của hệ thống

2.1 Header KPI (copy logic, không copy style)
[ Yield Today ] [ Total Yield ] [ Consumption Today ] [ Consumed from PV ]


Tooltip giải thích rõ (operator rất cần)

Giá trị realtime / last update time

2.2 ENERGY FLOW DIAGRAM (CORE UX)
          [ PV ]
           |
           |  PV Power
           |
[ Load ] ——┼—— [ Grid ]

Logic hiển thị:

Mũi tên động (màu):

Xanh: PV → Load

Cam: Grid → Load

Xám: Không dòng

Click vào PV / Load / Grid → popup chi tiết

👉 BẮT BUỘC CÓ cho on-premise năng lượng.

2.3 Environmental Impact (Optional – có thể giữ)
[ Coal saved ]   [ CO₂ avoided ]   [ Equivalent trees ]


👉 Có giá trị trình bày cho quản lý / chủ đầu tư
👉 Không ảnh hưởng vận hành

2.4 Alarm Summary (Plant level)
Alarm
---------------------------------
Critical | Major | Minor | Warning
---------------------------------


Click → danh sách alarm plant

Có ACK / comment (on-premise rất cần)

3️⃣ ENERGY MANAGEMENT (CHART – RẤT QUAN TRỌNG)
Template
[ Day | Month | Year | Lifetime ]   [ Date Picker ]

[ Energy Balance Bar ]
PV Generated | Fed to Grid | Consumed | From Grid

[ Power Chart ]
-----------------------------------
| PV Output (line)                |
| Load Consumption (line)         |
| From Grid (line)                |
-----------------------------------

UX logic

Zoom theo thời gian

Toggle từng line

Export CSV

4️⃣ DEVICE LIST (PLANT LEVEL)
Template
| Status | Device | Type | Protocol | Power | Last Update |
| Alarm  | Action(View) |

UX Flow

Click Device → Device Detail

Icon màu:

Xanh: online

Vàng: warning

Đỏ: alarm

Xám: offline

5️⃣ DEVICE DETAIL (KỸ SƯ RẤT CẦN)
Tabs
[ Overview | Realtime | History | Configuration ]

Overview

SN

Protocol (Modbus TCP/RTU)

IP / Unit ID

Status

Realtime
| Voltage | Current | Power | Energy |

History

Chart theo thời gian

Configuration (Admin only)

Mapping Modbus

Scale

Enable/Disable point

6️⃣ ALARM MANAGEMENT (GLOBAL & PLANT)
Template
| Time | Plant | Device | Level | Message | Status |


Actions:

Acknowledge

Comment

Filter theo level / thời gian

👉 On-premise rất cần log & ack

7️⃣ REPORTS
Template
Report Type:
[ Daily | Monthly | Custom ]

Filter:
[ Plant ] [ Date Range ]

Output:
[ Preview ] [ Export Excel ] [ Export PDF ]

8️⃣ SYSTEM SETTINGS (ON-PREMISE ONLY)
Tabs
- Network
- Device Protocol
- Data Retention
- Backup
- User & Role


Ví dụ:

Retention raw data: 90 ngày

Backup local → NAS

IV. UX FLOW THEO VAI TRÒ
Operator

Dashboard

Plant Overview

Alarm

Device realtime

Engineer

Device config

Mapping Modbus

History

Manager

KPI

Reports

Energy balance