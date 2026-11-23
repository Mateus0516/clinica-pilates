import { logout, requirePatient } from "@/lib/auth";

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  CircleHelp,
  Clock3,
  CreditCard,
  Mail,
  MessageCircle,
  Search,
} from "lucide-react";

import { PatientLayout } from "@/components/layout/PatientLayout";
import { getSession } from "@/lib/clinic-store";

export const Route = createFileRoute("/central-ajuda")({
  ssr: false,
  beforeLoad: requirePatient,
  component: CentralAjudaPage,
});

const perguntas = [
  {
    pergunta: "Como faço para agendar uma aula?",
    resposta:
      "Acesse Agenda, escolha um dia e horário disponível e confirme seu agendamento.",
    icon: CalendarDays,
  },
  {
    pergunta: "Como cancelar uma aula?",
    resposta:
      "Acesse Minhas aulas, encontre seu agendamento e selecione a opção de cancelamento.",
    icon: Clock3,
  },
  {
    pergunta: "Quando minha sessão é devolvida?",
    resposta:
      "Cancelamentos realizados com pelo menos 6 horas de antecedência devolvem a sessão. Com menos de 6 horas, a sessão não é devolvida.",
    icon: Clock3,
  },
  {
    pergunta: "Onde posso consultar meu plano?",
    resposta:
      "Acesse Perfil e selecione Meus planos ou Ver detalhes do plano.",
    icon: CreditCard,
  },
  {
    pergunta: "Como consultar minhas aulas?",
    resposta:
      "Acesse Minhas aulas para visualizar seus agendamentos ou Histórico para consultar aulas anteriores.",
    icon: CalendarDays,
  },
  {
    pergunta: "Como atualizar meus dados?",
    resposta:
      "Acesse Perfil, altere as informações disponíveis e clique em Salvar alterações.",
    icon: CircleHelp,
  },
];

function CentralAjudaPage() {
  const navigate = useNavigate();
  const [busca, setBusca] = useState("");
  const [aberta, setAberta] = useState<number | null>(null);

  useEffect(() => {
    if (!getSession()) {
      navigate({ to: "/paciente", replace: true });
    }
  }, [navigate]);

  const handleLogout = () => {
    logout();
    navigate({ to: "/acesso", replace: true });
  };

  const handleNavigation = (
    section:
      | "inicio"
      | "agenda"
      | "aulas"
      | "historico"
      | "perfil"
      | "notificacoes",
  ) => {
    const routes = {
      inicio: "/dashboard",
      agenda: "/agenda",
      aulas: "/aulas",
      historico: "/historico",
      perfil: "/perfil",
      notificacoes: "/notificacoes",
    } as const;

    navigate({ to: routes[section] });
  };

  const filtradas = perguntas
    .map((item, index) => ({ ...item, index }))
    .filter(
      (item) =>
        item.pergunta.toLowerCase().includes(busca.toLowerCase()) ||
        item.resposta.toLowerCase().includes(busca.toLowerCase()),
    );

  if (!getSession()) return null;

  return (
    <PatientLayout
      onLogout={handleLogout}
      onNavigate={handleNavigation}
    >
      <div className="mx-auto max-w-6xl space-y-8">
        <div>
          <button
            type="button"
            onClick={() => navigate({ to: "/perfil" })}
            className="mb-5 flex items-center gap-2 text-sm font-medium text-primary hover:opacity-80"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar ao perfil
          </button>

          <p className="text-sm font-semibold uppercase tracking-wider text-primary">
            Suporte
          </p>

          <h1 className="mt-2 text-4xl font-bold text-slate-950">
            Central de Ajuda
          </h1>

          <p className="mt-3 text-slate-600">
            Encontre respostas para suas dúvidas e saiba como
            utilizar o Timely.
          </p>
        </div>

        <div className="rounded-2xl border border-sky-100 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-950">
            Como podemos ajudar?
          </h2>

          <div className="relative mt-5">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={busca}
              onChange={(event) => setBusca(event.target.value)}
              placeholder="Pesquise sua dúvida..."
              className="w-full rounded-xl border border-sky-200 bg-white py-3 pl-12 pr-4 outline-none focus:border-primary"
            />
          </div>
        </div>

        <div className="rounded-2xl border border-sky-100 bg-white p-6 shadow-sm">
          <h2 className="mb-5 text-xl font-bold text-slate-950">
            Perguntas frequentes
          </h2>

          <div className="space-y-3">
            {filtradas.map((item) => {
              const Icon = item.icon;
              const expanded = aberta === item.index;

              return (
                <div
                  key={item.index}
                  className="rounded-xl border border-slate-200"
                >
                  <button
                    type="button"
                    aria-expanded={expanded}
                    onClick={() =>
                      setAberta(expanded ? null : item.index)
                    }
                    className="flex w-full items-center gap-3 p-4 text-left"
                  >
                    <Icon className="h-5 w-5 shrink-0 text-primary" />

                    <span className="flex-1 font-semibold text-slate-900">
                      {item.pergunta}
                    </span>

                    <span className="text-primary">
                      {expanded ? "−" : "+"}
                    </span>
                  </button>

                  {expanded && (
                    <p className="border-t border-slate-100 px-4 py-4 text-sm leading-6 text-slate-600">
                      {item.resposta}
                    </p>
                  )}
                </div>
              );
            })}

            {filtradas.length === 0 && (
              <p className="py-6 text-center text-slate-500">
                Nenhuma pergunta encontrada.
              </p>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-sky-100 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-slate-950">
            Ainda precisa de ajuda?
          </h2>

          <p className="mt-2 text-sm text-slate-600">
            Entre em contato com a clínica para receber
            atendimento.
          </p>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="flex items-center gap-4 rounded-xl border border-slate-200 p-4">
              <MessageCircle className="h-7 w-7 text-emerald-600" />
              <div>
                <p className="font-semibold text-slate-900">
                  WhatsApp
                </p>
                <p className="text-sm text-slate-500">
                  Consulte o número com a clínica
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 rounded-xl border border-slate-200 p-4">
              <Mail className="h-7 w-7 text-primary" />
              <div>
                <p className="font-semibold text-slate-900">
                  E-mail
                </p>
                <p className="text-sm text-slate-500">
                  Consulte o endereço com a clínica
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PatientLayout>
  );
}
