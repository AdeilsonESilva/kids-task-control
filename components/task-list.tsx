"use client";

import { Card } from "./ui/card";
import { Checkbox } from "./ui/checkbox";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";
import { apiClient } from "@/lib/api-client";
import { LoadingSpinner } from "./ui/loading-spinner";
import { CardError } from "./ui/card-error";
import { useTasks } from "@/hooks/use-tasks";
import { useCompletedTasks } from "@/hooks/use-completed-tasks";
import { useEffect } from "react";
import { useStoreTasks } from "@/app/stores/useStoreTaks";
import { useStoreTasksCompleted } from "@/app/stores/useStoreTasksCompleted";
import { Task } from "@/types/task";
import { useStoreDailySummary } from "@/app/stores/useStoreDailySummary";
import { useStoreMonthlySummary } from "@/app/stores/useStoreMonthlySummary";

interface TaskListProps {
  selectedChild?: string;
  selectedDate?: Date;
}

export function TaskList({ selectedChild, selectedDate }: TaskListProps) {
  const { tasks, update } = useStoreTasks();
  const { tasksCompleted, update: updateCompleted, updateTaskCompleted, reset } = useStoreTasksCompleted();
  const { sumDailySummary } = useStoreDailySummary();
  const { sumMonthlySummary } = useStoreMonthlySummary();
  const { toast } = useToast();
  const {
    tasks: tasksData,
    tasksBonus,
    tasksDiscount,
    isLoading: isLoadingTasks,
    error: errorTasks,
    refetch: refetchTasks,
  } = useTasks(!tasks);
  const {
    data: completedTasksData,
    isLoading: isLoadingCompletedTasks,
    error: errorCompletedTasks,
    refetch: refetchCompletedTasks,
  } = useCompletedTasks({ childId: selectedChild, startDate: selectedDate }, !tasksCompleted);

  useEffect(() => {
    reset();
  }, [selectedChild, selectedDate, reset]);

  useEffect(() => {
    if(tasksData !== undefined) {
      update(tasksData);
    }
  }, [tasksData, update]);

  useEffect(() => {
    if(completedTasksData !== undefined) {
      updateCompleted(completedTasksData);
    }
  }, [completedTasksData, updateCompleted]);

  
  const isLoading = isLoadingCompletedTasks || isLoadingTasks;
  const error = errorCompletedTasks || errorTasks;

  const refetch = () => {
    refetchTasks();
    refetchCompletedTasks();
  };

  const handleTaskCompletion = async (task: Task) => {
    if (!selectedChild || !selectedDate) {
      toast({
        title: "Atenção",
        description: "Selecione uma criança e uma data primeiro.",
        variant: "default",
      });
      return;
    }

    try {
      const data = await apiClient<{ message?: string }>(
        "/api/completed-tasks",
        {
          method: "POST",
          body: JSON.stringify({
            taskId: task.id,
            childId: selectedChild,
            date: selectedDate.toISOString(),
          }),
        }
      );

      updateTaskCompleted(task);
      sumDailySummary(task, data.message !== "Task uncompleted");
      sumMonthlySummary(task, data.message !== "Task uncompleted");

      if (data.message === "Task uncompleted") {
        toast({
          title: "Tarefa desmarcada",
          description: "A tarefa foi desmarcada com sucesso.",
        });
      } else {
        toast({
          title: "Tarefa completada",
          description: "A tarefa foi marcada como concluída.",
        });
      }
    } catch (error) {
      console.error("Error completing task:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status da tarefa.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">Lista de Tarefas</h2>

      {isLoading ? (
        <LoadingSpinner />
      ) : error ? (
        <CardError
          title={
            errorTasks
              ? "Erro ao carregar tarefas"
              : "Erro ao carregar tarefas completadas"
          }
          tryText="Tentar novamente"
          refetch={refetch}
        />
      ) : (
        <>
          {!selectedChild && (
            <Card className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
              <p className="text-yellow-800 dark:text-yellow-200">
                Selecione uma criança para gerenciar as tarefas.
              </p>
            </Card>
          )}

          {selectedChild && !selectedDate && (
            <Card className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
              <p className="text-yellow-800 dark:text-yellow-200">
                Selecione uma data no calendário.
              </p>
            </Card>
          )}

          {/* Tarefas */}
          {tasks?.length && (
            <div>
              <h3 className="text-lg font-medium mb-2">Tarefas</h3>
              <AnimatePresence mode="popLayout">
                {tasks.map((task) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    layout
                  >
                    <Card className="p-4 flex items-center justify-between hover:shadow-lg transition-shadow">
                      <div className="flex items-center gap-4">
                        <label
                          htmlFor={`task-${task.id}`}
                          className="flex cursor-pointer hover:bg-accent p-4 rounded-lg transition-colors"
                        >
                          <Checkbox
                            id={`task-${task.id}`}
                            checked={
                              !!tasksCompleted?.find(
                                (completedTask) =>
                                  completedTask.taskId === task.id
                              )
                            }
                            onCheckedChange={() =>
                              handleTaskCompletion(task)
                            }
                            className="transition-all duration-200"
                          />
                        </label>
                        <div
                          className={`transition-all duration-200 ${
                            tasksCompleted?.find(
                              (completedTask) =>
                                completedTask.taskId === task.id
                            )
                              ? "opacity-50"
                              : ""
                          }`}
                        >
                          <h3 className="font-medium">{task.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {task.description}
                          </p>
                          <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                            Valor: R$ {task.value.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          {/* Descontos */}
          {tasksDiscount.length > 0 && (
            <div>
              <h3 className="text-lg font-medium mb-2">Descontos</h3>
              <AnimatePresence mode="popLayout">
                {tasksDiscount.map((task) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    layout
                  >
                    <Card className="p-4 flex items-center justify-between hover:shadow-lg transition-shadow">
                      <div className="flex items-center gap-4">
                        <label
                          htmlFor={`task-discount-${task.id}`}
                          className="flex cursor-pointer hover:bg-accent p-4 rounded-lg transition-colors"
                        >
                          <Checkbox
                            id={`task-discount-${task.id}`}
                            checked={
                              !!tasksCompleted?.find(
                                (completedTask) =>
                                  completedTask.taskId === task.id
                              )
                            }
                            onCheckedChange={() =>
                              handleTaskCompletion(task)
                            }
                            className="transition-all duration-200"
                          />
                        </label>
                        <div
                          className={`transition-all duration-200 ${
                            tasksCompleted?.find(
                              (completedTask) =>
                                completedTask.taskId === task.id
                            )
                              ? "opacity-50"
                              : ""
                          }`}
                        >
                          <h3 className="font-medium">{task.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {task.description}
                          </p>
                          <p className="text-sm font-semibold text-red-600 dark:text-red-400">
                            Valor: R$ {task.value.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          {/* Bonus */}
          {tasksBonus.length > 0 && (
            <div>
              <h3 className="text-lg font-medium mb-2">Bônus</h3>
              <AnimatePresence mode="popLayout">
                {tasksBonus.map((task) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    layout
                  >
                    <Card className="p-4 flex items-center justify-between hover:shadow-lg transition-shadow">
                      <div className="flex items-center gap-4">
                        <label
                          htmlFor={`task-bonus-${task.id}`}
                          className="flex cursor-pointer hover:bg-accent p-4 rounded-lg transition-colors"
                        >
                          <Checkbox
                            id={`task-bonus-${task.id}`}
                            checked={
                              !!tasksCompleted?.find(
                                (completedTask) =>
                                  completedTask.taskId === task.id
                              )
                            }
                            onCheckedChange={() =>
                              handleTaskCompletion(task)
                            }
                            className="transition-all duration-200"
                          />
                        </label>
                        <div
                          className={`transition-all duration-200 ${
                            tasksCompleted?.find(
                              (completedTask) =>
                                completedTask.taskId === task.id
                            )
                              ? "opacity-50"
                              : ""
                          }`}
                        >
                          <h3 className="font-medium">{task.title}</h3>
                          <p className="text-sm text-muted-foreground">
                            {task.description}
                          </p>
                          <p className="text-sm font-semibold text-yellow-600 dark:text-yellow-400">
                            Valor: R$ {task.value.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </>
      )}
    </div>
  );
}
