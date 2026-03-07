// ============================================================
// Repository Interface - Data access abstraction.
// Pages/components depend on this, not on backend directly.
// ============================================================

import type {
    Receipt,
    DashboardStats,
    MonthlyExpense,
    CategoryBreakdown,
} from "@/types/domain";

export interface ReceiptFilters {
    search?: string;
    categoryId?: string;
    status?: string;
    sortBy?: "date" | "amount" | "merchant";
    sortOrder?: "asc" | "desc";
}

export interface DataRepository {
    getReceipts(filters?: ReceiptFilters): Promise<Receipt[]>;
    getReceiptById(id: string): Promise<Receipt | null>;
    getReviewQueue(): Promise<Receipt[]>;
    getDashboardStats(): Promise<DashboardStats>;
    getMonthlyExpenses(): Promise<MonthlyExpense[]>;
    getCategoryBreakdown(): Promise<CategoryBreakdown[]>;
    getRecentReceipts(limit: number): Promise<Receipt[]>;
    updateReceipt(id: string, updates: Partial<Receipt>): Promise<Receipt>;
}
