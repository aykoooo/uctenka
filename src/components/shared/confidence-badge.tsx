import { Badge } from "@/components/ui/badge";
import type { ConfidenceLevel } from "@/types/domain";

const CONFIDENCE_CONFIG: Record<
    ConfidenceLevel,
    { label: string; className: string }
> = {
    high: {
        label: "Vysoká",
        className: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800",
    },
    medium: {
        label: "Střední",
        className: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-800",
    },
    low: {
        label: "Nízká",
        className: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-400 dark:border-red-800",
    },
};

interface ConfidenceBadgeProps {
    level: ConfidenceLevel;
    showPercentage?: boolean;
    percentage?: number;
}

export function ConfidenceBadge({ level, showPercentage, percentage }: ConfidenceBadgeProps) {
    const config = CONFIDENCE_CONFIG[level];
    const label = showPercentage && percentage !== undefined
        ? `${config.label} (${percentage} %)`
        : config.label;

    return (
        <Badge variant="outline" className={config.className}>
            {label}
        </Badge>
    );
}
