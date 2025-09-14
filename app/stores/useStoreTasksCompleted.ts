import { Task } from '@/types/task'
import { TasksCompleted } from '@/types/tasks-completed'
import { StateCreator, create } from 'zustand'

type TasksCompletedState = {
  tasksCompleted?: TasksCompleted[]
  update: (by: TasksCompleted[]) => void
  updateTaskCompleted: (task: Task) => void
  reset: () => void
}

export const createStoreTasksCompleted: StateCreator<TasksCompletedState> = (set) => ({
  update: (tasksCompleted) => set(() => ({ tasksCompleted })),
  updateTaskCompleted: (task) => set((state) => {
    const tasksCompleted = state.tasksCompleted || []
    const taskIndex = tasksCompleted.findIndex(t => t.taskId === task.id)

    if (taskIndex > -1) {
      tasksCompleted.splice(taskIndex, 1)
    } else {
      tasksCompleted.push({
        taskId: task.id,
        task: {
          value: task.value,
          isDiscount: task.isDiscount
        }
      })
    }

    return { tasksCompleted }
  }),
  reset: () => set(() => ({ tasksCompleted: undefined }))
})

export const useStoreTasksCompleted = create<TasksCompletedState>(createStoreTasksCompleted)
