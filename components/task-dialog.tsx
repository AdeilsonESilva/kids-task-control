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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Task } from "@/types/task";

interface TaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: Task;
  onSuccess?: () => void;
}

export function TaskDialog({
  open,
  onOpenChange,
  task,
  onSuccess,
}: TaskDialogProps) {
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [value, setValue] = useState("");
  const [isDiscount, setIsDiscount] = useState<boolean>();

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description);
      setValue(Math.abs(task.value).toString());
      setIsDiscount(task.isDiscount);
    } else {
      setTitle("");
      setDescription("");
      setValue("");
      setIsDiscount(false);
    }
  }, [task]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const taskData = {
      title,
      description,
      value: isDiscount
        ? -Math.abs(parseFloat(value))
        : Math.abs(parseFloat(value)),
      isDiscount: isDiscount,
    };

    try {
      const response = await fetch(
        task ? `/api/tasks/${task.id}` : "/api/tasks",
        {
          method: task ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(taskData),
        }
      );

      if (response.ok) {
        toast({
          title: task ? "Tarefa atualizada!" : "Tarefa criada!",
          description: "A operação foi realizada com sucesso.",
        });
        onOpenChange(false);
        onSuccess?.();
      }
    } catch (error) {
      console.error("Error saving task:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar a tarefa.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{task ? "Editar Tarefa" : "Nova Tarefa"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Título</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Digite o título da tarefa"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Descrição</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Digite a descrição da tarefa"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Valor (R$)</label>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="0.00"
              required
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="is-discount"
              checked={isDiscount}
              onChange={(e) => setIsDiscount(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
            />
            <label htmlFor="is-discount" className="text-sm font-medium">
              É um desconto (valor negativo)
            </label>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit">{task ? "Atualizar" : "Criar"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
