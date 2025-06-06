import { apiClient } from "@/lib/api-client";
import { Child } from "@/types/child";
import { useQuery } from "@tanstack/react-query";

const fetchChildren = async () => {
  return await apiClient<Child[]>("/api/children");
};

export const useChildren = (enabled?: boolean) => {
  return useQuery({
    queryKey: ["children"],
    queryFn: fetchChildren,
    enabled,
  });
};
