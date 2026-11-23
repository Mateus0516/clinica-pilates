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
  Clock3,
  Info,
  Layers3,
  RefreshCw,
} from "lucide-react";

import { PatientLayout } from "@/components/layout/PatientLayout";
import { Card } from "@/components/ui/card";

import {
  Student,
  getSession,
} from "@/lib/clinic-store";

export const Route = createFileRoute(
  "/detalhes-plano",
)({
  ssr: false,
  beforeLoad: requirePatient,
  component: PlanDetailsPage,
});

type SidebarSection =
  | "inicio"
  | "agenda"
  | "aulas"
  | "historico"
  | "perfil"
  | "notificacoes";

function PlanDetailsPage() {
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
   * Dados temporários do protótipo.
   *
   * Quando conectarmos esta página ao backend,
   * essas informações virão do plano/pacote
   * cadastrado pela clínica.
   */
  const plan = {
    name: "Plano Mensal",
    status: "Ativo",
    totalSessions: 16,
    renewalDate: "10/10/2026",
    startDate: "10/09/2026",
    duration: "Mensal",
    service: "Pilates",
  };

  const usedSessions = Math.max(
    plan.totalSessions -
      student.sessionsRemaining,
    0,
  );

  const usedPercentage = Math.min(
    (usedSessions /
      plan.totalSessions) *
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
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">
            Plano
          </p>

          <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-950">
            Detalhes do plano
          </h1>

          <p className="mt-3 text-slate-600">
            Consulte as informações do seu
            plano atual e acompanhe a
            utilização das suas sessões.
          </p>
        </div>

        {/* CONTEÚDO */}
        <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_360px]">
          {/* COLUNA PRINCIPAL */}
          <div className="space-y-6">
            {/* PLANO ATUAL */}
            <Card className="overflow-hidden">
              <div className="border-b border-slate-100 bg-primary/[0.04] p-6">
                <div className="flex flex-wrap items-start justify-between gap-5">
                  <div className="flex items-start gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <CalendarCheck2 className="h-7 w-7" />
                    </div>

                    <div>
                      <p className="text-sm font-medium text-slate-500">
                        Plano atual
                      </p>

                      <h2 className="mt-1 text-2xl font-bold text-slate-950">
                        {plan.name}
                      </h2>

                      <p className="mt-2 text-sm text-slate-500">
                        {plan.service}
                      </p>
                    </div>
                  </div>

                  <span className="flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1.5 text-sm font-semibold text-emerald-700">
                    <CheckCircle2 className="h-4 w-4" />

                    {plan.status}
                  </span>
                </div>
              </div>

              <div className="p-6">
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  <PlanInformation
                    icon={CalendarDays}
                    label="Início do plano"
                    value={plan.startDate}
                  />

                  <PlanInformation
                    icon={RefreshCw}
                    label="Próxima renovação"
                    value={plan.renewalDate}
                  />

                  <PlanInformation
                    icon={Clock3}
                    label="Periodicidade"
                    value={plan.duration}
                  />
                </div>
              </div>
            </Card>

            {/* UTILIZAÇÃO */}
            <Card className="p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-950">
                    Utilização do plano
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Acompanhe quantas sessões
                    do seu pacote ainda estão
                    disponíveis.
                  </p>
                </div>

                <div className="rounded-xl bg-primary/10 px-4 py-3 text-right">
                  <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                    Disponíveis
                  </p>

                  <p className="mt-1 text-2xl font-bold text-slate-950">
                    {
                      student.sessionsRemaining
                    }
                  </p>
                </div>
              </div>

              <div className="mt-8">
                <div className="mb-3 flex items-center justify-between gap-4 text-sm">
                  <span className="font-medium text-slate-600">
                    Sessões utilizadas
                  </span>

                  <span className="font-semibold text-slate-950">
                    {usedSessions} de{" "}
                    {plan.totalSessions}
                  </span>
                </div>

                <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{
                      width: `${usedPercentage}%`,
                    }}
                  />
                </div>

                <div className="mt-5 grid gap-4 sm:grid-cols-3">
                  <SessionSummary
                    label="Total"
                    value={
                      plan.totalSessions
                    }
                  />

                  <SessionSummary
                    label="Utilizadas"
                    value={usedSessions}
                  />

                  <SessionSummary
                    label="Disponíveis"
                    value={
                      student.sessionsRemaining
                    }
                  />
                </div>
              </div>
            </Card>

            {/* INFORMAÇÕES DO PLANO */}
            <Card className="p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Layers3 className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="text-xl font-bold text-slate-950">
                    Informações do plano
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Condições principais do seu
                    plano atual.
                  </p>
                </div>
              </div>

              <div className="mt-6 divide-y divide-slate-100">
                <InformationRow
                  label="Serviço"
                  value={plan.service}
                />

                <InformationRow
                  label="Tipo"
                  value={plan.name}
                />

                <InformationRow
                  label="Quantidade de sessões"
                  value={`${plan.totalSessions} sessões`}
                />

                <InformationRow
                  label="Periodicidade"
                  value={plan.duration}
                />

                <InformationRow
                  label="Status"
                  value={plan.status}
                />
              </div>
            </Card>
          </div>

          {/* COLUNA LATERAL */}
          <div className="space-y-6">
            {/* RESUMO */}
            <Card className="p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <CalendarCheck2 className="h-6 w-6" />
              </div>

              <h2 className="mt-5 text-lg font-bold text-slate-950">
                Seu plano
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Você possui um plano ativo para{" "}
                {plan.service.toLowerCase()}.
              </p>

              <div className="my-6 border-t border-slate-100" />

              <div>
                <p className="text-sm text-slate-500">
                  Sessões disponíveis
                </p>

                <p className="mt-1 text-3xl font-bold text-slate-950">
                  {student.sessionsRemaining}
                </p>
              </div>

              <div className="mt-5">
                <p className="text-sm text-slate-500">
                  Próxima renovação
                </p>

                <p className="mt-1 font-semibold text-slate-950">
                  {plan.renewalDate}
                </p>
              </div>
            </Card>

            {/* DICA */}
            <Card className="border-primary/20 bg-primary/[0.04] p-6">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-primary shadow-sm">
                  <Info className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="font-bold text-slate-950">
                    Aproveite seu plano
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Organize seus horários com
                    antecedência para aproveitar
                    melhor as sessões disponíveis.
                  </p>
                </div>
              </div>
            </Card>

            {/* VOLTAR PARA PLANOS */}
            <button
              type="button"
              onClick={() =>
                navigate({
                  to: "/meus-planos",
                })
              }
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-primary/30 hover:text-primary"
            >
              <ChevronLeft className="h-4 w-4" />

              Voltar para meus planos
            </button>
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

function SessionSummary({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
      <p className="text-sm text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-xl font-bold text-slate-950">
        {value}
      </p>
    </div>
  );
}

function InformationRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
      <span className="text-sm text-slate-500">
        {label}
      </span>

      <span className="text-right text-sm font-semibold text-slate-950">
        {value}
      </span>
    </div>
  );
}