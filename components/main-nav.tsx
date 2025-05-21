"use client";

import { Settings, Users, ListTodo } from "lucide-react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "./ui/dropdown-menu";
import { useState, useCallback } from "react";
import { ChildrenManagementDialog } from "./children-management-dialog";
import { TaskManagementDialog } from "./task-management-dialog";
import { ThemeToggle } from "./theme-toggle";

export function MainNav() {
  const [isChildrenDialogOpen, setIsChildrenDialogOpen] = useState(false);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);

  const handleChildrenDialogChange = useCallback((open: boolean) => {
    setIsChildrenDialogOpen(open);
  }, []);

  const handleTaskDialogChange = useCallback((open: boolean) => {
    setIsTaskDialogOpen(open);
  }, []);

  return (
    <div className="flex items-center gap-4">
      <ThemeToggle />

      {!isChildrenDialogOpen && !isTaskDialogOpen ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <Settings className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleChildrenDialogChange(true)}>
              <Users className="mr-2 h-4 w-4" />
              Gerenciar Crianças
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleTaskDialogChange(true)}>
              <ListTodo className="mr-2 h-4 w-4" />
              Gerenciar Tarefas
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <Button variant="outline" size="icon">
          <Settings className="h-4 w-4" />
        </Button>
      )}

      <ChildrenManagementDialog
        open={isChildrenDialogOpen}
        onOpenChange={handleChildrenDialogChange}
      />

      <TaskManagementDialog
        open={isTaskDialogOpen}
        onOpenChange={handleTaskDialogChange}
      />
    </div>
  );
}