"use client";

import { useState, useCallback, useMemo } from "react";
import { ChildSelector } from "@/components/child-selector";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header"; // New import
import { DateRange } from "react-day-picker";
import { useCompletedTasks } from "@/hooks/use-completed-tasks";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { CardError } from "@/components/ui/card-error";

export default function PaymentDuePage() {
  const [selectedChildId, setSelectedChildId] = useState<string>();
  const [dateRange, setDateRange] = useState<DateRange>();
  const {
    data: completedTasks,
    isLoading,
    error,
    refetch,
    isSuccess,
  } = useCompletedTasks({
    childId: selectedChildId,
    startDate: dateRange?.from,
    endDate: dateRange?.to,
  });

  const handleChildSelect = useCallback((childId?: string) => {
    setSelectedChildId(childId);
  }, []);

  const handleDateRangeChange = useCallback((newDateRange?: DateRange) => {
    setDateRange(newDateRange);
  }, []);

  const totalAmount = useMemo(
    () =>
      completedTasks?.reduce(
        (acc, task) =>
          task.task.isDiscount
            ? (acc -= task.task.value)
            : (acc += task.task.value),
        0
      ) ?? 0,
    [completedTasks]
  );

  return (
    <div className="min-h-screen bg-background">
      <PageHeader title="Relatório de Valor a Pagar" />

      <main className="container mx-auto p-4">
        <CardContent className="flex justify-center">
          <div className="space-y-4">
            <Card className="p-4 shadow-lg hover:shadow-xl transition-shadow">
              <ChildSelector
                selectedChild={selectedChildId}
                onSelectChild={handleChildSelect}
              />
            </Card>
            <Card className="p-4 shadow-lg hover:shadow-xl transition-shadow">
              <DateRangePicker
                onChange={handleDateRangeChange}
                value={dateRange}
              />
            </Card>

            {isLoading ? (
              <LoadingSpinner />
            ) : error ? (
              <CardError
                title="Falha ao calcular o valor. Tente novamente."
                tryText="Tentar novamente"
                refetch={refetch}
              />
            ) : (
              isSuccess && (
                <Card className="p-4 shadow-lg hover:shadow-xl transition-shadow">
                  <h3 className="text-xl font-medium mb-2">
                    Valor Total a Pagar:
                  </h3>
                  <p
                    className={`text-3xl font-bold ${
                      totalAmount >= 0
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    R$ {totalAmount.toFixed(2).replace(".", ",")}
                  </p>
                </Card>
              )
            )}
          </div>
        </CardContent>
      </main>
    </div>
  );
}
