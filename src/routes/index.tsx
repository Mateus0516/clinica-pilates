import {
  createFileRoute,
  useNavigate,
} from "@tanstack/react-router";

import {
  ArrowRight,
  BarChart3,
  Building2,
  CheckCircle2,
  Clock3,
  Headphones,
  Heart,
  LockKeyhole,
  MonitorSmartphone,
  ShieldCheck,
  UserRound,
  UsersRound,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  const navigate = useNavigate();

  const goToAccess = () => {
    navigate({
      to: "/acesso",
    });
  };

  return (
    <div className="min-h-screen bg-white text-slate-950">
      {/* NAVBAR */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="Logo Timely"
              className="h-14 w-14 object-contain"
            />

            <div>
              <p className="text-2xl font-bold leading-none text-slate-900">
                TIMELY
              </p>

              <p className="mt-1 text-xs font-medium text-slate-500">
                Gestão e Autoatendimento
              </p>
            </div>
          </div>

          {/* Navegação */}
          <nav className="hidden items-center gap-9 text-sm font-medium text-slate-700 lg:flex">
            <a
              href="#inicio"
              className="border-b-2 border-primary pb-5 pt-5 text-primary transition"
            >
              Início
            </a>

            <a
              href="#funcionalidades"
              className="transition hover:text-primary"
            >
              Funcionalidades
            </a>

            <a
              href="#perfis"
              className="transition hover:text-primary"
            >
              Para clínicas
            </a>

            <a
              href="#contato"
              className="transition hover:text-primary"
            >
              Contato
            </a>

            <a
              href="#sobre"
              className="transition hover:text-primary"
            >
              Sobre nós
            </a>
          </nav>

          <Button
            type="button"
            onClick={goToAccess}
            className="rounded-xl px-5 shadow-sm"
          >
            <UserRound className="mr-2 h-4 w-4" />
            Acessar o sistema
          </Button>
        </div>
      </header>

      {/* HERO */}
      <section
        id="inicio"
        className="overflow-hidden bg-gradient-to-br from-white via-sky-50/70 to-blue-50"
      >
        <div className="mx-auto grid min-h-[700px] max-w-7xl items-center gap-12 px-6 py-16 lg:grid-cols-[0.95fr_1.05fr] lg:py-20">
          {/* Texto */}
          <div className="flex flex-col justify-center">
            <div className="mb-7 inline-flex w-fit items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
              <Heart className="h-4 w-4" />
              Tecnologia que conecta cuidado e gestão
            </div>

            <h1 className="max-w-[620px] text-5xl font-bold leading-[1.08] tracking-tight text-slate-950 lg:text-6xl">
              Cuidado e gestão
              <br />
              <span className="text-primary">
                em um só lugar.
              </span>
            </h1>

            <div className="mt-8 max-w-[590px] space-y-4 text-lg leading-8 text-slate-600">
              <p>
                Uma experiência simples para pacientes,
                profissionais e clínicas organizarem
                atendimentos, agendas e rotinas.
              </p>

              <p>
                Mais tempo, organização e qualidade no que
                realmente importa:{" "}
                <span className="font-semibold text-primary">
                  as pessoas.
                </span>
              </p>
            </div>

            {/* Botões */}
            <div className="mt-8 flex flex-wrap gap-4">
              <Button
                type="button"
                size="lg"
                className="h-14 rounded-xl px-7 text-base"
                onClick={goToAccess}
              >
                Acessar o sistema
                <ArrowRight className="ml-3 h-5 w-5" />
              </Button>

              <Button
                type="button"
                size="lg"
                variant="outline"
                className="h-14 rounded-xl border-primary px-7 text-base text-primary hover:bg-primary/5 hover:text-primary"
                onClick={() => {
                  document
                    .getElementById("contato")
                    ?.scrollIntoView({
                      behavior: "smooth",
                    });
                }}
              >
                Falar com a equipe
              </Button>
            </div>

            {/* Benefícios */}
            <div className="mt-14 grid grid-cols-2 gap-x-6 gap-y-6 sm:grid-cols-4">
              <MiniBenefit
                icon={ShieldCheck}
                title="Dados seguros"
                text="Proteção e privacidade"
              />

              <MiniBenefit
                icon={Clock3}
                title="Mais tempo"
                text="Gestão inteligente"
              />

              <MiniBenefit
                icon={UsersRound}
                title="Atendimento completo"
                text="Para você e sua clínica"
              />

              <MiniBenefit
                icon={MonitorSmartphone}
                title="100% online"
                text="Acesse de onde estiver"
              />
            </div>
          </div>

          {/* Imagem */}
          <div className="relative flex items-center justify-center">
            <div className="absolute -left-16 top-10 h-48 w-48 rounded-full bg-primary/10 blur-3xl" />

            <div className="absolute -bottom-16 right-0 h-56 w-56 rounded-full bg-sky-300/20 blur-3xl" />

            <img
              src="/landing-clinic.jpg"
              alt="Recepção de clínica"
              className="relative z-10 h-[560px] w-full rounded-[2rem] object-cover shadow-2xl"
            />
          </div>
        </div>
      </section>

      {/* PARA QUEM É */}
      <section
        id="perfis"
        className="bg-white py-20"
      >
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold text-slate-950">
              Para quem é o Timely?
            </h2>

            <p className="mt-3 text-slate-600">
              Soluções para cada perfil, integradas em uma
              única plataforma.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            <ProfileCard
              icon={UserRound}
              title="Paciente"
              description="Agende atendimentos, acompanhe sua agenda, histórico e receba avisos importantes."
            />

            <ProfileCard
              icon={UsersRound}
              title="Profissional"
              description="Gerencie sua agenda, pacientes, atendimentos e evoluções com praticidade e segurança."
            />

            <ProfileCard
              icon={Building2}
              title="Administração"
              description="Tenha controle da clínica, equipe, serviços, finanças e relatórios em um único lugar."
            />
          </div>
        </div>
      </section>

      {/* FUNCIONALIDADES */}
      <section
        id="funcionalidades"
        className="bg-slate-50 py-20"
      >
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold text-slate-950">
              Uma plataforma completa
            </h2>

            <p className="mt-3 text-slate-600">
              Recursos pensados para simplificar a rotina de
              clínicas, profissionais e pacientes.
            </p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-5">
            <FeatureCard
              icon={MonitorSmartphone}
              title="Acesso de onde estiver"
              text="Sistema online disponível em diferentes dispositivos."
            />

            <FeatureCard
              icon={Headphones}
              title="Suporte dedicado"
              text="Uma experiência pensada para facilitar sua operação."
            />

            <FeatureCard
              icon={BarChart3}
              title="Relatórios"
              text="Informações importantes para acompanhar sua clínica."
            />

            <FeatureCard
              icon={LockKeyhole}
              title="Segurança"
              text="Controle de acesso e proteção das informações."
            />

            <FeatureCard
              icon={CheckCircle2}
              title="Gestão integrada"
              text="Agenda, pacientes e profissionais em um só lugar."
            />
          </div>
        </div>
      </section>

      {/* SOBRE */}
      <section
        id="sobre"
        className="bg-white py-20"
      >
        <div className="mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-2">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">
              Sobre o Timely
            </p>

            <h2 className="mt-3 text-3xl font-bold text-slate-950">
              Tecnologia para simplificar o cuidado.
            </h2>
          </div>

          <div className="space-y-4 leading-7 text-slate-600">
            <p>
              O Timely foi pensado para conectar pacientes,
              profissionais e administração em uma experiência
              simples e organizada.
            </p>

            <p>
              A proposta é reduzir tarefas repetitivas,
              centralizar informações e tornar a rotina da
              clínica mais eficiente.
            </p>
          </div>
        </div>
      </section>

      {/* RODAPÉ */}
      <footer
        id="contato"
        className="border-t border-slate-200 bg-white"
      >
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-5 px-6 py-10 md:flex-row md:items-center">
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="Logo Timely"
              className="h-10 w-10 object-contain"
            />

            <div>
              <p className="font-bold text-slate-900">
                TIMELY
              </p>

              <p className="text-xs text-slate-500">
                Gestão e Autoatendimento
              </p>
            </div>
          </div>

          <div className="text-sm text-slate-500">
            © 2026 Timely. Todos os direitos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}

function MiniBenefit({
  icon: Icon,
  title,
  text,
}: {
  icon: typeof ShieldCheck;
  title: string;
  text: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Icon className="h-5 w-5" />
      </div>

      <div>
        <p className="text-sm font-semibold leading-5 text-slate-900">
          {title}
        </p>

        <p className="mt-1 text-xs leading-5 text-slate-500">
          {text}
        </p>
      </div>
    </div>
  );
}

function ProfileCard({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof UserRound;
  title: string;
  description: string;
}) {
  return (
    <Card className="group p-7 transition-all hover:-translate-y-1 hover:shadow-lg">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Icon className="h-7 w-7" />
      </div>

      <h3 className="mt-5 text-xl font-bold text-slate-950">
        {title}
      </h3>

      <p className="mt-3 leading-7 text-slate-600">
        {description}
      </p>

      <button
        type="button"
        className="mt-6 flex items-center gap-2 text-sm font-semibold text-primary"
      >
        Saiba mais

        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      </button>
    </Card>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  text,
}: {
  icon: typeof MonitorSmartphone;
  title: string;
  text: string;
}) {
  return (
    <Card className="p-5">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Icon className="h-5 w-5" />
      </div>

      <h3 className="mt-4 font-semibold text-slate-950">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-slate-500">
        {text}
      </p>
    </Card>
  );
}