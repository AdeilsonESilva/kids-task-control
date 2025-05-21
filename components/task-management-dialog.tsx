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
import { Textarea } from "@/components/ui/textarea";
import { Task } from "@/types/task";

interface TaskManagementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TaskManagementDialog({
  open,
  onOpenChange,
}: TaskManagementDialogProps) {
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [tasksDiscount, setTasksDiscount] = useState<Task[]>([]);
  const [tasksBonus, setTasksBonus] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    value: "",
    isDiscount: false,
    isBonus: false,
  });
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  useEffect(() => {
    if (open) {
      fetchTasks();
    } else {
      resetForm();
    }
  }, [open]);

  const resetForm = () => {
    setNewTask({
      title: "",
      description: "",
      value: "",
      isDiscount: false,
      isBonus: false,
    });
    setEditingTask(null);
  };

  const fetchTasks = async () => {
    try {
      const response = await fetch("/api/tasks");
      const data: Task[] = await response.json();
      setTasks(data.filter((task) => !task.isDiscount && !task.isBonus));
      setTasksDiscount(data.filter((task) => task.isDiscount));
      setTasksBonus(data.filter((task) => task.isBonus));
    } catch (error) {
      console.error("Error fetching tasks:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar a lista de tarefas.",
        variant: "destructive",
      });
    }
  };

  const handleAddTask = async () => {
    if (!newTask.title.trim() || !newTask.value) return;

    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: newTask.title,
          description: newTask.description,
          value: Math.abs(parseFloat(newTask.value)),
          isDiscount: newTask.isDiscount,
          isBonus: newTask.isBonus,
        }),
      });

      if (response.ok) {
        resetForm();
        await fetchTasks();
        toast({
          title: "Sucesso",
          description: "Tarefa adicionada com sucesso!",
        });
      }
    } catch (error) {
      console.error("Error adding task:", error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar a tarefa.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateTask = async () => {
    if (!editingTask || !editingTask.title.trim()) return;

    try {
      const response = await fetch(`/api/tasks/${editingTask.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: editingTask.title,
          description: editingTask.description,
          value: Math.abs(editingTask.value),
          isDiscount: editingTask.isDiscount,
          isBonus: editingTask.isBonus,
        }),
      });

      if (response.ok) {
        setEditingTask(null);
        await fetchTasks();
        toast({
          title: "Sucesso",
          description: "Tarefa atualizada com sucesso!",
        });
      }
    } catch (error) {
      console.error("Error updating task:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a tarefa.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchTasks();
        toast({
          title: "Sucesso",
          description: "Tarefa removida com sucesso!",
        });
      }
    } catch (error) {
      console.error("Error deleting task:", error);
      toast({
        title: "Erro",
        description: "Não foi possível remover a tarefa.",
        variant: "destructive",
      });
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    resetForm();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle>Gerenciar Tarefas</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="grid gap-4">
            <div className="grid grid-cols-[2fr,1fr] gap-2">
              <Input
                placeholder="Título da tarefa"
                value={newTask.title}
                onChange={(e) =>
                  setNewTask({ ...newTask, title: e.target.value })
                }
              />
              <Input
                type="number"
                step="0.01"
                min="0"
                placeholder="Valor"
                value={newTask.value}
                onChange={(e) =>
                  setNewTask({ ...newTask, value: e.target.value })
                }
              />
            </div>
            {/* mobile style gap-2 */}
            <div className="flex gap-2 mb-2 sm:gap-24">
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="new-task-is-discount"
                  name="task-type"
                  checked={newTask.isDiscount}
                  onChange={() => {}}
                  onClick={() =>
                    setNewTask({
                      ...newTask,
                      isDiscount: !newTask.isDiscount,
                      isBonus: false,
                    })
                  }
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <label
                  htmlFor="new-task-is-discount"
                  className="text-sm font-medium"
                >
                  É um desconto (valor negativo)
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="new-task-is-bonus"
                  name="task-type"
                  checked={newTask.isBonus}
                  onChange={() => {}}
                  onClick={() =>
                    setNewTask({
                      ...newTask,
                      isBonus: !newTask.isBonus,
                      isDiscount: false,
                    })
                  }
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <label
                  htmlFor="new-task-is-bonus"
                  className="text-sm font-medium"
                >
                  Bônus
                </label>
              </div>
            </div>
            <div className="flex gap-2">
              <Textarea
                placeholder="Descrição da tarefa"
                value={newTask.description}
                onChange={(e) =>
                  setNewTask({ ...newTask, description: e.target.value })
                }
                className="flex-1"
              />
              <Button onClick={handleAddTask} className="self-end">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar
              </Button>
            </div>
          </div>

          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
            {/* Tarefas */}
            {tasks.length > 0 && (
              <div className="mb-4">
                <h3 className="text-lg font-medium mb-2">Tarefas</h3>
                <AnimatePresence mode="popLayout">
                  {tasks.map((task) => (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.2 }}
                      layout
                    >
                      <Card className="p-4">
                        {editingTask?.id === task.id ? (
                          <div className="space-y-2">
                            <Input
                              value={editingTask.title}
                              onChange={(e) =>
                                setEditingTask({
                                  ...editingTask,
                                  title: e.target.value,
                                })
                              }
                              className="mb-2"
                            />
                            <Textarea
                              value={editingTask.description}
                              onChange={(e) =>
                                setEditingTask({
                                  ...editingTask,
                                  description: e.target.value,
                                })
                              }
                              className="mb-2"
                            />
                            <div className="flex gap-2">
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                value={Math.abs(editingTask.value)}
                                onChange={(e) =>
                                  setEditingTask({
                                    ...editingTask,
                                    value: parseFloat(e.target.value),
                                  })
                                }
                              />
                              <Button
                                onClick={handleUpdateTask}
                                className="bg-green-500 hover:bg-green-600"
                              >
                                Salvar
                              </Button>
                            </div>
                            <div className="flex gap-2 mb-2 sm:gap-24">
                              <div className="flex items-center space-x-2">
                                <input
                                  type="radio"
                                  id={`edit-task-is-discount-${task.id}`}
                                  name={`edit-task-type-${task.id}`}
                                  checked={editingTask.isDiscount}
                                  onChange={() => {}}
                                  onClick={() =>
                                    setEditingTask({
                                      ...editingTask,
                                      isDiscount: !editingTask.isDiscount,
                                      isBonus: false,
                                    })
                                  }
                                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                />
                                <label
                                  htmlFor={`edit-task-is-discount-${task.id}`}
                                  className="text-sm font-medium"
                                >
                                  É um desconto (valor negativo)
                                </label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <input
                                  type="radio"
                                  id={`edit-task-is-bonus-${task.id}`}
                                  name={`edit-task-type-${task.id}`}
                                  checked={editingTask.isBonus}
                                  onChange={() => {}}
                                  onClick={() =>
                                    setEditingTask({
                                      ...editingTask,
                                      isBonus: !editingTask.isBonus,
                                      isDiscount: false,
                                    })
                                  }
                                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                />
                                <label
                                  htmlFor={`edit-task-is-bonus-${task.id}`}
                                  className="text-sm font-medium"
                                >
                                  Bônus
                                </label>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium">{task.title}</h3>
                              <p className="text-sm text-muted-foreground">
                                {task.description}
                              </p>
                              <p
                                className={`text-sm font-semibold ${
                                  task.isDiscount
                                    ? "text-red-600 dark:text-red-400"
                                    : "text-green-600 dark:text-green-400"
                                }`}
                              >
                                R$ {task.value.toFixed(2)}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setEditingTask(task)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="destructive"
                                size="icon"
                                onClick={() => handleDeleteTask(task.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}

            {/* Descontos */}
            {tasksDiscount.length > 0 && (
              <div className="mb-4">
                <h3 className="text-lg font-medium mb-2">Descontos</h3>
                <AnimatePresence mode="popLayout">
                  {tasksDiscount.map((task) => (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.2 }}
                      layout
                    >
                      <Card className="p-4">
                        {editingTask?.id === task.id ? (
                          <div className="space-y-2">
                            <Input
                              value={editingTask.title}
                              onChange={(e) =>
                                setEditingTask({
                                  ...editingTask,
                                  title: e.target.value,
                                })
                              }
                              className="mb-2"
                            />
                            <Textarea
                              value={editingTask.description}
                              onChange={(e) =>
                                setEditingTask({
                                  ...editingTask,
                                  description: e.target.value,
                                })
                              }
                              className="mb-2"
                            />
                            <div className="flex gap-2">
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                value={Math.abs(editingTask.value)}
                                onChange={(e) =>
                                  setEditingTask({
                                    ...editingTask,
                                    value: parseFloat(e.target.value),
                                  })
                                }
                              />
                              <Button
                                onClick={handleUpdateTask}
                                className="bg-green-500 hover:bg-green-600"
                              >
                                Salvar
                              </Button>
                            </div>
                            <div className="flex gap-2 mb-2 sm:gap-24">
                              <div className="flex items-center space-x-2">
                                <input
                                  type="radio"
                                  id={`edit-task-is-discount-${task.id}`}
                                  name={`edit-task-type-${task.id}`}
                                  checked={editingTask.isDiscount}
                                  onChange={() => {}}
                                  onClick={() =>
                                    setEditingTask({
                                      ...editingTask,
                                      isDiscount: !editingTask.isDiscount,
                                      isBonus: false,
                                    })
                                  }
                                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                />
                                <label
                                  htmlFor={`edit-task-is-discount-${task.id}`}
                                  className="text-sm font-medium"
                                >
                                  É um desconto (valor negativo)
                                </label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <input
                                  type="radio"
                                  id={`edit-task-is-bonus-${task.id}`}
                                  name={`edit-task-type-${task.id}`}
                                  checked={editingTask.isBonus}
                                  onChange={() => {}}
                                  onClick={() =>
                                    setEditingTask({
                                      ...editingTask,
                                      isBonus: !editingTask.isBonus,
                                      isDiscount: false,
                                    })
                                  }
                                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                />
                                <label
                                  htmlFor={`edit-task-is-bonus-${task.id}`}
                                  className="text-sm font-medium"
                                >
                                  Bônus
                                </label>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium">{task.title}</h3>
                              <p className="text-sm text-muted-foreground">
                                {task.description}
                              </p>
                              <p className="text-sm font-semibold text-red-600 dark:text-red-400">
                                R$ {task.value.toFixed(2)}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setEditingTask(task)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="destructive"
                                size="icon"
                                onClick={() => handleDeleteTask(task.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}

            {/* Bônus */}
            {tasksBonus.length > 0 && (
              <div>
                <h3 className="text-lg font-medium mb-2">Bônus</h3>
                <AnimatePresence mode="popLayout">
                  {tasksBonus.map((task) => (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.2 }}
                      layout
                    >
                      <Card className="p-4">
                        {editingTask?.id === task.id ? (
                          <div className="space-y-2">
                            <Input
                              value={editingTask.title}
                              onChange={(e) =>
                                setEditingTask({
                                  ...editingTask,
                                  title: e.target.value,
                                })
                              }
                              className="mb-2"
                            />
                            <Textarea
                              value={editingTask.description}
                              onChange={(e) =>
                                setEditingTask({
                                  ...editingTask,
                                  description: e.target.value,
                                })
                              }
                              className="mb-2"
                            />
                            <div className="flex gap-2">
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                value={Math.abs(editingTask.value)}
                                onChange={(e) =>
                                  setEditingTask({
                                    ...editingTask,
                                    value: parseFloat(e.target.value),
                                  })
                                }
                              />
                              <Button
                                onClick={handleUpdateTask}
                                className="bg-green-500 hover:bg-green-600"
                              >
                                Salvar
                              </Button>
                            </div>
                            <div className="flex gap-2 mb-2 sm:gap-24">
                              <div className="flex items-center space-x-2">
                                <input
                                  type="radio"
                                  id={`edit-task-is-discount-${task.id}`}
                                  name={`edit-task-type-${task.id}`}
                                  checked={editingTask.isDiscount}
                                  onChange={() => {}}
                                  onClick={() =>
                                    setEditingTask({
                                      ...editingTask,
                                      isDiscount: !editingTask.isDiscount,
                                      isBonus: false,
                                    })
                                  }
                                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                />
                                <label
                                  htmlFor={`edit-task-is-discount-${task.id}`}
                                  className="text-sm font-medium"
                                >
                                  É um desconto (valor negativo)
                                </label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <input
                                  type="radio"
                                  id={`edit-task-is-bonus-${task.id}`}
                                  name={`edit-task-type-${task.id}`}
                                  checked={editingTask.isBonus}
                                  onChange={() => {}}
                                  onClick={() =>
                                    setEditingTask({
                                      ...editingTask,
                                      isBonus: !editingTask.isBonus,
                                      isDiscount: false,
                                    })
                                  }
                                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                />
                                <label
                                  htmlFor={`edit-task-is-bonus-${task.id}`}
                                  className="text-sm font-medium"
                                >
                                  Bônus
                                </label>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium">{task.title}</h3>
                              <p className="text-sm text-muted-foreground">
                                {task.description}
                              </p>
                              <p className="text-sm font-semibold text-yellow-600 dark:text-yellow-400">
                                R$ {task.value.toFixed(2)}
                              </p>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setEditingTask(task)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="destructive"
                                size="icon"
                                onClick={() => handleDeleteTask(task.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
