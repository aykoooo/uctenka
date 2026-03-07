"use client";

import { useState, useEffect } from "react";
import { DashboardHeader } from "@/components/shared/dashboard-header";
import { ReceiptsToolbar } from "@/components/receipts/receipts-toolbar";
import { ReceiptsList } from "@/components/receipts/receipts-list";
import { LoadingTable } from "@/components/shared/loading-state";
import { fetchReceipts } from "@/app/actions";
import type { ReceiptFilters } from "@/lib/data";
import type { Receipt } from "@/types/domain";

export default function ReceiptsPage() {
    const [receipts, setReceipts] = useState<Receipt[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState<ReceiptFilters>({});

    useEffect(() => {
        const loadReceipts = async () => {
            setLoading(true);
            const data = await fetchReceipts(filters);
            setReceipts(data);
            setLoading(false);
        };
        loadReceipts();
    }, [filters]);

    const hasFilters = !!(filters.search || filters.categoryId || filters.status);

    return (
        <>
            <DashboardHeader
                breadcrumbs={[{ title: "Účtenky" }]}
            />

            <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
                <ReceiptsToolbar filters={filters} onFiltersChange={setFilters} />

                {loading ? (
                    <LoadingTable rows={8} />
                ) : (
                    <ReceiptsList receipts={receipts} hasFilters={hasFilters} />
                )}
            </div>
        </>
    );
}
