/**
 * Formats a number as a CZK currency string.
 * e.g. 1234.5 → "1 234,50 Kč"
 */
export function formatCZK(amount: number | null): string {
    if (amount === null || amount === undefined) return "—";
    return new Intl.NumberFormat("cs-CZ", {
        style: "currency",
        currency: "CZK",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}

/**
 * Formats a number as a compact CZK string for charts.
 * e.g. 15000 → "15 000"
 */
export function formatCZKCompact(amount: number): string {
    return new Intl.NumberFormat("cs-CZ", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}
