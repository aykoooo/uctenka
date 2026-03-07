// ============================================================
// Mock Repository - Implements DataRepository using mock data.
// Default data source for v1 development.
// ============================================================

import type {
    Receipt,
    DashboardStats,
    MonthlyExpense,
    CategoryBreakdown,
    CategoryId,
} from "@/types/domain";
import type { DataRepository, ReceiptFilters } from "./repository";
import { MOCK_RECEIPT_ROWS } from "./mock-data";
import { mapBackendReceiptToDomain } from "./mappers";
import { isSameMonth, subMonths, startOfMonth, format } from "date-fns";
import { cs } from "date-fns/locale";

// Pre-map all receipts to domain types once
const allReceipts: Receipt[] = MOCK_RECEIPT_ROWS.map(mapBackendReceiptToDomain);

export class MockRepository implements DataRepository {
    async getReceipts(filters?: ReceiptFilters): Promise<Receipt[]> {
        let result = [...allReceipts];

        if (filters?.search) {
            const search = filters.search.toLowerCase();
            result = result.filter(
                (r) =>
                    r.merchantName.toLowerCase().includes(search) ||
                    (r.companyName && r.companyName.toLowerCase().includes(search))
            );
        }

        if (filters?.categoryId) {
            result = result.filter((r) => r.categoryId === filters.categoryId);
        }

        if (filters?.status) {
            result = result.filter((r) => r.status === filters.status);
        }

        // Sort
        const sortBy = filters?.sortBy ?? "date";
        const sortOrder = filters?.sortOrder ?? "desc";
        const multiplier = sortOrder === "desc" ? -1 : 1;

        result.sort((a, b) => {
            switch (sortBy) {
                case "date": {
                    const dateA = a.date?.getTime() ?? 0;
                    const dateB = b.date?.getTime() ?? 0;
                    return (dateA - dateB) * multiplier;
                }
                case "amount": {
                    const amtA = a.amount ?? 0;
                    const amtB = b.amount ?? 0;
                    return (amtA - amtB) * multiplier;
                }
                case "merchant":
                    return a.merchantName.localeCompare(b.merchantName, "cs") * multiplier;
                default:
                    return 0;
            }
        });

        return result;
    }

    async getReceiptById(id: string): Promise<Receipt | null> {
        return allReceipts.find((r) => r.id === id) ?? null;
    }

    async getReviewQueue(): Promise<Receipt[]> {
        return allReceipts.filter((r) => r.needsReview);
    }

    async getDashboardStats(): Promise<DashboardStats> {
        const now = new Date();
        const currentMonthStart = startOfMonth(now);
        const previousMonthStart = startOfMonth(subMonths(now, 1));

        const thisMonthReceipts = allReceipts.filter(
            (r) => r.date && isSameMonth(r.date, currentMonthStart)
        );
        const previousMonthReceipts = allReceipts.filter(
            (r) => r.date && isSameMonth(r.date, previousMonthStart)
        );

        const monthlyExpenses = thisMonthReceipts.reduce((sum, r) => sum + (r.amount ?? 0), 0);
        const previousMonthExpenses = previousMonthReceipts.reduce((sum, r) => sum + (r.amount ?? 0), 0);

        const getTopCategoryFor = (
            receipts: Receipt[]
        ): DashboardStats["topCategory"] => {
            const totals: Partial<Record<CategoryId, number>> = {};

            for (const receipt of receipts) {
                if (!receipt.categoryId || receipt.amount === null) continue;
                totals[receipt.categoryId] = (totals[receipt.categoryId] ?? 0) + receipt.amount;
            }

            let top: DashboardStats["topCategory"] = null;
            let maxAmount = 0;

            for (const [categoryId, amount] of Object.entries(totals)) {
                const value = amount ?? 0;
                if (value > maxAmount) {
                    maxAmount = value;
                    top = { categoryId: categoryId as CategoryId, amount: value };
                }
            }

            return top;
        };

        const topCategory = getTopCategoryFor(thisMonthReceipts);
        const previousTopCategory = getTopCategoryFor(previousMonthReceipts);

        const pendingReviewCount = thisMonthReceipts.filter((r) => r.needsReview).length;
        const previousPendingReviewCount = previousMonthReceipts.filter((r) => r.needsReview).length;

        return {
            monthlyExpenses,
            previousMonthExpenses,
            receiptCount: thisMonthReceipts.length,
            previousMonthReceiptCount: previousMonthReceipts.length,
            topCategory,
            previousTopCategory,
            pendingReviewCount,
            previousPendingReviewCount,
        };
    }

    async getMonthlyExpenses(): Promise<MonthlyExpense[]> {
        const CZ_MONTHS = [
            "Led", "Úno", "Bře", "Dub", "Kvě", "Čvn",
            "Čvc", "Srp", "Zář", "Říj", "Lis", "Pro",
        ];

        const monthMap: Record<string, number> = {};

        for (const r of allReceipts) {
            if (!r.date || r.amount === null) continue;
            const key = `${r.date.getFullYear()}-${String(r.date.getMonth() + 1).padStart(2, "0")}`;
            monthMap[key] = (monthMap[key] ?? 0) + r.amount;
        }

        return Object.entries(monthMap)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([key, amount]) => {
                const [yearStr, monthStr] = key.split("-");
                const date = new Date(parseInt(yearStr, 10), parseInt(monthStr, 10) - 1, 1);
                const monthLabel = format(date, "LLLL", { locale: cs });
                const capitalizedMonthLabel = monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1);

                // Generate random income, slightly higher than expenses
                const minIncome = Math.max(amount * 1.1, 30000); // At least 10% higher, or a base of 30k
                const maxIncome = minIncome + 20000; // Up to 20k more than minIncome
                const income = Math.floor(Math.random() * (maxIncome - minIncome + 1)) + minIncome;

                return {
                    month: key,
                    label: capitalizedMonthLabel,
                    amount,
                    income,
                };
            });
    }

    async getCategoryBreakdown(): Promise<CategoryBreakdown[]> {
        const catMap: Record<string, { amount: number; count: number }> = {};

        for (const r of allReceipts) {
            if (!r.categoryId) continue;
            if (!catMap[r.categoryId]) {
                catMap[r.categoryId] = { amount: 0, count: 0 };
            }
            catMap[r.categoryId].amount += r.amount ?? 0;
            catMap[r.categoryId].count += 1;
        }

        return Object.entries(catMap)
            .map(([categoryId, data]) => ({
                categoryId: categoryId as CategoryId,
                amount: data.amount,
                count: data.count,
            }))
            .sort((a, b) => b.amount - a.amount);
    }

    async getRecentReceipts(limit: number): Promise<Receipt[]> {
        return [...allReceipts]
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
            .slice(0, limit);
    }

    async updateReceipt(id: string, updates: Partial<Receipt>): Promise<Receipt> {
        const index = allReceipts.findIndex(r => r.id === id);
        if (index === -1) {
            throw new Error(`Receipt ${id} not found`);
        }

        const current = allReceipts[index];
        const newStatus = updates.status ?? current.status;
        const reviewIssues = newStatus === "processed" ? [] : (updates.reviewIssues ?? current.reviewIssues);

        const updated = {
            ...current,
            ...updates,
            reviewIssues,
        };

        allReceipts[index] = updated;
        return updated;
    }
}
