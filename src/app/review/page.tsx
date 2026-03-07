import { DashboardHeader } from "@/components/shared/dashboard-header";
import { ReviewSummary } from "@/components/review/review-summary";
import { ReviewList } from "@/components/review/review-list";
import { getRepository } from "@/lib/data";

export default async function ReviewPage() {
    const repo = getRepository();
    const reviewQueue = await repo.getReviewQueue();

    const lowConfidenceCount = reviewQueue.filter(
        (r) => r.reviewIssues.some((i) => i.type === "low_confidence")
    ).length;

    const missingCategoryCount = reviewQueue.filter(
        (r) => r.reviewIssues.some((i) => i.type === "missing_category")
    ).length;

    return (
        <>
            <DashboardHeader
                breadcrumbs={[{ title: "Ke kontrole" }]}
            />

            <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
                <ReviewSummary
                    totalCount={reviewQueue.length}
                    lowConfidenceCount={lowConfidenceCount}
                    missingCategoryCount={missingCategoryCount}
                />

                <ReviewList receipts={reviewQueue} />
            </div>
        </>
    );
}
