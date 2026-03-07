import { DEFAULT_CURRENCY, DEFAULT_LOCALE } from "@/lib/constants/locale";

/**
 * Formats a number as a CZK currency string.
 * e.g. 1234.5 → "1 234,50 Kč"
 */
export function formatCZK(amount: number | null, currency: string = DEFAULT_CURRENCY): string {
    if (amount === null || amount === undefined) return "—";

    const normalizedCurrency = typeof currency === "string" && currency.trim()
        ? currency.trim().toUpperCase()
        : DEFAULT_CURRENCY;

    try {
        return new Intl.NumberFormat(DEFAULT_LOCALE, {
            style: "currency",
            currency: normalizedCurrency,
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    } catch {
        return new Intl.NumberFormat(DEFAULT_LOCALE, {
            style: "currency",
            currency: DEFAULT_CURRENCY,
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    }
}

/**
 * Formats a number as a compact CZK string for charts.
 * e.g. 15000 → "15 000"
 */
export function formatCZKCompact(amount: number): string {
    return new Intl.NumberFormat(DEFAULT_LOCALE, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}
