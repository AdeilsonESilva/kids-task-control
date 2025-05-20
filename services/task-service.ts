import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/types/supabase";
import { TaskInput } from "@/types/task";

export class TaskService {
  constructor(private db: SupabaseClient<Database>) {}

  async getAllTasks() {
    const { data, error } = await this.db.from("Task").select("*");

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

  async deleteTask(id: string) {
    const { error } = await this.db.from("Task").delete().eq("id", id);

    if (error) throw error;
  }
}
