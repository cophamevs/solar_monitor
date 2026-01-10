"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MqttService = void 0;
const mqtt_1 = __importDefault(require("mqtt"));
const index_js_1 = require("../index.js");
class MqttService {
    client = null;
    io;
    constructor(io) {
        this.io = io;
        this.connect();
    }
    connect() {
        const brokerUrl = process.env.MQTT_BROKER_URL || 'mqtt://localhost:1883';
        try {
            this.client = mqtt_1.default.connect(brokerUrl);
            this.client.on('connect', () => {
                console.log('✅ Connected to MQTT broker');
                // Subscribe to telemetry topics
                this.client?.subscribe('solar/+/data', (err) => {
                    if (err) {
                        console.error('Failed to subscribe to telemetry topic:', err);
                    }
                    else {
                        console.log('📡 Subscribed to solar/+/data');
                    }
                });
                // Subscribe to device status topics
                this.client?.subscribe('solar/+/status', (err) => {
                    if (err) {
                        console.error('Failed to subscribe to status topic:', err);
                    }
                    else {
                        console.log('📡 Subscribed to solar/+/status');
                    }
                });
            });
            this.client.on('message', async (topic, message) => {
                try {
                    await this.handleMessage(topic, message.toString());
                }
                catch (error) {
                    console.error('Error handling MQTT message:', error);
                }
            });
            this.client.on('error', (error) => {
                console.error('MQTT error:', error);
            });
            this.client.on('offline', () => {
                console.log('MQTT client offline');
            });
        }
        catch (error) {
            console.error('Failed to connect to MQTT broker:', error);
        }
    }
    async handleMessage(topic, message) {
        const parts = topic.split('/');
        if (parts.length < 3)
            return;
        const deviceId = parts[1];
        const messageType = parts[2];
        const payload = JSON.parse(message);
        if (messageType === 'data') {
            await this.handleTelemetry(deviceId, payload);
        }
        else if (messageType === 'status') {
            await this.handleStatus(deviceId, payload);
        }
    }
    async handleTelemetry(deviceId, payload) {
        const timestamp = new Date(payload.timestamp);
        // Save telemetry data
        const telemetryRecords = Object.entries(payload.readings).map(([key, value]) => ({
            time: timestamp,
            deviceId,
            parameterKey: key,
            value: value
        }));
        try {
            await index_js_1.prisma.telemetry.createMany({
                data: telemetryRecords,
                skipDuplicates: true
            });
            // Update device last seen
            await index_js_1.prisma.device.update({
                where: { id: deviceId },
                data: {
                    lastSeen: timestamp,
                    status: 'ONLINE'
                }
            });
            // Emit realtime update to subscribed clients
            this.io.to(`device:${deviceId}`).emit('telemetry_update', {
                deviceId,
                time: timestamp.toISOString(),
                data: payload.readings
            });
            // Check thresholds and create alerts if needed
            await this.checkThresholds(deviceId, payload.readings);
        }
        catch (error) {
            console.error('Error saving telemetry:', error);
        }
    }
    async handleStatus(deviceId, payload) {
        try {
            const status = payload.status.toUpperCase();
            await index_js_1.prisma.device.update({
                where: { id: deviceId },
                data: {
                    status,
                    lastSeen: new Date()
                }
            });
            this.io.emit('device_status', { deviceId, status });
        }
        catch (error) {
            console.error('Error updating device status:', error);
        }
    }
    async checkThresholds(deviceId, readings) {
        // Example threshold checking - customize based on requirements
        const thresholds = {
            temperature: { warning: 60, critical: 80 },
            voltage: { min: 200, max: 260 }
        };
        for (const [key, value] of Object.entries(readings)) {
            let alertLevel = null;
            let message = '';
            if (key === 'temperature') {
                if (value >= thresholds.temperature.critical) {
                    alertLevel = 'CRITICAL';
                    message = `Temperature critical: ${value}°C`;
                }
                else if (value >= thresholds.temperature.warning) {
                    alertLevel = 'WARNING';
                    message = `Temperature high: ${value}°C`;
                }
            }
            if (alertLevel) {
                const device = await index_js_1.prisma.device.findUnique({
                    where: { id: deviceId },
                    include: { site: true }
                });
                if (device) {
                    const alert = await index_js_1.prisma.alert.create({
                        data: {
                            deviceId,
                            siteId: device.siteId,
                            level: alertLevel,
                            message,
                            status: 'OPEN'
                        }
                    });
                    this.io.emit('alert_new', alert);
                }
            }
        }
    }
    disconnect() {
        if (this.client) {
            this.client.end();
            console.log('MQTT client disconnected');
        }
    }
}
exports.MqttService = MqttService;
//# sourceMappingURL=mqtt.js.map