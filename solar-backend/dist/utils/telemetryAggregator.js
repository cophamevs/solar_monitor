"use strict";
/**
 * Telemetry aggregation utilities
 * Handles grouping of raw telemetry data by time buckets
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.INTERVAL_SECONDS = exports.VALID_INTERVALS = void 0;
exports.groupTelemetryByTime = groupTelemetryByTime;
exports.isValidInterval = isValidInterval;
/**
 * Groups raw telemetry rows by time bucket
 * Consolidates multiple parameters into single objects per timestamp
 *
 * @param rows - Raw rows from database query
 * @returns Array of formatted data points with all parameters as properties
 */
function groupTelemetryByTime(rows) {
    const grouped = {};
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
exports.VALID_INTERVALS = ['raw', '5min', 'hour', 'day', 'month'];
/**
 * Validates if the given interval is a known valid value
 *
 * @param interval - Interval string to validate
 * @returns True if valid
 */
function isValidInterval(interval) {
    if (!interval)
        return true; // undefined is valid (defaults to raw)
    return exports.VALID_INTERVALS.includes(interval);
}
/** Interval durations in seconds */
exports.INTERVAL_SECONDS = {
    '5min': 300,
    'hour': 3600,
    'day': 86400,
};
//# sourceMappingURL=telemetryAggregator.js.map