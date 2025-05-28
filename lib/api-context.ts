// lib/api-context.ts
import { createClient } from "@supabase/supabase-js";
// import { supabase, supabaseSC } from "./supabase";
import { supabase } from "./supabase";
import type { Database } from "@/types/supabase";

// Tipo para o contexto da API
export interface ApiContext {
  db: ReturnType<typeof createClient<Database>>;
}

// Função para criar o contexto da API
export function createApiContext(): ApiContext {
  // const aa = () => {
  //   return supabaseSC.then();
  // }
  return { db: supabase };
}

// Singleton do contexto da API
let apiContext: ApiContext | null = null;

// Função para obter o contexto da API
export function getApiContext(): ApiContext {
  if (!apiContext) {
    apiContext = createApiContext();
  }
  return apiContext;
}
