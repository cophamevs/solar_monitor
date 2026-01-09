import React from "react";
import { Button } from "../base/Button";
import { Icon } from "../base/Icon";

interface Site {
    id: string;
    name: string;
}

interface AddDeviceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    sites: Site[];
}

type DeviceType = "INVERTER" | "METER" | "SENSOR";
type Protocol = "MODBUS_TCP" | "MODBUS_RTU" | "IEC104" | "BACNET_IP" | "MELSEC";

interface FormData {
    name: string;
    type: DeviceType;
    protocol: Protocol;
    siteId: string;
    // MODBUS_TCP / IEC104 / BACNET_IP / MELSEC
    ipAddress: string;
    port: number;
    // MODBUS common
    slaveId: number;
    // MODBUS_RTU
    serialPort: string;
    baudRate: number;
    dataBits: number;
    parity: "none" | "even" | "odd";
    stopBits: number;
    // IEC104
    commonAddress: number;
    // BACNET_IP
    deviceInstance: number;
    // MELSEC
    networkNumber: number;
    stationNumber: number;
}

const DEFAULT_PORTS: Record<Protocol, number> = {
    MODBUS_TCP: 502,
    MODBUS_RTU: 0,
    IEC104: 2404,
    BACNET_IP: 47808,
    MELSEC: 5000,
};

export function AddDeviceModal({ isOpen, onClose, onSuccess, sites }: AddDeviceModalProps) {
    const [formData, setFormData] = React.useState<FormData>({
        name: "",
        type: "INVERTER",
        protocol: "MODBUS_TCP",
        siteId: sites[0]?.id || "",
        ipAddress: "",
        port: 502,
        slaveId: 1,
        serialPort: "/dev/ttyUSB0",
        baudRate: 9600,
        dataBits: 8,
        parity: "none",
        stopBits: 1,
        commonAddress: 1,
        deviceInstance: 1,
        networkNumber: 0,
        stationNumber: 255,
    });
    const [loading, setLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    // Update port when protocol changes
    React.useEffect(() => {
        setFormData(prev => ({
            ...prev,
            port: DEFAULT_PORTS[prev.protocol],
        }));
    }, [formData.protocol]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: ["port", "slaveId", "baudRate", "dataBits", "stopBits", "commonAddress", "deviceInstance", "networkNumber", "stationNumber"].includes(name)
                ? Number(value)
                : value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        // Build payload based on protocol
        const payload: Record<string, any> = {
            name: formData.name,
            type: formData.type,
            protocol: formData.protocol,
            siteId: formData.siteId,
        };

        switch (formData.protocol) {
            case "MODBUS_TCP":
                payload.ipAddress = formData.ipAddress;
                payload.port = formData.port;
                payload.slaveId = formData.slaveId;
                break;
            case "MODBUS_RTU":
                payload.serialPort = formData.serialPort;
                payload.baudRate = formData.baudRate;
                payload.dataBits = formData.dataBits;
                payload.parity = formData.parity;
                payload.stopBits = formData.stopBits;
                payload.slaveId = formData.slaveId;
                break;
            case "IEC104":
                payload.ipAddress = formData.ipAddress;
                payload.port = formData.port;
                payload.commonAddress = formData.commonAddress;
                break;
            case "BACNET_IP":
                payload.ipAddress = formData.ipAddress;
                payload.port = formData.port;
                payload.deviceInstance = formData.deviceInstance;
                break;
            case "MELSEC":
                payload.ipAddress = formData.ipAddress;
                payload.port = formData.port;
                payload.networkNumber = formData.networkNumber;
                payload.stationNumber = formData.stationNumber;
                break;
        }

        try {
            const response = await fetch(
                `${import.meta.env.VITE_API_URL || "http://localhost:3000/api"}/devices`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                }
            );

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || "Failed to create device");
            }

            onSuccess();
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to create device");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const isEthernetProtocol = ["MODBUS_TCP", "IEC104", "BACNET_IP", "MELSEC"].includes(formData.protocol);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/50" onClick={onClose} />
            <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg p-6 m-4 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-text-main">Add New Device</h2>
                    <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
                        <Icon name="settings" size={20} className="text-text-sub" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Basic Info */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-text-main mb-1">Device Name *</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="e.g., Inv-A-01"
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-main mb-1">Plant *</label>
                            <select name="siteId" value={formData.siteId} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" required>
                                {sites.map((site) => (
                                    <option key={site.id} value={site.id}>{site.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-main mb-1">Type *</label>
                            <select name="type" value={formData.type} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none">
                                <option value="INVERTER">Inverter</option>
                                <option value="METER">Meter</option>
                                <option value="SENSOR">Sensor</option>
                            </select>
                        </div>
                    </div>

                    {/* Protocol Selection */}
                    <div className="border-t pt-4">
                        <label className="block text-sm font-medium text-text-main mb-2">Communication Protocol *</label>
                        <div className="grid grid-cols-5 gap-2">
                            {(["MODBUS_TCP", "MODBUS_RTU", "IEC104", "BACNET_IP", "MELSEC"] as Protocol[]).map((p) => (
                                <button
                                    key={p}
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, protocol: p }))}
                                    className={`px-2 py-2 text-xs font-medium rounded-lg border transition-colors ${formData.protocol === p
                                            ? "bg-primary text-white border-primary"
                                            : "bg-white text-text-sub border-gray-200 hover:border-primary"
                                        }`}
                                >
                                    {p.replace("_", " ")}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Protocol-Specific Fields */}
                    <div className="border-t pt-4 space-y-4">
                        <p className="text-sm font-medium text-text-main">Connection Settings</p>

                        {/* Ethernet-based protocols */}
                        {isEthernetProtocol && (
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-text-sub mb-1">IP Address *</label>
                                    <input
                                        type="text"
                                        name="ipAddress"
                                        value={formData.ipAddress}
                                        onChange={handleChange}
                                        placeholder="192.168.1.100"
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-text-sub mb-1">Port</label>
                                    <input
                                        type="number"
                                        name="port"
                                        value={formData.port}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                    />
                                </div>
                            </div>
                        )}

                        {/* MODBUS_RTU specific */}
                        {formData.protocol === "MODBUS_RTU" && (
                            <>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm text-text-sub mb-1">Serial Port *</label>
                                        <input
                                            type="text"
                                            name="serialPort"
                                            value={formData.serialPort}
                                            onChange={handleChange}
                                            placeholder="/dev/ttyUSB0"
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-text-sub mb-1">Baud Rate</label>
                                        <select name="baudRate" value={formData.baudRate} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none">
                                            {[9600, 19200, 38400, 57600, 115200].map(b => (
                                                <option key={b} value={b}>{b}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm text-text-sub mb-1">Data Bits</label>
                                        <select name="dataBits" value={formData.dataBits} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg">
                                            <option value={7}>7</option>
                                            <option value={8}>8</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm text-text-sub mb-1">Parity</label>
                                        <select name="parity" value={formData.parity} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg">
                                            <option value="none">None</option>
                                            <option value="even">Even</option>
                                            <option value="odd">Odd</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm text-text-sub mb-1">Stop Bits</label>
                                        <select name="stopBits" value={formData.stopBits} onChange={handleChange} className="w-full px-3 py-2 border border-gray-200 rounded-lg">
                                            <option value={1}>1</option>
                                            <option value={2}>2</option>
                                        </select>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Modbus Slave ID */}
                        {(formData.protocol === "MODBUS_TCP" || formData.protocol === "MODBUS_RTU") && (
                            <div className="w-1/2">
                                <label className="block text-sm text-text-sub mb-1">Slave ID (1-247)</label>
                                <input
                                    type="number"
                                    name="slaveId"
                                    value={formData.slaveId}
                                    onChange={handleChange}
                                    min={1}
                                    max={247}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                />
                            </div>
                        )}

                        {/* IEC104 specific */}
                        {formData.protocol === "IEC104" && (
                            <div className="w-1/2">
                                <label className="block text-sm text-text-sub mb-1">Common Address</label>
                                <input
                                    type="number"
                                    name="commonAddress"
                                    value={formData.commonAddress}
                                    onChange={handleChange}
                                    min={1}
                                    max={65534}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                />
                            </div>
                        )}

                        {/* BACnet specific */}
                        {formData.protocol === "BACNET_IP" && (
                            <div className="w-1/2">
                                <label className="block text-sm text-text-sub mb-1">Device Instance</label>
                                <input
                                    type="number"
                                    name="deviceInstance"
                                    value={formData.deviceInstance}
                                    onChange={handleChange}
                                    min={0}
                                    max={4194302}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                />
                            </div>
                        )}

                        {/* MELSEC specific */}
                        {formData.protocol === "MELSEC" && (
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-text-sub mb-1">Network Number</label>
                                    <input
                                        type="number"
                                        name="networkNumber"
                                        value={formData.networkNumber}
                                        onChange={handleChange}
                                        min={0}
                                        max={255}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-text-sub mb-1">Station Number</label>
                                    <input
                                        type="number"
                                        name="stationNumber"
                                        value={formData.stationNumber}
                                        onChange={handleChange}
                                        min={0}
                                        max={255}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Adding..." : "Add Device"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
