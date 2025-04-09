"use client";

import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { ptBR } from "date-fns/locale";
import { motion } from "framer-motion";

interface CalendarViewProps {
  onDateSelect: (date: Date | undefined) => void;
  selectedDate: Date | undefined;
}

export function CalendarView({
  onDateSelect,
  selectedDate,
}: CalendarViewProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="p-4">
        <h2 className="text-xl font-semibold mb-4">Calendário</h2>
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={onDateSelect}
          locale={ptBR}
          className="rounded-md border"
        />
      </Card>
    </motion.div>
  );
}
