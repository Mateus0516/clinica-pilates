import { getPatient, logout, requirePatient } from "@/lib/auth";
import {
  createFileRoute,
  useNavigate,
} from "@tanstack/react-router";

import {
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

import { calendarDate, clinicDateKey, clinicToday, useAppointmentHistory, type Appointment } from "@/lib/scheduling";
import { SchedulingFeedback } from "@/components/dashboard/SchedulingFeedback";

import { Toaster } from "sonner";

export const Route = createFileRoute("/historico")({
  ssr: false,
  beforeLoad: requirePatient,
  component: HistoryPage,
});

type SidebarSection =
  | "inicio"
  | "agenda"
  | "aulas"
  | "historico"
  | "perfil"
  | "notificacoes";

function HistoryPage() {
  const navigate = useNavigate();

  const student = getPatient();
  const history = useAppointmentHistory();

  const [period, setPeriod] =
    useState<
      "30dias" | "3meses" | "6meses" | "todos"
    >("todos");

  const [professional, setProfessional] =
    useState("Todos");

  const handleLogout = () => {
    logout();

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

  const filteredHistory = useMemo(() => {
    const today = Date.parse(clinicToday());
    return (history.data ?? []).filter((item) => {
      if (professional !== "Todos" && item.instrutor !== professional) return false;
      if (period === "todos") return true;
      const activityDate = item.canceladoEm ? clinicDateKey(new Date(item.canceladoEm)) : item.data;
      const days = (today - Date.parse(activityDate)) / 86_400_000;
      const limit = period === "30dias" ? 30 : period === "3meses" ? 90 : 180;
      return days >= 0 && days <= limit;
    });
  }, [history.data, period, professional]);

  const professionals = ["Todos", ...new Set(history.data?.map((item) => item.instrutor) ?? [])];
  const completedCount = history.data?.filter((item) => item.status === "ENCERRADO").length;
  const canceledCount = history.data?.filter((item) => item.status === "CANCELADO").length;
  const refundedCount = history.data?.filter((item) => item.sessaoDevolvida).length;
  const lastActivity = history.data?.reduce<string | undefined>((latest, item) => {
    const date = item.canceladoEm ? clinicDateKey(new Date(item.canceladoEm)) : item.data;
    return !latest || date > latest ? date : latest;
  }, undefined);

  const resetFilters = () => {
    setPeriod("todos");
    setProfessional("Todos");
  };

  if (!student) {
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
            Consulte suas aulas encerradas, cancelamentos e devoluções de sessões.
          </p>
        </div>

        {/* RESUMO */}
        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            icon={CalendarCheck2}
            value={completedCount ?? "—"}
            title="Aulas encerradas"
            description="Aulas cujo horário já passou"
          />

          <SummaryCard
            icon={XCircle}
            value={canceledCount ?? "—"}
            title="Cancelamentos"
            description="Atendimentos cancelados"
          />

          <SummaryCard
            icon={CheckCircle2}
            value={refundedCount ?? "—"}
            title="Sessões devolvidas"
            description="Sessões devolvidas por cancelamento"
          />

          <SummaryCard
            icon={Clock3}
            value={lastActivity ? calendarDate(lastActivity).toLocaleDateString("pt-BR") : "—"}
            title="Última atividade"
            description="Última aula encerrada ou cancelada"
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

            <div className="min-w-0 flex-1 sm:min-w-[260px]">
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
              {history.data ? filteredHistory.length : "—"} registros
            </span>
          </div>

          <SchedulingFeedback query={history} />
          {history.isSuccess && (filteredHistory.length === 0 ? (
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
          ))}
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
  item: Appointment;
}) {
  const formattedDate = calendarDate(item.data);

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

  const canceled = item.status === "CANCELADO";
  const statusConfig = canceled
    ? { label: "Cancelado", className: "bg-amber-50 text-amber-700" }
    : { label: "Encerrado", className: "bg-emerald-50 text-emerald-700" };

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
          {weekday} · {item.horario}
        </p>
      </div>

      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <CalendarCheck2 className="h-6 w-6" />
      </div>

      <div className="min-w-0 flex-1 break-words max-sm:basis-full sm:min-w-[200px]">
        <p className="font-bold text-slate-950">
          Atendimento
        </p>

        <p className="mt-1 text-sm text-slate-600">
          Prof. {item.instrutor}
        </p>
        {canceled && (
          <p className="mt-1 text-sm text-slate-600">
            {item.sessaoDevolvida ? "Sessão devolvida" : "Sessão não devolvida"}
          </p>
        )}
      </div>

      <span
        className={`rounded-full px-3 py-1 text-xs font-semibold ${statusConfig.className}`}
      >
        {statusConfig.label}
      </span>
    </div>
  );
}