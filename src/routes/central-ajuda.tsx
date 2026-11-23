import { logout, requirePatient } from "@/lib/auth";

import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
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

export const Route = createFileRoute("/central-ajuda")({
  ssr: false,
  beforeLoad: requirePatient,
  component: CentralAjudaPage,
});

const perguntas = [
  {
    pergunta: "Como faço para agendar uma aula?",
    resposta:
      "Na Agenda, escolha uma data, um horário futuro com vaga e um instrutor. Confirme a reserva para usar uma sessão do seu saldo. Você pode ter uma reserva ativa por dia.",
    icon: CalendarDays,
    destino: "/agenda",
    link: "Abrir Agenda",
  },
  {
    pergunta: "Como consultar a disponibilidade de horários?",
    resposta:
      "Selecione uma data na Agenda e use os filtros de período e profissional. As aulas são oferecidas de segunda a sábado, com até três vagas por horário e instrutor. A disponibilidade pode mudar até a confirmação da reserva.",
    icon: CalendarDays,
    destino: "/agenda",
    link: "Consultar horários",
  },
  {
    pergunta: "Como cancelar uma aula?",
    resposta:
      "Em Minhas aulas, selecione uma reserva que ainda não começou, clique em Cancelar aula e confirme. O cancelamento e o resultado da devolução da sessão aparecem no Histórico.",
    icon: Clock3,
    destino: "/aulas",
    link: "Abrir Minhas aulas",
  },
  {
    pergunta: "Quando minha sessão é devolvida?",
    resposta:
      "Ao cancelar com pelo menos 6 horas de antecedência em relação ao início da aula, a sessão volta ao saldo. Com menos de 6 horas, você ainda pode cancelar antes do início, mas a sessão não é devolvida.",
    icon: Clock3,
    destino: "/historico",
    link: "Abrir Histórico",
  },
  {
    pergunta: "Onde posso consultar meu plano?",
    resposta:
      "Em Meus planos você encontra o plano vigente e as contratações anteriores. Em Detalhes do plano você pode consultar valor, periodicidade, benefícios, vigência e uso das sessões do plano.",
    icon: CreditCard,
    destino: "/meus-planos",
    link: "Abrir Meus planos",
  },
  {
    pergunta: "Como contratar ou renovar um plano?",
    resposta:
      "Escolha uma oferta em Meus planos quando estiver sem plano vigente e sem pedido pendente. A renovação fica disponível em Detalhes do plano a partir do vencimento, conforme a oferta disponível. Conclua o pagamento simulado para iniciar a vigência e receber as sessões.",
    icon: CreditCard,
    destino: "/detalhes-plano",
    link: "Abrir Detalhes do plano",
  },
  {
    pergunta: "Como funciona o pagamento simulado?",
    resposta:
      "Em Gerenciar pagamentos, escolha PIX ou cartão simulado e confirme a simulação. É um fluxo acadêmico, sem cobrança real e sem dados bancários. O comprovante simulado fica no histórico de pagamentos.",
    icon: CreditCard,
    destino: "/gerenciar-pagamentos",
    link: "Abrir Gerenciar pagamentos",
  },
  {
    pergunta: "Como consultar meu saldo e as sessões utilizadas?",
    resposta:
      "O Dashboard mostra seu saldo disponível para novas reservas. Detalhes do plano mostra o uso das sessões daquela contratação. O saldo geral pode incluir créditos anteriores, que continuam disponíveis após o vencimento do plano.",
    icon: CalendarDays,
    destino: "/dashboard",
    link: "Consultar saldo no Dashboard",
  },
  {
    pergunta: "Como consultar minhas aulas?",
    resposta:
      "Minhas aulas mostra as próximas reservas e permite confirmar a intenção de comparecer. Essa confirmação é feita pelo paciente. O Histórico reúne aulas cujo horário já começou e reservas canceladas.",
    icon: CalendarDays,
    destino: "/aulas",
    link: "Consultar próximas aulas",
  },
  {
    pergunta: "Como atualizar meus dados ou alterar a senha?",
    resposta:
      "No Perfil, edite seus dados ou endereço e clique em Salvar alterações. Para trocar a senha, abra Segurança, informe a senha atual e confirme a nova. Depois da troca, entre novamente nas suas sessões.",
    icon: CircleHelp,
    destino: "/perfil",
    link: "Abrir Perfil",
  },
  {
    pergunta: "Onde vejo minhas notificações internas?",
    resposta:
      "Abra Notificações pela sidebar ou pelo sino do Dashboard. A caixa reúne avisos de reservas, cancelamentos, aulas próximas, pagamentos simulados e atualizações de plano. Você pode filtrar, marcar como lidas e excluir notificações.",
    icon: MessageCircle,
    destino: "/notificacoes",
    link: "Abrir Notificações",
  },
  {
    pergunta: "Como altero minhas preferências de comunicação?",
    resposta:
      "No Perfil, use Preferências de comunicação para salvar suas escolhas de e-mail, WhatsApp e push. Os avisos internos continuam na caixa de Notificações. Esses canais externos ainda não enviam mensagens pelo Timely.",
    icon: Mail,
    destino: "/perfil",
    link: "Abrir preferências no Perfil",
  },
] as const;

function normalizarBusca(texto: string) {
  return texto.normalize("NFD").replace(/\p{M}/gu, "").toLocaleLowerCase("pt-BR");
}

function CentralAjudaPage() {
  const navigate = useNavigate();
  const [busca, setBusca] = useState("");
  const [aberta, setAberta] = useState<number | null>(null);

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

  const termos = normalizarBusca(busca).trim().split(/\s+/).filter(Boolean);
  const filtradas = perguntas
    .map((item, index) => ({ ...item, index }))
    .filter((item) => {
      const conteudo = normalizarBusca(`${item.pergunta} ${item.resposta}`);
      return termos.every((termo) => conteudo.includes(termo));
    });

  return (
    <PatientLayout
      onLogout={handleLogout}
      onNavigate={handleNavigation}
    >
      <div className="mx-auto max-w-6xl space-y-8 max-sm:[overflow-wrap:anywhere]">
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

        <div className="rounded-2xl border border-sky-100 bg-white p-6 shadow-sm max-sm:px-3">
          <h2 className="text-xl font-bold text-slate-950">
            Como podemos ajudar?
          </h2>

          <div className="relative mt-5">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              aria-label="Pesquisar perguntas frequentes"
              value={busca}
              onChange={(event) => setBusca(event.target.value)}
              placeholder="Pesquise sua dúvida..."
              className="w-full rounded-xl border border-sky-200 bg-white py-3 pl-12 pr-4 outline-none focus:border-primary"
            />
          </div>
        </div>

        <div className="rounded-2xl border border-sky-100 bg-white p-6 shadow-sm max-sm:px-3">
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
                    aria-controls={`faq-resposta-${item.index}`}
                    onClick={() =>
                      setAberta(expanded ? null : item.index)
                    }
                    className="flex w-full items-center gap-3 p-4 text-left max-sm:gap-1.5 max-sm:px-2"
                  >
                    <Icon className="h-5 w-5 shrink-0 text-primary" />

                    <span className="min-w-0 flex-1 font-semibold text-slate-900">
                      {item.pergunta}
                    </span>

                    <span className="text-primary">
                      {expanded ? "−" : "+"}
                    </span>
                  </button>

                  <div
                    id={`faq-resposta-${item.index}`}
                    hidden={!expanded}
                    className="border-t border-slate-100 px-4 py-4 text-sm leading-6 text-slate-600 max-sm:px-2"
                  >
                    <p>{item.resposta}</p>
                    <Link to={item.destino} className="mt-2 inline-block font-medium text-primary hover:underline">
                      {item.link}
                    </Link>
                  </div>
                </div>
              );
            })}

            {filtradas.length === 0 && (
              <p role="status" className="py-6 text-center text-slate-500">
                Nenhuma pergunta encontrada.
              </p>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-sky-100 bg-white p-6 shadow-sm max-sm:px-3">
          <h2 className="text-xl font-bold text-slate-950">
            Ainda precisa de ajuda?
          </h2>

          <p className="mt-2 text-sm text-slate-600">
            Os contatos oficiais ainda não estão cadastrados no Timely.
            Confirme os canais de atendimento diretamente com a clínica.
          </p>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="flex items-center gap-4 rounded-xl border border-slate-200 p-4 max-sm:gap-2 max-sm:px-2">
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

            <div className="flex items-center gap-4 rounded-xl border border-slate-200 p-4 max-sm:gap-2 max-sm:px-2">
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
