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
import { Pencil, Trash2, Plus, GripVertical } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Textarea } from "@/components/ui/textarea";
import { Task } from "@/types/task";
import { apiClient } from "@/lib/api-client";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  restrictToVerticalAxis,
  restrictToWindowEdges,
} from "@dnd-kit/modifiers";
import { useTasks } from "@/hooks/use-tasks";
import { LoadingSpinner } from "./ui/loading-spinner";
import { CardError } from "./ui/card-error";

interface TaskManagementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function SortableTaskCard({
  task,
  onEdit,
  onDelete,
  isEditing,
  editingTask,
  setEditingTask,
  onUpdate,
}: {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  isEditing: boolean;
  editingTask: Task | null;
  setEditingTask: (task: Task | null) => void;
  onUpdate: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <Card className="p-4">
        <div className="flex items-start gap-3">
          {/* Drag handle */}
          <div
            {...attributes}
            {...listeners}
            className="touch-none mt-1 cursor-grab active:cursor-grabbing"
          >
            <GripVertical className="h-5 w-5 text-muted-foreground" />
          </div>

          {/* Card content */}
          <div className="flex-1">
            {isEditing && editingTask ? (
              <div className="space-y-2">
                <Input
                  value={editingTask.title}
                  onPointerDown={(e) => e.stopPropagation()}
                  onChange={(e) =>
                    setEditingTask({
                      ...editingTask,
                      title: e.target.value,
                    })
                  }
                  className="mb-2"
                />
                <Textarea
                  value={editingTask.description || ''}
                  onPointerDown={(e) => e.stopPropagation()}
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
                    onPointerDown={(e) => e.stopPropagation()}
                    onChange={(e) =>
                      setEditingTask({
                        ...editingTask,
                        value: parseFloat(e.target.value),
                      })
                    }
                  />
                  <Button
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={onUpdate}
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
              <div className="flex justify-between items-start w-full">
                <div>
                  <h3 className="font-medium">{task.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {task.description}
                  </p>
                  <p
                    className={`text-sm font-semibold ${
                      task.isDiscount
                        ? "text-red-600 dark:text-red-400"
                        : task.isBonus
                        ? "text-yellow-600 dark:text-yellow-400"
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
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={() => onEdit(task)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon"
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={() => onDelete(task.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}

export function TaskManagementDialog({
  open,
  onOpenChange,
}: TaskManagementDialogProps) {
  const { toast } = useToast();
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    value: "",
    isDiscount: false,
    isBonus: false,
  });
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const { tasks, tasksDiscount, tasksBonus, isLoading, error, refetch } =
    useTasks();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (open) return;

    resetForm();
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

  const handleAddTask = async () => {
    if (!newTask.title.trim() || !newTask.value) return;

    try {
      await apiClient("/api/tasks", {
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

      resetForm();
      await refetch();
      toast({
        title: "Sucesso",
        description: "Tarefa adicionada com sucesso!",
      });
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
      await apiClient(`/api/tasks/${editingTask.id}`, {
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
          order: editingTask.order,
          enable: editingTask.enable,
        }),
      });

      setEditingTask(null);
      await refetch();
      toast({
        title: "Sucesso",
        description: "Tarefa atualizada com sucesso!",
      });
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
      await apiClient(`/api/tasks/${taskId}`, {
        method: "DELETE",
      });

      await refetch();
      toast({
        title: "Sucesso",
        description: "Tarefa removida com sucesso!",
      });
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

  const handleDragEnd = async (event: DragEndEvent, tasksToOrder: Task[]) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = tasksToOrder.findIndex((task) => task.id === active.id);
      const newIndex = tasksToOrder.findIndex((task) => task.id === over.id);
      const newTasks = arrayMove(tasksToOrder, oldIndex, newIndex);

      // Atualizar a ordem no backend
      try {
        await apiClient("/api/tasks/reorder", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            taskIds: newTasks.map((task) => task.id),
          }),
        });
      } catch (error) {
        console.error("Error reordering tasks:", error);
        toast({
          title: "Erro",
          description: "Não foi possível atualizar a ordem das tarefas.",
          variant: "destructive",
        });
      } finally {
        // Recarregar as tarefas em caso de erro
        await refetch();
      }
    }
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

          {isLoading ? (
            <LoadingSpinner />
          ) : error ? (
            <CardError
              title="Erro ao carregar tarefas"
              tryText="Tentar novamente"
              refetch={refetch}
            />
          ) : (
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
              {/* Tarefas */}
              {tasks.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-lg font-medium mb-2">Tarefas</h3>
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={(event) => handleDragEnd(event, tasks)}
                    modifiers={[restrictToVerticalAxis, restrictToWindowEdges]}
                  >
                    <SortableContext
                      items={tasks.map((task) => task.id)}
                      strategy={verticalListSortingStrategy}
                    >
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
                            <SortableTaskCard
                              task={task}
                              onEdit={setEditingTask}
                              onDelete={handleDeleteTask}
                              isEditing={editingTask?.id === task.id}
                              editingTask={editingTask}
                              setEditingTask={setEditingTask}
                              onUpdate={handleUpdateTask}
                            />
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </SortableContext>
                  </DndContext>
                </div>
              )}

              {/* Descontos */}
              {tasksDiscount.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-lg font-medium mb-2">Descontos</h3>
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={(event) => handleDragEnd(event, tasksDiscount)}
                    modifiers={[restrictToVerticalAxis, restrictToWindowEdges]}
                  >
                    <SortableContext
                      items={tasksDiscount.map((task) => task.id)}
                      strategy={verticalListSortingStrategy}
                    >
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
                            <SortableTaskCard
                              task={task}
                              onEdit={setEditingTask}
                              onDelete={handleDeleteTask}
                              isEditing={editingTask?.id === task.id}
                              editingTask={editingTask}
                              setEditingTask={setEditingTask}
                              onUpdate={handleUpdateTask}
                            />
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </SortableContext>
                  </DndContext>
                </div>
              )}

              {/* Bônus */}
              {tasksBonus.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium mb-2">Bônus</h3>
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={(event) => handleDragEnd(event, tasksBonus)}
                    modifiers={[restrictToVerticalAxis, restrictToWindowEdges]}
                  >
                    <SortableContext
                      items={tasksBonus.map((task) => task.id)}
                      strategy={verticalListSortingStrategy}
                    >
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
                            <SortableTaskCard
                              task={task}
                              onEdit={setEditingTask}
                              onDelete={handleDeleteTask}
                              isEditing={editingTask?.id === task.id}
                              editingTask={editingTask}
                              setEditingTask={setEditingTask}
                              onUpdate={handleUpdateTask}
                            />
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </SortableContext>
                  </DndContext>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
