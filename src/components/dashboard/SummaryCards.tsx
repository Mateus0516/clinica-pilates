import { BarChart3, Clock3, Coins, Flame } from "lucide-react";

import { Card } from "@/components/ui/card";
import type { Booking, Student } from "@/lib/clinic-store";

type SummaryCardsProps = {
  student: Student;
  nextBooking?: Booking;
  classesThisMonth: number;
  monthlyGoal: number;
  goalProgress: number;
};

export function SummaryCards({
  student,
  nextBooking,
  classesThisMonth,
  monthlyGoal,
  goalProgress,
}: SummaryCardsProps) {
  return (
    <section className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Card className="p-5 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">
              Créditos disponíveis
            </p>

            <p className="mt-2 text-3xl font-bold">
              {student.credits}
            </p>
          </div>

          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15">
            <Coins className="h-5 w-5 text-primary" />
          </div>
        </div>

        <p className="mt-5 text-xs text-muted-foreground">
          Cada agendamento utiliza 1 crédito.
        </p>
      </Card>

      <Card className="p-5 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm text-muted-foreground">
              Próxima aula
            </p>

            {nextBooking ? (
              <>
                <p className="mt-2 text-lg font-bold capitalize">
                  {new Date(
                    `${nextBooking.date}T00:00:00`,
                  ).toLocaleDateString("pt-BR", {
                    weekday: "long",
                  })}
                </p>

                <p className="text-sm text-muted-foreground">
                  {new Date(
                    `${nextBooking.date}T00:00:00`,
                  ).toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "short",
                  })}
                  {" • "}
                  {nextBooking.time}
                </p>

                <span className="mt-3 inline-flex rounded-md bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground">
                  {nextBooking.instructor}
                </span>
              </>
            ) : (
              <p className="mt-3 text-sm text-muted-foreground">
                Nenhuma aula agendada.
              </p>
            )}
          </div>

          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/15">
            <Clock3 className="h-5 w-5 text-primary" />
          </div>
        </div>
      </Card>

      <Card className="p-5 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">
              Aulas este mês
            </p>

            <p className="mt-2 text-3xl font-bold">
              {classesThisMonth}
            </p>
          </div>

          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15">
            <BarChart3 className="h-5 w-5 text-primary" />
          </div>
        </div>

        <div className="mt-5">
          <div className="mb-2 flex justify-between text-xs text-muted-foreground">
            <span>Meta: {monthlyGoal} aulas</span>
            <span>{goalProgress}%</span>
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-300"
              style={{ width: `${goalProgress}%` }}
            />
          </div>
        </div>
      </Card>

      <Card className="p-5 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">
              Sequência atual
            </p>

            <p className="mt-2 text-3xl font-bold">
              5 dias
            </p>
          </div>

          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15">
            <Flame className="h-5 w-5 text-primary" />
          </div>
        </div>

        <p className="mt-5 text-xs text-muted-foreground">
          Continue mantendo sua frequência 🔥
        </p>
      </Card>
    </section>
  );
}