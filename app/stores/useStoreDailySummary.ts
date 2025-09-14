import { DailySummaryType } from '@/types/daily-summary'
import { Task } from '@/types/task'
import { StateCreator, create } from 'zustand'

type DailySummaryState = {
  dailySummary?: DailySummaryType
  update: (by: DailySummaryType) => void
  sumDailySummary: (task: Task, isCompleted: boolean) => void
  reset: () => void
}

export const createStoreDailySummary: StateCreator<DailySummaryState> = (set) => ({
  update: (dailySummary) => set(() => ({ dailySummary })),
  sumDailySummary: (task, isCompleted) => set((state) => {
    const dailySummary = state.dailySummary || { totalValue: 0, completedTasks: 0, totalTasks: 0, totalDiscountWeek: 0 }

    dailySummary.totalValue += task.isDiscount ? 0 : ( isCompleted ? task.value : -task.value)
    dailySummary.completedTasks += task.isDiscount || task.isBonus ? 0 : (isCompleted ? 1 : -1)
    dailySummary.totalDiscountWeek += task.isDiscount ? (isCompleted ? task.value : -task.value) : 0

    return { dailySummary }
  }),
  reset: () => set(() => ({ dailySummary: undefined }))
})

export const useStoreDailySummary = create<DailySummaryState>(createStoreDailySummary)
