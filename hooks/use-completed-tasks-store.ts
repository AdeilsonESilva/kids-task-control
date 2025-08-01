import { useEffect } from "react";
import { useCompletedTasksStore } from "@/lib/stores";
import { useToast } from "@/components/ui/use-toast";
import { Task } from "@/types/task";

interface UseCompletedTasksStoreParams {
  childId?: string;
  selectedDate?: Date;
}

export const useCompletedTasksStoreHook = ({
  childId,
  selectedDate,
}: UseCompletedTasksStoreParams) => {
  const { toast } = useToast();

  const {
    isLoading,
    error,
    fetchCompletedTasks,
    refetchCompletedTasks,
    getCompletedTasks,
    toggleTaskCompletion,
    clearError,
  } = useCompletedTasksStore();

  // Busca as tarefas completadas quando os parâmetros mudam
  useEffect(() => {
    if (childId && selectedDate) {
      fetchCompletedTasks(childId, selectedDate);
    }
  }, [childId, selectedDate, fetchCompletedTasks]);

  // Mostra toast de erro quando há erro
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

  // Função para obter as tarefas completadas do estado atual
  const data =
    childId && selectedDate ? getCompletedTasks(childId, selectedDate) : null;

  // Função para refetch
  const refetch = () => {
    if (childId && selectedDate) {
      refetchCompletedTasks(childId, selectedDate);
    }
  };

  // Função para toggle de tarefa
  const handleToggleTask = async (task: Task) => {
    if (childId && selectedDate) {
      return await toggleTaskCompletion(task, childId, selectedDate);
    }
  };

  return {
    data,
    isLoading,
    error,
    refetch,
    toggleTask: handleToggleTask,
  };
};
