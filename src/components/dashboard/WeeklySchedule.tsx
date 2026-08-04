import {
  Check,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

import {
  Booking,
  INSTRUCTORS,
  MAX_PER_SLOT,
  Student,
  TIME_SLOTS,
  fmtDate,
} from "@/lib/clinic-store";

const WEEKDAYS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

type WeeklyScheduleProps = {
  student: Student;
  week: Date[];
  bookings: Booking[];
  onPreviousWeek: () => void;
  onNextWeek: () => void;
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
  onBook,
  onCancel,
}: WeeklyScheduleProps) {
  return (
    <Card className="p-4 md:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">
            Agenda da semana
          </h2>

          <p className="text-sm text-muted-foreground">
            Escolha o melhor dia e horário para sua aula.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={onPreviousWeek}
            aria-label="Semana anterior"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <span className="min-w-[135px] text-center text-sm text-muted-foreground">
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

          <Button
            size="sm"
            variant="outline"
            onClick={onNextWeek}
            aria-label="Próxima semana"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="grid min-w-[720px] grid-cols-[80px_repeat(6,1fr)] gap-1">
          <div />

          {week.map((date, index) => {
            const formattedDate = fmtDate(date);
            const today = fmtDate(new Date());
            const isToday = formattedDate === today;

            return (
              <div
                key={formattedDate}
                className={`rounded-lg py-2 text-center ${
                  isToday ? "bg-primary/15" : ""
                }`}
              >
                <div className="text-xs uppercase text-muted-foreground">
                  {WEEKDAYS[index]}
                </div>

                <div className="font-semibold">
                  {date.getDate().toString().padStart(2, "0")}
                </div>

                {isToday && (
                  <div className="mt-1 text-[10px] font-medium text-primary">
                    Hoje
                  </div>
                )}
              </div>
            );
          })}

          {TIME_SLOTS.map((time) => (
            <FragmentRow key={time}>
              <div className="flex items-center justify-end pr-2 text-sm text-muted-foreground">
                {time}
              </div>

              {week.map((date, index) => {
                const formattedDate = fmtDate(date);

                const isPast =
                  new Date(
                    `${formattedDate}T${time}:00`,
                  ).getTime() < Date.now();

                return (
                  <div
                    key={`${time}-${index}`}
                    className="min-h-[72px] space-y-1 rounded-md bg-muted/40 p-1"
                  >
                    {INSTRUCTORS.map((instructor) => {
                      const slotBookings = bookings.filter(
                        (booking) =>
                          booking.date === formattedDate &&
                          booking.time === time &&
                          booking.instructor === instructor,
                      );

                      const mine = slotBookings.some(
                        (booking) =>
                          booking.studentId === student.id,
                      );

                      const full =
                        slotBookings.length >= MAX_PER_SLOT;

                      return (
                        <button
                          key={instructor}
                          type="button"
                          disabled={isPast || (full && !mine)}
                          onClick={() => {
                            if (mine) {
                              const studentBooking =
                                slotBookings.find(
                                  (booking) =>
                                    booking.studentId ===
                                    student.id,
                                );

                              if (studentBooking) {
                                onCancel(studentBooking);
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
                            "w-full rounded border px-1.5 py-1 text-[10px] leading-tight transition " +
                            (mine
                              ? "border-success bg-success text-success-foreground"
                              : full
                                ? "cursor-not-allowed border-destructive/20 bg-destructive/10 text-destructive"
                                : isPast
                                  ? "cursor-not-allowed bg-background opacity-40"
                                  : "border-border bg-background hover:bg-primary hover:text-primary-foreground")
                          }
                        >
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-medium">
                              {instructor}
                            </span>

                            <span className="flex items-center gap-0.5">
                              {mine && (
                                <Check className="h-3 w-3" />
                              )}

                              {slotBookings.length}/{MAX_PER_SLOT}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </FragmentRow>
          ))}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-4 text-xs text-muted-foreground">
        <Legend
          color="border bg-background"
          label="Disponível"
        />

        <Legend
          color="bg-success"
          label="Você está agendado"
        />

        <Legend
          color="bg-destructive/20"
          label="Turma cheia"
        />

        <Legend
          color="bg-muted opacity-50"
          label="Horário encerrado"
        />
      </div>
    </Card>
  );
}

function FragmentRow({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
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
        className={`inline-block h-3 w-3 rounded ${color}`}
      />

      <span>{label}</span>
    </div>
  );
}