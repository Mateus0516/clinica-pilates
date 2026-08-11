import { CalendarDays, Search, RotateCcw, UserRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { INSTRUCTORS } from "@/lib/clinic-store";

type ScheduleFiltersProps = {
  searchTime: string;
  selectedInstructor: string;
  onlyAvailable: boolean;
  onSearchTimeChange: (value: string) => void;
  onInstructorChange: (value: string) => void;
  onOnlyAvailableChange: (value: boolean) => void;
  onGoToToday: () => void;
  onClearFilters: () => void;
};

export function ScheduleFilters({
  searchTime,
  selectedInstructor,
  onlyAvailable,
  onSearchTimeChange,
  onInstructorChange,
  onOnlyAvailableChange,
  onGoToToday,
  onClearFilters,
}: ScheduleFiltersProps) {
  return (
    <div className="mb-6 grid gap-3 md:grid-cols-2 xl:grid-cols-[1.3fr_1fr_auto_auto_auto]">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

        <input
          type="text"
          value={searchTime}
          onChange={(event) => onSearchTimeChange(event.target.value)}
          placeholder="Buscar horário, ex.: 08:00"
          className="h-10 w-full rounded-lg border border-input bg-background pl-10 pr-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <div className="relative">
        <UserRound className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

        <select
          value={selectedInstructor}
          onChange={(event) => onInstructorChange(event.target.value)}
          className="h-10 w-full appearance-none rounded-lg border border-input bg-background pl-10 pr-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
        >
          <option value="Todos">Todos os professores</option>

          {INSTRUCTORS.map((instructor) => (
            <option key={instructor} value={instructor}>
              {instructor}
            </option>
          ))}
        </select>
      </div>

      <Button
        type="button"
        variant="outline"
        className="h-10"
        onClick={onGoToToday}
      >
        <CalendarDays className="mr-2 h-4 w-4" />
        Hoje
      </Button>

      <label className="flex h-10 cursor-pointer items-center gap-2 rounded-lg border border-input bg-background px-4 text-sm">
        <input
          type="checkbox"
          checked={onlyAvailable}
          onChange={(event) =>
            onOnlyAvailableChange(event.target.checked)
          }
          className="h-4 w-4 accent-[var(--primary)]"
        />

        Apenas disponíveis
      </label>

      <Button
        type="button"
        variant="ghost"
        className="h-10"
        onClick={onClearFilters}
      >
        <RotateCcw className="mr-2 h-4 w-4" />
        Limpar
      </Button>
    </div>
  );
}