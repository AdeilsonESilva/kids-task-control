import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/types/supabase";
import { startOfMonth, endOfMonth } from "date-fns";

export class MonthlySummaryService {
  constructor(private db: SupabaseClient<Database>) {}

  async getMonthlySummary(childId: string, dateStr: string) {
    const date = new Date(dateStr);
    const monthStart = startOfMonth(date);
    const monthEnd = endOfMonth(date);

    const { data: completedTasks, error } = await this.db
      .from("CompletedTask")
      .select(
        `
        *,
        Task (
          value,
          isDiscount
        )
      `
      )
      .eq("childId", childId)
      .gte("date", monthStart.toISOString())
      .lte("date", monthEnd.toISOString());

    if (error) throw error;

    // Calculando o total do mês (excluindo tarefas de desconto)
    const totalValue = completedTasks.reduce((sum, ct) => {
      const taskValue = parseFloat(ct.Task.value);
      return ct.Task.isDiscount ? sum - taskValue : sum + taskValue;
    }, 0);

    // Calculando o total de descontos
    const totalDiscounts = completedTasks.reduce((sum, ct) => {
      const taskValue = parseFloat(ct.Task.value);
      // Apenas soma valores negativos (descontos)
      return ct.Task.isDiscount ? sum + taskValue : sum;
    }, 0);

    const daysInMonth = monthEnd.getDate();
    const dailyAverageValue = totalValue / daysInMonth;

    return {
      totalValue,
      totalDiscounts,
      completedTasks: completedTasks.filter((ct) => !ct.Task.isDiscount).length,
      dailyAverageValue,
    };
  }
}
