import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CategoryBadge } from "@/components/shared/category-badge";
import { StatusBadge } from "@/components/shared/status-badge";
import { ConfidenceBadge } from "@/components/shared/confidence-badge";
import type { Receipt } from "@/types/domain";
import { formatCZK, formatDate } from "@/lib/formatters";
import { Edit2, ArrowLeft } from "lucide-react";

interface ReceiptDetailHeaderProps {
    receipt: Receipt;
    isEditing?: boolean;
    onEditToggle?: () => void;
    isSaving?: boolean;
    backHref?: string;
    backLabel?: string;
    hideEditButton?: boolean;
}

export function ReceiptDetailHeader({
    receipt,
    isEditing,
    onEditToggle,
    isSaving,
    backHref = "/receipts",
    backLabel = "Zpět na účtenky",
    hideEditButton = false,
}: ReceiptDetailHeaderProps) {
    return (
        <div className="mb-6">
            <Button variant="ghost" size="sm" className="mb-4 -ml-2" nativeButton={false} render={<Link href={backHref} />}>
                <ArrowLeft className="mr-1 h-4 w-4" />
                {backLabel}
            </Button>

            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">
                        {receipt.merchantName}
                    </h1>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <span className="text-xl font-bold">{formatCZK(receipt.amount, receipt.currency)}</span>
                        <span className="text-muted-foreground">·</span>
                        <span className="text-muted-foreground">{formatDate(receipt.date)}</span>
                    </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                    <CategoryBadge categoryId={receipt.categoryId} />
                    <StatusBadge status={receipt.status} />
                    <ConfidenceBadge
                        level={receipt.confidenceLevel}
                        showPercentage
                        percentage={receipt.confidence}
                    />
                    {onEditToggle && !isEditing && !hideEditButton && (
                        <Button variant="outline" size="sm" onClick={onEditToggle} className="ml-2">
                            <Edit2 className="mr-2 h-4 w-4" />
                            Upravit
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
