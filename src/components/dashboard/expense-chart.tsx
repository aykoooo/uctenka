"use client";

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import type { MonthlyExpense } from "@/types/domain";
import { formatCZK, formatCZKCompact } from "@/lib/formatters";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
} from "recharts";
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    ChartLegend,
    ChartLegendContent,
} from "@/components/ui/chart";
import { TrendingDown, TrendingUp } from "lucide-react";

const chartConfig = {
    income: {
        label: "Příjmy",
        color: "var(--color-emerald-500)", // Green
    },
    amount: {
        label: "Výdaje",
        color: "var(--color-red-500)", // Red
    },
} satisfies ChartConfig;

interface ExpenseChartProps {
    data: MonthlyExpense[];
}

export function ExpenseChart({ data }: ExpenseChartProps) {
    const sortedData = [...data].sort((a, b) => a.month.localeCompare(b.month));
    const chartData = sortedData.slice(-6);

    const totals = chartData.reduce(
        (acc, item) => {
            acc.income += item.income;
            acc.expenses += item.amount;
            return acc;
        },
        { income: 0, expenses: 0 }
    );

    const latest = chartData.at(-1);
    const previous = chartData.at(-2);
    const expenseDelta = latest && previous ? latest.amount - previous.amount : 0;
    const expenseTrendUp = expenseDelta >= 0;

    return (
        <Card className="flex h-full flex-col">
            <CardHeader>
                <CardTitle className="text-base">Příjmy a výdaje</CardTitle>
                <CardDescription>Posledních {chartData.length || 0} měsíců přehledu</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-1 items-stretch pb-2">
                <ChartContainer config={chartConfig} className="h-full min-h-[320px] w-full aspect-auto">
                    <BarChart
                        accessibilityLayer
                        data={chartData}
                        margin={{ top: 8, right: 0, left: 0, bottom: 0 }}
                        barCategoryGap="24%"
                    >
                        <CartesianGrid vertical={false} strokeDasharray="3 3" />
                        <YAxis
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            width={56}
                            tickFormatter={(value) => formatCZKCompact(Number(value))}
                        />
                        <XAxis
                            dataKey="label"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                        />
                        <ChartTooltip
                            cursor={false}
                            content={
                                <ChartTooltipContent
                                    indicator="dashed"
                                    formatter={(value, name) => (
                                        <div className="flex min-w-[140px] items-center justify-between gap-3">
                                            <span className="text-muted-foreground">{name}</span>
                                            <span className="font-medium text-foreground">{formatCZK(Number(value))}</span>
                                        </div>
                                    )}
                                />
                            }
                        />
                        <ChartLegend verticalAlign="top" content={<ChartLegendContent />} />
                        <Bar
                            dataKey="income"
                            fill="var(--color-income)"
                            radius={[4, 4, 0, 0]}
                            maxBarSize={32}
                        />
                        <Bar
                            dataKey="amount"
                            fill="var(--color-amount)"
                            radius={[4, 4, 0, 0]}
                            maxBarSize={32}
                        />
                    </BarChart>
                </ChartContainer>
            </CardContent>
            <CardFooter className="grid grid-cols-2 gap-4 border-t">
                <div className="flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground">Bilance období</span>
                    <span className="text-sm font-medium">{formatCZK(totals.income - totals.expenses)}</span>
                </div>
                <div className="flex flex-col items-end gap-1 text-right">
                    <span className="text-xs text-muted-foreground">Výdaje vs minulý měsíc</span>
                    <span className="inline-flex items-center gap-1 text-sm font-medium">
                        {expenseTrendUp ? <TrendingUp className="size-4" /> : <TrendingDown className="size-4" />}
                        {expenseDelta === 0 ? "Beze změny" : `${expenseTrendUp ? "+" : ""}${formatCZK(expenseDelta)}`}
                    </span>
                </div>
            </CardFooter>
        </Card>
    );
}
