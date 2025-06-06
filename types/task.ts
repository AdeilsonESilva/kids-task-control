import { Database } from "./supabase";

export type Task = Database["public"]["Tables"]["Task"]["Row"];

export type CreateTask = Omit<Task, "id" | "createdAt" | "updatedAt">;
