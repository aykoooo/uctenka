import Link from "next/link";
import {
    Card,
    CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Receipt } from "@/types/domain";
import { CategoryBadge } from "@/components/shared/category-badge";
import { ConfidenceBadge } from "@/components/shared/confidence-badge";
import { IssueBadges } from "@/components/shared/issue-badges";
import { formatCZK, formatDate } from "@/lib/formatters";
import { FileText, ArrowRight } from "lucide-react";

interface ReviewCardProps {
    receipt: Receipt;
}

export function ReviewCard({ receipt }: ReviewCardProps) {
    return (
        <Card className="overflow-hidden">
            <CardContent className="p-0">
                <div className="flex gap-4 p-4">
                    {/* Thumbnail placeholder */}
                    <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-lg bg-muted">
                        <FileText className="h-8 w-8 text-muted-foreground" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                            <div>
                                <p className="font-medium truncate">{receipt.merchantName}</p>
                                <p className="text-sm text-muted-foreground">
                                    {formatDate(receipt.date)} · {formatCZK(receipt.amount, receipt.currency)}
                                </p>
                            </div>
                            <ConfidenceBadge
                                level={receipt.confidenceLevel}
                                showPercentage
                                percentage={receipt.confidence}
                            />
                        </div>

                        <div className="flex items-center gap-2 mb-3 flex-wrap">
                            <CategoryBadge categoryId={receipt.categoryId} />
                            <IssueBadges issues={receipt.reviewIssues} />
                        </div>

                        <Button size="sm" variant="outline" nativeButton={false} render={<Link href={`/receipts/${receipt.id}?mode=review`} />}>
                            Zkontrolovat
                            <ArrowRight className="ml-1 h-3 w-3" />
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
