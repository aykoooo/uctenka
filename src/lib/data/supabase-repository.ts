// ============================================================
// Supabase Repository - Fetches parsed receipt data.
// ============================================================

import type {
    Receipt,
    DashboardStats,
    MonthlyExpense,
    CategoryBreakdown,
    CategoryId,
} from "@/types/domain";
import type { DataRepository, ReceiptFilters } from "./repository";
import { supabase } from "@/lib/supabase/client";
import { mapSupabaseToReceipt } from "./mappers";
import type { SupabaseReceiptRow } from "@/types/backend";

// Standard Supabase Table Name 
const RECEIPTS_TABLE = "receipts";

export class SupabaseRepository implements DataRepository {
    async getReceipts(filters?: ReceiptFilters): Promise<Receipt[]> {
        const query = supabase.from(RECEIPTS_TABLE).select("*");

        // We apply filters in memory for now given the complex structure, 
        // but for a production app, we would write SQL/RPCs on inference fields.
        const { data, error } = await query.order("created_at", { ascending: false });

        if (error) {
            console.error("Supabase error fetching receipts:", error);
            return [];
        }

        let receipts = (data as SupabaseReceiptRow[]).map(mapSupabaseToReceipt);

        // Client-side filtering
        if (filters?.search) {
            const searchQuery = filters.search.toLowerCase();
            receipts = receipts.filter(r =>
                r.merchantName.toLowerCase().includes(searchQuery) ||
                (r.companyName && r.companyName.toLowerCase().includes(searchQuery)) ||
                (r.ico && r.ico.includes(searchQuery))
            );
        }

        if (filters?.categoryId && filters.categoryId !== "all") {
            receipts = receipts.filter(r => r.categoryId === filters.categoryId);
        }

        if (filters?.status && filters.status !== "all") {
            if (filters.status === "review") {
                receipts = receipts.filter(r => r.needsReview);
            } else {
                receipts = receipts.filter(r => r.status === filters.status);
            }
        }

        return receipts;
    }

    async getReceiptById(id: string): Promise<Receipt | null> {
        const { data, error } = await supabase
            .from(RECEIPTS_TABLE)
            .select("*")
            .eq("id", id)
            .single();

        if (error) {
            console.error("Supabase error fetching receipt by ID:", error);
            return null;
        }

        if (!data) return null;

        return mapSupabaseToReceipt(data as SupabaseReceiptRow);
    }

    async getReviewQueue(): Promise<Receipt[]> {
        const receipts = await this.getReceipts();
        return receipts.filter(r => r.needsReview);
    }

    async getDashboardStats(): Promise<DashboardStats> {
        const receipts = await this.getReceipts();

        // This is a naive client-side aggregation. In prod, use Supabase RPC.
        const now = new Date();
        const thisMonth = now.getMonth();
        const thisYear = now.getFullYear();
        const previousMonthDate = new Date(thisYear, thisMonth - 1, 1);
        const previousMonth = previousMonthDate.getMonth();
        const previousMonthYear = previousMonthDate.getFullYear();

        const currentMonthReceipts = receipts.filter(r => {
            if (!r.date) return false;
            return r.date.getMonth() === thisMonth && r.date.getFullYear() === thisYear;
        });
        const previousMonthReceipts = receipts.filter(r => {
            if (!r.date) return false;
            return r.date.getMonth() === previousMonth && r.date.getFullYear() === previousMonthYear;
        });

        const monthlyExpenses = currentMonthReceipts.reduce((sum, r) => sum + (r.amount || 0), 0);
        const previousMonthExpenses = previousMonthReceipts.reduce((sum, r) => sum + (r.amount || 0), 0);

        const getTopCategory = (
            monthReceipts: Receipt[]
        ): DashboardStats["topCategory"] => {
            const categoryMap = new Map<CategoryId, number>();

            monthReceipts.forEach((receipt) => {
                if (!receipt.categoryId || receipt.amount === null) return;
                const current = categoryMap.get(receipt.categoryId) || 0;
                categoryMap.set(receipt.categoryId, current + receipt.amount);
            });

            let top: DashboardStats["topCategory"] = null;
            let maxAmount = 0;

            for (const [categoryId, amount] of Array.from(categoryMap.entries())) {
                if (amount > maxAmount) {
                    maxAmount = amount;
                    top = { categoryId, amount };
                }
            }

            return top;
        };

        const topCategory = getTopCategory(currentMonthReceipts);
        const previousTopCategory = getTopCategory(previousMonthReceipts);

        const reviewCount = currentMonthReceipts.filter((r) => r.needsReview).length;
        const previousReviewCount = previousMonthReceipts.filter((r) => r.needsReview).length;

        return {
            monthlyExpenses,
            previousMonthExpenses,
            receiptCount: currentMonthReceipts.length,
            previousMonthReceiptCount: previousMonthReceipts.length,
            topCategory,
            previousTopCategory,
            pendingReviewCount: reviewCount,
            previousPendingReviewCount: previousReviewCount,
        };
    }

    async getMonthlyExpenses(): Promise<MonthlyExpense[]> {
        const receipts = await this.getReceipts();

        // Naive client-side aggregation
        const monthlyMap = new Map<string, number>(); // "YYYY-MM" -> amount

        receipts.forEach(r => {
            if (!r.date || !r.amount) return;
            const month = `${r.date.getFullYear()}-${String(r.date.getMonth() + 1).padStart(2, '0')}`;
            const current = monthlyMap.get(month) || 0;
            monthlyMap.set(month, current + r.amount);
        });

        // Convert to array and sort
        const result: MonthlyExpense[] = [];
        const sortedMonths = Array.from(monthlyMap.keys()).sort();

        // Get last 6 months
        const recentMonths = sortedMonths.slice(-6);
        const czechMonthsFull = ["Leden", "Únor", "Březen", "Duben", "Květen", "Červen", "Červenec", "Srpen", "Září", "Říjen", "Listopad", "Prosinec"];

        for (const monthStr of recentMonths) {
            const [year, month] = monthStr.split('-');
            const monthIndex = parseInt(month) - 1;
            result.push({
                month: monthStr,
                label: `${czechMonthsFull[monthIndex]}`,
                amount: monthlyMap.get(monthStr) || 0,
                income: 0, // Placeholder as we only track expenses for now
            });
        }

        return result;
    }

    async getCategoryBreakdown(): Promise<CategoryBreakdown[]> {
        const receipts = await this.getReceipts();
        const breakdownMap = new Map<string, { amount: number, count: number }>();

        receipts.forEach(r => {
            if (!r.categoryId || !r.amount) return;

            const current = breakdownMap.get(r.categoryId) || { amount: 0, count: 0 };
            breakdownMap.set(r.categoryId, {
                amount: current.amount + r.amount,
                count: current.count + 1
            });
        });

        return Array.from(breakdownMap.entries())
            .map(([categoryId, data]) => ({
                categoryId: categoryId as CategoryId,
                amount: data.amount,
                count: data.count
            }))
            .sort((a, b) => b.amount - a.amount);
    }

    async getRecentReceipts(limit: number): Promise<Receipt[]> {
        const receipts = await this.getReceipts();
        // Backend sorts by created_at desc already, so we just slice.
        return receipts.slice(0, limit);
    }

    async updateReceipt(id: string, updates: Partial<Receipt>): Promise<Receipt> {
        // Technically, modifying inference data directly is an anti-pattern,
        // but for user-overrides, we should have a `user_overrides` json field
        // in the database. 
        // For MVP, we'll throw an alert here as this is a non-destructive mock frontend.
        console.warn(`Attempting to update Supabase row ${id} with:`, updates);
        throw new Error("Updating receipts in Supabase is not implemented in this MVP layer.");
    }
}
