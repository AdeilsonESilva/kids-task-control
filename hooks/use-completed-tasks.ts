import { apiClient } from "@/lib/api-client";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";


interface CompletedTaskParam {
  selectedChild?: string;
  selectedDate?: Date;
}

const fetchCompletedTasks = async ({selectedChild, selectedDate}: CompletedTaskParam) => {
      return await apiClient<string[]>(
        `/api/completed-tasks?childId=${selectedChild}&startDate=${selectedDate?.toISOString()}`
      );
  };

export const useCompletedTasks = (completedTask: CompletedTaskParam) => {
  const { toast } = useToast();

  const query =  useQuery({
    queryKey: ["completedTasks", completedTask.selectedChild, completedTask.selectedDate?.toISOString()],
    queryFn: () => fetchCompletedTasks(completedTask),
    enabled: !!completedTask.selectedChild && !!completedTask.selectedDate,
  });

  const error = query.error;

  useEffect(() => {
      if (!error) return;
  
      toast({
        title: "Erro",
        description: "Não foi possível carregar as tarefas completadas.",
        variant: "destructive",
      });
    }, [error, toast]);

  return query;
};
