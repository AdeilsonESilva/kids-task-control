"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { motion } from "framer-motion";

interface MonthlySummaryProps {
  selectedChild: string | null;
  selectedDate: Date | undefined;
  updateTrigger?: number; // Adicionar propriedade para forçar atualização
}

interface MonthlySummary {
  totalValue: number;
  totalDiscounts: number;
  completedTasks: number;
  dailyAverageValue: number;
}

export function MonthlySummary({
  selectedChild,
  selectedDate,
  updateTrigger = 0,
}: MonthlySummaryProps) {
  const [summary, setSummary] = useState<MonthlySummary>({
    totalValue: 0,
    totalDiscounts: 0,
    completedTasks: 0,
    dailyAverageValue: 0,
  });

  useEffect(() => {
    if (selectedChild && selectedDate) {
      fetchMonthlySummary();
    }
  }, [selectedChild, selectedDate, updateTrigger]);

  const fetchMonthlySummary = async () => {
    try {
      const response = await fetch(
        `/api/monthly-summary?childId=${selectedChild}&date=${selectedDate?.toISOString()}`
      );
      const data = await response.json();
      setSummary(data);
    } catch (error) {
      console.error("Error fetching monthly summary:", error);
    }
  };

  if (!selectedChild || !selectedDate) {
    return null;
  }

  const monthYear = format(selectedDate, "MMMM 'de' yyyy", { locale: ptBR });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="p-4">
        <h2 className="text-xl font-semibold mb-4">
          Resumo do Mês - {monthYear}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4 bg-gradient-to-br from-purple-100 to-purple-50 dark:from-purple-900 dark:to-purple-800 h-24">
            <h3 className="text-sm font-medium text-purple-800 dark:text-purple-100">
              Total do Mês
            </h3>
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-300">
              R$ {summary.totalValue.toFixed(2)}
            </p>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-red-100 to-red-50 dark:from-red-900 dark:to-red-800 h-24">
            <h3 className="text-sm font-medium text-red-800 dark:text-red-100">
              Total Descontos
            </h3>
            <p className="text-2xl font-bold text-red-600 dark:text-red-300">
              R$ {summary.totalDiscounts.toFixed(2)}
            </p>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900 dark:to-blue-800 h-24">
            <h3 className="text-sm font-medium text-blue-800 dark:text-blue-100">
              Tarefas Completadas
            </h3>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-300">
              {summary.completedTasks}
            </p>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-green-100 to-green-50 dark:from-green-900 dark:to-green-800 h-24">
            <h3 className="text-sm font-medium text-green-800 dark:text-green-100">
              Média Diária
            </h3>
            <p className="text-2xl font-bold text-green-600 dark:text-green-300">
              R$ {summary.dailyAverageValue.toFixed(2)}
            </p>
          </Card>
        </div>
      </Card>
    </motion.div>
  );
}
