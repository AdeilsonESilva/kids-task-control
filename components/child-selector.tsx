"use client";

import { Button } from "./ui/button";
import { motion } from "framer-motion";
import { LoadingSpinner } from "./ui/loading-spinner";
import { CardError } from "./ui/card-error";
import { useChildren } from "@/hooks/use-children";
import { useStoreChildren } from "@/app/stores/useStoreChildren";
import { useEffect } from "react";

interface ChildSelectorProps {
  selectedChild?: string;
  onSelectChild: (childId?: string) => void;
}

export function ChildSelector({
  selectedChild,
  onSelectChild,
}: ChildSelectorProps) {
  const { children, update } = useStoreChildren();
  const { data: childrenData, isLoading, error, refetch } = useChildren(!children);

  useEffect(() => {
    if(childrenData !== undefined) {
      update(childrenData);
    }
  }, [childrenData, update]);


  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">Crianças</h2>

      <div className="space-y-2">
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
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Button
                variant={selectedChild === child.id ? "default" : "outline"}
                className="w-full justify-start"
                onClick={() =>
                  onSelectChild(child.id === selectedChild ? undefined : child.id)
                }
              >
                {child.name}
              </Button>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
