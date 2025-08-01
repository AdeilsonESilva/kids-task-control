import { useToast } from "@/components/ui/use-toast";
import { useMonthlySummaryStore } from "@/lib/stores/monthly-summary-store";
import { useEffect } from "react";

interface MonthlySummaryParam {
  selectedChild?: string;
  selectedDate?: Date;
}

export const useMonthlySummary = ({
  selectedChild,
  selectedDate,
}: MonthlySummaryParam) => {
  const { toast } = useToast();
  const {
    isLoading,
    error,
    fetchMonthlySummary,
    refetchMonthlySummary,
    getMonthlySummary,
    clearError,
  } = useMonthlySummaryStore();

  // Busca os dados se necessário
  useEffect(() => {
    if (selectedChild && selectedDate) {
      fetchMonthlySummary(selectedChild, selectedDate);
    }
  }, [selectedChild, selectedDate, fetchMonthlySummary]);

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
      ? getMonthlySummary(selectedChild, selectedDate)
      : null;

  return {
    data,
    isLoading,
    error,
    isError: !!error,
    isSuccess: !isLoading && !error && !!data,
    refetch:
      selectedChild && selectedDate
        ? () => refetchMonthlySummary(selectedChild, selectedDate)
        : () => Promise.resolve(),
  };
};
