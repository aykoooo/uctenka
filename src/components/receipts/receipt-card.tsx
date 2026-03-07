"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import type { Receipt } from "@/types/domain";
import { CategoryBadge } from "@/components/shared/category-badge";
import { StatusBadge } from "@/components/shared/status-badge";
import { ConfidenceBadge } from "@/components/shared/confidence-badge";
import { formatCZK, formatDate } from "@/lib/formatters";

interface ReceiptCardProps {
    receipt: Receipt;
}

export function ReceiptCard({ receipt }: ReceiptCardProps) {
    return (
        <Link href={`/receipts/${receipt.id}`}>
            <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{receipt.merchantName}</p>
                            {receipt.companyName && (
                                <p className="text-xs text-muted-foreground truncate">{receipt.companyName}</p>
                            )}
                        </div>
                        <span className="text-base font-bold whitespace-nowrap">
                            {formatCZK(receipt.amount)}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs text-muted-foreground">{formatDate(receipt.date)}</span>
                        <CategoryBadge categoryId={receipt.categoryId} />
                        <StatusBadge status={receipt.status} />
                        <ConfidenceBadge level={receipt.confidenceLevel} />
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}
