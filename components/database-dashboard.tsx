"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Plus, Edit2, Trash2, RefreshCw } from "lucide-react";
import {
  useSelectedChild,
  useChildStore,
  useChildren,
} from "@/lib/stores/child-store";
import { useChildrenWithDatabase } from "@/hooks/use-children-database";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Child } from "@/types/child";

export function DatabaseDashboard() {
  const {
    children,
    isLoading,
    error,
    createChild,
    updateChild,
    deleteChild,
    refetch,
    isCreating,
    isUpdating,
    isDeleting,
  } = useChildrenWithDatabase();

  const selectedChild = useSelectedChild();
  // const childrenState = useChildren();

  // console.log("Children state:", childrenState);

  // const bla = useChildStore((state) => state.children);
  // console.log("Children state:", bla);

  // console.log("isLoading db:", isLoading);
  // const bla = useChildStore.getState().children;
  // console.log("Children state:", bla);

  useEffect(() => {
    const bla = useChildStore.getState().children;
    console.log("Children state:", bla);
  }, [isLoading]);

  const [newChildName, setNewChildName] = useState("");
  const [editingChild, setEditingChild] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const { setCreatingModal } = useChildStore.getState();

  const isCreatingModal = useChildStore((state) => state.isCreatingModal);

  const handleCreateChild = () => {
    if (!newChildName.trim()) return;

    setCreatingModal(true);

    createChild(newChildName.trim());
    setNewChildName("");
  };

  const handleUpdateChild = () => {
    if (!editingChild || !editingChild.name.trim()) return;

    updateChild(editingChild.id, editingChild.name.trim());
    setEditingChild(null);
    setIsEditDialogOpen(false);
  };

  const handleSelectChild = (child: Child) => {
    useChildStore.getState().selectChild(child);
  };

  const startEdit = (child: { id: string; name: string }) => {
    setEditingChild(child);
    setIsEditDialogOpen(true);
  };

  if (error) {
    return (
      <div className="space-y-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-600">
              <span>❌</span>
              <span className="font-medium">Erro ao carregar dados:</span>
              <span>
                {error instanceof Error ? error.message : "Erro desconhecido"}
              </span>
            </div>
            <Button
              onClick={() => refetch()}
              className="mt-4"
              variant="outline"
              size="sm"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Tentar novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard com Banco de Dados</h1>
          <p className="text-muted-foreground">
            Dados carregados do Supabase via React Query + Zustand
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setCreatingModal(true)}
            variant="outline"
            disabled={isLoading}
          >
            Loading true
          </Button>

          <Button
            onClick={() => setCreatingModal(false)}
            variant="outline"
            disabled={isLoading}
          >
            Loading false
          </Button>

          <Button
            onClick={() => refetch()}
            variant="outline"
            disabled={isLoading}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
            />
            Atualizar
          </Button>

          <Dialog open={isCreatingModal} onOpenChange={setCreatingModal}>
            <DialogTrigger asChild>
              <Button disabled={isCreating}>
                {isCreating ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4 mr-2" />
                )}
                Adicionar Criança
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar Nova Criança</DialogTitle>
                <DialogDescription>
                  Digite o nome da criança para adicionar ao banco de dados.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="childName">Nome da Criança</Label>
                  <Input
                    id="childName"
                    value={newChildName}
                    onChange={(e) => setNewChildName(e.target.value)}
                    placeholder="Digite o nome..."
                    onKeyDown={(e) => e.key === "Enter" && handleCreateChild()}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setCreatingModal(false)}
                >
                  {/* <Button variant="outline" onClick={() => setCreating(false)}> */}
                  Cancelar
                </Button>
                <Button
                  onClick={handleCreateChild}
                  disabled={!newChildName.trim() || isCreating}
                >
                  {isCreating && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  Adicionar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {selectedChild && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <span className="text-green-600">✅</span>
              <span className="font-medium">Criança selecionada:</span>
              <Badge variant="secondary">{selectedChild.name}</Badge>
              <Badge variant="outline">ID: {selectedChild.id}</Badge>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Crianças do Banco de Dados</span>
            <div className="flex items-center gap-2">
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              <Badge variant="secondary">{children.length}</Badge>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading && children.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                <p className="text-muted-foreground">Carregando crianças...</p>
              </div>
            </div>
          ) : children.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                Nenhuma criança encontrada no banco de dados.
              </p>
              <Button onClick={() => setCreatingModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar primeira criança
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {children.map((child) => (
                <div
                  key={child.id}
                  className={`p-4 border rounded-lg hover:shadow-md transition-shadow ${
                    selectedChild?.id === child.id
                      ? "border-blue-300 bg-blue-50"
                      : ""
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium">{child.name}</h3>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          startEdit({ id: child.id, name: child.name })
                        }
                        disabled={isUpdating}
                      >
                        {isUpdating ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Edit2 className="h-3 w-3" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteChild(child.id)}
                        disabled={isDeleting}
                        className="text-red-600 hover:text-red-700"
                      >
                        {isDeleting ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Trash2 className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">
                      ID: {child.id}
                    </p>
                    <Button
                      size="sm"
                      variant={
                        selectedChild?.id === child.id ? "default" : "outline"
                      }
                      onClick={() => handleSelectChild(child)}
                      className="w-full"
                    >
                      {selectedChild?.id === child.id
                        ? "Selecionada"
                        : "Selecionar"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Status da Integração</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {children.length}
              </p>
              <p className="text-sm text-muted-foreground">Total no DB</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">
                {selectedChild?.id ? "1" : "0"}
              </p>
              <p className="text-sm text-muted-foreground">Selecionada</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">✅</p>
              <p className="text-sm text-muted-foreground">React Query</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">✅</p>
              <p className="text-sm text-muted-foreground">Zustand</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dialog de Edição */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Criança</DialogTitle>
            <DialogDescription>
              Altere o nome da criança no banco de dados.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="editChildName">Nome da Criança</Label>
              <Input
                id="editChildName"
                value={editingChild?.name || ""}
                onChange={(e) =>
                  setEditingChild((prev) =>
                    prev ? { ...prev, name: e.target.value } : null
                  )
                }
                placeholder="Digite o nome..."
                onKeyDown={(e) => e.key === "Enter" && handleUpdateChild()}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleUpdateChild}
              disabled={!editingChild?.name.trim() || isUpdating}
            >
              {isUpdating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
