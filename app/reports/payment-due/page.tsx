"use client";

import { useState, useCallback } from "react";
import { ChildSelector } from "@/components/child-selector";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCompletedTasksByDateRange } from "@/lib/api-client";
import { PageHeader } from "@/components/ui/page-header"; // New import
import { DateRange } from "react-day-picker";
// import { Child } from "@/lib/types"; // Placeholder for Child type
// import { Task } from "@/types/task"; // Placeholder for Task type - path might differ

export default function PaymentDuePage() {
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>();
  const [totalAmount, setTotalAmount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleChildSelect = useCallback((childId: string | null) => {
    setSelectedChildId(childId);
    setTotalAmount(null); // Reset amount when child changes
    setError(null);
  }, []);

  const handleDateRangeChange = useCallback((newDateRange?: DateRange) => {
    setDateRange(newDateRange);
    setTotalAmount(null); // Reset amount when date range changes
    setError(null);
  }, []);

  const handleCalculate = useCallback(async () => {
    if (!selectedChildId || !dateRange?.from || !dateRange?.to) {
      setError("Por favor, selecione uma criança e um período válido.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setTotalAmount(null);

    try {
      console.log(
        "Fetching completed tasks for child:",
        selectedChildId,
        "from:",
        dateRange.from,
        "to:",
        dateRange.to
      );

      const completedTasks = await getCompletedTasksByDateRange(
        selectedChildId,
        dateRange.from,
        dateRange.to
      );

      console.log("Fetched completed tasks:", completedTasks);

      let calculatedAmount = 0;
      for (const task of completedTasks) {
        // Use task.value and task.isDiscount directly if they are on the root object
        // Or use task.task.value and task.task.isDiscount if nested
        const value = task.task?.value ?? task.value;
        const isDiscount = task.task?.isDiscount ?? task.isDiscount;

        if (typeof value !== "number") {
          console.warn(
            `Task with ID ${task.taskId} has an invalid or missing value.`
          );
          continue;
        }

        if (isDiscount) {
          calculatedAmount -= value;
        } else {
          calculatedAmount += value;
        }
      }
      setTotalAmount(calculatedAmount);
    } catch (err) {
      console.error("Error calculating payment:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Falha ao calcular o valor. Tente novamente."
      );
    } finally {
      setIsLoading(false);
    }
  }, [selectedChildId, dateRange]);

  return (
    <div className="min-h-screen bg-background">
      <PageHeader title="Relatório de Valor a Pagar" />
      <main className="container mx-auto p-4">
        <Card>
          <CardHeader>
            {/* This CardTitle might be reviewed later if PageHeader's title is sufficient */}
            <CardTitle>Calcular Valor a Pagar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div className="md:col-span-1">
                  <ChildSelector
                    onSelectChild={handleChildSelect}
                    selectedChild={selectedChildId}
                  />
                </div>
                <div className="md:col-span-1">
                  <DateRangePicker
                    onChange={handleDateRangeChange}
                    value={dateRange}
                  />
                </div>
                <Button
                  onClick={handleCalculate}
                  disabled={
                    isLoading ||
                    !selectedChildId ||
                    !dateRange?.from ||
                    !dateRange?.to
                  }
                  className="md:col-span-1"
                >
                  {isLoading ? "Calculando..." : "Calcular"}
                </Button>
              </div>

              {isLoading && <p className="text-center">Calculando...</p>}
              {error && <p className="text-center text-red-500">{error}</p>}
              {totalAmount !== null && !isLoading && !error && (
                <div className="mt-6 text-center p-6 bg-card rounded-lg shadow">
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
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
