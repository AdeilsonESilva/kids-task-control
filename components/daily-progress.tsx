"use client";

import { Card } from "./ui/card";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useDailySummary } from "@/hooks/use-daily-summary";
import { LoadingSpinner } from "./ui/loading-spinner";
import { CardError } from "./ui/card-error";

interface DailyProgressProps {
  selectedChild?: string;
  selectedDate?: Date;
}

export function DailyProgress({
  selectedChild,
  selectedDate,
}: DailyProgressProps) {
  const {
    data: summary,
    isLoading,
    error,
    refetch,
  } = useDailySummary({ selectedChild, selectedDate });

  const formattedDate = selectedDate
    ? format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
    : "";

  if (!selectedChild || !selectedDate) {
    return null;
  }

  return (
    <Card className="p-4 shadow-lg hover:shadow-xl transition-shadow">
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">
          Progresso do Dia - {formattedDate}
        </h2>

        {isLoading ? (
          <LoadingSpinner />
        ) : error ? (
          <CardError
            title="Erro ao carregar progresso diário"
            tryText="Tentar novamente"
            refetch={refetch}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="p-4 bg-gradient-to-br from-green-100 to-green-50 dark:from-green-900 dark:to-green-800 h-24">
                <h3 className="text-sm font-medium text-green-800 dark:text-green-100">
                  Total do dia
                </h3>
                <p className="text-2xl font-bold text-green-600 dark:text-green-300">
                  R$ {summary?.totalValue.toFixed(2)}
                </p>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <Card className="p-4 bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900 dark:to-blue-800 h-24">
                <h3 className="text-sm font-medium text-blue-800 dark:text-blue-100">
                  Tarefas pagas
                </h3>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-300">
                  {summary?.completedTasks} / {summary?.totalTasks}
                </p>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="p-4 bg-gradient-to-br from-red-100 to-red-50 dark:from-red-900 dark:to-red-800 h-24">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-100">
                  Total descontos da semana
                </h3>
                <p className="text-2xl font-bold text-red-600 dark:text-red-300">
                  R$ {summary?.totalDiscountWeek.toFixed(2)}
                </p>
              </Card>
            </motion.div>
          </div>
        )}
      </div>
    </Card>
  );
}
