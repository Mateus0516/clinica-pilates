import { useMemo, useState } from "react";

import {
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Users,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScheduleFilters } from "@/components/dashboard/ScheduleFilters";

import { TIME_SLOTS } from "@/lib/clinic-store";
import { calendarDate, calendarKey, clinicToday, hoursUntil, type Appointment, type Slot } from "@/lib/scheduling";

const WEEKDAYS = [
  "SEG",
  "TER",
  "QUA",
  "QUI",
  "SEX",
  "SÁB",
];

type WeeklyScheduleProps = {
  sessionsRemaining?: number;
  slots: Slot[];
  canReserve: boolean;
  isPending: boolean;
  week: Date[];
  bookings: Appointment[];
  onPreviousWeek: () => void;
  onNextWeek: () => void;
  onGoToToday: () => void;
  onBook: (slot: Slot) => Promise<boolean>;
  onCancel: (booking: Appointment) => Promise<boolean>;
};

export function WeeklySchedule({
  sessionsRemaining,
  slots,
  canReserve,
  isPending,
  week,
  bookings,
  onPreviousWeek,
  onNextWeek,
  onGoToToday,
  onBook,
  onCancel,
}: WeeklyScheduleProps) {
  const [searchTime, setSearchTime] =
    useState("");

  const [
    selectedInstructor,
    setSelectedInstructor,
  ] = useState("Todos");

  const [onlyAvailable, setOnlyAvailable] =
    useState(false);

  const [
    selectedClass,
    setSelectedClass,
  ] = useState<Slot | null>(null);

  // Aula selecionada para cancelamento
  const [
    bookingToCancel,
    setBookingToCancel,
  ] = useState<Appointment | null>(null);

  const filteredTimeSlots = useMemo(() => {
    const normalizedSearch =
      searchTime.trim().toLowerCase();

    const times = [...new Set([...TIME_SLOTS, ...slots.map((slot) => slot.horario)])].sort();
    return times.filter((time) => time.includes(normalizedSearch));
  }, [searchTime, slots]);

  const instructors = [...new Set([...slots.map((slot) => slot.instrutor), selectedInstructor])]
    .filter((name) => name !== "Todos");

  const clearFilters = () => {
    setSearchTime("");
    setSelectedInstructor("Todos");
    setOnlyAvailable(false);
  };

  const today = clinicToday();

  const handleConfirmBooking = async () => {
    if (!selectedClass || isPending) return;
    if (await onBook(selectedClass)) setSelectedClass(null);
  };

  const handleConfirmCancel = async () => {
    if (!bookingToCancel || isPending) return;
    if (await onCancel(bookingToCancel)) setBookingToCancel(null);
  };

  const formattedSelectedDate = selectedClass ? calendarDate(selectedClass.data).toLocaleDateString("pt-BR") : "";
  const formattedCancelDate = bookingToCancel ? calendarDate(bookingToCancel.data).toLocaleDateString("pt-BR") : "";

  return (
    <>
      <Card className="overflow-hidden shadow-sm">
        {canReserve && slots.length === 0 && (
          <p className="px-4 py-3 text-sm text-muted-foreground">Nenhum horário encontrado nesta semana.</p>
        )}
        {/* CABEÇALHO */}
        <div className="border-b border-border p-4 md:p-6">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold tracking-tight">
                Agenda semanal
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Escolha um horário disponível para
                agendar sua aula.
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
                  {week[0].toLocaleDateString(
                    "pt-BR",
                    {
                      day: "2-digit",
                      month: "short",
                    },
                  )}

                  {" — "}

                  {week[5].toLocaleDateString(
                    "pt-BR",
                    {
                      day: "2-digit",
                      month: "short",
                    },
                  )}
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
            instructors={instructors}
            searchTime={searchTime}
            selectedInstructor={
              selectedInstructor
            }
            onlyAvailable={onlyAvailable}
            onSearchTimeChange={setSearchTime}
            onInstructorChange={
              setSelectedInstructor
            }
            onOnlyAvailableChange={
              setOnlyAvailable
            }
            onGoToToday={onGoToToday}
            onClearFilters={clearFilters}
          />
        </div>

        {/* SEM RESULTADOS */}
        {filteredTimeSlots.length === 0 ? (
          <div className="p-6">
            <div className="rounded-xl border border-dashed border-border bg-muted/30 p-8 text-center">
              <p className="font-semibold">
                Nenhum horário encontrado
              </p>

              <p className="mt-1 text-sm text-muted-foreground">
                Tente pesquisar por outro horário,
                como 07:00 ou 18:00.
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="min-w-[1050px]">
              {/* DIAS */}
              <div className="grid grid-cols-[78px_repeat(6,minmax(150px,1fr))] border-b border-border">
                <div className="border-r border-border bg-muted/20" />

                {week.map((date, index) => {
                  const formattedDate =
                    calendarKey(date);

                  const isToday =
                    formattedDate === today;

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

              {/* HORÁRIOS */}
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
                    const formattedDate =
                      calendarKey(date);

                    const isToday =
                      formattedDate === today;

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
                          {slots.filter((slot) =>
                            slot.data === formattedDate && slot.horario === time
                            && (selectedInstructor === "Todos" || slot.instrutor === selectedInstructor),
                          ).map((slot) => {
                              const instructor = slot.instrutor;
                              const myBooking = bookings.find((booking) =>
                                booking.data === slot.data && booking.horario === slot.horario
                                && booking.instrutorCodigo === slot.instrutorCodigo,
                              );
                              const mine = Boolean(myBooking);
                              const full = slot.vagasDisponiveis === 0;
                              const isPast = hoursUntil(slot) <= 0;

                              if (
                                onlyAvailable &&
                                (isPast || full) &&
                                !mine
                              ) {
                                return null;
                              }

                              return (
                                <button
                                  key={slot.instrutorCodigo}
                                  type="button"
                                  disabled={isPending || isPast || (!mine && (full || !canReserve))}
                                  onClick={() => {
                                    if (myBooking) setBookingToCancel(myBooking);
                                    else setSelectedClass(slot);
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
                                        Prof.{" "}
                                        {instructor}
                                      </p>
                                    </div>

                                    <div className="flex shrink-0 items-center gap-1 text-[10px] font-medium text-muted-foreground">
                                      <Users className="h-3 w-3" />

                                      {
                                        slot.capacidade - slot.vagasDisponiveis
                                      }
                                      /{slot.capacidade}

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

        {/* LEGENDA */}
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

      {/* MODAL CONFIRMAR AGENDAMENTO */}
      {selectedClass && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-[2px]"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              setSelectedClass(null);
            }
          }}
        >
          <div className="w-full max-w-[560px] overflow-hidden rounded-3xl bg-white shadow-2xl">
            {/* CABEÇALHO */}
            <div className="flex items-start justify-between border-b border-slate-200 px-7 py-7">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10">
                  <CalendarDays className="h-7 w-7 text-primary" />
                </div>

                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-slate-950">
                    Confirmar agendamento
                  </h2>

                  <p className="mt-2 text-base text-slate-500">
                    Confira os dados antes de
                    continuar.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedClass(null)
                }
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                aria-label="Fechar"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* CONTEÚDO */}
            <div className="space-y-5 px-7 py-7">
              {/* DADOS */}
              <div className="rounded-2xl bg-slate-50 px-6 py-2">
                <div className="flex items-center justify-between gap-4 border-b border-slate-200 py-5">
                  <span className="text-base text-slate-500">
                    Data
                  </span>

                  <span className="text-base font-bold text-slate-950">
                    {formattedSelectedDate}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4 border-b border-slate-200 py-5">
                  <span className="text-base text-slate-500">
                    Horário
                  </span>

                  <span className="text-base font-bold text-slate-950">
                    {selectedClass.horario}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4 py-5">
                  <span className="text-base text-slate-500">
                    Profissional
                  </span>

                  <span className="text-base font-bold text-slate-950">
                    Prof.{" "}
                    {selectedClass.instrutor}
                  </span>
                </div>
              </div>

              {/* SESSÃO */}
              <div className="flex items-start gap-4 rounded-2xl border border-primary/25 bg-primary/5 p-5">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-primary">
                  <CheckCircle2 className="h-6 w-6" />
                </div>

                <div>
                  <p className="font-semibold text-slate-900">
                    Este agendamento utilizará 1
                    sessão do seu pacote
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    Você possui{" "}
                    {sessionsRemaining ?? "—"}{" "}
                    {sessionsRemaining === 1
                      ? "sessão disponível"
                      : "sessões disponíveis"}.
                  </p>
                </div>
              </div>
            </div>

            {/* BOTÕES */}
            <div className="grid grid-cols-2 gap-4 border-t border-slate-200 px-7 py-6">
              <Button
                type="button"
                variant="outline"
                className="h-12 rounded-xl text-base"
                onClick={() =>
                  setSelectedClass(null)
                }
              >
                Cancelar
              </Button>

              <Button
                type="button"
                className="h-12 rounded-xl text-base"
                disabled={isPending}
                onClick={handleConfirmBooking}
              >
                Confirmar agendamento
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CONFIRMAR CANCELAMENTO */}
      {bookingToCancel && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-[2px]"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              setBookingToCancel(null);
            }
          }}
        >
          <div className="w-full max-w-[560px] overflow-hidden rounded-3xl bg-white shadow-2xl">
            {/* CABEÇALHO */}
            <div className="flex items-start justify-between border-b border-slate-200 px-7 py-7">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-950">
                  Cancelar aula?
                </h2>

                <p className="mt-2 text-base text-slate-500">
                  Tem certeza de que deseja cancelar
                  este agendamento?
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setBookingToCancel(null)
                }
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                aria-label="Fechar"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* CONTEÚDO */}
            <div className="space-y-5 px-7 py-7">
              {/* DADOS DA AULA */}
              <div className="rounded-2xl bg-slate-50 px-6 py-2">
                <div className="flex items-center justify-between gap-4 border-b border-slate-200 py-5">
                  <span className="text-base text-slate-500">
                    Data
                  </span>

                  <span className="text-base font-bold text-slate-950">
                    {formattedCancelDate}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4 border-b border-slate-200 py-5">
                  <span className="text-base text-slate-500">
                    Horário
                  </span>

                  <span className="text-base font-bold text-slate-950">
                    {bookingToCancel.horario}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4 py-5">
                  <span className="text-base text-slate-500">
                    Profissional
                  </span>

                  <span className="text-base font-bold text-slate-950">
                    Prof.{" "}
                    {
                      bookingToCancel.instrutor
                    }
                  </span>
                </div>
              </div>

              {/* AVISO */}
              <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
                <p className="font-semibold text-red-900">
                  Atenção ao cancelamento
                </p>

                <p className="mt-1 text-sm text-red-700">
                  Cancelamentos realizados com pelo
                  menos 6 horas de antecedência
                  devolvem a sessão ao seu pacote.
                </p>
              </div>
            </div>

            {/* BOTÕES */}
            <div className="grid grid-cols-2 gap-4 border-t border-slate-200 px-7 py-6">
              <Button
                type="button"
                variant="outline"
                className="h-12 rounded-xl text-base"
                onClick={() =>
                  setBookingToCancel(null)
                }
              >
                Voltar
              </Button>

              <Button
                type="button"
                variant="destructive"
                className="h-12 rounded-xl text-base"
                disabled={isPending}
                onClick={handleConfirmCancel}
              >
                Confirmar cancelamento
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
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