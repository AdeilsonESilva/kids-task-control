import { Task } from '@/types/task'
import { StateCreator, create } from 'zustand'

type TasksState = {
  tasks?: Task[]
  update: (by: Task[]) => void
}

export const createStoreTasks: StateCreator<TasksState> = (set) => ({
  update: (tasks) => set(() => ({ tasks }))
})

export const useStoreTasks = create<TasksState>(createStoreTasks)
