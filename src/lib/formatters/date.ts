import { format, formatDistanceToNow } from "date-fns";
import { cs } from "date-fns/locale";

/**
 * Formats a date as "dd. MM. yyyy" in Czech locale.
 * e.g. "15. 03. 2025"
 */
export function formatDate(date: Date | null): string {
    if (!date) return "—";
    return format(date, "d. M. yyyy", { locale: cs });
}

/**
 * Formats a date as "dd. MMM yyyy" (with abbreviated month).
 * e.g. "15. bře 2025"
 */
export function formatDateShort(date: Date | null): string {
    if (!date) return "—";
    return format(date, "d. MMM yyyy", { locale: cs });
}

/**
 * Formats a date as relative time.
 * e.g. "před 2 dny"
 */
export function formatRelativeDate(date: Date | null): string {
    if (!date) return "—";
    return formatDistanceToNow(date, { addSuffix: true, locale: cs });
}
