import { useState, useEffect, useCallback, useRef } from 'react';

interface UseApiState<T> {
    data: T | null;
    loading: boolean;
    error: string | null;
    isRefreshing: boolean;
}

export function useApi<T>(
    fetcher: () => Promise<T>,
    deps: unknown[] = []
): UseApiState<T> & { refetch: () => void } {
    const [state, setState] = useState<UseApiState<T>>({
        data: null,
        loading: true,
        error: null,
        isRefreshing: false,
    });
    const hasFetchedRef = useRef(false);

    const fetch = useCallback(async () => {
        // First fetch: show loading skeleton
        // Subsequent fetches: just set isRefreshing (no skeleton)
        // Use ref only (not state) to avoid stale closure issues
        if (hasFetchedRef.current) {
            setState(prev => ({ ...prev, isRefreshing: true, error: null }));
        } else {
            setState(prev => ({ ...prev, loading: true, error: null }));
        }

        try {
            const data = await fetcher();
            hasFetchedRef.current = true;
            setState({ data, loading: false, error: null, isRefreshing: false });
        } catch (err) {
            setState(prev => ({ ...prev, loading: false, isRefreshing: false, error: (err as Error).message }));
        }
    }, deps);

    useEffect(() => {
        fetch();
    }, [fetch]);

    return { ...state, refetch: fetch };
}

export function useInterval(callback: () => void, delay: number | null) {
    useEffect(() => {
        if (delay === null) return;

        const id = setInterval(callback, delay);
        return () => clearInterval(id);
    }, [callback, delay]);
}
