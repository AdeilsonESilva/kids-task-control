"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { TaskList } from "@/components/task-list";
import { ChildSelector } from "@/components/child-selector";
import { DailyProgress } from "@/components/daily-progress";
import { CalendarView } from "@/components/calendar-view";
import { MonthlySummary } from "@/components/monthly-summary";
import { MainNav } from "@/components/main-nav";
import { motion } from "framer-motion";

export default function Dashboard() {
  const [selectedChild, setSelectedChild] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );
  const [updateTrigger, setUpdateTrigger] = useState(0);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary">
            Tarefas das Crianças
          </h1>
          <MainNav />
        </div>
      </header>

      <main className="container mx-auto p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="col-span-1 md:col-span-3 space-y-6">
              <Card className="p-4 shadow-lg hover:shadow-xl transition-shadow">
                <ChildSelector
                  selectedChild={selectedChild}
                  onSelectChild={setSelectedChild}
                />
              </Card>

              <CalendarView
                selectedDate={selectedDate}
                onDateSelect={setSelectedDate}
              />
            </div>

            <div className="col-span-1 md:col-span-9 space-y-6">
              <MonthlySummary
                selectedChild={selectedChild}
                selectedDate={selectedDate}
                updateTrigger={updateTrigger}
              />

              <DailyProgress
                selectedChild={selectedChild}
                selectedDate={selectedDate}
                updateTrigger={updateTrigger}
              />

              <Card className="p-4 shadow-lg hover:shadow-xl transition-shadow">
                <TaskList
                  selectedChild={selectedChild}
                  selectedDate={selectedDate}
                  updateTrigger={updateTrigger}
                  onUpdateTrigger={() => setUpdateTrigger((prev) => prev + 1)}
                />
              </Card>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
