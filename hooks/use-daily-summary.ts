import { useToast } from "@/components/ui/use-toast";
import { apiClient } from "@/lib/api-client";
import { DailySummaryType } from "@/types/daily-summary";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

interface DailySummaryParam {
  selectedChild?: string;
  selectedDate?: Date;
}

const fetchDailySummary = async ({ selectedChild, selectedDate }: DailySummaryParam) => {
  return await apiClient<DailySummaryType>(
    `/api/daily-summary?childId=${selectedChild}&date=${selectedDate?.toISOString()}`
  );
};

export const useDailySummary = (dailySummary: DailySummaryParam) => {
  const { toast } = useToast();

  const query =  useQuery({
    queryKey: ["dailySummary", dailySummary.selectedChild, dailySummary.selectedDate?.toISOString()],
    queryFn: () => fetchDailySummary(dailySummary),
    enabled: !!dailySummary.selectedChild && !!dailySummary.selectedDate,
  });

  const error = query.error;

  useEffect(() => {
      if (!error) return;
  
      toast({
        title: "Erro",
        description: "Não foi possível carregar o resumo diário.",
        variant: "destructive",
      });
    }, [error, toast]);

  return query;
};
