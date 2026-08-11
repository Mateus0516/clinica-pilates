import { useMemo, useState } from "react";

import {
  Check,
  ChevronLeft,
  ChevronRight,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScheduleFilters } from "@/components/dashboard/ScheduleFilters";

import {
  Booking,
  INSTRUCTORS,
  MAX_PER_SLOT,
  Student,
  TIME_SLOTS,
  fmtDate,
} from "@/lib/clinic-store";

const WEEKDAYS = ["SEG", "TER", "QUA", "QUI", "SEX", "SÁB"];

type WeeklyScheduleProps = {
  student: Student;
  week: Date[];
  bookings: Booking[];
  onPreviousWeek: () => void;
  onNextWeek: () => void;
  onGoToToday: () => void;
  onBook: (
    date: string,
    time: string,
    instructor: string,
  ) => void;
  onCancel: (booking: Booking) => void;
};

export function WeeklySchedule({
  student,
  week,
  bookings,
  onPreviousWeek,
  onNextWeek,
  onGoToToday,
  onBook,
  onCancel,
}: WeeklyScheduleProps) {
  const [searchTime, setSearchTime] = useState("");
  const [selectedInstructor, setSelectedInstructor] =
    useState("Todos");
  const [onlyAvailable, setOnlyAvailable] = useState(false);

  const filteredTimeSlots = useMemo(() => {
    const normalizedSearch = searchTime.trim().toLowerCase();

    if (!normalizedSearch) {
      return TIME_SLOTS;
    }

    return TIME_SLOTS.filter((time) =>
      time.toLowerCase().includes(normalizedSearch),
    );
  }, [searchTime]);

  const filteredInstructors = useMemo(() => {
    if (selectedInstructor === "Todos") {
      return INSTRUCTORS;
    }

    return INSTRUCTORS.filter(
      (instructor) => instructor === selectedInstructor,
    );
  }, [selectedInstructor]);

  const clearFilters = () => {
    setSearchTime("");
    setSelectedInstructor("Todos");
    setOnlyAvailable(false);
  };

  const today = fmtDate(new Date());

  return (
    <Card className="overflow-hidden shadow-sm">
      <div className="border-b border-border p-4 md:p-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight">
              Agenda semanal
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Escolha um horário disponível para agendar sua aula.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="icon"
              variant="outline"
              onClick={onPreviousWeek}
              aria-label="Semana anterior"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="min-w-[170px] rounded-lg border border-border bg-muted/30 px-4 py-2 text-center">
              <span className="text-sm font-medium">
                {week[0].toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "short",
                })}

                {" — "}

                {week[5].toLocaleDateString("pt-BR", {
                  day: "2-digit",
                  month: "short",
                })}
              </span>
            </div>

            <Button
              size="icon"
              variant="outline"
              onClick={onNextWeek}
              aria-label="Próxima semana"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <ScheduleFilters
          searchTime={searchTime}
          selectedInstructor={selectedInstructor}
          onlyAvailable={onlyAvailable}
          onSearchTimeChange={setSearchTime}
          onInstructorChange={setSelectedInstructor}
          onOnlyAvailableChange={setOnlyAvailable}
          onGoToToday={onGoToToday}
          onClearFilters={clearFilters}
        />
      </div>

      {filteredTimeSlots.length === 0 ? (
        <div className="p-6">
          <div className="rounded-xl border border-dashed border-border bg-muted/30 p-8 text-center">
            <p className="font-semibold">
              Nenhum horário encontrado
            </p>

            <p className="mt-1 text-sm text-muted-foreground">
              Tente pesquisar por outro horário, como 07:00 ou 18:00.
            </p>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <div className="min-w-[1050px]">
            <div className="grid grid-cols-[78px_repeat(6,minmax(150px,1fr))] border-b border-border">
              <div className="border-r border-border bg-muted/20" />

              {week.map((date, index) => {
                const formattedDate = fmtDate(date);
                const isToday = formattedDate === today;

                return (
                  <div
                    key={formattedDate}
                    className={
                      "relative border-r border-border px-3 py-4 text-center last:border-r-0 transition-colors " +
                      (isToday
                        ? "bg-primary/20"
                        : "bg-background")
                    }
                  >
                    <p
                      className={
                        "text-xs font-semibold tracking-wider " +
                        (isToday
                          ? "text-primary"
                          : "text-muted-foreground")
                      }
                    >
                      {WEEKDAYS[index]}
                    </p>

                    <p className="mt-1 text-2xl font-bold">
                      {date
                        .getDate()
                        .toString()
                        .padStart(2, "0")}
                    </p>

                    {isToday && (
                      <span className="mx-auto mt-2 block h-2 w-2 rounded-full bg-primary" />
                    )}
                  </div>
                );
              })}
            </div>

            {filteredTimeSlots.map((time) => (
              <div
                key={time}
                className="grid grid-cols-[78px_repeat(6,minmax(150px,1fr))] border-b border-border last:border-b-0"
              >
                <div className="flex min-h-[82px] items-start justify-end border-r border-border bg-muted/10 px-3 py-3">
                  <span className="text-xs font-medium text-muted-foreground">
                    {time}
                  </span>
                </div>

                {week.map((date) => {
                  const formattedDate = fmtDate(date);
                  const isToday = formattedDate === today;

                  const isPast =
                    new Date(
                      `${formattedDate}T${time}:00`,
                    ).getTime() < Date.now();

                  return (
                    <div
                      key={`${formattedDate}-${time}`}
                      className={
                        "min-h-[82px] border-r border-border p-2 last:border-r-0 transition-colors " +
                        (isToday
                          ? "bg-primary/15"
                          : "bg-background")
                      }
                    >
                      <div className="space-y-1.5">
                        {filteredInstructors.map(
                          (instructor) => {
                            const slotBookings =
                              bookings.filter(
                                (booking) =>
                                  booking.date ===
                                    formattedDate &&
                                  booking.time === time &&
                                  booking.instructor ===
                                    instructor,
                              );

                            const mine = slotBookings.some(
                              (booking) =>
                                booking.studentId ===
                                student.id,
                            );

                            const full =
                              slotBookings.length >=
                              MAX_PER_SLOT;

                            if (
                              onlyAvailable &&
                              (isPast || full) &&
                              !mine
                            ) {
                              return null;
                            }

                            return (
                              <button
                                key={instructor}
                                type="button"
                                disabled={
                                  isPast ||
                                  (full && !mine)
                                }
                                onClick={() => {
                                  if (mine) {
                                    const studentBooking =
                                      slotBookings.find(
                                        (booking) =>
                                          booking.studentId ===
                                          student.id,
                                      );

                                    if (studentBooking) {
                                      onCancel(
                                        studentBooking,
                                      );
                                    }

                                    return;
                                  }

                                  onBook(
                                    formattedDate,
                                    time,
                                    instructor,
                                  );
                                }}
                                className={
                                  "group w-full rounded-lg border-l-4 px-3 py-2 text-left shadow-sm transition-all " +
                                  (mine
                                    ? "border-l-success border-success/30 bg-success/10 hover:bg-success/15"
                                    : full
                                      ? "cursor-not-allowed border-l-destructive border-destructive/20 bg-destructive/5 opacity-70"
                                      : isPast
                                        ? "cursor-not-allowed border-l-muted-foreground/30 border-border bg-muted/30 opacity-45"
                                        : "border-l-primary border-border bg-white hover:-translate-y-0.5 hover:border-primary/40 hover:bg-primary/5 hover:shadow-md")
                                }
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <div className="min-w-0">
                                    <p className="truncate text-xs font-semibold">
                                      Pilates
                                    </p>

                                    <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                                      Prof. {instructor}
                                    </p>
                                  </div>

                                  <div className="flex shrink-0 items-center gap-1 text-[10px] font-medium text-muted-foreground">
                                    <Users className="h-3 w-3" />

                                    {slotBookings.length}/
                                    {MAX_PER_SLOT}

                                    {mine && (
                                      <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-success text-success-foreground">
                                        <Check className="h-3 w-3" />
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </button>
                            );
                          },
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="border-t border-border bg-muted/10 px-4 py-4 md:px-6">
        <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground">
          <Legend
            color="border-l-4 border-l-primary bg-white"
            label="Disponível"
          />

          <Legend
            color="border-l-4 border-l-success bg-success/10"
            label="Você está agendado"
          />

          <Legend
            color="border-l-4 border-l-destructive bg-destructive/5"
            label="Turma cheia"
          />

          <Legend
            color="border-l-4 border-l-muted-foreground/30 bg-muted/30"
            label="Horário encerrado"
          />
        </div>
      </div>
    </Card>
  );
}

function Legend({
  color,
  label,
}: {
  color: string;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={`inline-block h-4 w-5 rounded ${color}`}
      />

      <span>{label}</span>
    </div>
  );
}