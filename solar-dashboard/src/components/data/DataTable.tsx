import React from "react";
import { Skeleton } from "../base/Skeleton";
import { Icon } from "../base/Icon";
import { cn } from "../../utils/cn";

export interface Column<T> {
    key: keyof T | string;
    header: string;
    render?: (item: T) => React.ReactNode;
    className?: string;
}

interface DataTableProps<T> {
    columns: Column<T>[];
    data: T[];
    state?: "normal" | "loading" | "empty";
    loading?: boolean;
    keyExtractor: (item: T) => string;
    emptyMessage?: string;
    loadingRows?: number;
    className?: string;
}

export function DataTable<T>({
    columns,
    data,
    state = "normal",
    loading = false,
    keyExtractor,
    emptyMessage = "No data to display",
    loadingRows = 5,
    className
}: DataTableProps<T>) {

    const effectiveState = loading ? "loading" : state;

    if (effectiveState === "loading") {
        return (
            <div className={cn("overflow-hidden rounded-lg border", className)}>
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            {columns.map((col, idx) => (
                                <th key={idx} className="px-4 py-3 text-left text-xs font-medium text-text-sub uppercase">
                                    {col.header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {Array.from({ length: loadingRows }).map((_, rowIdx) => (
                            <tr key={rowIdx}>
                                {columns.map((_, colIdx) => (
                                    <td key={colIdx} className="px-4 py-3">
                                        <Skeleton className="h-4 w-full" />
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    }

    if (effectiveState === "empty" || data.length === 0) {
        return (
            <div className={cn("overflow-hidden rounded-lg border", className)}>
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            {columns.map((col, idx) => (
                                <th key={idx} className="px-4 py-3 text-left text-xs font-medium text-text-sub uppercase">
                                    {col.header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                </table>
                <div className="flex flex-col items-center justify-center py-12 text-text-sub">
                    <Icon name="report" size={32} className="mb-3 text-gray-300" />
                    <p className="text-sm">{emptyMessage}</p>
                </div>
            </div>
        );
    }

    return (
        <div className={cn("overflow-hidden rounded-lg border", className)}>
            <table className="w-full">
                <thead className="bg-gray-50">
                    <tr>
                        {columns.map((col, idx) => (
                            <th key={idx} className={cn("px-4 py-3 text-left text-xs font-medium text-text-sub uppercase", col.className)}>
                                {col.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y bg-white">
                    {data.map((item) => (
                        <tr key={keyExtractor(item)} className="hover:bg-gray-50 transition-colors">
                            {columns.map((col, colIdx) => (
                                <td key={colIdx} className={cn("px-4 py-3 text-sm", col.className)}>
                                    {col.render
                                        ? col.render(item)
                                        : String((item as Record<string, unknown>)[col.key as string] ?? "")}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
