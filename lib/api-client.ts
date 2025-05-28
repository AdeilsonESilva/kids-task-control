import { supabase } from "./supabase";

export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const { data, error } = await supabase.auth.getUser()

  if (error || !data?.user) {
    throw new Error("Não autenticado");
  }

  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  const response = await fetch(endpoint, {
    ...options,
    headers,
    credentials: "include", // Importante para enviar os cookies
  });

  if (response.status === 401) {
    throw new Error("Não autenticado");
  }

  if (!response.ok) {
    throw new Error(`Erro na requisição: ${response.statusText}`);
  }

  return response.json();
}
