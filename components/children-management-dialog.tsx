"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Pencil, Trash2, Plus } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { apiClient } from "@/lib/api-client";
import { CardError } from "./ui/card-error";
import { useChildren } from "@/hooks/use-children";
import { LoadingSpinner } from "./ui/loading-spinner";

interface Child {
  id: string;
  name: string;
}

interface ChildrenManagementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ChildrenManagementDialog({
  open,
  onOpenChange,
}: ChildrenManagementDialogProps) {
  const { toast } = useToast();
  const [newChildName, setNewChildName] = useState("");
  const [editingChild, setEditingChild] = useState<Child | null>(null);

  const { data: children, isLoading, error, refetch } = useChildren(open);

  useEffect(() => {
    if (!open) {
      // Limpar estados ao fechar o modal
      setNewChildName("");
      setEditingChild(null);
    }
  }, [open]);

  const handleAddChild = async () => {
    if (!newChildName.trim()) return;

    try {
      await apiClient<Child>("/api/children", {
        method: "POST",
        body: JSON.stringify({ name: newChildName }),
      });
      setNewChildName("");
      await refetch();
      toast({
        title: "Sucesso",
        description: "Criança adicionada com sucesso!",
      });
    } catch (error) {
      console.error("Error adding child:", error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar a criança.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateChild = async () => {
    if (!editingChild || !editingChild.name.trim()) return;

    try {
      await apiClient<Child>(`/api/children/${editingChild.id}`, {
        method: "PUT",
        body: JSON.stringify({ name: editingChild.name }),
      });
      setEditingChild(null);
      await refetch();
      toast({
        title: "Sucesso",
        description: "Nome atualizado com sucesso!",
      });
    } catch (error) {
      console.error("Error updating child:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o nome.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteChild = async (childId: string) => {
    try {
      await apiClient(`/api/children/${childId}`, {
        method: "DELETE",
      });

      await refetch();
      toast({
        title: "Sucesso",
        description: "Criança removida com sucesso!",
      });
    } catch (error) {
      console.error("Error deleting child:", error);
      toast({
        title: "Erro",
        description: "Não foi possível remover a criança.",
        variant: "destructive",
      });
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setEditingChild(null);
    setNewChildName("");
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle>Gerenciar Crianças</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="flex gap-2">
            <Input
              placeholder="Nome da criança"
              value={newChildName}
              onChange={(e) => setNewChildName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleAddChild();
                }
              }}
            />
            <Button onClick={handleAddChild} size="icon">
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
            <AnimatePresence mode="popLayout">
              {isLoading ? (
                <LoadingSpinner />
              ) : error ? (
                <CardError
                  title="Erro ao carregar crianças"
                  tryText="Tentar novamente"
                  refetch={refetch}
                />
              ) : (
                children?.map((child) => (
                  <motion.div
                    key={child.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2 }}
                    layout
                  >
                    <Card className="p-3 flex items-center justify-between">
                      {editingChild?.id === child.id ? (
                        <Input
                          value={editingChild?.name}
                          onChange={(e) =>
                            setEditingChild({
                              ...editingChild!,
                              name: e.target.value,
                            })
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              handleUpdateChild();
                            }
                          }}
                          className="max-w-[200px]"
                          autoFocus
                        />
                      ) : (
                        <span className="font-medium">{child.name}</span>
                      )}

                      <div className="flex gap-2">
                        {editingChild?.id === child.id ? (
                          <Button
                            size="sm"
                            onClick={handleUpdateChild}
                            className="bg-green-500 hover:bg-green-600"
                          >
                            Salvar
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setEditingChild(child)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => handleDeleteChild(child.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </Card>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
