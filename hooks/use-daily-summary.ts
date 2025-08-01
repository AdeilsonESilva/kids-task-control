import { useToast } from "@/components/ui/use-toast";
import { useDailySummaryStore } from "@/lib/stores/daily-summary-store";
import { useEffect } from "react";

interface DailySummaryParam {
  selectedChild?: string;
  selectedDate?: Date;
}

export const useDailySummary = ({
  selectedChild,
  selectedDate,
}: DailySummaryParam) => {
  const { toast } = useToast();
  const {
    isLoading,
    error,
    fetchDailySummary,
    refetchDailySummary,
    getDailySummary,
    clearError,
  } = useDailySummaryStore();

  // Busca os dados se necessário
  useEffect(() => {
    if (selectedChild && selectedDate) {
      fetchDailySummary(selectedChild, selectedDate);
    }
  }, [selectedChild, selectedDate, fetchDailySummary]);

  // Exibe toast de erro se houver
  useEffect(() => {
    if (error) {
      toast({
        title: "Erro",
        description: error,
        variant: "destructive",
      });
      clearError();
    }
  }, [error, toast, clearError]);

  // Retorna os dados no mesmo formato que o React Query
  const data =
    selectedChild && selectedDate
      ? getDailySummary(selectedChild, selectedDate)
      : null;

  return {
    data,
    isLoading,
    error,
    isError: !!error,
    isSuccess: !isLoading && !error && !!data,
    refetch:
      selectedChild && selectedDate
        ? () => refetchDailySummary(selectedChild, selectedDate)
        : () => Promise.resolve(),
  };
};
