"use client";

import { TrendingUp } from "lucide-react";
import { Label, PolarRadiusAxis, RadialBar, RadialBarChart } from "recharts";

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import type { CategoryBreakdown } from "@/types/domain";
import { CATEGORIES } from "@/lib/constants/categories";
import { formatCZKCompact } from "@/lib/formatters";
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";

const chartConfig = {
    amount: { label: "Výdaje" },
    ...Object.fromEntries(
        Object.values(CATEGORIES).map((cat) => [
            cat.id,
            {
                label: cat.label,
                color: cat.color,
            },
        ])
    ),
    other: {
        label: "Ostatní",
        color: "var(--muted-foreground)"
    }
} satisfies ChartConfig;

interface CategoryChartProps {
    data: CategoryBreakdown[];
}

export function CategoryChart({ data }: CategoryChartProps) {
    if (!data || data.length === 0) {
        return (
            <Card className="flex h-full flex-col">
                <CardHeader className="items-start pb-0">
                    <CardTitle>Kategorie výdajů</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
                    Žádná data k zobrazení.
                </CardContent>
            </Card>
        );
    }

    // Sort descending so the largest slice is rendered correctly natively
    const sortedData = [...data].sort((a, b) => b.amount - a.amount);

    let totalExpenses = 0;
    const chartDataObj: Record<string, number | string> = { name: "categories" };

    sortedData.forEach((item) => {
        const key = item.categoryId ?? "other";
        chartDataObj[key] = item.amount;
        totalExpenses += item.amount;
    });

    const chartData = [chartDataObj];
    const topCategory = sortedData[0];
    const topCategoryLabel = topCategory
        ? CATEGORIES[topCategory.categoryId]?.label ?? "Ostatní"
        : "Ostatní";
    const topCategoryShare = totalExpenses > 0 && topCategory
        ? (topCategory.amount / totalExpenses) * 100
        : 0;
    const topCategoryShareLabel = topCategoryShare.toLocaleString("cs-CZ", {
        maximumFractionDigits: 1,
    });

    return (
        <Card className="flex h-full flex-col">
            <CardHeader className="items-start pb-0">
                <CardTitle>Kategorie výdajů</CardTitle>
                <CardDescription>Podíl kategorií na celkových výdajích</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-1 items-center justify-center px-2 pb-0 pt-0">
                <ChartContainer
                    config={chartConfig}
                    className="mx-auto h-[320px] w-full max-w-[460px] aspect-auto"
                >
                    <RadialBarChart
                        data={chartData}
                        startAngle={180}
                        endAngle={0}
                        cx="50%"
                        cy="74%"
                        innerRadius={114}
                        outerRadius={184}
                    >
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent hideLabel />}
                        />
                        <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
                            <Label
                                content={({ viewBox }) => {
                                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                                        return (
                                            <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle">
                                                <tspan
                                                    x={viewBox.cx}
                                                    y={(viewBox.cy || 0) - 18}
                                                    className="fill-foreground text-2xl font-bold"
                                                >
                                                    {formatCZKCompact(totalExpenses)}
                                                </tspan>
                                                <tspan
                                                    x={viewBox.cx}
                                                    y={(viewBox.cy || 0) + 8}
                                                    className="fill-muted-foreground text-xs"
                                                >
                                                    Celkem
                                                </tspan>
                                            </text>
                                        );
                                    }
                                }}
                            />
                        </PolarRadiusAxis>

                        {/* Render radial bars per category from sorted data */}
                        {sortedData.map((item) => {
                            const key = item.categoryId ?? "other";
                            return (
                                <RadialBar
                                    key={key}
                                    dataKey={key}
                                    stackId="a"
                                    cornerRadius={5}
                                    fill={`var(--color-${key})`}
                                    className="stroke-transparent stroke-2"
                                />
                            );
                        })}

                    </RadialBarChart>
                </ChartContainer>
            </CardContent>
            <CardFooter className="flex-col items-start gap-2 text-sm">
                <div className="flex items-center gap-2 font-medium leading-none">
                    Nejvyšší podíl má {topCategoryLabel} ({topCategoryShareLabel} %)
                    <TrendingUp className="size-4" />
                </div>
                <div className="leading-none text-muted-foreground">
                    Zobrazeno rozdělení celkových výdajů podle kategorií.
                </div>
            </CardFooter>
        </Card>
    );
}
