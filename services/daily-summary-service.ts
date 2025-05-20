import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/types/supabase";
import { startOfDay, endOfDay } from "date-fns";

export class DailySummaryService {
  constructor(private db: SupabaseClient<Database>) {}

  async getDailySummary(childId: string, dateStr: string) {
    const date = new Date(dateStr);
    const dayStart = startOfDay(date).toISOString();
    const dayEnd = endOfDay(date).toISOString();

    // Busca tarefas completadas com suas tarefas relacionadas
    const { data: completedTasks, error: completedTasksError } = await this.db
      .from("CompletedTask")
      .select(
        `
        *,
        task:Task(*)
      `
      )
      .eq("childId", childId)
      .gte("date", dayStart)
      .lte("date", dayEnd);

    if (completedTasksError) throw completedTasksError;

    // Conta o total de tarefas
    const { count: totalTasks, error: countError } = await this.db
      .from("Task")
      .select("*", { count: "exact", head: true });

    if (countError) throw countError;

    // Calcula o valor total das tarefas completadas
    // Tarefas com isDiscount=true devem subtrair do valor total
    const totalValue = completedTasks.reduce((sum, ct) => {
      const taskValue = parseFloat(ct.task.value);
      return ct.task.isDiscount ? sum - taskValue : sum + taskValue;
    }, 0);

    return {
      totalValue,
      completedTasks: completedTasks.length,
      totalTasks,
    };
  }
}
