import { cn } from "../../utils/cn";

export type StatusType = "online" | "warning" | "critical" | "offline" | "nodata";

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
    status?: StatusType;
}

export function Badge({ className, status = "online", ...props }: BadgeProps) {
    return (
        <div
            className={cn(
                "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                {
                    "border-transparent bg-success text-white": status === "online",
                    "border-transparent bg-warning text-white": status === "warning",
                    "border-transparent bg-critical text-white": status === "critical",
                    "border-transparent bg-offline text-white": status === "offline",
                    "border-transparent bg-gray-200 text-gray-800": status === "nodata",
                },
                className
            )}
            {...props}
        />
    );
}
