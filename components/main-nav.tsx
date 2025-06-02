"use client";

import { Settings, Users, ListTodo, LogOut, BarChart2, DollarSign } from "lucide-react";
import Link from "next/link";
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
import { useAuth } from "./auth/auth-provider";

export function MainNav() {
  const [isChildrenDialogOpen, setIsChildrenDialogOpen] = useState(false);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);

  const { signOut } = useAuth();

  const handleChildrenDialogChange = useCallback((open: boolean) => {
    setIsChildrenDialogOpen(open);
  }, []);

  const handleTaskDialogChange = useCallback((open: boolean) => {
    setIsTaskDialogOpen(open);
  }, []);

  return (
    <div className="flex items-center gap-4">
      {/* New Reports Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon">
            <BarChart2 className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link href="/reports/payment-due">
              <DollarSign className="mr-2 h-4 w-4" />
              Valor a pagar
            </Link>
          </DropdownMenuItem>
          {/* Future report items can be added here */}
        </DropdownMenuContent>
      </DropdownMenu>
      
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
            <DropdownMenuItem onClick={signOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Sair
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
