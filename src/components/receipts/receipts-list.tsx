"use client";

import type { Receipt } from "@/types/domain";
import { ReceiptsTable } from "./receipts-table";
import { ReceiptCard } from "./receipt-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Search, FileX } from "lucide-react";

interface ReceiptsListProps {
    receipts: Receipt[];
    hasFilters: boolean;
}

export function ReceiptsList({ receipts, hasFilters }: ReceiptsListProps) {
    if (receipts.length === 0 && hasFilters) {
        return (
            <EmptyState
                title="Žádné výsledky"
                description="Zkuste upravit filtry nebo vyhledávání."
                icon={<Search className="h-8 w-8 text-muted-foreground" />}
            />
        );
    }

    if (receipts.length === 0) {
        return (
            <EmptyState
                title="Zatím žádné účtenky"
                description="Pošlete první účtenku přes Telegram bota."
                icon={<FileX className="h-8 w-8 text-muted-foreground" />}
            />
        );
    }

    return (
        <>
            {/* Desktop table */}
            <ReceiptsTable receipts={receipts} />

            {/* Mobile cards */}
            <div className="md:hidden space-y-3">
                {receipts.map((receipt) => (
                    <ReceiptCard key={receipt.id} receipt={receipt} />
                ))}
            </div>
        </>
    );
}
