import type { Receipt } from "@/types/domain";
import { ReviewCard } from "./review-card";
import { EmptyState } from "@/components/shared/empty-state";
import { CheckCircle } from "lucide-react";

interface ReviewListProps {
    receipts: Receipt[];
}

export function ReviewList({ receipts }: ReviewListProps) {
    if (receipts.length === 0) {
        return (
            <EmptyState
                title="Vše zkontrolováno"
                description="Žádné účtenky momentálně nevyžadují kontrolu."
                icon={<CheckCircle className="h-8 w-8 text-emerald-500" />}
            />
        );
    }

    return (
        <div className="space-y-4">
            {receipts.map((receipt) => (
                <ReviewCard key={receipt.id} receipt={receipt} />
            ))}
        </div>
    );
}
