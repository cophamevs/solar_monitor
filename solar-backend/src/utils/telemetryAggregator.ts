/**
 * Telemetry aggregation utilities
 * Handles grouping of raw telemetry data by time buckets
 */

/** Raw telemetry row from database query */
export interface RawTelemetryRow {
    bucket: Date | string;
    parameterKey: string;
    value: number | string;
}

/** Formatted telemetry data point for API response */
export interface FormattedDataPoint {
    time: string;
    [key: string]: string | number;
}

/**
 * Groups raw telemetry rows by time bucket
 * Consolidates multiple parameters into single objects per timestamp
 * 
 * @param rows - Raw rows from database query
 * @returns Array of formatted data points with all parameters as properties
 */
export function groupTelemetryByTime(rows: RawTelemetryRow[]): FormattedDataPoint[] {
    const grouped: Record<string, Record<string, number>> = {};

    for (const row of rows) {
        const timeKey = new Date(row.bucket).toISOString();
        if (!grouped[timeKey]) {
            grouped[timeKey] = {};
        }
        grouped[timeKey][row.parameterKey] = Number(row.value);
    }

    return Object.entries(grouped).map(([time, values]) => ({
        time,
        ...values,
    }));
}

/** Valid interval values for telemetry aggregation */
export const VALID_INTERVALS = ['raw', '5min', 'hour', 'day', 'month'] as const;
export type TelemetryInterval = typeof VALID_INTERVALS[number];

/**
 * Validates if the given interval is a known valid value
 * 
 * @param interval - Interval string to validate
 * @returns True if valid
 */
export function isValidInterval(interval: string | undefined): interval is TelemetryInterval {
    if (!interval) return true; // undefined is valid (defaults to raw)
    return VALID_INTERVALS.includes(interval as TelemetryInterval);
}

/** Interval durations in seconds */
export const INTERVAL_SECONDS: Record<string, number> = {
    '5min': 300,
    'hour': 3600,
    'day': 86400,
};
