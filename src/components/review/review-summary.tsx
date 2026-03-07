import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { AlertCircle, AlertTriangle, HelpCircle } from "lucide-react";

interface ReviewSummaryProps {
    totalCount: number;
    lowConfidenceCount: number;
    missingCategoryCount: number;
}

export function ReviewSummary({
    totalCount,
    lowConfidenceCount,
    missingCategoryCount,
}: ReviewSummaryProps) {
    const items = [
        {
            label: "Celkem ke kontrole",
            value: totalCount,
            icon: AlertCircle,
            iconColor: "text-orange-600 dark:text-orange-400",
            iconBg: "bg-orange-50 dark:bg-orange-950",
        },
        {
            label: "Nízká důvěra",
            value: lowConfidenceCount,
            icon: AlertTriangle,
            iconColor: "text-red-600 dark:text-red-400",
            iconBg: "bg-red-50 dark:bg-red-950",
        },
        {
            label: "Chybí kategorie",
            value: missingCategoryCount,
            icon: HelpCircle,
            iconColor: "text-amber-600 dark:text-amber-400",
            iconBg: "bg-amber-50 dark:bg-amber-950",
        },
    ];

    return (
        <div className="grid gap-4 sm:grid-cols-3 mb-6">
            {items.map((item) => (
                <Card key={item.label}>
                    <CardContent className="flex items-center gap-4 p-4">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${item.iconBg}`}>
                            <item.icon className={`h-5 w-5 ${item.iconColor}`} />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{item.value}</p>
                            <p className="text-xs text-muted-foreground">{item.label}</p>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
