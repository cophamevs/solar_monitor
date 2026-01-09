/**
 * Chart configuration constants
 * Defines timing, intervals, and refresh rates for chart views
 */

// Time durations in milliseconds
export const TIME_MS = {
    MINUTE: 60 * 1000,
    HOUR: 60 * 60 * 1000,
    DAY: 24 * 60 * 60 * 1000,
} as const;

// Chart view mode configurations
export const CHART_VIEW_CONFIG = {
    realtime: {
        duration: 2 * TIME_MS.MINUTE,      // 2 minutes window
        interval: 'raw' as const,           // No aggregation
        refreshMs: 5000,                    // Refresh every 5 seconds
        label: 'Realtime (5s)',
        title: 'Last 2 Minutes',
    },
    '24h': {
        duration: TIME_MS.DAY,              // 24 hours window
        interval: '5min' as const,          // 5-minute buckets
        refreshMs: 30000,                   // Refresh every 30 seconds
        label: '24h (5min)',
        title: 'Last 24 Hours',
    },
} as const;

// Default parameters for telemetry queries
export const DEFAULT_TELEMETRY_PARAMS = ['pv_power', 'grid_voltage', 'temperature'];

// Type for view modes
export type ChartViewMode = keyof typeof CHART_VIEW_CONFIG;
