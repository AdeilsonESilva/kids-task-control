import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { useChildStore } from "@/lib/stores/child-store";
import { useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Child } from "@/types/child";

// API functions
const fetchChildren = async (): Promise<Child[]> => {
  return await apiClient<Child[]>("/api/children");
};

const createChild = async (childData: { name: string }): Promise<Child> => {
  return await apiClient<Child>("/api/children", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(childData),
  });
};

const updateChild = async ({
  id,
  ...data
}: {
  id: string;
  name?: string;
}): Promise<Child> => {
  return await apiClient<Child>(`/api/children/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
};

const deleteChild = async (id: string): Promise<void> => {
  return await apiClient<void>(`/api/children/${id}`, {
    method: "DELETE",
  });
};

// Hook que sincroniza banco de dados com Zustand
export function useChildrenWithDatabase() {
  const queryClient = useQueryClient();
  const {
    setChildren,
    // setLoading,
    setCreatingModal: setCreating,
  } = useChildStore.getState();
  const { toast } = useToast();
  // const isCreatingAde = useChildStore((state) => state.isCreating);

  // Query para buscar crianças
  const {
    data: children = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["children"],
    queryFn: fetchChildren,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  });

  // Sincronizar dados do React Query com Zustand
  // useEffect(() => {
  //   setChildren(children);
  //   setLoading(isLoading);
  // }, [children, isLoading]);
  useEffect(() => {
    console.log("children db: ", children);
    setChildren(children);
  }, [children]);

  // Mutation para criar criança
  const createChildMutation = useMutation({
    mutationFn: createChild,
    onSuccess: (newChild) => {
      // Atualizar cache do React Query
      queryClient.setQueryData(["children"], (old: Child[] = []) => [
        ...old,
        newChild,
      ]);

      // Atualizar Zustand
      useChildStore.getState().addChild(newChild);

      setCreating(false);

      // console.log("New child added - isCreatingAde:", isCreatingAde);

      // Mostrar notificação
      toast({
        title: "Criança adicionada!",
        description: `${newChild.name} foi adicionada com sucesso.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao adicionar criança",
        description:
          error instanceof Error ? error.message : "Erro desconhecido",
      });
    },
  });

  // Mutation para atualizar criança
  const updateChildMutation = useMutation({
    mutationFn: updateChild,
    onSuccess: (updatedChild) => {
      // Atualizar cache do React Query
      queryClient.setQueryData(["children"], (old: Child[] = []) =>
        old.map((child) =>
          child.id === updatedChild.id ? updatedChild : child
        )
      );

      // Atualizar Zustand
      const currentChildren = useChildStore.getState().children;
      const updatedChildren = currentChildren.map((child) =>
        child.id === updatedChild.id ? updatedChild : child
      );
      useChildStore.getState().setChildren(updatedChildren);

      toast({
        title: "Criança atualizada!",
        description: `${updatedChild.name} foi atualizada com sucesso.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar criança",
        description:
          error instanceof Error ? error.message : "Erro desconhecido",
      });
    },
  });

  // Mutation para deletar criança
  const deleteChildMutation = useMutation({
    mutationFn: deleteChild,
    onSuccess: (_, deletedId) => {
      // Atualizar cache do React Query
      queryClient.setQueryData(["children"], (old: Child[] = []) =>
        old.filter((child) => child.id !== deletedId)
      );

      // Atualizar Zustand
      const currentChildren = useChildStore.getState().children;
      const filteredChildren = currentChildren.filter(
        (child) => child.id !== deletedId
      );
      useChildStore.getState().setChildren(filteredChildren);

      // Se a criança deletada estava selecionada, limpar seleção
      const selectedChildId = useChildStore.getState().selectedChild?.id;
      if (selectedChildId === deletedId) {
        useChildStore.getState().selectChild();
      }

      toast({
        title: "Criança removida!",
        description: "Criança foi removida com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao remover criança",
        description:
          error instanceof Error ? error.message : "Erro desconhecido",
      });
    },
  });

  return {
    // Dados
    children,
    isLoading,
    error,

    // Actions
    createChild: (name: string) => createChildMutation.mutate({ name }),
    updateChild: (id: string, name: string) =>
      updateChildMutation.mutate({ id, name }),
    deleteChild: (id: string) => deleteChildMutation.mutate(id),
    refetch,

    // Estados das mutations
    isCreating: createChildMutation.isPending,
    isUpdating: updateChildMutation.isPending,
    isDeleting: deleteChildMutation.isPending,
  };
}
