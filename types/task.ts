export interface Task {
  id: string;
  title: string;
  description: string;
  value: number;
  isDiscount: boolean;
  isBonus: boolean;
}

export type TaskInput = Omit<Task, "id">;
