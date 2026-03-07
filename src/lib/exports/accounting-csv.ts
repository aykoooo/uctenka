import { getCategoryById } from "@/lib/constants/categories";
import type { Receipt } from "@/types/domain";

export type AccountingDocumentType = "tax-evidence" | "vat-report";

export interface AccountingExportRow {
    date: string;
    supplier_name: string;
    supplier_company_registration: string;
    receipt_number: string;
    total_net: string;
    vat_rate: string;
    total_tax: string;
    total_amount: string;
    purchase_category: string;
}

const CSV_HEADERS: Array<keyof AccountingExportRow> = [
    "date",
    "supplier_name",
    "supplier_company_registration",
    "receipt_number",
    "total_net",
    "vat_rate",
    "total_tax",
    "total_amount",
    "purchase_category",
];

function normalizeNumber(value: number | null | undefined): string {
    if (value === null || value === undefined || Number.isNaN(value)) {
        return "";
    }

    return value.toFixed(2);
}

function formatDate(value: Date | null): string {
    if (!value || Number.isNaN(value.getTime())) {
        return "";
    }

    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, "0");
    const day = String(value.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function csvEscape(value: string): string {
    const escaped = value.replaceAll("\"", "\"\"");
    return `"${escaped}"`;
}

function formatSupplierCompanyRegistration(receipt: Receipt): string {
    const ico = receipt.ico?.trim();
    const dic = receipt.dic?.trim();

    if (ico && dic) {
        return `${ico} / ${dic}`;
    }

    return ico || dic || "";
}

function resolveTaxRows(receipt: Receipt): Array<{ rate: number | null; base: number | null; amount: number | null }> {
    if (receipt.taxes.length > 0) {
        return receipt.taxes.map((tax) => ({
            rate: tax.rate,
            base: tax.base,
            amount: tax.amount,
        }));
    }

    const fallbackTax = receipt.totalTax;
    const fallbackBase = receipt.totalNet ?? (
        receipt.amount !== null && receipt.amount !== undefined && fallbackTax !== null && fallbackTax !== undefined
            ? receipt.amount - fallbackTax
            : receipt.amount
    );

    return [{
        rate: null,
        base: fallbackBase ?? null,
        amount: fallbackTax ?? null,
    }];
}

function resolveCategoryLabel(receipt: Receipt): string {
    const category = getCategoryById(receipt.categoryId);
    return category?.label ?? receipt.categoryId ?? "";
}

function createRow(receipt: Receipt, taxLine: { rate: number | null; base: number | null; amount: number | null }): AccountingExportRow {
    return {
        date: formatDate(receipt.date),
        supplier_name: receipt.companyName || receipt.merchantName,
        supplier_company_registration: formatSupplierCompanyRegistration(receipt),
        receipt_number: receipt.receiptNumber || receipt.id,
        total_net: normalizeNumber(taxLine.base),
        vat_rate: taxLine.rate === null || taxLine.rate === undefined ? "" : `${taxLine.rate}%`,
        total_tax: normalizeNumber(taxLine.amount),
        total_amount: normalizeNumber(receipt.amount),
        purchase_category: resolveCategoryLabel(receipt),
    };
}

export function buildAccountingExportRows(
    receipts: Receipt[],
    documentType: AccountingDocumentType,
): AccountingExportRow[] {
    const rows = receipts
        .flatMap((receipt) => {
            const taxRows = resolveTaxRows(receipt);
            return taxRows.map((taxLine) => createRow(receipt, taxLine));
        })
        .sort((a, b) => a.date.localeCompare(b.date));

    if (documentType === "vat-report") {
        return rows.filter((row) => row.total_net !== "" || row.total_tax !== "" || row.vat_rate !== "");
    }

    return rows;
}

export function createAccountingCsv(rows: AccountingExportRow[]): string {
    const headerLine = CSV_HEADERS.map(csvEscape).join(",");
    const bodyLines = rows.map((row) => CSV_HEADERS.map((header) => csvEscape(row[header])).join(","));

    return [headerLine, ...bodyLines].join("\n");
}

export function getAccountingExportLabel(documentType: AccountingDocumentType): string {
    if (documentType === "tax-evidence") {
        return "Daňová evidence výdajů";
    }

    return "Podklad pro kontrolní hlášení a přiznání k DPH";
}

export function buildAccountingCsvFileName(documentType: AccountingDocumentType, generatedAt = new Date()): string {
    const y = generatedAt.getFullYear();
    const m = String(generatedAt.getMonth() + 1).padStart(2, "0");
    const d = String(generatedAt.getDate()).padStart(2, "0");

    const slug = documentType === "tax-evidence" ? "danova-evidence-vydaju" : "podklad-dph";
    return `${slug}-${y}${m}${d}.csv`;
}

export const UTF8_BOM = "\uFEFF";
