import {
  createFileRoute,
  useNavigate,
} from "@tanstack/react-router";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  CalendarCheck2,
  CheckCircle2,
  Clock3,
  RotateCcw,
  UserRound,
  XCircle,
} from "lucide-react";

import { PatientLayout } from "@/components/layout/PatientLayout";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

import {
  Booking,
  Student,
  getBookings,
  getSession,
  setSession,
} from "@/lib/clinic-store";

import { Toaster } from "sonner";

export const Route = createFileRoute("/historico")({
  component: HistoryPage,
});

type SidebarSection =
  | "inicio"
  | "agenda"
  | "aulas"
  | "historico"
  | "perfil"
  | "notificacoes";

type HistoryStatus =
  | "concluido"
  | "cancelado"
  | "falta";

type HistoryItem = Booking & {
  status: HistoryStatus;
  activity: string;
};

function HistoryPage() {
  const navigate = useNavigate();

  const [student, setStudent] =
    useState<Student | null>(null);

  const [ready, setReady] =
    useState(false);

  const [period, setPeriod] =
    useState<
      "30dias" | "3meses" | "6meses" | "todos"
    >("todos");

  const [professional, setProfessional] =
    useState("Todos");

  useEffect(() => {
    const currentStudent = getSession();

    if (!currentStudent) {
      navigate({
        to: "/paciente",
        replace: true,
      });

      return;
    }

    setStudent(currentStudent);
    setReady(true);
  }, [navigate]);

  const handleLogout = () => {
    setSession(null);
    setStudent(null);

    navigate({
      to: "/acesso",
      replace: true,
    });
  };

  const handleNavigation = (
    section: SidebarSection,
  ) => {
    if (section === "inicio") {
      navigate({
        to: "/dashboard",
      });

      return;
    }

    if (section === "agenda") {
      navigate({
        to: "/agenda",
      });

      return;
    }

    if (section === "aulas") {
      navigate({
        to: "/aulas",
      });

      return;
    }

    if (section === "historico") {
      navigate({
        to: "/historico",
      });

      return;
    }

    if (section === "perfil") {
      navigate({
        to: "/perfil",
      });

      return;
    }

    if (section === "notificacoes") {
      navigate({
        to: "/notificacoes",
      });

      return;
    }
  };

  const allHistory = useMemo<HistoryItem[]>(() => {
    if (!student) {
      return [];
    }

    const now = Date.now();

    return getBookings()
      .filter(
        (booking) =>
          booking.studentId === student.id,
      )
      .filter((booking) => {
        const bookingDate = new Date(
          `${booking.date}T${booking.time}:00`,
        ).getTime();

        return bookingDate < now;
      })
      .map((booking, index) => {
        const activities = [
          "Pilates",
          "Fisioterapia",
          "RPG",
        ];

        const statuses: HistoryStatus[] = [
          "concluido",
          "concluido",
          "cancelado",
          "concluido",
          "falta",
        ];

        return {
          ...booking,
          activity:
            activities[index % activities.length],
          status:
            statuses[index % statuses.length],
        };
      })
      .sort(
        (a, b) =>
          `${b.date}T${b.time}`.localeCompare(
            `${a.date}T${a.time}`,
          ),
      );
  }, [student]);

  const professionals = useMemo(() => {
    const names = Array.from(
      new Set(
        allHistory.map(
          (item) => item.instructor,
        ),
      ),
    );

    return [
      "Todos",
      ...names,
    ];
  }, [allHistory]);

  const filteredHistory = useMemo(() => {
    const now = new Date();

    return allHistory.filter((item) => {
      const itemDate = new Date(
        `${item.date}T${item.time}:00`,
      );

      if (
        professional !== "Todos" &&
        item.instructor !== professional
      ) {
        return false;
      }

      if (period === "todos") {
        return true;
      }

      const difference =
        now.getTime() -
        itemDate.getTime();

      const days =
        difference /
        (1000 * 60 * 60 * 24);

      if (period === "30dias") {
        return days <= 30;
      }

      if (period === "3meses") {
        return days <= 90;
      }

      return days <= 180;
    });
  }, [
    allHistory,
    period,
    professional,
  ]);

  const completedCount =
    allHistory.filter(
      (item) =>
        item.status === "concluido",
    ).length;

  const canceledCount =
    allHistory.filter(
      (item) =>
        item.status === "cancelado",
    ).length;

  const absenceCount =
    allHistory.filter(
      (item) =>
        item.status === "falta",
    ).length;

  const lastActivity =
    allHistory[0] ?? null;

  const resetFilters = () => {
    setPeriod("todos");
    setProfessional("Todos");
  };

  if (!ready || !student) {
    return null;
  }

  return (
    <PatientLayout
      onLogout={handleLogout}
      onNavigate={handleNavigation}
    >
      <Toaster
        richColors
        position="top-center"
      />

      <div className="mx-auto max-w-7xl">
        {/* CABEÇALHO */}
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">
            Histórico
          </p>

          <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-950">
            Acompanhe seus atendimentos anteriores
          </h1>

          <p className="mt-3 max-w-2xl text-slate-600">
            Consulte seus atendimentos concluídos,
            cancelamentos, faltas e profissionais.
          </p>
        </div>

        {/* RESUMO */}
        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            icon={CalendarCheck2}
            value={completedCount}
            title="Atendimentos concluídos"
            description="Total de atendimentos finalizados"
          />

          <SummaryCard
            icon={XCircle}
            value={canceledCount}
            title="Cancelamentos"
            description="Atendimentos cancelados"
          />

          <SummaryCard
            icon={CheckCircle2}
            value={absenceCount}
            title="Faltas"
            description={
              absenceCount === 0
                ? "Você não possui faltas"
                : "Faltas registradas"
            }
          />

          <SummaryCard
            icon={Clock3}
            value={
              lastActivity
                ? new Date(
                    `${lastActivity.date}T00:00:00`,
                  ).toLocaleDateString(
                    "pt-BR",
                    {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    },
                  )
                : "—"
            }
            title="Última atividade"
            description={
              lastActivity
                ? `${lastActivity.activity} com Prof. ${lastActivity.instructor}`
                : "Nenhum atendimento anterior"
            }
          />
        </div>

        {/* FILTROS */}
        <Card className="mt-6 p-5">
          <div className="flex flex-wrap items-end gap-5">
            <div>
              <p className="mb-3 text-sm font-semibold text-slate-700">
                Período
              </p>

              <div className="flex flex-wrap gap-2">
                {[
                  ["30dias", "30 dias"],
                  ["3meses", "3 meses"],
                  ["6meses", "6 meses"],
                  ["todos", "Todos"],
                ].map(
                  ([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() =>
                        setPeriod(
                          value as typeof period,
                        )
                      }
                      className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${
                        period === value
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-slate-200 bg-white text-slate-600 hover:border-primary/40 hover:text-primary"
                      }`}
                    >
                      {label}
                    </button>
                  ),
                )}
              </div>
            </div>

            <div className="min-w-[260px] flex-1">
              <p className="mb-3 text-sm font-semibold text-slate-700">
                Profissional
              </p>

              <div className="flex items-center gap-2">
                <UserRound className="h-4 w-4 text-slate-500" />

                <select
                  value={professional}
                  onChange={(event) =>
                    setProfessional(
                      event.target.value,
                    )
                  }
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-primary"
                >
                  {professionals.map(
                    (name) => (
                      <option
                        key={name}
                        value={name}
                      >
                        {name === "Todos"
                          ? "Todos os profissionais"
                          : `Prof. ${name}`}
                      </option>
                    ),
                  )}
                </select>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={resetFilters}
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Limpar filtros
            </Button>
          </div>
        </Card>

        {/* LISTA */}
        <Card className="mt-6 p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-950">
                Seus atendimentos
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Histórico completo de atividades.
              </p>
            </div>

            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              {filteredHistory.length} registros
            </span>
          </div>

          {filteredHistory.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Clock3 className="h-8 w-8" />
              </div>

              <h3 className="mt-5 text-lg font-bold text-slate-950">
                Nenhum atendimento encontrado
              </h3>

              <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                Não encontramos registros para os filtros
                selecionados.
              </p>
            </div>
          ) : (
            <div className="mt-6 space-y-3">
              {filteredHistory.map(
                (item) => (
                  <HistoryRow
                    key={item.id}
                    item={item}
                  />
                ),
              )}
            </div>
          )}
        </Card>
      </div>
    </PatientLayout>
  );
}

function SummaryCard({
  icon: Icon,
  value,
  title,
  description,
}: {
  icon: typeof CalendarCheck2;
  value: string | number;
  title: string;
  description: string;
}) {
  return (
    <Card className="p-5">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Icon className="h-6 w-6" />
        </div>

        <div>
          <p className="text-2xl font-bold text-slate-950">
            {value}
          </p>

          <p className="mt-1 text-sm font-semibold text-slate-700">
            {title}
          </p>

          <p className="mt-1 text-xs leading-5 text-slate-500">
            {description}
          </p>
        </div>
      </div>
    </Card>
  );
}

function HistoryRow({
  item,
}: {
  item: HistoryItem;
}) {
  const formattedDate = new Date(
    `${item.date}T00:00:00`,
  );

  const day = formattedDate
    .getDate()
    .toString()
    .padStart(2, "0");

  const month = formattedDate
    .toLocaleDateString(
      "pt-BR",
      {
        month: "short",
      },
    )
    .replace(".", "")
    .toUpperCase();

  const weekday =
    formattedDate.toLocaleDateString(
      "pt-BR",
      {
        weekday: "short",
      },
    );

  const statusConfig = {
    concluido: {
      label: "Concluído",
      className:
        "bg-emerald-50 text-emerald-700",
    },

    cancelado: {
      label: "Cancelado",
      className:
        "bg-amber-50 text-amber-700",
    },

    falta: {
      label: "Falta",
      className:
        "bg-red-50 text-red-600",
    },
  }[item.status];

  return (
    <div className="flex flex-wrap items-center gap-5 rounded-xl border border-slate-200 bg-white p-4 transition hover:border-primary/30 hover:shadow-sm">
      <div className="w-[75px] shrink-0 text-center">
        <p className="text-2xl font-bold text-slate-950">
          {day}
        </p>

        <p className="text-xs font-semibold text-slate-500">
          {month}
        </p>

        <p className="mt-1 text-xs capitalize text-slate-400">
          {weekday} · {item.time}
        </p>
      </div>

      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <CalendarCheck2 className="h-6 w-6" />
      </div>

      <div className="min-w-[200px] flex-1">
        <p className="font-bold text-slate-950">
          {item.activity}
        </p>

        <p className="mt-1 text-sm text-slate-600">
          Prof. {item.instructor}
        </p>
      </div>

      <span
        className={`rounded-full px-3 py-1 text-xs font-semibold ${statusConfig.className}`}
      >
        {statusConfig.label}
      </span>
    </div>
  );
}