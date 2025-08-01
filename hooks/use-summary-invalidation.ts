import { useDailySummaryStore, useMonthlySummaryStore } from "@/lib/stores";

// TODO ade remove
export const useSummaryInvalidation = () => {
  const { invalidateChild: invalidateDailyChild } = useDailySummaryStore();
  const { invalidateChild: invalidateMonthlyChild } = useMonthlySummaryStore();

  const invalidateChildSummaries = (childId: string) => {
    invalidateDailyChild(childId);
    invalidateMonthlyChild(childId);
  };

  return {
    invalidateChildSummaries,
    invalidateDailyChild,
    invalidateMonthlyChild,
  };
};
