export interface Task {
  id: string;
  title: string;
  description: string;
  value: number;
  isDiscount?: boolean;
}

export type TaskInput = Omit<Task, "id">;
