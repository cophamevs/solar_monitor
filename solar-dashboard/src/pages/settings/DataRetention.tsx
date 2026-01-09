import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../../components/cards/Card";
import { Button } from "../../components/base/Button";
import { Icon } from "../../components/base/Icon";

export function DataRetention() {
    const [rawDays, setRawDays] = React.useState(7);
    const [aggregatedDays, setAggregatedDays] = React.useState(365);
    const [isSaving, setIsSaving] = React.useState(false);
    const [isCleaning, setIsCleaning] = React.useState(false);

    const handleSave = async () => {
        setIsSaving(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        setIsSaving(false);
        window.alert('Retention settings saved!');
    };

    const handleCleanup = async () => {
        if (!window.confirm('Run cleanup now? This will delete old data according to retention settings.')) return;
        setIsCleaning(true);
        try {
            // Simulate cleanup API
            await new Promise(resolve => setTimeout(resolve, 3000));
            window.alert('Cleanup completed successfully! Freed 0.5 GB.');
        } catch (error) {
            window.alert('Cleanup failed. Please try again.');
        } finally {
            setIsCleaning(false);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-title-xl mb-2">Data Retention</h2>
                <p className="text-text-sub">Configure how long data is stored in the system</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Raw Data */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <Icon name="energy" size={20} />
                            <span>Raw Data</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-text-sub">
                            High-resolution data collected every few seconds. Uses more storage.
                        </p>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Keep raw data for</label>
                            <div className="flex items-center space-x-2">
                                <input
                                    type="number"
                                    value={rawDays}
                                    onChange={(e) => setRawDays(Number(e.target.value))}
                                    className="w-20 rounded-lg border px-3 py-2 text-sm focus:border-primary focus:outline-none"
                                    min={1}
                                    max={30}
                                />
                                <span className="text-sm text-text-sub">days</span>
                            </div>
                        </div>

                        <div className="rounded-lg bg-warning/10 p-3 text-sm">
                            <p className="font-medium text-warning">Storage estimate</p>
                            <p className="text-text-sub mt-1">~{(rawDays * 0.2).toFixed(1)} GB at current rate</p>
                        </div>
                    </CardContent>
                </Card>

                {/* Aggregated Data */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <Icon name="report" size={20} />
                            <span>Aggregated Data</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p className="text-sm text-text-sub">
                            Hourly and daily summaries. Uses minimal storage.
                        </p>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Keep aggregated data for</label>
                            <select
                                value={aggregatedDays}
                                onChange={(e) => setAggregatedDays(Number(e.target.value))}
                                className="w-full rounded-lg border px-3 py-2 text-sm focus:border-primary focus:outline-none"
                            >
                                <option value={90}>3 months</option>
                                <option value={180}>6 months</option>
                                <option value={365}>1 year</option>
                                <option value={730}>2 years</option>
                                <option value={1825}>5 years</option>
                            </select>
                        </div>

                        <div className="rounded-lg bg-success/10 p-3 text-sm">
                            <p className="font-medium text-success">Storage estimate</p>
                            <p className="text-text-sub mt-1">~{(aggregatedDays * 0.01).toFixed(1)} GB</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Actions */}
            <Card>
                <CardContent className="flex items-center justify-between py-4">
                    <div>
                        <p className="text-sm font-medium">Current database size: 2.4 GB</p>
                        <p className="text-xs text-text-sub">Last cleanup: Jan 5, 2026</p>
                    </div>
                    <div className="flex space-x-3">
                        <Button variant="outline" onClick={handleCleanup} disabled={isCleaning}>
                            {isCleaning ? 'Cleaning...' : 'Run Cleanup Now'}
                        </Button>
                        <Button onClick={handleSave} loading={isSaving}>
                            Save Settings
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
