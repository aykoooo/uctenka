// ============================================================
// Backend Types - Raw models from Supabase database.
// ============================================================

export type ConfidenceString = "Low" | "Medium" | "High" | "Certain";

export interface LocationInfo {
    // Array of coordinates, typically polygon points
    polygon?: number[][];
}

export interface FieldValue<T> {
    locations?: LocationInfo[];
    confidence?: ConfidenceString | null;
    value?: T | null;
}

export interface NestedField<T> {
    locations?: LocationInfo[];
    confidence?: ConfidenceString | null;
    fields?: T;
}

export interface ArrayField<T> {
    items?: T[];
    confidence?: ConfidenceString | null;
}

export interface CompanyRegistrationItem {
    locations?: LocationInfo[];
    confidence?: ConfidenceString | null;
    fields?: {
        number?: FieldValue<string>;
        type?: FieldValue<string>;
    };
}

export interface TaxItem {
    locations?: LocationInfo[];
    confidence?: ConfidenceString | null;
    fields?: {
        rate?: FieldValue<number>;
        base?: FieldValue<number>;
        amount?: FieldValue<number>;
    };
}

export interface LineItem {
    locations?: LocationInfo[];
    confidence?: ConfidenceString | null;
    fields?: {
        description?: FieldValue<string>;
        quantity?: FieldValue<number>;
        unit_price?: FieldValue<number>;
        total_price?: FieldValue<number>;
    };
}

export interface LocaleFields {
    language?: FieldValue<string>;
    country?: FieldValue<string>;
    currency?: FieldValue<string>;
}

export interface InferenceFields {
    supplier_name?: FieldValue<string>;
    supplier_address?: FieldValue<string>;
    supplier_phone_number?: FieldValue<string>;
    supplier_company_registration?: ArrayField<CompanyRegistrationItem>;
    receipt_number?: FieldValue<string>;
    date?: FieldValue<string>; // YYYY-MM-DD
    time?: FieldValue<string>; // HH:MM:SS
    total_amount?: FieldValue<number>;
    total_net?: FieldValue<number>;
    total_tax?: FieldValue<number>;
    taxes?: ArrayField<TaxItem>;
    tips_gratuity?: FieldValue<number>;
    line_items?: ArrayField<LineItem>;
    document_type?: FieldValue<string>;
    purchase_category?: FieldValue<string>;
    purchase_subcategory?: FieldValue<string>;
    locale?: NestedField<LocaleFields>;
}

export interface InferencePayload {
    id: string;
    job?: { id: string };
    model?: { id: string };
    file?: {
        name?: string;
        alias?: string | null;
        page_count?: number;
        mime_type?: string;
    };
    result?: {
        fields?: InferenceFields;
        raw_text?: string | null;
        rag?: string | null;
    };
}

export interface SupabaseReceiptRow {
    id: string;
    created_at: string;
    image_url: string | null;
    inference: InferencePayload | null;
}

// Temporary type for mock data processing
export interface BackendReceiptRow {
    id: string;
    merchant_name: string;
    company_name: string | null;
    ico: string | null;
    receipt_date: string | null; // ISO string
    category: string | null;
    amount: number | null;
    currency: string;
    status: string;
    confidence: number;
    image_url: string | null;
    raw_text: string | null;
    created_at: string;
    updated_at: string;
    telegram_message_id: string | null;
    ocr_engine: string | null;
    processing_duration_ms: number | null;
    user_id?: string;
}
