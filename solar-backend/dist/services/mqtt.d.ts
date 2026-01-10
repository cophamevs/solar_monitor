import { Server } from 'socket.io';
export declare class MqttService {
    private client;
    private io;
    constructor(io: Server);
    private connect;
    private handleMessage;
    private handleTelemetry;
    private handleStatus;
    private checkThresholds;
    disconnect(): void;
}
//# sourceMappingURL=mqtt.d.ts.map