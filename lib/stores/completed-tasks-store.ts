import { create } from "zustand";
import { TasksCompleted } from "@/types/tasks-completed";
import { apiClient } from "@/lib/api-client";
import { Task } from "@/types/task";

interface CompletedTasksStore {
  completedTasks: Record<string, TasksCompleted[]>;
  isLoading: boolean;
  error: string | null;
  rawError?: unknown;
  fetchCompletedTasks: (childId: string, date: Date) => Promise<void>;
  refetchCompletedTasks: (childId: string, date: Date) => Promise<void>;
  getCompletedTasks: (childId: string, date: Date) => TasksCompleted[] | null;
  toggleTaskCompletion: (
    task: Task,
    childId: string,
    date: Date
  ) => Promise<{ message?: string }>;
  invalidateChild: (childId: string) => void;
  invalidateDate: (date: Date) => void;
  clearError: () => void;
}

export const useCompletedTasksStore = create<CompletedTasksStore>(
  (set, get) => ({
    completedTasks: {},
    isLoading: false,
    error: null,

    fetchCompletedTasks: async (childId: string, date: Date) => {
      const key = `${childId}-${date.toISOString().split("T")[0]}`;

      // Se já temos o dado, não faz nova requisição
      if (get().completedTasks[key]) {
        return;
      }

      set({ isLoading: true, error: null });

      try {
        const data = await apiClient<TasksCompleted[]>(
          `/api/completed-tasks?childId=${childId}&startDate=${date.toISOString()}`
        );

        set((state) => ({
          completedTasks: {
            ...state.completedTasks,
            [key]: data,
          },
          isLoading: false,
        }));
      } catch (error) {
        set({
          error: "Não foi possível carregar as tarefas completadas.",
          isLoading: false,
          rawError: error,
        });
      }
    },

    refetchCompletedTasks: async (childId: string, date: Date) => {
      const key = `${childId}-${date.toISOString().split("T")[0]}`;

      set({ isLoading: true, error: null });

      try {
        const data = await apiClient<TasksCompleted[]>(
          `/api/completed-tasks?childId=${childId}&startDate=${date.toISOString()}`
        );

        set((state) => ({
          completedTasks: {
            ...state.completedTasks,
            [key]: data,
          },
          isLoading: false,
        }));
      } catch (error) {
        set({
          error: "Não foi possível carregar as tarefas completadas.",
          isLoading: false,
          rawError: error,
        });
      }
    },

    getCompletedTasks: (childId: string, date: Date) => {
      const key = `${childId}-${date.toISOString().split("T")[0]}`;
      return get().completedTasks[key] || null;
    },

    toggleTaskCompletion: async (task: Task, childId: string, date: Date) => {
      const key = `${childId}-${date.toISOString().split("T")[0]}`;

      try {
        const response = await apiClient<{ message?: string }>(
          "/api/completed-tasks",
          {
            method: "POST",
            body: JSON.stringify({
              taskId: task.id,
              childId,
              date: date.toISOString(),
            }),
          }
        );

        // Atualiza o estado local baseado na resposta da API
        if (response.message === "Task uncompleted") {
          // Remove a tarefa da lista de completadas
          set((state) => {
            const currentTasks = state.completedTasks[key] || [];
            const updatedTasks = currentTasks.filter(
              (currentTask) => currentTask.taskId !== task.id
            );

            return {
              ...state,
              completedTasks: {
                ...state.completedTasks,
                [key]: updatedTasks,
              },
            };
          });
        } else {
          const completeTask: TasksCompleted = {
            task: {
              isDiscount: task.isDiscount,
              value: task.value,
            },
            taskId: task.id,
          };
          set((state) => ({
            ...state,
            completedTasks: {
              ...state.completedTasks,
              [`${childId}-${date.toISOString().split("T")[0]}`]: [
                ...(state.completedTasks[
                  `${childId}-${date.toISOString().split("T")[0]}`
                ] || []),
                completeTask,
              ],
            },
          }));
        }

        return response;
      } catch (error) {
        set({
          error: "Não foi possível atualizar o status da tarefa.",
          rawError: error,
        });
        throw error;
      }
    },

    invalidateChild: (childId: string) => {
      set((state) => {
        const newCompletedTasks = { ...state.completedTasks };
        Object.keys(newCompletedTasks).forEach((key) => {
          if (key.startsWith(`${childId}-`)) {
            delete newCompletedTasks[key];
          }
        });
        return { completedTasks: newCompletedTasks };
      });
    },

    invalidateDate: (date: Date) => {
      const dateKey = date.toISOString().split("T")[0];
      set((state) => {
        const newCompletedTasks = { ...state.completedTasks };
        Object.keys(newCompletedTasks).forEach((key) => {
          if (key.endsWith(`-${dateKey}`)) {
            delete newCompletedTasks[key];
          }
        });
        return { completedTasks: newCompletedTasks };
      });
    },

    clearError: () => set({ error: null }),
  })
);
