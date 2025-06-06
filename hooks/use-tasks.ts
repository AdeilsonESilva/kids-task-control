import { apiClient } from "@/lib/api-client";
import { Task } from "@/types/task";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useToast } from "@/components/ui/use-toast";

const fetchTasks = async () => {
  return await apiClient<Task[]>("/api/tasks");
};

export const useTasks = () => {
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [tasksDiscount, setTasksDiscount] = useState<Task[]>([]);
  const [tasksBonus, setTasksBonus] = useState<Task[]>([]);

  const {data: allTasks, isLoading, error, refetch, ...rest} = useQuery({
    queryKey: ["tasks"],
    queryFn: fetchTasks,
  });

  useEffect(() => {
    if (!allTasks) return;

    setTasks(allTasks.filter((task) => !task.isDiscount && !task.isBonus));
    setTasksDiscount(allTasks.filter((task) => task.isDiscount));
    setTasksBonus(allTasks.filter((task) => task.isBonus));
  }, [allTasks]);

  useEffect(() => {
    if (!error) return;

    toast({
      title: "Erro",
      description: "Não foi possível carregar as tarefas.",
      variant: "destructive",
    });
  }, [error, toast]);

  return {
    allTasks,
    tasks,
    tasksDiscount,
    tasksBonus,
    isLoading,
    error,
    refetch,
    ...rest
  };
};
