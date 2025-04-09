import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/types/supabase";

type ChildInput = {
  name: string;
};

export class ChildService {
  constructor(private db: SupabaseClient<Database>) {}

  async getAllChildren() {
    const { data, error } = await this.db
      .from("Child")
      .select("*")
      .order("name");

    if (error) throw error;

    return data;
  }

  async createChild(childInput: ChildInput) {
    const { data, error } = await this.db
      .from("Child")
      .insert([childInput])
      .select()
      .single();

    if (error) throw error;

    return data;
  }

  async updateChild(id: string, childInput: Partial<ChildInput>) {
    const { data, error } = await this.db
      .from("Child")
      .update(childInput)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return data;
  }

  async deleteChild(id: string) {
    const { error } = await this.db.from("Child").delete().eq("id", id);

    if (error) throw error;
  }
}
