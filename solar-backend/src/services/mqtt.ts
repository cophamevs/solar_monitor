import mqtt, { MqttClient } from 'mqtt';
import { Server } from 'socket.io';
import { prisma } from '../index.js';

interface TelemetryPayload {
    timestamp: string;
    readings: Record<string, number>;
}

export class MqttService {
    private client: MqttClient | null = null;
    private io: Server;

    constructor(io: Server) {
        this.io = io;
        this.connect();
    }

    private connect() {
        const brokerUrl = process.env.MQTT_BROKER_URL || 'mqtt://localhost:1883';

        try {
            this.client = mqtt.connect(brokerUrl);

            this.client.on('connect', () => {
                console.log('✅ Connected to MQTT broker');

                // Subscribe to telemetry topics
                this.client?.subscribe('solar/+/data', (err) => {
                    if (err) {
                        console.error('Failed to subscribe to telemetry topic:', err);
                    } else {
                        console.log('📡 Subscribed to solar/+/data');
                    }
                });

                // Subscribe to device status topics
                this.client?.subscribe('solar/+/status', (err) => {
                    if (err) {
                        console.error('Failed to subscribe to status topic:', err);
                    } else {
                        console.log('📡 Subscribed to solar/+/status');
                    }
                });
            });

            this.client.on('message', async (topic, message) => {
                try {
                    await this.handleMessage(topic, message.toString());
                } catch (error) {
                    console.error('Error handling MQTT message:', error);
                }
            });

            this.client.on('error', (error) => {
                console.error('MQTT error:', error);
            });

            this.client.on('offline', () => {
                console.log('MQTT client offline');
            });

        } catch (error) {
            console.error('Failed to connect to MQTT broker:', error);
        }
    }

    private async handleMessage(topic: string, message: string) {
        const parts = topic.split('/');
        if (parts.length < 3) return;

        const deviceId = parts[1];
        const messageType = parts[2];

        const payload = JSON.parse(message);

        if (messageType === 'data') {
            await this.handleTelemetry(deviceId, payload as TelemetryPayload);
        } else if (messageType === 'status') {
            await this.handleStatus(deviceId, payload);
        }
    }

    private async handleTelemetry(deviceId: string, payload: TelemetryPayload) {
        const timestamp = new Date(payload.timestamp);

        // Save telemetry data
        const telemetryRecords = Object.entries(payload.readings).map(([key, value]) => ({
            time: timestamp,
            deviceId,
            parameterKey: key,
            value: value as number
        }));

        try {
            await prisma.telemetry.createMany({
                data: telemetryRecords,
                skipDuplicates: true
            });

            // Update device last seen
            await prisma.device.update({
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

        } catch (error) {
            console.error('Error saving telemetry:', error);
        }
    }

    private async handleStatus(deviceId: string, payload: { status: string }) {
        try {
            const status = payload.status.toUpperCase() as 'ONLINE' | 'OFFLINE' | 'WARNING' | 'CRITICAL';

            await prisma.device.update({
                where: { id: deviceId },
                data: {
                    status,
                    lastSeen: new Date()
                }
            });

            this.io.emit('device_status', { deviceId, status });

        } catch (error) {
            console.error('Error updating device status:', error);
        }
    }

    private async checkThresholds(deviceId: string, readings: Record<string, number>) {
        // Example threshold checking - customize based on requirements
        const thresholds = {
            temperature: { warning: 60, critical: 80 },
            voltage: { min: 200, max: 260 }
        };

        for (const [key, value] of Object.entries(readings)) {
            let alertLevel: 'WARNING' | 'MAJOR' | 'CRITICAL' | null = null;
            let message = '';

            if (key === 'temperature') {
                if (value >= thresholds.temperature.critical) {
                    alertLevel = 'CRITICAL';
                    message = `Temperature critical: ${value}°C`;
                } else if (value >= thresholds.temperature.warning) {
                    alertLevel = 'WARNING';
                    message = `Temperature high: ${value}°C`;
                }
            }

            if (alertLevel) {
                const device = await prisma.device.findUnique({
                    where: { id: deviceId },
                    include: { site: true }
                });

                if (device) {
                    const alert = await prisma.alert.create({
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

    public disconnect() {
        if (this.client) {
            this.client.end();
            console.log('MQTT client disconnected');
        }
    }
}
