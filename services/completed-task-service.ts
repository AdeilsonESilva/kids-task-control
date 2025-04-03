import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/types/supabase";
import { startOfDay, endOfDay } from "date-fns";

export class CompletedTaskService {
  constructor(private db: SupabaseClient<Database>) {}

  async getCompletedTasksByChildAndDate(childId: string, dateStr: string) {
    const date = new Date(dateStr);
    const dayStart = startOfDay(date).toISOString();
    const dayEnd = endOfDay(date).toISOString();

    const { data, error } = await this.db
      .from("CompletedTask")
      .select("*")
      .eq("childId", childId)
      .gte("date", dayStart)
      .lte("date", dayEnd);

    if (error) throw error;

    return data;
  }

  async toggleTaskCompletion(taskId: string, childId: string, date: string) {
    const dayStart = startOfDay(new Date(date)).toISOString();
    const dayEnd = endOfDay(new Date(date)).toISOString();

    // Verificar se a tarefa já foi completada neste dia
    const { data: existingTasks, error: findError } = await this.db
      .from("CompletedTask")
      .select("*")
      .eq("taskId", taskId)
      .eq("childId", childId)
      .gte("date", dayStart)
      .lte("date", dayEnd);

    if (findError) throw findError;

    if (existingTasks && existingTasks.length > 0) {
      // Se já existe, remove a tarefa completada
      const { error: deleteError } = await this.db
        .from("CompletedTask")
        .delete()
        .eq("id", existingTasks[0].id);

      if (deleteError) throw deleteError;

      return { message: "Task uncompleted" };
    } else {
      // Se não existe, cria uma nova tarefa completada
      const { data: completedTask, error: insertError } = await this.db
        .from("CompletedTask")
        .insert([
          {
            taskId,
            childId,
            date: new Date(date).toISOString(),
          },
        ])
        .select()
        .single();

      if (insertError) throw insertError;

      return completedTask;
    }
  }
}
