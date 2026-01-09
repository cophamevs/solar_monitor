import { useEffect, useState } from 'react';
import { analyticsService } from '../services/analyticsService';

export const usePlantAnalytics = (timeRange: 'day' | 'month' | 'year', date?: string) => {
    const [data, setData] = useState<{
        specificYieldData: { name: string; value: number }[];
        productionShareData: { name: string; value: number }[];
        downtimeData: { name: string; hours: number }[];
        errorDensityData: { name: string; critical: number }[];
    } | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const fetchAnalytics = async () => {
            setLoading(true);
            try {
                const response = await analyticsService.getComparison(timeRange, date);

                // Transform API response to UI-friendly format if needed
                // API returns { sites: AnalyticsSiteData[] }
                const sites = response.sites;

                setData({
                    specificYieldData: sites.map(s => ({ name: s.name, value: s.specificYield })),
                    productionShareData: sites.map(s => ({ name: s.name, value: s.productionShare })),
                    downtimeData: sites.map(s => ({ name: s.name, hours: s.downtimeHours })),
                    errorDensityData: sites.map(s => ({ name: s.name, critical: s.criticalAlerts }))
                });
            } catch (err) {
                setError(err as Error);
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, [timeRange, date]);

    return {
        specificYieldData: data?.specificYieldData || [],
        productionShareData: data?.productionShareData || [],
        downtimeData: data?.downtimeData || [],
        errorDensityData: data?.errorDensityData || [],
        loading,
        error
    };
};
