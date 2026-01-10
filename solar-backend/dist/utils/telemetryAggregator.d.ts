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
export declare function groupTelemetryByTime(rows: RawTelemetryRow[]): FormattedDataPoint[];
/** Valid interval values for telemetry aggregation */
export declare const VALID_INTERVALS: readonly ["raw", "5min", "hour", "day", "month"];
export type TelemetryInterval = typeof VALID_INTERVALS[number];
/**
 * Validates if the given interval is a known valid value
 *
 * @param interval - Interval string to validate
 * @returns True if valid
 */
export declare function isValidInterval(interval: string | undefined): interval is TelemetryInterval;
/** Interval durations in seconds */
export declare const INTERVAL_SECONDS: Record<string, number>;
//# sourceMappingURL=telemetryAggregator.d.ts.map