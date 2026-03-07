import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { DashboardStats } from "@/types/domain";
import { formatCZK } from "@/lib/formatters";
import { getCategoryById } from "@/lib/constants/categories";
import {
    Minus,
    TrendingDown,
    TrendingUp,
} from "lucide-react";

interface KpiCardsProps {
    stats: DashboardStats;
}

type TrendDirection = "up" | "down" | "flat";

function getTrend(current: number, previous: number, goodWhen: "up" | "down" = "up") {
    const delta = current - previous;

    const direction: TrendDirection = delta === 0 ? "flat" : delta > 0 ? "up" : "down";
    const percent =
        previous === 0
            ? (current === 0 ? 0 : 100)
            : Math.abs((delta / Math.abs(previous)) * 100);

    const isPositive =
        direction === "flat" ? true : goodWhen === "up" ? delta > 0 : delta < 0;

    return {
        direction,
        percent,
        isPositive,
        sentence:
            direction === "flat"
                ? "Beze změny oproti minulému měsíci"
                : `${direction === "up" ? "Nárůst" : "Pokles"} oproti minulému měsíci`,
        badgeClass:
            direction === "flat"
                ? "border-border text-muted-foreground"
                : isPositive
                    ? "border-emerald-200/80 bg-emerald-50/80 text-emerald-700"
                    : "border-red-200/80 bg-red-50/80 text-red-700",
    };
}

function formatPercent(value: number): string {
    return new Intl.NumberFormat("cs-CZ", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 1,
    }).format(value);
}

export function KpiCards({ stats }: KpiCardsProps) {
    const topCategory = stats.topCategory ? getCategoryById(stats.topCategory.categoryId) : null;

    const kpis = [
        {
            label: "Výdaje tento měsíc",
            value: formatCZK(stats.monthlyExpenses),
            helper: "Součet všech zpracovaných účtenek",
            current: stats.monthlyExpenses,
            previous: stats.previousMonthExpenses,
            goodWhen: "up" as const,
        },
        {
            label: "Účtenky tento měsíc",
            value: String(stats.receiptCount),
            helper: "Počet nově nahraných účtenek",
            current: stats.receiptCount,
            previous: stats.previousMonthReceiptCount,
            goodWhen: "up" as const,
        },
        {
            label: "Největší kategorie",
            value: topCategory?.label ?? "—",
            helper: stats.topCategory ? formatCZK(stats.topCategory.amount) : "Bez dat",
            current: stats.topCategory?.amount ?? 0,
            previous: stats.previousTopCategory?.amount ?? 0,
            goodWhen: "up" as const,
        },
        {
            label: "Ke kontrole",
            value: String(stats.pendingReviewCount),
            helper: "Čeká na manuální revizi",
            current: stats.pendingReviewCount,
            previous: stats.previousPendingReviewCount,
            goodWhen: "down" as const,
        },
    ];

    return (
        <>
            {kpis.map((kpi) => {
                const trend = getTrend(kpi.current, kpi.previous, kpi.goodWhen);
                const TrendIcon =
                    trend.direction === "flat"
                        ? Minus
                        : trend.direction === "up"
                            ? TrendingUp
                            : TrendingDown;

                return (
                <Card
                    key={kpi.label}
                    className="relative flex flex-col border-border/60 bg-card/95"
                >
                    <div
                        aria-hidden
                        className="pointer-events-none absolute inset-x-0 top-0 h-14 bg-gradient-to-b from-muted/40 to-transparent"
                    />
                    <CardHeader className="relative flex flex-row items-start justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            {kpi.label}
                        </CardTitle>
                        <Badge variant="outline" className={trend.badgeClass}>
                            <TrendIcon className="size-3" data-icon="inline-start" />
                            {trend.direction === "flat" ? "0 %" : `${trend.direction === "up" ? "+" : "-"}${formatPercent(trend.percent)} %`}
                        </Badge>
                    </CardHeader>
                    <CardContent className="relative flex flex-1 flex-col gap-2">
                        <div className="text-4xl leading-none font-semibold tracking-tight">
                            {kpi.value}
                        </div>
                        <p className="text-sm font-medium text-foreground">{trend.sentence}</p>
                        <p className="text-sm text-muted-foreground">{kpi.helper}</p>
                    </CardContent>
                </Card>
            )})}
        </>
    );
}
