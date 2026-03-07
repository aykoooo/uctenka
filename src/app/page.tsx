import { DashboardHeader } from "@/components/shared/dashboard-header";
import { KpiCards } from "@/components/dashboard/kpi-cards";
import { ExpenseChart } from "@/components/dashboard/expense-chart";
import { CategoryChart } from "@/components/dashboard/category-chart";
import { RecentReceipts } from "@/components/dashboard/recent-receipts";
import { ReviewNeeded } from "@/components/dashboard/review-needed";
import { getRepository } from "@/lib/data";

export default async function DashboardPage() {
  const repo = getRepository();
  const [stats, monthlyExpenses, categoryBreakdown, recentReceipts, reviewQueue] =
    await Promise.all([
      repo.getDashboardStats(),
      repo.getMonthlyExpenses(),
      repo.getCategoryBreakdown(),
      repo.getRecentReceipts(5),
      repo.getReviewQueue(),
    ]);

  const reviewNeeded = reviewQueue.slice(0, 5);

  return (
    <>
      <DashboardHeader
        breadcrumbs={[{ title: "Nástěnka" }]}
      />

      <div className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <KpiCards stats={stats} />
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <div className="md:col-span-2 lg:col-span-4">
            <ExpenseChart data={monthlyExpenses} />
          </div>
          <div className="md:col-span-2 lg:col-span-3">
            <CategoryChart data={categoryBreakdown} />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <div className="md:col-span-2 lg:col-span-4">
            <RecentReceipts receipts={recentReceipts} />
          </div>
          <div className="md:col-span-2 lg:col-span-3">
            <ReviewNeeded receipts={reviewNeeded} />
          </div>
        </div>
      </div>
    </>
  );
}
