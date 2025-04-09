"use client";

import { useEffect, useState } from "react";
import { Card } from "./ui/card";
import { Checkbox } from "./ui/checkbox";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";
import { TaskDialog } from "./task-dialog";

interface Task {
  id: string;
  title: string;
  description: string;
  value: number;
}

interface TaskListProps {
  selectedChild: string | null;
  selectedDate: Date | undefined;
}

export function TaskList({ selectedChild, selectedDate }: TaskListProps) {
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);

  // Resetar as tarefas completadas quando trocar de criança ou data
  useEffect(() => {
    setCompletedTasks([]);
    if (selectedChild && selectedDate) {
      fetchCompletedTasks();
    }
  }, [selectedChild, selectedDate]);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await fetch("/api/tasks");
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as tarefas.",
        variant: "destructive",
      });
    }
  };

  const fetchCompletedTasks = async () => {
    if (!selectedChild || !selectedDate) return;

    try {
      const response = await fetch(
        `/api/completed-tasks?childId=${selectedChild}&date=${selectedDate.toISOString()}`
      );
      const data = await response.json();
      setCompletedTasks(data.map((ct: { taskId: string }) => ct.taskId));
    } catch (error) {
      console.error("Error fetching completed tasks:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as tarefas completadas.",
        variant: "destructive",
      });
    }
  };

  const handleTaskCompletion = async (taskId: string) => {
    if (!selectedChild || !selectedDate) {
      toast({
        title: "Atenção",
        description: "Selecione uma criança e uma data primeiro.",
        variant: "default",
      });
      return;
    }

    try {
      const response = await fetch("/api/completed-tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          taskId,
          childId: selectedChild,
          date: selectedDate.toISOString(),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.message === "Task uncompleted") {
          setCompletedTasks(completedTasks.filter((id) => id !== taskId));
          toast({
            title: "Tarefa desmarcada",
            description: "A tarefa foi desmarcada com sucesso.",
          });
        } else {
          setCompletedTasks([...completedTasks, taskId]);
          toast({
            title: "Tarefa completada",
            description: "A tarefa foi marcada como concluída.",
          });
        }
      }
    } catch (error) {
      console.error("Error completing task:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status da tarefa.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">Lista de Tarefas</h2>

      {!selectedChild && (
        <Card className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
          <p className="text-yellow-800 dark:text-yellow-200">
            Selecione uma criança para gerenciar as tarefas.
          </p>
        </Card>
      )}

      {selectedChild && !selectedDate && (
        <Card className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
          <p className="text-yellow-800 dark:text-yellow-200">
            Selecione uma data no calendário.
          </p>
        </Card>
      )}

      <AnimatePresence mode="popLayout">
        {tasks.map((task) => (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            layout
          >
            <Card className="p-4 flex items-center justify-between hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-4">
                <Checkbox
                  checked={completedTasks.includes(task.id)}
                  // disabled={!selectedChild || !selectedDate}
                  onCheckedChange={() => handleTaskCompletion(task.id)}
                  className="transition-all duration-200"
                />
                <div
                  className={`transition-all duration-200 ${
                    completedTasks.includes(task.id) ? "opacity-50" : ""
                  }`}
                >
                  <h3 className="font-medium">{task.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {task.description}
                  </p>
                  <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                    Valor: R$ {task.value.toFixed(2)}
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>

      <TaskDialog
        open={isTaskDialogOpen}
        onOpenChange={setIsTaskDialogOpen}
        task={editingTask}
        onSuccess={() => {
          setEditingTask(null);
          fetchTasks();
        }}
      />
    </div>
  );
}
