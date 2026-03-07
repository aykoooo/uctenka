import { notFound } from "next/navigation";
import { ReceiptDetailInteractive } from "@/components/receipts/receipt-detail-interactive";
import { DashboardHeader } from "@/components/shared/dashboard-header";
import { getRepository } from "@/lib/data";

interface ReceiptDetailPageProps {
    params: Promise<{ id: string }>;
    searchParams?: Promise<{ mode?: string }>;
}

export default async function ReceiptDetailPage({ params, searchParams }: ReceiptDetailPageProps) {
    const { id } = await params;
    const resolvedSearchParams = searchParams ? await searchParams : undefined;
    const startInReviewMode = resolvedSearchParams?.mode === "review";
    const repo = getRepository();
    const receipt = await repo.getReceiptById(id);

    if (!receipt) {
        notFound();
    }

    return (
        <>
            <DashboardHeader
                breadcrumbs={[
                    { title: "Účtenky", url: "/receipts" },
                    { title: receipt.merchantName || "Detail účtenky" }
                ]}
            />
            <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
                <ReceiptDetailInteractive initialReceipt={receipt} startInReviewMode={startInReviewMode} />
            </div>
        </>
    );
}
