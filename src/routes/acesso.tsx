import {
  createFileRoute,
  useNavigate,
} from "@tanstack/react-router";

import {
  ArrowLeft,
  ArrowRight,
  Building2,
  UserRound,
  UsersRound,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/acesso")({
  component: AccessPage,
});

function AccessPage() {
  const navigate = useNavigate();

  const goBack = () => {
    navigate({
      to: "/",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-sky-50 to-blue-50">
      <header className="border-b border-slate-200 bg-white/95">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <button
            type="button"
            onClick={goBack}
            className="flex items-center gap-3"
          >
            <img
              src="/logo.png"
              alt="Logo Timely"
              className="h-12 w-12 object-contain"
            />

            <div className="text-left">
              <p className="text-xl font-bold text-slate-900">
                TIMELY
              </p>

              <p className="text-xs text-slate-500">
                Gestão e Autoatendimento
              </p>
            </div>
          </button>

          <Button
            type="button"
            variant="outline"
            onClick={goBack}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        </div>
      </header>

      <main className="mx-auto flex min-h-[calc(100vh-81px)] max-w-7xl items-center px-6 py-16">
        <div className="w-full">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">
              Acesso ao sistema
            </p>

            <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950 md:text-5xl">
              Como você deseja acessar?
            </h1>

            <p className="mt-4 text-lg text-slate-600">
              Escolha o seu perfil para continuar no Timely.
            </p>
          </div>

          <div className="mx-auto mt-12 grid max-w-5xl gap-6 md:grid-cols-3">
            <AccessCard
              icon={UserRound}
              title="Paciente"
              description="Agende atendimentos, acompanhe seus horários, planos, sessões e histórico."
              buttonText="Continuar como paciente"
              onClick={() => {
                navigate({
                  to: "/paciente",
                });
              }}
            />

            <AccessCard
              icon={UsersRound}
              title="Profissional"
              description="Gerencie sua agenda, pacientes, atendimentos e disponibilidade."
              buttonText="Continuar como profissional"
              onClick={() => {
                alert(
                  "Acesso do profissional será implementado na próxima etapa.",
                );
              }}
            />

            <AccessCard
              icon={Building2}
              title="Administração"
              description="Gerencie profissionais, pacientes, serviços, agenda e configurações da clínica."
              buttonText="Continuar como administrador"
              onClick={() => {
                alert(
                  "Acesso administrativo será implementado na próxima etapa.",
                );
              }}
            />
          </div>

          <p className="mt-10 text-center text-sm text-slate-500">
            Ainda não possui uma conta? O cadastro será exibido
            de acordo com o perfil escolhido.
          </p>
        </div>
      </main>
    </div>
  );
}

function AccessCard({
  icon: Icon,
  title,
  description,
  buttonText,
  onClick,
}: {
  icon: typeof UserRound;
  title: string;
  description: string;
  buttonText: string;
  onClick: () => void;
}) {
  return (
    <Card className="group flex min-h-[330px] flex-col p-7 transition-all hover:-translate-y-1 hover:shadow-xl">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Icon className="h-8 w-8" />
      </div>

      <h2 className="mt-6 text-2xl font-bold text-slate-950">
        {title}
      </h2>

      <p className="mt-3 flex-1 leading-7 text-slate-600">
        {description}
      </p>

      <Button
        type="button"
        className="mt-7 w-full"
        onClick={onClick}
      >
        {buttonText}

        <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </Card>
  );
}