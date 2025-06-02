import * as React from "react";
import { ptBR } from "date-fns/locale";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";

interface DateRangePickerProps {
  value?: DateRange;
  onChange: (value?: DateRange) => void;
  className?: string;
}

export function DateRangePicker({
  value,
  onChange,
  className,
}: DateRangePickerProps) {
  return (
    <div className={cn("grid gap-2", className)}>
      <Calendar
        autoFocus
        mode="range"
        defaultMonth={value?.from}
        selected={value}
        onSelect={onChange}
        locale={ptBR}
      />
    </div>
  );
}
