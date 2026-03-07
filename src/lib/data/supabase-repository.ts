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
import type {
    SupabaseReceiptRow,
    InferencePayload,
    InferenceFields,
    CompanyRegistrationItem,
} from "@/types/backend";

// Standard Supabase Table Name 
const RECEIPTS_TABLE = "receipts";
const INVOICE_PREFIX = "Faktura: ";

function isIncomeInvoice(receipt: Receipt): boolean {
    return receipt.merchantName.startsWith(INVOICE_PREFIX) && (receipt.amount ?? 0) < 0;
}

function getExpenseAmount(receipt: Receipt): number {
    const amount = receipt.amount ?? 0;
    if (isIncomeInvoice(receipt)) return 0;
    return amount > 0 ? amount : 0;
}

function getIncomeAmount(receipt: Receipt): number {
    if (!isIncomeInvoice(receipt)) return 0;
    return Math.abs(receipt.amount ?? 0);
}

function formatDateToYmd(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function ensureInferencePayload(row: SupabaseReceiptRow): InferencePayload {
    const payload = row.inference
        ? (JSON.parse(JSON.stringify(row.inference)) as InferencePayload)
        : ({ id: row.id } as InferencePayload);

    if (!payload.result) {
        payload.result = {};
    }

    if (!payload.result.fields) {
        payload.result.fields = {};
    }

    return payload;
}

function upsertCompanyRegistration(
    fields: InferenceFields,
    type: "INN" | "DIC",
    value: string | null
) {
    const existingItems = fields.supplier_company_registration?.items ?? [];
    const items: CompanyRegistrationItem[] = [...existingItems];

    const index = items.findIndex((item) => item.fields?.type?.value === type);

    if (!value) {
        if (index >= 0) {
            items.splice(index, 1);
        }
    } else {
        const nextItem: CompanyRegistrationItem = {
            ...(index >= 0 ? items[index] : {}),
            confidence: "Certain",
            fields: {
                ...(index >= 0 ? items[index].fields : {}),
                type: {
                    ...(index >= 0 ? items[index].fields?.type : {}),
                    value: type,
                    confidence: "Certain",
                },
                number: {
                    ...(index >= 0 ? items[index].fields?.number : {}),
                    value,
                    confidence: "Certain",
                },
            },
        };

        if (index >= 0) {
            items[index] = nextItem;
        } else {
            items.push(nextItem);
        }
    }

    fields.supplier_company_registration = {
        ...(fields.supplier_company_registration ?? {}),
        confidence: fields.supplier_company_registration?.confidence ?? "Certain",
        items,
    };
}

function applyDirectFieldOverwrites(payload: InferencePayload, updates: Partial<Receipt>): InferencePayload {
    const fields = payload.result?.fields;
    if (!fields) {
        return payload;
    }

    if (updates.merchantName !== undefined) {
        const merchantName = updates.merchantName.trim();
        fields.supplier_name = {
            ...(fields.supplier_name ?? {}),
            value: merchantName || null,
            confidence: "Certain",
        };
    } else if (updates.companyName !== undefined) {
        const companyName = updates.companyName?.trim() ?? "";
        fields.supplier_name = {
            ...(fields.supplier_name ?? {}),
            value: companyName || null,
            confidence: "Certain",
        };
    }

    if (updates.amount !== undefined) {
        fields.total_amount = {
            ...(fields.total_amount ?? {}),
            value: updates.amount,
            confidence: "Certain",
        };
    }

    if (updates.categoryId !== undefined) {
        fields.purchase_category = {
            ...(fields.purchase_category ?? {}),
            value: updates.categoryId,
            confidence: "Certain",
        };
    }

    if (updates.date !== undefined) {
        fields.date = {
            ...(fields.date ?? {}),
            value: updates.date ? formatDateToYmd(updates.date) : null,
            confidence: "Certain",
        };
    }

    if (updates.ico !== undefined) {
        upsertCompanyRegistration(fields, "INN", updates.ico);
    }

    if (updates.dic !== undefined) {
        upsertCompanyRegistration(fields, "DIC", updates.dic);
    }

    return payload;
}

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

        const monthlyExpenses = currentMonthReceipts.reduce((sum, r) => sum + getExpenseAmount(r), 0);
        const previousMonthExpenses = previousMonthReceipts.reduce((sum, r) => sum + getExpenseAmount(r), 0);

        const getTopCategory = (
            monthReceipts: Receipt[]
        ): DashboardStats["topCategory"] => {
            const categoryMap = new Map<CategoryId, number>();

            monthReceipts.forEach((receipt) => {
                if (!receipt.categoryId) return;
                const expenseAmount = getExpenseAmount(receipt);
                if (expenseAmount <= 0) return;
                const current = categoryMap.get(receipt.categoryId) || 0;
                categoryMap.set(receipt.categoryId, current + expenseAmount);
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
        const monthlyMap = new Map<string, { amount: number; income: number }>(); // "YYYY-MM" -> values

        receipts.forEach(r => {
            if (!r.date || r.amount === null) return;
            const month = `${r.date.getFullYear()}-${String(r.date.getMonth() + 1).padStart(2, '0')}`;
            const current = monthlyMap.get(month) || { amount: 0, income: 0 };
            current.amount += getExpenseAmount(r);
            current.income += getIncomeAmount(r);
            monthlyMap.set(month, current);
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
                amount: monthlyMap.get(monthStr)?.amount || 0,
                income: monthlyMap.get(monthStr)?.income || 0,
            });
        }

        return result;
    }

    async getCategoryBreakdown(): Promise<CategoryBreakdown[]> {
        const receipts = await this.getReceipts();
        const breakdownMap = new Map<string, { amount: number, count: number }>();

        receipts.forEach(r => {
            if (!r.categoryId) return;

            const expenseAmount = getExpenseAmount(r);
            if (expenseAmount <= 0) return;

            const current = breakdownMap.get(r.categoryId) || { amount: 0, count: 0 };
            breakdownMap.set(r.categoryId, {
                amount: current.amount + expenseAmount,
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
        const { data: currentRow, error: fetchError } = await supabase
            .from(RECEIPTS_TABLE)
            .select("*")
            .eq("id", id)
            .single();

        if (fetchError) {
            throw new Error(`Failed to load receipt ${id} for update: ${fetchError.message}`);
        }

        if (!currentRow) {
            throw new Error(`Receipt ${id} not found`);
        }

        const payload = ensureInferencePayload(currentRow as SupabaseReceiptRow);
        const updatedInference = applyDirectFieldOverwrites(payload, updates);

        const { data: updatedRow, error: updateError } = await supabase
            .from(RECEIPTS_TABLE)
            .update({
                inference: updatedInference,
            })
            .eq("id", id)
            .select("*")
            .single();

        if (updateError) {
            throw new Error(`Failed to update receipt ${id}: ${updateError.message}`);
        }

        if (!updatedRow) {
            throw new Error(`Receipt ${id} was updated but no row was returned`);
        }

        return mapSupabaseToReceipt(updatedRow as SupabaseReceiptRow);
    }
}
