import {
  BarChart3,
  CalendarCheck2,
  Clock3,
  CalendarDays,
} from "lucide-react";

import { Card } from "@/components/ui/card";

import { calendarDate, type Appointment } from "@/lib/scheduling";

type SummaryCardsProps = {
  sessionsRemaining?: number;
  nextBooking?: Appointment;
  classesThisMonth?: number;
  upcomingCount?: number;
};

export function SummaryCards({
  sessionsRemaining,
  nextBooking,
  classesThisMonth,
  upcomingCount,
}: SummaryCardsProps) {
  return (
    <section className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {/* SESSÕES DISPONÍVEIS */}
      <Card className="p-5 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">
              Sessões disponíveis
            </p>

            <p className="mt-2 text-3xl font-bold">
              {sessionsRemaining ?? "—"}
            </p>
          </div>

          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15">
            <CalendarCheck2 className="h-5 w-5 text-primary" />
          </div>
        </div>

        <p className="mt-5 text-xs text-muted-foreground">
          Cada agendamento utiliza 1 sessão do seu pacote.
        </p>
      </Card>

      {/* PRÓXIMA AULA */}
      <Card className="p-5 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm text-muted-foreground">
              Próxima aula
            </p>

            {nextBooking ? (
              <>
                <p className="mt-2 text-lg font-bold capitalize">
                  {calendarDate(nextBooking.data).toLocaleDateString(
                    "pt-BR",
                    {
                      weekday: "long",
                    },
                  )}
                </p>

                <p className="text-sm text-muted-foreground">
                  {calendarDate(nextBooking.data).toLocaleDateString(
                    "pt-BR",
                    {
                      day: "2-digit",
                      month: "short",
                    },
                  )}

                  {" • "}

                  {nextBooking.horario}
                </p>

                <span className="mt-3 inline-flex rounded-md bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground">
                  Prof. {nextBooking.instrutor}
                </span>
              </>
            ) : (
              <p className="mt-3 text-sm text-muted-foreground">
                {upcomingCount === 0 ? "Nenhuma aula agendada." : "—"}
              </p>
            )}
          </div>

          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/15">
            <Clock3 className="h-5 w-5 text-primary" />
          </div>
        </div>
      </Card>

      {/* AULAS ESTE MÊS */}
      <Card className="p-5 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">
              Aulas este mês
            </p>

            <p className="mt-2 text-3xl font-bold">
              {classesThisMonth ?? "—"}
            </p>
          </div>

          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15">
            <BarChart3 className="h-5 w-5 text-primary" />
          </div>
        </div>

        <p className="mt-5 text-xs text-muted-foreground">
          Aulas agendadas e encerradas no mês.
        </p>
      </Card>

      {/* SEQUÊNCIA */}
      <Card className="p-5 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">
              Próximas aulas
            </p>

            <p className="mt-2 text-3xl font-bold">
              {upcomingCount ?? "—"}
            </p>
          </div>

          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15">
            <CalendarDays className="h-5 w-5 text-primary" />
          </div>
        </div>

        <p className="mt-5 text-xs text-muted-foreground">
          Atendimentos futuros na sua agenda.
        </p>
      </Card>
    </section>
  );
}