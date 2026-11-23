import { logout, requirePatient } from "@/lib/auth";
import {
  createFileRoute,
  useNavigate,
} from "@tanstack/react-router";

import {
  useEffect,
  useState,
} from "react";

import {
  CalendarCheck2,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  History,
  Info,
  Layers3,
} from "lucide-react";

import { PatientLayout } from "@/components/layout/PatientLayout";
import { Card } from "@/components/ui/card";

import {
  Student,
  getSession,
} from "@/lib/clinic-store";

export const Route = createFileRoute(
  "/meus-planos",
)({
  ssr: false,
  beforeLoad: requirePatient,
  component: MyPlansPage,
});

type SidebarSection =
  | "inicio"
  | "agenda"
  | "aulas"
  | "historico"
  | "perfil"
  | "notificacoes";

function MyPlansPage() {
  const navigate = useNavigate();

  const [student, setStudent] =
    useState<Student | null>(null);

  const [ready, setReady] =
    useState(false);

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
    logout();
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
    }
  };

  if (!ready || !student) {
    return null;
  }

  /*
   * Dados temporários.
   *
   * Quando conectarmos o backend,
   * os planos serão carregados da API.
   */
  const currentPlan = {
    name: "Plano Mensal",
    service: "Pilates",
    status: "Ativo",
    totalSessions: 16,
    startDate: "10/09/2026",
    renewalDate: "10/10/2026",
    periodicity: "Mensal",
  };

  const previousPlans = [
    {
      id: 1,
      name: "Plano Mensal",
      service: "Pilates",
      period: "10/08/2026 a 09/09/2026",
      sessions: 16,
      status: "Concluído",
    },
    {
      id: 2,
      name: "Pacote de 8 sessões",
      service: "Pilates",
      period: "10/07/2026 a 09/08/2026",
      sessions: 8,
      status: "Concluído",
    },
  ];

  const usedSessions = Math.max(
    currentPlan.totalSessions -
      student.sessionsRemaining,
    0,
  );

  const usedPercentage = Math.min(
    (usedSessions /
      currentPlan.totalSessions) *
      100,
    100,
  );

  return (
    <PatientLayout
      onLogout={handleLogout}
      onNavigate={handleNavigation}
    >
      <div className="mx-auto max-w-7xl">
        {/* VOLTAR */}
        <button
          type="button"
          onClick={() =>
            navigate({
              to: "/perfil",
            })
          }
          className="mb-6 flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-primary"
        >
          <ChevronLeft className="h-4 w-4" />

          Voltar para o perfil
        </button>

        {/* CABEÇALHO */}
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">
              Planos
            </p>

            <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-950">
              Meus planos
            </h1>

            <p className="mt-3 text-slate-600">
              Acompanhe seu plano atual,
              sessões disponíveis e planos
              anteriores.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 font-semibold text-primary">
            <CalendarCheck2 className="h-5 w-5" />

            {student.sessionsRemaining}{" "}
            {student.sessionsRemaining === 1
              ? "sessão disponível"
              : "sessões disponíveis"}
          </div>
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_340px]">
          {/* COLUNA PRINCIPAL */}
          <div className="space-y-6">
            {/* PLANO ATUAL */}
            <Card className="overflow-hidden border-primary/20">
              <div className="border-b border-primary/10 bg-primary/[0.04] p-6">
                <div className="flex flex-wrap items-start justify-between gap-5">
                  <div className="flex items-start gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <CalendarCheck2 className="h-7 w-7" />
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-primary">
                        Plano atual
                      </p>

                      <h2 className="mt-1 text-2xl font-bold text-slate-950">
                        {currentPlan.name}
                      </h2>

                      <p className="mt-2 text-sm text-slate-500">
                        {currentPlan.service}
                      </p>
                    </div>
                  </div>

                  <span className="flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1.5 text-sm font-semibold text-emerald-700">
                    <CheckCircle2 className="h-4 w-4" />

                    {currentPlan.status}
                  </span>
                </div>
              </div>

              <div className="p-6">
                {/* INFORMAÇÕES */}
                <div className="grid gap-5 sm:grid-cols-3">
                  <PlanInformation
                    icon={CalendarDays}
                    label="Início"
                    value={
                      currentPlan.startDate
                    }
                  />

                  <PlanInformation
                    icon={CalendarDays}
                    label="Próxima renovação"
                    value={
                      currentPlan.renewalDate
                    }
                  />

                  <PlanInformation
                    icon={Clock3}
                    label="Periodicidade"
                    value={
                      currentPlan.periodicity
                    }
                  />
                </div>

                {/* SESSÕES */}
                <div className="mt-7 rounded-2xl border border-slate-100 bg-slate-50/70 p-5">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold text-slate-950">
                        Utilização das sessões
                      </p>

                      <p className="mt-1 text-sm text-slate-500">
                        {usedSessions} de{" "}
                        {
                          currentPlan.totalSessions
                        }{" "}
                        sessões utilizadas
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-sm text-slate-500">
                        Disponíveis
                      </p>

                      <p className="mt-1 text-2xl font-bold text-primary">
                        {
                          student.sessionsRemaining
                        }
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 h-2.5 overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{
                        width: `${usedPercentage}%`,
                      }}
                    />
                  </div>
                </div>

                {/* DETALHES */}
                <button
                  type="button"
                  onClick={() =>
                    navigate({
                      to: "/detalhes-plano",
                    })
                  }
                  className="mt-6 flex w-full items-center justify-between border-t border-slate-100 pt-5 text-sm font-semibold text-primary transition hover:opacity-80"
                >
                  Ver detalhes do plano

                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </Card>

            {/* PLANOS ANTERIORES */}
            <Card className="p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                  <History className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="text-xl font-bold text-slate-950">
                    Planos anteriores
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Consulte seus planos e
                    pacotes anteriores.
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                {previousPlans.map(
                  (plan) => (
                    <div
                      key={plan.id}
                      className="rounded-xl border border-slate-200 p-5"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-slate-950">
                              {plan.name}
                            </h3>

                            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                              {plan.status}
                            </span>
                          </div>

                          <p className="mt-2 text-sm text-slate-500">
                            {plan.service}
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="text-sm font-semibold text-slate-950">
                            {plan.sessions}{" "}
                            sessões
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            {plan.period}
                          </p>
                        </div>
                      </div>
                    </div>
                  ),
                )}
              </div>
            </Card>
          </div>

          {/* COLUNA LATERAL */}
          <div className="space-y-6">
            {/* RESUMO */}
            <Card className="p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Layers3 className="h-6 w-6" />
              </div>

              <h2 className="mt-5 text-lg font-bold text-slate-950">
                Resumo do plano
              </h2>

              <div className="mt-6 space-y-5">
                <SummaryItem
                  label="Plano"
                  value={currentPlan.name}
                />

                <SummaryItem
                  label="Serviço"
                  value={
                    currentPlan.service
                  }
                />

                <SummaryItem
                  label="Sessões disponíveis"
                  value={`${student.sessionsRemaining}`}
                />

                <SummaryItem
                  label="Próxima renovação"
                  value={
                    currentPlan.renewalDate
                  }
                />
              </div>

              <button
                type="button"
                onClick={() =>
                  navigate({
                    to: "/detalhes-plano",
                  })
                }
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-90"
              >
                Ver detalhes

                <ChevronRight className="h-4 w-4" />
              </button>
            </Card>

            {/* INFORMAÇÃO */}
            <Card className="border-primary/20 bg-primary/[0.04] p-6">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-primary shadow-sm">
                  <Info className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="font-bold text-slate-950">
                    Sobre seus planos
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    As condições, quantidade
                    de sessões e período de
                    validade dependem do plano
                    ou pacote contratado.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </PatientLayout>
  );
}

function PlanInformation({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof CalendarDays;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
        <Icon className="h-5 w-5" />
      </div>

      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
          {label}
        </p>

        <p className="mt-1 font-semibold text-slate-950">
          {value}
        </p>
      </div>
    </div>
  );
}

function SummaryItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="border-b border-slate-100 pb-4 last:border-0 last:pb-0">
      <p className="text-sm text-slate-500">
        {label}
      </p>

      <p className="mt-1 font-semibold text-slate-950">
        {value}
      </p>
    </div>
  );
}