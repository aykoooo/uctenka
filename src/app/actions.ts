"use server";

import { getRepository } from "@/lib/data";
import type { ReceiptFilters } from "@/lib/data";
import type { Receipt } from "@/types/domain";
import { revalidatePath } from "next/cache";
import {
    UTF8_BOM,
    buildAccountingCsvFileName,
    buildAccountingExportRows,
    createAccountingCsv,
    getAccountingExportLabel,
    type AccountingDocumentType,
} from "@/lib/exports/accounting-csv";

export interface AccountingExportFilters {
    search?: string;
    categoryId?: string;
    status?: string;
    fromDate?: string;
    toDate?: string;
}

export interface AccountingCsvExportResult {
    fileName: string;
    mimeType: string;
    content: string;
    label: string;
    rowCount: number;
}

function inDateRange(receiptDate: Date | null, fromDate?: string, toDate?: string): boolean {
    if (!receiptDate) {
        return false;
    }

    const start = fromDate ? new Date(fromDate) : null;
    const end = toDate ? new Date(toDate) : null;

    if (start && !Number.isNaN(start.getTime()) && receiptDate < start) {
        return false;
    }

    if (end && !Number.isNaN(end.getTime())) {
        const inclusiveEnd = new Date(end);
        inclusiveEnd.setHours(23, 59, 59, 999);
        if (receiptDate > inclusiveEnd) {
            return false;
        }
    }

    return true;
}

export async function fetchReceipts(filters?: ReceiptFilters) {
    const repo = getRepository();
    // Wrap in try-catch in case of server-side exceptions leaking details
    try {
        const data = await repo.getReceipts(filters);
        return data;
    } catch (error) {
        console.error("Action fetchReceipts failed:", error);
        return [];
    }
}

export async function updateReceiptAction(id: string, updates: Partial<Receipt>) {
    const repo = getRepository();
    const updated = await repo.updateReceipt(id, updates);

    revalidatePath("/review");
    revalidatePath("/receipts");
    revalidatePath(`/receipts/${id}`);

    return updated;
}

export async function exportAccountingCsvAction(
    documentType: AccountingDocumentType,
    filters?: AccountingExportFilters,
): Promise<AccountingCsvExportResult> {
    const repo = getRepository();

    const repoFilters: ReceiptFilters = {
        search: filters?.search,
        categoryId: filters?.categoryId,
        status: filters?.status,
        sortBy: "date",
        sortOrder: "asc",
    };

    const receipts = await repo.getReceipts(repoFilters);
    const filteredByDate = receipts.filter((receipt) =>
        inDateRange(receipt.date, filters?.fromDate, filters?.toDate)
    );

    const rows = buildAccountingExportRows(filteredByDate, documentType);
    const csv = UTF8_BOM + createAccountingCsv(rows);

    return {
        fileName: buildAccountingCsvFileName(documentType),
        mimeType: "text/csv;charset=utf-8",
        content: csv,
        label: getAccountingExportLabel(documentType),
        rowCount: rows.length,
    };
}
