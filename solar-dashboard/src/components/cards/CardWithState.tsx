import { Card, CardContent, CardHeader } from "./Card";
import { Skeleton } from "../base/Skeleton";
import { Icon } from "../base/Icon";
import { cn } from "../../utils/cn";

interface CardWithStateProps {
    state: "normal" | "loading" | "nodata" | "error";
    title?: string;
    errorMessage?: string;
    children?: React.ReactNode;
    className?: string;
    onRetry?: () => void;
}

export function CardWithState({
    state,
    title,
    errorMessage = "Failed to load data",
    children,
    className,
    onRetry
}: CardWithStateProps) {
    if (state === "loading") {
        return (
            <Card className={cn("overflow-hidden", className)}>
                {title && (
                    <CardHeader>
                        <Skeleton className="h-6 w-32" />
                    </CardHeader>
                )}
                <CardContent className="space-y-4">
                    <Skeleton className="h-24 w-full" />
                    <div className="flex space-x-4">
                        <Skeleton className="h-4 w-1/3" />
                        <Skeleton className="h-4 w-1/4" />
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (state === "nodata") {
        return (
            <Card className={cn("overflow-hidden", className)}>
                {title && (
                    <CardHeader>
                        <h3 className="text-title-l">{title}</h3>
                    </CardHeader>
                )}
                <CardContent>
                    <div className="flex flex-col items-center justify-center py-12 text-text-sub">
                        <Icon name="status-offline" size={48} className="mb-4 text-gray-300" />
                        <p className="text-sm font-medium">No data available</p>
                        <p className="text-xs mt-1">Data will appear once connected</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (state === "error") {
        return (
            <Card className={cn("overflow-hidden border-critical/30", className)}>
                {title && (
                    <CardHeader>
                        <h3 className="text-title-l">{title}</h3>
                    </CardHeader>
                )}
                <CardContent>
                    <div className="flex flex-col items-center justify-center py-12 text-critical">
                        <Icon name="status-critical" size={48} className="mb-4" />
                        <p className="text-sm font-medium">{errorMessage}</p>
                        {onRetry && (
                            <button
                                onClick={onRetry}
                                className="mt-4 text-xs text-primary hover:underline"
                            >
                                Try again
                            </button>
                        )}
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Normal state
    return (
        <Card className={cn("overflow-hidden", className)}>
            {title && (
                <CardHeader>
                    <h3 className="text-title-l">{title}</h3>
                </CardHeader>
            )}
            <CardContent>{children}</CardContent>
        </Card>
    );
}
