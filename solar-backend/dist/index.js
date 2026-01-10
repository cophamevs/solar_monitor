"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = exports.prisma = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const client_1 = require("@prisma/client");
const dotenv_1 = __importDefault(require("dotenv"));
const auth_js_1 = __importDefault(require("./routes/auth.js"));
const dashboard_js_1 = __importDefault(require("./routes/dashboard.js"));
const sites_js_1 = __importDefault(require("./routes/sites.js"));
const devices_js_1 = __importDefault(require("./routes/devices.js"));
const alerts_js_1 = __importDefault(require("./routes/alerts.js"));
const analytics_js_1 = __importDefault(require("./routes/analytics.js"));
const errorHandler_js_1 = require("./middleware/errorHandler.js");
const mqtt_js_1 = require("./services/mqtt.js");
dotenv_1.default.config();
const app = (0, express_1.default)();
const httpServer = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:5173',
        methods: ['GET', 'POST']
    }
});
exports.io = io;
exports.prisma = new client_1.PrismaClient();
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Routes
app.use('/api/auth', auth_js_1.default);
app.use('/api/dashboard', dashboard_js_1.default);
app.use('/api/sites', sites_js_1.default);
app.use('/api/devices', devices_js_1.default);
app.use('/api/alerts', alerts_js_1.default);
app.use('/api/analytics', analytics_js_1.default);
// Health check
app.get('/health', (_, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
// Error handler
app.use(errorHandler_js_1.errorHandler);
// Socket.io connection
io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`);
    socket.on('subscribe_device', (deviceId) => {
        socket.join(`device:${deviceId}`);
        console.log(`Client ${socket.id} subscribed to device ${deviceId}`);
    });
    socket.on('unsubscribe_device', (deviceId) => {
        socket.leave(`device:${deviceId}`);
    });
    socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);
    });
});
// Start MQTT service
const mqttService = new mqtt_js_1.MqttService(io);
const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
    console.log(`🚀 Solar Backend running on port ${PORT}`);
    console.log(`📡 WebSocket server ready`);
});
// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM received, shutting down...');
    await exports.prisma.$disconnect();
    mqttService.disconnect();
    httpServer.close();
    process.exit(0);
});
//# sourceMappingURL=index.js.map