# Solar Monitor 🌞

A complete IoT platform for monitoring and managing distributed solar energy systems. Built with React, Node.js, PostgreSQL, and MQTT.

![Solar Monitor Dashboard](screenshots/website.png)

## Features

- **Real-time Monitoring** - Live power, energy, and device status
- **Energy Flow Visualization** - Animated diagrams showing PV, Grid, Load, Battery flows
- **Historical Analysis** - Charts with 5-second (realtime) and 5-minute (24h) intervals
- **Alert Management** - Multi-level alerts with acknowledgment workflow
- **Multi-device Support** - Modbus TCP/RTU, IEC104, BACnet, MELSEC protocols
- **Reports & Export** - Generate PDF/Excel reports

## Tech Stack

| Component | Technology |
|-----------|------------|
| Frontend | React + TypeScript + Vite + Tailwind |
| Backend | Node.js + Express + Prisma |
| Database | PostgreSQL (TimescaleDB ready) |
| IoT | MQTT (Mosquitto) |
| Container | Docker Compose |

---

## 🚀 Quick Start (Docker) - Just 2 Commands!

### Prerequisites

- Docker & Docker Compose v2+
- Git

### Deploy

```bash
# 1. Clone
git clone https://github.com/cophamevs/solar_monitor.git
cd solar_monitor

# 2. Run (database auto-initializes!)
docker compose up -d
```

**That's it!** Wait ~30 seconds for initialization, then access:

| Service | URL | Credentials |
|---------|-----|-------------|
| **Dashboard** | http://localhost | `admin` / `admin123` |
| **API** | http://localhost:3000/health | - |

> 💡 **For production:** Create `.env` file with secure passwords. See [.env.example](.env.example)

---

## 💻 Development Setup (Without Docker)

### Prerequisites

- Node.js v18+
- PostgreSQL 14+
- MQTT Broker (Mosquitto)

### 1. Install dependencies

```bash
# Backend
cd solar-backend
npm install

# Frontend
cd ../solar-dashboard
npm install
```

### 2. Setup database

```bash
cd solar-backend

# Create .env file
cat > .env << EOF
DATABASE_URL="postgresql://solar:solar123@localhost:5432/solar_monitor"
MQTT_BROKER_URL="mqtt://localhost:1883"
JWT_SECRET="dev-jwt-secret-key-12345"
PORT=3000
EOF

# Run migrations
npx prisma migrate deploy
npx prisma generate

# Seed sample data (optional)
npx prisma db seed
```

### 3. Start services

```bash
# Terminal 1: Start PostgreSQL & Mosquitto
sudo systemctl start postgresql mosquitto

# Terminal 2: Start backend
cd solar-backend
npm run dev

# Terminal 3: Start frontend
cd solar-dashboard
npm run dev

# Terminal 4: Start MQTT simulator (optional)
cd solar-backend
npm exec ts-node scripts/mqtt-simulator.ts
```

### 4. Access the application

| Service | URL |
|---------|-----|
| **Dashboard** | http://localhost:5173 |
| **API** | http://localhost:3000 |

---

## 📁 Project Structure

```
solar_monitor/
├── solar-backend/          # Node.js API server
│   ├── src/
│   │   ├── routes/         # Express routes (thin controllers)
│   │   ├── services/       # Business logic (Service Layer)
│   │   ├── utils/          # Pure utility functions
│   │   └── middleware/     # Auth, error handling
│   ├── prisma/             # Database schema & migrations
│   └── scripts/            # MQTT simulator, seed data
│
├── solar-dashboard/        # React frontend
│   ├── src/
│   │   ├── pages/          # Page components
│   │   ├── components/     # Reusable UI components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── constants/      # Configuration constants
│   │   └── api/            # API client
│   └── public/
│
├── docker-compose.yml      # Production deployment
├── .env.example            # Environment template
└── docs/                   # Architecture documentation
```

---

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DB_PASSWORD` | PostgreSQL password | ✅ |
| `JWT_SECRET` | JWT signing key (32+ chars) | ✅ |
| `PGADMIN_PASSWORD` | PgAdmin login password | ❌ (dev only) |

### Ports

| Port | Service |
|------|---------|
| 80 | Frontend (production) |
| 3000 | Backend API |
| 5173 | Frontend (development) |
| 5432 | PostgreSQL |
| 1883 | MQTT |
| 5050 | PgAdmin (dev) |

---

## 📊 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/summary` | System overview |
| GET | `/api/dashboard/energy-flow/:siteId` | Energy flow data |
| GET | `/api/devices` | List all devices |
| GET | `/api/devices/:id/telemetry` | Device telemetry |
| GET | `/api/alerts` | Alert list |
| POST | `/api/auth/login` | User login |

---

## 🧪 Testing

```bash
# Backend tests
cd solar-backend
npm test

# Frontend build check
cd solar-dashboard
npm run build
```

---

## 📝 License

MIT License - see [LICENSE](LICENSE) for details.

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
