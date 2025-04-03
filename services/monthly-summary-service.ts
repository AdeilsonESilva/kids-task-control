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
          value
        )
      `
      )
      .eq("childId", childId)
      .gte("date", monthStart.toISOString())
      .lte("date", monthEnd.toISOString());

    if (error) throw error;

    // Corrigindo o acesso ao valor da tarefa
    const totalValue = completedTasks.reduce(
      (sum, ct) => sum + parseFloat(ct.Task.value),
      0
    );

    const daysInMonth = monthEnd.getDate();
    const dailyAverageValue = totalValue / daysInMonth;

    return {
      totalValue,
      completedTasks: completedTasks.length,
      dailyAverageValue,
    };
  }
}
