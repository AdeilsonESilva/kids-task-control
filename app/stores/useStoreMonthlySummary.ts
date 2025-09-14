import { MonthlySummaryType } from '@/types/monthly-summary'
import { Task } from '@/types/task'
import { StateCreator, create } from 'zustand'

type MonthlySummaryState = {
  currentDate?: Date
  currentChild?: string
  monthlySummary?: MonthlySummaryType
  update: (by: MonthlySummaryType) => void
  sumMonthlySummary: (task: Task, isCompleted: boolean) => void
  reset: () => void
  isNeedUpdate: (date?: Date, child?: string) => void
}

export const createStoreMonthlySummary: StateCreator<MonthlySummaryState> = (set, get) => ({
  isNeedUpdate: (date, child) => {
    if(date && get().currentDate && child && get().currentChild && (date.getMonth() !== get().currentDate!.getMonth() || date.getFullYear() !== get().currentDate!.getFullYear() || child !== get().currentChild)) {
      get().reset()
    }

    return set(() => ({ currentDate: date, currentChild: child }))
  },
  update: (monthlySummary) => set(() => ({ monthlySummary })),
  sumMonthlySummary: (task, isCompleted) => set((state) => {
    const monthlySummary = state.monthlySummary || { totalValue: 0, completedTasks: 0, totalDiscounts: 0, dailyAverageValue: 0 }

    monthlySummary.totalValue += task.isDiscount ? 0 : ( isCompleted ? task.value : -task.value)
    monthlySummary.completedTasks += task.isDiscount || task.isBonus ? 0 : (isCompleted ? 1 : -1)
    monthlySummary.totalDiscounts += task.isDiscount ? (isCompleted ? task.value : -task.value) : 0
    monthlySummary.dailyAverageValue = monthlySummary.totalValue / (monthlySummary.completedTasks || 1)


    return { monthlySummary }
  }),
  reset: () => set(() => ({ month: undefined, monthlySummary: undefined }))
})

export const useStoreMonthlySummary = create<MonthlySummaryState>(createStoreMonthlySummary)
