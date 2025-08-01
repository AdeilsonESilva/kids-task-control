import { create } from "zustand";
import { MonthlySummaryType } from "@/lib/types";
import { apiClient } from "@/lib/api-client";

interface MonthlySummaryStore {
  summaries: Record<string, MonthlySummaryType>;
  isLoading: boolean;
  error: string | null;
  rawError?: unknown;
  fetchMonthlySummary: (childId: string, date: Date) => Promise<void>;
  refetchMonthlySummary: (childId: string, date: Date) => Promise<void>;
  getMonthlySummary: (childId: string, date: Date) => MonthlySummaryType | null;
  invalidateChild: (childId: string) => void;
  invalidateMonth: (date: Date) => void;
  clearError: () => void;
}

export const useMonthlySummaryStore = create<MonthlySummaryStore>(
  (set, get) => ({
    summaries: {},
    isLoading: false,
    error: null,

    fetchMonthlySummary: async (childId: string, date: Date) => {
      const key = `${childId}-${date.getFullYear()}-${date.getMonth() + 1}`;

      // Se já temos o dado, não faz nova requisição
      if (get().summaries[key]) {
        return;
      }

      set({ isLoading: true, error: null });

      try {
        const data = await apiClient<MonthlySummaryType>(
          `/api/monthly-summary?childId=${childId}&date=${date.toISOString()}`
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
          error: "Não foi possível carregar o resumo mensal.",
          isLoading: false,
          rawError: error,
        });
      }
    },

    refetchMonthlySummary: async (childId: string, date: Date) => {
      const key = `${childId}-${date.getFullYear()}-${date.getMonth() + 1}`;

      set({ isLoading: true, error: null });

      try {
        const data = await apiClient<MonthlySummaryType>(
          `/api/monthly-summary?childId=${childId}&date=${date.toISOString()}`
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
          error: "Não foi possível carregar o resumo mensal.",
          isLoading: false,
          rawError: error,
        });
      }
    },

    getMonthlySummary: (childId: string, date: Date) => {
      const key = `${childId}-${date.getFullYear()}-${date.getMonth() + 1}`;
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

    invalidateMonth: (date: Date) => {
      const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
      set((state) => {
        const newSummaries = { ...state.summaries };
        Object.keys(newSummaries).forEach((key) => {
          if (key.endsWith(`-${monthKey}`)) {
            delete newSummaries[key];
          }
        });
        return { summaries: newSummaries };
      });
    },

    clearError: () => set({ error: null }),
  })
);
