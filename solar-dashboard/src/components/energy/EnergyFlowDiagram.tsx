import React from "react";
import { Icon } from "../base/Icon";
import { cn } from "../../utils/cn";

export interface EnergyFlowData {
    pv: number;
    grid: number;
    load: number;
    battery: number;
    soc: number;
}

interface EnergyNodeProps {
    type: "pv" | "grid" | "load" | "battery" | "inverter";
    label: string;
    value: string;
    subLabel?: string;
    status?: "active" | "inactive" | "error";
    xPct: number; // Percentage 0-100
    yPct: number; // Percentage 0-100
    width: number; // Fixed px for card content
    height: number; // Fixed px for card content
}

function EnergyNode({ type, label, value, subLabel, status = "active", xPct, yPct, width, height }: EnergyNodeProps) {
    const iconMap: Record<string, any> = {
        pv: "pv",
        grid: "grid",
        load: "load",
        battery: "battery",
        inverter: "device"
    };

    const colorMap: Record<string, string> = {
        pv: "text-success bg-success/10 border-success/20",
        grid: "text-warning bg-warning/10 border-warning/20",
        load: "text-primary bg-primary/10 border-primary/20",
        battery: "text-secondary bg-secondary/10 border-secondary/20",
        inverter: "text-text-main bg-white border-gray-200"
    };

    return (
        <div
            className={cn(
                "absolute flex flex-col items-center justify-center p-2 rounded-xl border shadow-sm transition-all duration-300 bg-white z-10",
                status === "active" ? colorMap[type] : "bg-gray-50 border-gray-100 text-gray-400"
            )}
            style={{
                left: `${xPct}%`,
                top: `${yPct}%`,
                width: `${width}px`,
                height: `${height}px`,
                transform: 'translate(-50%, -50%)'
            }}
        >
            <div className={cn(
                "p-1.5 rounded-full mb-1",
                status === "active" ? "bg-white/80 shadow-sm" : "bg-gray-100"
            )}>
                <Icon name={iconMap[type]} size={20} className={cn(
                    status === "active" ? colorMap[type].split(" ")[0] : "text-gray-400"
                )} />
            </div>
            <div className="text-[10px] font-bold uppercase tracking-wider mb-0.5 opacity-70">{label}</div>
            <div className="text-sm font-bold tracking-tight">{value}</div>
            {subLabel && <div className="text-[9px] font-medium opacity-60 mt-0.5">{subLabel}</div>}
        </div>
    );
}

// Native SVG Path with SMIL Animation (No React Re-renders, No Flicker)
// Uses stable keys to prevent animation restart on parent re-render
function FlowPath({ d, color = "#10B981", active = true, id }: { d: string; color?: string; active?: boolean; id: string }) {
    return (
        <g key={id}>
            {/* Background Path */}
            <path d={d} stroke="#E5E7EB" strokeWidth="2" fill="none" />

            {active && (
                <>
                    {/* Dashed Line Animation */}
                    <path d={d} stroke={color} strokeWidth="2" fill="none" strokeDasharray="4 4" opacity="0.6">
                        <animate attributeName="stroke-dashoffset" from="8" to="0" dur="1s" repeatCount="indefinite" />
                    </path>

                    {/* Moving Dot */}
                    <circle r="3" fill={color}>
                        <animateMotion path={d} dur="1.5s" repeatCount="indefinite" rotate="auto" />
                    </circle>
                </>
            )}
        </g>
    );
}

interface EnergyFlowDiagramProps {
    data?: EnergyFlowData;
}

export const EnergyFlowDiagram = React.memo(function EnergyFlowDiagram({ data }: EnergyFlowDiagramProps) {
    const values = data || { pv: 0, grid: 0, load: 0, battery: 0, soc: 0 };

    const isPvActive = values.pv > 0.1;
    const isLoadActive = values.load > 0.1;

    // ViewBox Dimensions (Use logical units)
    const vW = 600;
    const vH = 360;

    // Fixed Card Size (Visual)
    const cardW = 110;
    const cardH = 90;

    // Center Points (Logical Coordinates)
    const cx = vW / 2;
    const cy = vH / 2;

    // Nodes Centers
    const pos = {
        pv: { x: cx, y: 55 },
        inverter: { x: cx, y: cy },
        grid: { x: 80, y: cy },
        load: { x: vW - 80, y: cy },
        battery: { x: cx, y: vH - 55 }
    };

    // Connection Points (Exact Edges)
    // PV Bottom to Inverter Top
    const pPv = { x: pos.pv.x, y: pos.pv.y + cardH / 2 };
    const pInvTop = { x: pos.inverter.x, y: pos.inverter.y - cardH / 2 };
    const pathPv = `M ${pPv.x} ${pPv.y} L ${pInvTop.x} ${pInvTop.y}`;

    // Grid Right to Inverter Left
    const pGrid = { x: pos.grid.x + cardW / 2, y: pos.grid.y };
    const pInvLeft = { x: pos.inverter.x - cardW / 2, y: pos.inverter.y };
    const pathGridImport = `M ${pGrid.x} ${pGrid.y} L ${pInvLeft.x} ${pInvLeft.y}`;
    const pathGridExport = `M ${pInvLeft.x} ${pInvLeft.y} L ${pGrid.x} ${pGrid.y}`;

    // Inverter Right to Load Left
    const pInvRight = { x: pos.inverter.x + cardW / 2, y: pos.inverter.y };
    const pLoad = { x: pos.load.x - cardW / 2, y: pos.load.y };
    const pathLoad = `M ${pInvRight.x} ${pInvRight.y} L ${pLoad.x} ${pLoad.y}`;

    // Inverter Bottom to Battery Top
    const pInvBot = { x: pos.inverter.x, y: pos.inverter.y + cardH / 2 };
    const pBatTop = { x: pos.battery.x, y: pos.battery.y - cardH / 2 };
    const pathBatCharge = `M ${pInvBot.x} ${pInvBot.y} L ${pBatTop.x} ${pBatTop.y}`;
    const pathBatDischarge = `M ${pBatTop.x} ${pBatTop.y} L ${pInvBot.x} ${pInvBot.y}`;


    return (
        // Container maintains 5/3 aspect ratio to match viewBox 600/360
        // Nodes use percentage positioning, SVG uses viewBox
        // Both stretch perfectly together.
        <div className="w-full max-w-[600px] mx-auto aspect-[5/3] relative bg-white/50 rounded-xl overflow-hidden">

            {/* SVG Layer */}
            <svg
                viewBox={`0 0 ${vW} ${vH}`}
                className="absolute inset-0 w-full h-full pointer-events-none"
                preserveAspectRatio="xMidYMid meet"
            >
                {/* PV Path */}
                <FlowPath id="flow-pv" d={pathPv} color="#10B981" active={isPvActive} />

                {/* Grid Path */}
                {values.grid > 0 && <FlowPath id="flow-grid-import" d={pathGridImport} color="#F59E0B" active={true} />}
                {values.grid < 0 && <FlowPath id="flow-grid-export" d={pathGridExport} color="#10B981" active={true} />}
                {!values.grid && <path d={pathGridImport} stroke="#E5E7EB" strokeWidth="2" />}

                {/* Load Path */}
                <FlowPath id="flow-load" d={pathLoad} color="#3B82F6" active={isLoadActive} />

                {/* Battery Path */}
                {values.battery > 0 && <FlowPath id="flow-bat-charge" d={pathBatCharge} color="#8B5CF6" active={true} />}
                {values.battery < 0 && <FlowPath id="flow-bat-discharge" d={pathBatDischarge} color="#F59E0B" active={true} />}
                {!values.battery && <path d={pathBatCharge} stroke="#E5E7EB" strokeWidth="2" />}
            </svg>

            {/* HTML Nodes Layer */}
            {/* Use xPct = (x / vW) * 100 */}

            <EnergyNode
                type="pv" label="Solar PV" value={`${values.pv.toFixed(1)} kW`}
                subLabel={values.pv > 0 ? "Generating" : "Idle"} status={values.pv > 0 ? "active" : "inactive"}
                xPct={(pos.pv.x / vW) * 100} yPct={(pos.pv.y / vH) * 100}
                width={cardW} height={cardH}
            />

            <EnergyNode
                type="grid" label="Grid"
                value={`${Math.abs(values.grid).toFixed(1)} kW`}
                subLabel={values.grid > 0 ? "Importing" : values.grid < 0 ? "Exporting" : "Idle"}
                status={values.grid !== 0 ? "active" : "inactive"}
                xPct={(pos.grid.x / vW) * 100} yPct={(pos.grid.y / vH) * 100}
                width={cardW} height={cardH}
            />

            <EnergyNode
                type="inverter" label="Inverter" value="Active" subLabel="Hybrid"
                xPct={(pos.inverter.x / vW) * 100} yPct={(pos.inverter.y / vH) * 100}
                width={cardW} height={cardH}
            />

            <EnergyNode
                type="load" label="Load" value={`${values.load.toFixed(1)} kW`}
                subLabel="Consuming"
                xPct={(pos.load.x / vW) * 100} yPct={(pos.load.y / vH) * 100}
                width={cardW} height={cardH}
            />

            <EnergyNode
                type="battery" label="Battery" value={`${values.soc}%`}
                subLabel={values.battery !== 0 ? `${Math.abs(values.battery).toFixed(1)} kW` : "Idle"}
                status={values.battery !== 0 ? "active" : "inactive"}
                xPct={(pos.battery.x / vW) * 100} yPct={(pos.battery.y / vH) * 100}
                width={cardW} height={cardH}
            />

        </div>
    );
}, (prev, next) => {
    // Custom comparison to be absolutely sure
    return JSON.stringify(prev.data) === JSON.stringify(next.data);
});
