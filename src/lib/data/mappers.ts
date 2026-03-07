// ============================================================
// Mappers - Convert backend row shapes to frontend domain types.
// This is the only place that knows about backend field names.
// ============================================================

import type { BackendReceiptRow, SupabaseReceiptRow, ConfidenceString } from "@/types/backend";
import { DEFAULT_CURRENCY } from "@/lib/constants/locale";
import type {
    Receipt,
    ReceiptStatus,
    ConfidenceLevel,
    ReviewIssue,
    CategoryId,
} from "@/types/domain";

const VALID_STATUSES: ReceiptStatus[] = ["processed", "pending", "error"];
const VALID_CATEGORIES: CategoryId[] = [
    "food", "transport", "office", "services", "electronics",
    "health", "entertainment", "clothing", "other",
];

function mapStatus(raw: string): ReceiptStatus {
    if (VALID_STATUSES.includes(raw as ReceiptStatus)) {
        return raw as ReceiptStatus;
    }
    return "pending";
}

function mapConfidenceLevel(confidence: number): ConfidenceLevel {
    if (confidence >= 80) return "high";
    if (confidence >= 50) return "medium";
    return "low";
}

function mapCategory(raw: string | null): CategoryId | null {
    if (!raw) return null;
    if (VALID_CATEGORIES.includes(raw as CategoryId)) {
        return raw as CategoryId;
    }
    return "other";
}

function mapInferenceCategory(rawCategory: string | null | undefined): CategoryId {
    if (!rawCategory) return "other";
    const lower = rawCategory.toLowerCase();

    if (lower.includes("food") || lower.includes("restaurant") || lower.includes("grocery")) return "food";
    if (lower.includes("transport") || lower.includes("fuel") || lower.includes("travel")) return "transport";
    if (lower.includes("office") || lower.includes("supplies")) return "office";
    if (lower.includes("service")) return "services";
    if (lower.includes("electronic") || lower.includes("it") || lower.includes("software")) return "electronics";
    if (lower.includes("health") || lower.includes("medical")) return "health";
    if (lower.includes("entertainment") || lower.includes("leisure")) return "entertainment";
    if (lower.includes("cloth") || lower.includes("apparel")) return "clothing";

    return "other";
}

// Map inference string-based confidence to a percentage (0-100)
function mapConfidenceToPercentage(conf: ConfidenceString | null | undefined): number {
    switch (conf) {
        case "Certain": return 100;
        case "High": return 80;
        case "Medium": return 50;
        case "Low": return 20;
        default: return 0;
    }
}

// Map inference string-based confidence to DOMAIN ConfidenceLevel
function mapInferenceConfidenceToLevel(conf: ConfidenceString | null | undefined): ConfidenceLevel {
    switch (conf) {
        case "Certain":
        case "High":
            return "high";
        case "Medium":
            return "medium";
        case "Low":
        default:
            return "low";
    }
}

function detectReviewIssues(row: BackendReceiptRow): ReviewIssue[] {
    const issues: ReviewIssue[] = [];

    if (row.confidence < 50) {
        issues.push({ type: "low_confidence", label: "Nízká důvěra" });
    }
    if (!row.category) {
        issues.push({ type: "missing_category", label: "Chybí kategorie" });
    }
    if (!row.receipt_date) {
        issues.push({ type: "missing_date", label: "Chybí datum" });
    }
    if (row.amount === null || row.amount === undefined) {
        issues.push({ type: "missing_amount", label: "Chybí částka" });
    }
    if (!row.merchant_name) {
        issues.push({ type: "missing_merchant", label: "Chybí obchod" });
    }

    return issues;
}

export function mapBackendReceiptToDomain(row: BackendReceiptRow): Receipt {
    const reviewIssues = detectReviewIssues(row);
    const confidenceLevel = mapConfidenceLevel(row.confidence);

    return {
        id: row.id,
        receiptNumber: null,
        merchantName: row.merchant_name,
        companyName: row.company_name,
        ico: row.ico,
        dic: null, // Legacy mock doesn't have it
        date: row.receipt_date ? new Date(row.receipt_date) : null,
        categoryId: mapCategory(row.category),
        amount: row.amount,
        totalNet: null,
        totalTax: null,
        taxes: [],
        currency: row.currency || DEFAULT_CURRENCY,
        status: mapStatus(row.status),
        confidence: row.confidence,
        confidenceLevel,
        imageUrl: row.image_url,
        rawText: row.raw_text,
        reviewIssues,
        needsReview: reviewIssues.length > 0 || row.status === "pending",
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at),
        telegramMessageId: row.telegram_message_id,
        ocrEngine: row.ocr_engine,
        processingDurationMs: row.processing_duration_ms,
    };
}

export function mapSupabaseToReceipt(row: SupabaseReceiptRow): Receipt {
    const fields = row.inference?.result?.fields;

    // Default values if fields are missing
    let merchantName = "Neznámý obchodník";
    let companyName = null;
    let ico = null;
    let dic = null;
    let receiptNumber = null;
    let amount = null;
    let totalNet = null;
    let totalTax = null;
    let currency = DEFAULT_CURRENCY;
    let date = null;
    const taxes: Receipt["taxes"] = [];
    let categoryId: CategoryId = "other";
    let confidence: number = 0;
    let confidenceLevel: ConfidenceLevel = "low";

    if (fields) {
        merchantName = fields.supplier_name?.value || "Neznámý obchodník";
        companyName = fields.supplier_name?.value || null; // Using supplier_name as companyName fallback

        // Find IČO and DIČ
        if (fields.supplier_company_registration?.items) {
            for (const item of fields.supplier_company_registration.items) {
                const type = item.fields?.type?.value;
                const value = item.fields?.number?.value;
                if ((type === "INN" || type === "ICO") && value) {
                    ico = value;
                } else if ((type === "DIC" || type === "VAT") && value) {
                    dic = value;
                }
            }
        }

        receiptNumber = fields.receipt_number?.value ?? null;

        // Amount and Currency
        amount = fields.total_amount?.value ?? null;
        totalNet = fields.total_net?.value ?? null;
        totalTax = fields.total_tax?.value ?? null;
        if (fields.locale?.fields?.currency?.value) {
            currency = fields.locale.fields.currency.value;
        }

        if (fields.taxes?.items?.length) {
            for (const taxItem of fields.taxes.items) {
                taxes.push({
                    rate: taxItem.fields?.rate?.value ?? null,
                    base: taxItem.fields?.base?.value ?? null,
                    amount: taxItem.fields?.amount?.value ?? null,
                });
            }
        }

        // Date
        if (fields.date?.value) {
            const parsedDate = new Date(fields.date.value);
            if (!isNaN(parsedDate.getTime())) {
                date = parsedDate;
            }
        }

        // Category
        categoryId = mapInferenceCategory(fields.purchase_category?.value);

        // Calculate confidence prioritizing certain fields in this order
        const confString = fields.total_amount?.confidence || fields.supplier_name?.confidence || fields.date?.confidence;
        confidence = mapConfidenceToPercentage(confString);
        confidenceLevel = mapInferenceConfidenceToLevel(confString);
    }

    const reviewIssues: ReviewIssue[] = [];
    if (amount === null || amount === undefined) reviewIssues.push({ type: "missing_amount", label: "Chybí částka" });
    if (!date) reviewIssues.push({ type: "missing_date", label: "Chybí datum" });
    if (!merchantName || merchantName === "Neznámý obchodník") reviewIssues.push({ type: "missing_merchant", label: "Chybí obchod" });
    if (confidenceLevel === "low") reviewIssues.push({ type: "low_confidence", label: "Nízká spolehlivost čtení" });

    return {
        id: row.id,
        receiptNumber,
        merchantName,
        companyName,
        ico,
        dic,
        date,
        categoryId,
        amount,
        totalNet,
        totalTax,
        taxes,
        currency,
        status: "processed", // Static for now until backend status sync is implemented
        confidence,
        confidenceLevel,
        imageUrl: row.image_url,
        rawText: row.inference?.result?.raw_text || null,
        reviewIssues,
        needsReview: reviewIssues.length > 0,
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.created_at),
        telegramMessageId: null,
        ocrEngine: row.inference?.model?.id || null,
        processingDurationMs: null,
    };
}
