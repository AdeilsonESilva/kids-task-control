import { apiClient } from "@/lib/api-client";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { TasksCompleted } from "@/types/tasks-completed";


interface CompletedTaskParam {
  childId?: string;
  startDate?: Date;
  endDate?: Date;
}

const fetchCompletedTasks = async ({ childId, startDate, endDate }: CompletedTaskParam) => {
  return await apiClient<TasksCompleted[]>(
    `/api/completed-tasks?childId=${childId}${startDate ? `&startDate=${startDate.toISOString()}` : ""}${endDate ? `&endDate=${endDate.toISOString()}` : ""}`
  );
};

export const useCompletedTasks = (completedTask: CompletedTaskParam) => {
  const { toast } = useToast();

  const query = useQuery({
    queryKey: ["completedTasks", completedTask.childId, completedTask.startDate?.toISOString(), completedTask.endDate?.toISOString()],
    queryFn: () => fetchCompletedTasks(completedTask),
    enabled: !!completedTask.childId && !!completedTask.startDate,
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
