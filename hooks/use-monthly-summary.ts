import { useToast } from "@/components/ui/use-toast";
import { apiClient } from "@/lib/api-client";
import { MonthlySummaryType } from "@/types/monthly-summary";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

interface MonthlySummaryParam {
  selectedChild?: string;
  selectedDate?: Date;
}

const fetchMonthlySummary = async ({ selectedChild, selectedDate }: MonthlySummaryParam) => {
  return await apiClient<MonthlySummaryType>(
    `/api/monthly-summary?childId=${selectedChild}&date=${selectedDate?.toISOString()}`
  );
};

export const useMonthlySummary = (monthlySummary: MonthlySummaryParam, enabled?: boolean) => {
  const { toast } = useToast();

  const query = useQuery({
    queryKey: ["monthlySummary", monthlySummary.selectedChild, monthlySummary.selectedDate?.toISOString()],
    queryFn: () => fetchMonthlySummary(monthlySummary),
    enabled: !!monthlySummary.selectedChild && !!monthlySummary.selectedDate && enabled,
  });

  const error = query.error;

  useEffect(() => {
    if (!error) return;

    toast({
      title: "Erro",
      description: "Não foi possível carregar o resumo mensal.",
      variant: "destructive",
    });
  }, [error, toast]);

  return query;
};
