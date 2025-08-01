import { useDailySummaryStore } from "@/lib/stores/daily-summary-store";
import { useMonthlySummaryStore } from "@/lib/stores/monthly-summary-store";
import { useCallback } from "react";

export const useSummaryPreloader = () => {
  const { fetchDailySummary } = useDailySummaryStore();
  const { fetchMonthlySummary } = useMonthlySummaryStore();

  const preloadSummaries = useCallback(
    async (childIds: string[]) => {
      const today = new Date();
      const currentMonth = new Date(today.getFullYear(), today.getMonth(), 1);

      const promises = childIds.flatMap((childId) => [
        fetchDailySummary(childId, today),
        fetchMonthlySummary(childId, currentMonth),
      ]);

      try {
        await Promise.allSettled(promises);
      } catch (error) {
        console.error("Erro ao pré-carregar summaries:", error);
      }
    },
    [fetchDailySummary, fetchMonthlySummary]
  );

  return { preloadSummaries };
};
