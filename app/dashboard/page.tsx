"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { TaskList } from "@/components/task-list";
import { ChildSelector } from "@/components/child-selector";
import { DailyProgress } from "@/components/daily-progress";
import { CalendarView } from "@/components/calendar-view";
import { MonthlySummary } from "@/components/monthly-summary";
// MainNav import removed as it's handled by PageHeader
import { PageHeader } from "@/components/ui/page-header"; // New import
import { motion } from "framer-motion";
import { useAuth } from "@/components/auth/auth-provider";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [selectedChild, setSelectedChild] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(today);
  const [updateTrigger, setUpdateTrigger] = useState(0);

  const { user, loading } = useAuth();

  const router = useRouter();

  useEffect(() => {
    if (!loading && !user)
      router.push("/login");
  }, [loading, user, router])

  if (loading) {
    return <div>Loading...</div>; 
  }

  if (!user) {
    return <div>Acesso negado...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <PageHeader title="Tarefas das Crianças" />

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
