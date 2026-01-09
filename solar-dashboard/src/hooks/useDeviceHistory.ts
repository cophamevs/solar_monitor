import { useCallback, useRef, useEffect } from 'react';
import { api, useApi, type TelemetryResponse } from '../api';
import { CHART_VIEW_CONFIG, DEFAULT_TELEMETRY_PARAMS, type ChartViewMode } from '../constants/chart';

/**
 * Custom hook for fetching device history data with view mode support
 * 
 * @param deviceId - Device ID to fetch telemetry for
 * @param viewMode - 'realtime' (2min raw) or '24h' (aggregated)
 * @returns { data, loading, refetch, config }
 */
export function useDeviceHistory(deviceId: string | undefined, viewMode: ChartViewMode) {
    const config = CHART_VIEW_CONFIG[viewMode];

    // Ref to track current view mode for use in fetch callback
    const viewModeRef = useRef(viewMode);
    useEffect(() => {
        viewModeRef.current = viewMode;
    }, [viewMode]);

    // Build fetch params based on current view mode
    const buildParams = useCallback(() => {
        const now = new Date();
        const currentConfig = CHART_VIEW_CONFIG[viewModeRef.current];

        return {
            start_date: new Date(now.getTime() - currentConfig.duration).toISOString(),
            end_date: now.toISOString(),
            interval: currentConfig.interval,
            parameters: DEFAULT_TELEMETRY_PARAMS.join(','),
        };
    }, []);

    // Fetch history data
    const { data, loading, refetch } = useApi<TelemetryResponse>(
        () => {
            if (!deviceId) {
                return Promise.resolve(null as unknown as TelemetryResponse);
            }
            return api.getDeviceTelemetry(deviceId, buildParams());
        },
        [deviceId, viewMode]
    );

    return {
        data,
        loading,
        refetch,
        config,
    };
}
