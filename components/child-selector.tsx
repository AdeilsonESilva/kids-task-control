"use client";

import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { motion } from "framer-motion";
import { apiClient } from "@/lib/api-client";

interface Child {
  id: string;
  name: string;
}

interface ChildSelectorProps {
  selectedChild: string | null;
  onSelectChild: (childId: string | null) => void;
}

export function ChildSelector({
  selectedChild,
  onSelectChild,
}: ChildSelectorProps) {
  const [children, setChildren] = useState<Child[]>([]);

  useEffect(() => {
    fetchChildren();
  }, []);

  const fetchChildren = async () => {
    try {
      const data = await apiClient<Child[]>("/api/children");
      setChildren(data);
    } catch (error) {
      console.error("Error fetching children:", error);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">Crianças</h2>

      <div className="space-y-2">
        {children.map((child) => (
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
                onSelectChild(child.id === selectedChild ? null : child.id)
              }
            >
              {child.name}
            </Button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
