"use server";

import { getRepository } from "@/lib/data";
import type { ReceiptFilters } from "@/lib/data";

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
