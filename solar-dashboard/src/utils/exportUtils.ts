import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Export data to Excel (.xlsx)
 */
export function exportToExcel(data: Record<string, any>[], filename: string): void {
    if (!data || data.length === 0) {
        throw new Error('No data to export');
    }

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Report');
    XLSX.writeFile(wb, `${filename}.xlsx`);
}

/**
 * Export data to PDF
 */
export function exportToPDF(
    data: Record<string, any>[],
    filename: string,
    title: string
): void {
    if (!data || data.length === 0) {
        throw new Error('No data to export');
    }

    const doc = new jsPDF();

    // Title
    doc.setFontSize(16);
    doc.text(title, 14, 20);

    // Subtitle with date
    doc.setFontSize(10);
    doc.setTextColor(128);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 28);

    // Table
    const headers = Object.keys(data[0]);
    const rows = data.map(row => headers.map(h => String(row[h] ?? '')));

    autoTable(doc, {
        head: [headers],
        body: rows,
        startY: 35,
        styles: { fontSize: 9 },
        headStyles: { fillColor: [22, 163, 74] }, // Primary green
    });

    doc.save(`${filename}.pdf`);
}

/**
 * Export data to CSV
 */
export function exportToCSV(data: Record<string, any>[], filename: string): void {
    if (!data || data.length === 0) {
        throw new Error('No data to export');
    }

    const headers = Object.keys(data[0]);
    const headerRow = headers.join(',');
    const rows = data.map(row =>
        headers.map(h => {
            const val = row[h];
            // Escape commas and quotes
            if (typeof val === 'string' && (val.includes(',') || val.includes('"'))) {
                return `"${val.replace(/"/g, '""')}"`;
            }
            return val ?? '';
        }).join(',')
    );

    const csv = [headerRow, ...rows].join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.csv`;
    link.click();

    URL.revokeObjectURL(url);
}

/**
 * Format telemetry data for export
 */
export function formatTelemetryForExport(
    telemetryData: { time: string;[key: string]: any }[]
): Record<string, any>[] {
    return telemetryData.map(row => ({
        Time: new Date(row.time).toLocaleString(),
        Power: row.power ? `${row.power.toFixed(2)} kW` : '-',
        Voltage: row.voltage ? `${row.voltage.toFixed(1)} V` : '-',
        Current: row.current ? `${row.current.toFixed(2)} A` : '-',
        Temperature: row.temperature ? `${row.temperature.toFixed(1)} °C` : '-',
    }));
}

/**
 * Format report data for export
 */
export function formatReportForExport(
    reportData: any[],
    selectedMetrics?: string[]
): Record<string, any>[] {
    return reportData.map(row => {
        const formatted: Record<string, any> = {
            Date: row.date,
        };

        const metricsInitial: Record<string, string> = {
            "Energy Generation": "Generation (kWh)",
            "Energy Consumption": "Consumption (kWh)",
            "Grid Import/Export": "Export (kWh)",
            "Self-use Ratio": "Self-use (%)",
            "Alarms Summary": "Alarms"
        };

        const keysMap: Record<string, string> = {
            "Energy Generation": "generation",
            "Energy Consumption": "consumption",
            "Grid Import/Export": "export",
            "Self-use Ratio": "selfUse",
            "Alarms Summary": "alarms"
        };

        // If no metrics selected, include all default columns
        const metricsToInclude = selectedMetrics && selectedMetrics.length > 0
            ? selectedMetrics
            : ["Energy Generation", "Energy Consumption", "Grid Import/Export"];

        metricsToInclude.forEach(metric => {
            const label = metricsInitial[metric];
            const key = keysMap[metric];
            if (label && key && row[key] !== undefined) {
                formatted[label] = typeof row[key] === 'number' ? row[key].toFixed(2) : row[key];
            }
        });

        return formatted;
    });
}
