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

// Define a type for the completed tasks that includes value and isDiscount
// This might need to be adjusted based on the actual structure of your Task and CompletedTask types
interface CompletedTaskWithValue {
  id: string;
  taskId: string;
  childId: string;
  date: string;
  value: number; // Assuming 'value' comes from the joined Task table
  isDiscount: boolean; // Assuming 'isDiscount' comes from the joined Task table
  task?: { // Optional: if the API nests task details
    value: number;
    isDiscount: boolean;
  };
}


export async function getCompletedTasksByDateRange(
  childId: string,
  startDate: Date,
  endDate: Date
): Promise<CompletedTaskWithValue[]> {
  const startDateString = startDate.toISOString();
  const endDateString = endDate.toISOString();

  const endpoint = `/api/completed-tasks?childId=${childId}&startDate=${startDateString}&endDate=${endDateString}`;
  return apiClient<CompletedTaskWithValue[]>(endpoint, { method: "GET" });
}
