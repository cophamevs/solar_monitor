import React from "react";
import { message } from "antd";
import { Card, CardHeader, CardTitle, CardContent } from "../components/cards/Card";
import { Button } from "../components/base/Button";
import { Icon } from "../components/base/Icon";
import { exportToExcel, exportToPDF, formatReportForExport } from "../utils/exportUtils";

type ReportType = "daily" | "monthly" | "custom";

export function Reports() {
    const [reportType, setReportType] = React.useState<ReportType>("daily");
    const [isGenerating, setIsGenerating] = React.useState(false);
    const [reportData, setReportData] = React.useState<any[]>([]);
    const [selectedMetrics, setSelectedMetrics] = React.useState<string[]>([
        "Energy Generation",
        "Energy Consumption",
        "Grid Import/Export"
    ]);

    const metricsOptions = [
        "Energy Generation",
        "Energy Consumption",
        "Grid Import/Export",
        "Self-use Ratio",
        "Alarms Summary"
    ];

    // Generate mock report data
    const generateReportData = () => {
        return [1, 2, 3, 4, 5].map(day => ({
            date: `2026-01-0${day}`,
            generation: 200 + Math.random() * 100,
            consumption: 150 + Math.random() * 80,
            export: 50 + Math.random() * 50,
            selfUse: 60 + Math.random() * 30, // Mock self-use %
            alarms: Math.floor(Math.random() * 3) // Mock alarms count
        }));
    };

    const handleGenerate = async () => {
        setIsGenerating(true);
        await new Promise(resolve => setTimeout(resolve, 500));
        setReportData(generateReportData());
        setIsGenerating(false);
        message.success("Report generated successfully");
    };

    const handleExportExcel = () => {
        try {
            const dataToExport = reportData.length > 0 ? reportData : generateReportData();
            const formatted = formatReportForExport(dataToExport, selectedMetrics);
            exportToExcel(formatted, `solar_report_${reportType}`);
            message.success("Excel exported successfully");
        } catch (error) {
            message.error((error as Error).message);
        }
    };

    const handleExportPDF = () => {
        try {
            const dataToExport = reportData.length > 0 ? reportData : generateReportData();
            const formatted = formatReportForExport(dataToExport, selectedMetrics);
            exportToPDF(formatted, `solar_report_${reportType}`, 'Solar Energy Report');
            message.success("PDF exported successfully");
        } catch (error) {
            message.error((error as Error).message);
        }
    };

    const toggleMetric = (metric: string) => {
        setSelectedMetrics(prev =>
            prev.includes(metric)
                ? prev.filter(m => m !== metric)
                : [...prev, metric]
        );
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-title-xl">Reports</h2>
                <p className="text-text-sub text-sm mt-1">Generate and export energy reports</p>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Report Configuration */}
                <Card className="lg:col-span-1">
                    <CardHeader>
                        <CardTitle>Report Configuration</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Report Type */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Report Type</label>
                            <div className="flex rounded-lg border overflow-hidden">
                                {(["daily", "monthly", "custom"] as ReportType[]).map((type) => (
                                    <button
                                        key={type}
                                        onClick={() => setReportType(type)}
                                        className={`flex-1 px-3 py-2 text-sm font-medium capitalize transition-colors ${reportType === type
                                            ? "bg-primary text-white"
                                            : "bg-white hover:bg-gray-50"
                                            }`}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Plant Selection */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Plant</label>
                            <select className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-primary">
                                <option>All Plants</option>
                                <option>Plant A - Roof</option>
                                <option>Plant B - Ground</option>
                                <option>Plant C - Carport</option>
                            </select>
                        </div>

                        {/* Date Range */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Date Range</label>
                            <div className="space-y-2">
                                <input
                                    type="date"
                                    className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-primary"
                                    defaultValue="2026-01-01"
                                />
                                <input
                                    type="date"
                                    className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:border-primary"
                                    defaultValue="2026-01-05"
                                />
                            </div>
                        </div>

                        {/* Metrics Selection */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Include Metrics</label>
                            <div className="space-y-2">
                                {metricsOptions.map((metric) => (
                                    <label key={metric} className="flex items-center space-x-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={selectedMetrics.includes(metric)}
                                            onChange={() => toggleMetric(metric)}
                                            className="rounded"
                                        />
                                        <span className="text-sm">{metric}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <Button onClick={handleGenerate} loading={isGenerating} className="w-full">
                            Generate Report
                        </Button>
                    </CardContent>
                </Card>

                {/* Preview */}
                <Card className="lg:col-span-2">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Preview</CardTitle>
                        <div className="flex space-x-2">
                            <Button variant="outline" size="sm" onClick={handleExportExcel}>
                                <Icon name="report" size={16} className="mr-1" />
                                Excel
                            </Button>
                            <Button variant="outline" size="sm" onClick={handleExportPDF}>
                                <Icon name="report" size={16} className="mr-1" />
                                PDF
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="border rounded-lg bg-gray-50 p-6 min-h-[400px]">
                            {/* Mock Report Preview */}
                            <div className="space-y-6">
                                <div className="text-center border-b pb-4">
                                    <h3 className="text-lg font-bold">Solar Energy Report</h3>
                                    <p className="text-sm text-text-sub">January 1 - January 5, 2026</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    {selectedMetrics.includes("Energy Generation") && (
                                        <div className="bg-white p-4 rounded-lg border">
                                            <p className="text-xs text-text-sub uppercase">Total Generation</p>
                                            <p className="text-2xl font-bold text-primary">1,250 kWh</p>
                                        </div>
                                    )}
                                    {selectedMetrics.includes("Energy Consumption") && (
                                        <div className="bg-white p-4 rounded-lg border">
                                            <p className="text-xs text-text-sub uppercase">Total Consumption</p>
                                            <p className="text-2xl font-bold">980 kWh</p>
                                        </div>
                                    )}
                                    {selectedMetrics.includes("Grid Import/Export") && (
                                        <div className="bg-white p-4 rounded-lg border">
                                            <p className="text-xs text-text-sub uppercase">Grid Export</p>
                                            <p className="text-2xl font-bold text-success">420 kWh</p>
                                        </div>
                                    )}
                                    {selectedMetrics.includes("Self-use Ratio") && (
                                        <div className="bg-white p-4 rounded-lg border">
                                            <p className="text-xs text-text-sub uppercase">Self-use Ratio</p>
                                            <p className="text-2xl font-bold">78%</p>
                                        </div>
                                    )}
                                    {selectedMetrics.includes("Alarms Summary") && (
                                        <div className="bg-white p-4 rounded-lg border">
                                            <p className="text-xs text-text-sub uppercase">Total Alarms</p>
                                            <p className="text-2xl font-bold text-critical">12</p>
                                        </div>
                                    )}
                                </div>

                                <div className="bg-white p-4 rounded-lg border">
                                    <p className="text-sm font-medium mb-2">Daily Breakdown</p>
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="text-left text-text-sub">
                                                <th className="py-1">Date</th>
                                                {selectedMetrics.includes("Energy Generation") && <th className="py-1">Generation</th>}
                                                {selectedMetrics.includes("Energy Consumption") && <th className="py-1">Consumption</th>}
                                                {selectedMetrics.includes("Grid Import/Export") && <th className="py-1">Export</th>}
                                                {selectedMetrics.includes("Self-use Ratio") && <th className="py-1">Self-use</th>}
                                                {selectedMetrics.includes("Alarms Summary") && <th className="py-1">Alarms</th>}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {[1, 2, 3, 4, 5].map(day => (
                                                <tr key={day} className="border-t">
                                                    <td className="py-1">Jan {day}</td>
                                                    {selectedMetrics.includes("Energy Generation") && (
                                                        <td className="py-1">{(200 + Math.random() * 100).toFixed(0)} kWh</td>
                                                    )}
                                                    {selectedMetrics.includes("Energy Consumption") && (
                                                        <td className="py-1">{(150 + Math.random() * 80).toFixed(0)} kWh</td>
                                                    )}
                                                    {selectedMetrics.includes("Grid Import/Export") && (
                                                        <td className="py-1 text-success">{(50 + Math.random() * 50).toFixed(0)} kWh</td>
                                                    )}
                                                    {selectedMetrics.includes("Self-use Ratio") && (
                                                        <td className="py-1">{(60 + Math.random() * 30).toFixed(0)} %</td>
                                                    )}
                                                    {selectedMetrics.includes("Alarms Summary") && (
                                                        <td className="py-1">{Math.floor(Math.random() * 3)}</td>
                                                    )}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
