export type Expense = {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: Date;
};

export type ExpenseFormData = Omit<Expense, "id" | "date"> & {
  date: string;
};

export const EXPENSE_CATEGORIES = [
  "Food",
  "Transportation",
  "Housing",
  "Utilities",
  "Entertainment",
  "Healthcare",
  "Shopping",
  "Education",
  "Other",
] as const;

// Daily Summary Types
export type DailySummaryType = {
  id: string;
  childId: string;
  date: string;
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  points: number;
  reward?: string;
  totalValue: number;
  totalDiscountWeek: number;
};

// Monthly Summary Types
export type MonthlySummaryType = {
  id: string;
  childId: string;
  month: number;
  year: number;
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  totalPoints: number;
  averageDaily: number;
  bestDay?: string;
  rewards: string[];
  totalValue: number;
  totalDiscounts: number;
  dailyAverageValue: number;
};
