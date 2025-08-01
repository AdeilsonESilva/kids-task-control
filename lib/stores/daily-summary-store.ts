import { create } from "zustand";
import { DailySummaryType } from "@/lib/types";
import { apiClient } from "@/lib/api-client";
import { Task } from "@/types/task";
import { TasksCompleted } from "@/types/tasks-completed";

interface DailySummaryStore {
  summaries: Record<string, DailySummaryType>;
  isLoading: boolean;
  error: string | null;
  rawError?: unknown;
  fetchDailySummary: (childId: string, date: Date) => Promise<void>;
  refetchDailySummary: (childId: string, date: Date) => Promise<void>;
  getDailySummary: (childId: string, date: Date) => DailySummaryType | null;
  invalidateChild: (childId: string) => void;
  invalidateDate: (date: Date) => void;
  clearError: () => void;
}

export const useDailySummaryStore = create<DailySummaryStore>((set, get) => ({
  summaries: {},
  isLoading: false,
  error: null,

  recalculateDailySummary: (
    childId: string,
    date: Date,
    tasks: Task[],
    tasksCompleted: TasksCompleted[]
  ) => {
    const key = `${childId}-${date.toISOString().split("T")[0]}`;

    if (!get().summaries[key]) {
      return get().fetchDailySummary(childId, date);
    }

    const data: DailySummaryType = {
      id: "string",
      childId,
      date: date.toISOString().split("T")[0],
      totalTasks: tasks.length,
      completedTasks: tasksCompleted.length,
      completionRate: number,
      points: number,
      reward: string,
      totalValue: number,
      totalDiscountWeek: number,
    };

    set((state) => ({
      summaries: {
        ...state.summaries,
        [key]: data,
      },
      isLoading: false,
    }));
  },

  fetchDailySummary: async (childId: string, date: Date) => {
    const key = `${childId}-${date.toISOString().split("T")[0]}`;

    // Se já temos o dado, não faz nova requisição
    if (get().summaries[key]) {
      return;
    }

    set({ isLoading: true, error: null });

    try {
      const data = await apiClient<DailySummaryType>(
        `/api/daily-summary?childId=${childId}&date=${date.toISOString()}`
      );

      set((state) => ({
        summaries: {
          ...state.summaries,
          [key]: data,
        },
        isLoading: false,
      }));
    } catch (error) {
      set({
        error: "Não foi possível carregar o resumo diário.",
        isLoading: false,
        rawError: error,
      });
    }
  },

  refetchDailySummary: async (childId: string, date: Date) => {
    const key = `${childId}-${date.toISOString().split("T")[0]}`;

    set({ isLoading: true, error: null });

    try {
      const data = await apiClient<DailySummaryType>(
        `/api/daily-summary?childId=${childId}&date=${date.toISOString()}`
      );

      set((state) => ({
        summaries: {
          ...state.summaries,
          [key]: data,
        },
        isLoading: false,
      }));
    } catch (error) {
      set({
        error: "Não foi possível carregar o resumo diário.",
        isLoading: false,
        rawError: error,
      });
    }
  },

  getDailySummary: (childId: string, date: Date) => {
    const key = `${childId}-${date.toISOString().split("T")[0]}`;
    return get().summaries[key] || null;
  },

  invalidateChild: (childId: string) => {
    set((state) => {
      const newSummaries = { ...state.summaries };
      Object.keys(newSummaries).forEach((key) => {
        if (key.startsWith(`${childId}-`)) {
          delete newSummaries[key];
        }
      });
      return { summaries: newSummaries };
    });
  },

  invalidateDate: (date: Date) => {
    const dateKey = date.toISOString().split("T")[0];
    set((state) => {
      const newSummaries = { ...state.summaries };
      Object.keys(newSummaries).forEach((key) => {
        if (key.endsWith(`-${dateKey}`)) {
          delete newSummaries[key];
        }
      });
      return { summaries: newSummaries };
    });
  },

  clearError: () => set({ error: null }),
}));
