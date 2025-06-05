import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/types/supabase";
import { Task, TaskInput } from "@/types/task";

export class TaskService {
  constructor(private db: SupabaseClient<Database>) { }

  async getAllTasks() {
    const { data, error } = await this.db
      .from("Task")
      .select("*")
      .eq("enable", true)
      .order("order", { ascending: true });

    if (error) throw error;

    return data;
  }

  async createTask(taskInput: TaskInput) {
    const { data, error } = await this.db
      .from("Task")
      .insert([taskInput])
      .select()
      .single();

    if (error) throw error;

    return data;
  }

  async updateTask(id: string, taskInput: Partial<TaskInput>) {
    const { data, error } = await this.db
      .from("Task")
      .update(taskInput)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return data;
  }

  async updateTasksOrder(tasks: Partial<Task>[]) {
    try {
      const results = await Promise.all(
        tasks.map(async (task) => {
          const { data, error } = await this.db
            .from("Task")
            .update({ order: task.order })
            .eq("id", task.id)
            .select();

          if (error) throw error;
          return data?.[0];
        })
      );

      return results;
    } catch (err) {
      throw new Error("Erro ao atualizar a ordem das tarefas: " + String(err));
    }
  }

  async deleteTask(id: string) {
    const { error } = await this.db.from("Task").update({ enable: false }).eq("id", id);

    if (error) throw error;
  }
}
