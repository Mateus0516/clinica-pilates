import { getPatient, logout, requirePatient } from "@/lib/auth";
import {
  createFileRoute,
  useNavigate,
} from "@tanstack/react-router";

import {
  useState,
} from "react";

import {
  AlertTriangle,
  CalendarDays,
  Clock3,
  UserRound,
} from "lucide-react";

import { PatientLayout } from "@/components/layout/PatientLayout";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

import { calendarDate, useAppointmentChange, useAppointments, useSessionBalance, type Appointment } from "@/lib/scheduling";
import { SchedulingFeedback } from "@/components/dashboard/SchedulingFeedback";
import { Toaster } from "sonner";

export const Route = createFileRoute("/aulas")({
  ssr: false,
  beforeLoad: requirePatient,
  component: ClassesPage,
});

type SidebarSection =
  | "inicio"
  | "agenda"
  | "aulas"
  | "historico"
  | "perfil"
  | "notificacoes";

function ClassesPage() {
  const navigate = useNavigate();

  const student = getPatient();
  const [bookingToCancel, setBookingToCancel] = useState<Appointment | null>(null);
  const appointments = useAppointments();
  const balance = useSessionBalance();
  const change = useAppointmentChange();
  const myBookings = appointments.data ?? [];

  const handleLogout = () => {
    logout();
    void navigate({ to: "/acesso", replace: true });
  };

  const handleNavigation = (
    section: SidebarSection,
  ) => {
    if (
      section === "inicio"
    ) {
      navigate({
        to: "/dashboard",
      });

      return;
    }

    if (
      section === "agenda"
    ) {
      navigate({
        to: "/agenda",
      });

      return;
    }

    if (
      section === "aulas"
    ) {
      navigate({
        to: "/aulas",
      });

      return;
    }

    if (
      section === "historico"
    ) {
      navigate({
        to: "/historico",
      });

      return;
    }

    if (
      section === "perfil"
    ) {
      navigate({
        to: "/perfil",
      });

      return;
    }

    if (
      section ===
      "notificacoes"
    ) {
      navigate({
        to: "/notificacoes",
      });

      return;
    }
  };

  /*
   * Mostra somente as próximas aulas
   * do paciente e coloca em ordem.
   */
  const confirmCancelBooking = () => {
    if (!bookingToCancel || change.isPending) return;
    change.mutate({ type: "cancel", id: bookingToCancel.id }, {
      onSuccess: () => setBookingToCancel(null),
    });
  };

  if (!student) return null;

  return (
    <PatientLayout
      onLogout={
        handleLogout
      }
      onNavigate={
        handleNavigation
      }
    >
      <Toaster
        richColors
        position="top-center"
      />

      <div className="mx-auto max-w-7xl">
        {/* CABEÇALHO */}
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">
            Minhas aulas
          </p>

          <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-950">
            Seus próximos atendimentos
          </h1>

          <p className="mt-3 max-w-2xl text-slate-600">
            Consulte seus próximos
            horários, profissionais e
            gerencie seus agendamentos.
          </p>
        </div>

        {/* RESUMO */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-5">
          {/* PRÓXIMOS ATENDIMENTOS */}
          <div>
            <p className="text-sm text-slate-500">
              Próximos atendimentos
            </p>

            <p className="mt-1 text-2xl font-bold text-slate-950">
              {appointments.data?.length ?? "—"}
            </p>
          </div>

          {/* SESSÕES DISPONÍVEIS */}
          <div>
            <p className="text-sm text-slate-500">
              Sessões disponíveis
            </p>

            <p className="mt-1 text-2xl font-bold text-primary">
              {
                balance.data?.sessoesDisponiveis ?? "—"
              }
            </p>
          </div>

          {/* NOVA AULA */}
          <Button
            type="button"
            onClick={() =>
              navigate({
                to: "/agenda",
              })
            }
          >
            <CalendarDays className="mr-2 h-4 w-4" />

            Agendar nova aula
          </Button>
        </div>

        <SchedulingFeedback query={appointments} />
        <SchedulingFeedback query={balance} />
        {appointments.isSuccess && (myBookings.length === 0 ? (
          <Card className="mt-6 flex flex-col items-center justify-center p-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <CalendarDays className="h-8 w-8" />
            </div>

            <h2 className="mt-5 text-xl font-bold text-slate-950">
              Nenhuma aula agendada
            </h2>

            <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
              Você ainda não possui
              próximos atendimentos.
              Acesse a agenda para
              escolher um horário
              disponível.
            </p>

            <Button
              type="button"
              className="mt-6"
              onClick={() =>
                navigate({
                  to: "/agenda",
                })
              }
            >
              Ver agenda
            </Button>
          </Card>
        ) : (
          /*
           * LISTA DE AULAS
           */
          <div className="mt-6 space-y-4">
            {myBookings.map(
              (booking) => (
                <Card
                  key={
                    booking.id
                  }
                  className="p-6"
                >
                  <div className="flex flex-wrap items-center gap-5">
                    {/* ÍCONE */}
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <CalendarDays className="h-6 w-6" />
                    </div>

                    {/* DATA */}
                    <div className="min-w-[180px]">
                      <p className="text-sm text-slate-500">
                        Data
                      </p>

                      <p className="mt-1 font-semibold capitalize text-slate-950">
                        {calendarDate(booking.data).toLocaleDateString(
                          "pt-BR",
                          {
                            weekday:
                              "long",
                            day: "2-digit",
                            month:
                              "long",
                          },
                        )}
                      </p>
                    </div>

                    {/* HORÁRIO */}
                    <div>
                      <p className="text-sm text-slate-500">
                        Horário
                      </p>

                      <div className="mt-1 flex items-center gap-2 font-semibold text-slate-950">
                        <Clock3 className="h-4 w-4 text-primary" />

                        {
                          booking.horario
                        }
                      </div>
                    </div>

                    {/* PROFISSIONAL */}
                    <div className="min-w-[150px]">
                      <p className="text-sm text-slate-500">
                        Profissional
                      </p>

                      <div className="mt-1 flex items-center gap-2 font-semibold text-slate-950">
                        <UserRound className="h-4 w-4 text-primary" />

                        Prof.{" "}
                        {
                          booking.instrutor
                        }
                      </div>
                    </div>

                    {/* CANCELAR */}
                    <div className="ml-auto flex flex-wrap items-center gap-2">
                      <span className="text-sm text-slate-600">Agendada</span>
                      {booking.intencaoPresencaConfirmadaEm ? (
                        <span className="text-sm font-medium text-primary">Intenção de comparecer confirmada</span>
                      ) : (
                        <Button type="button" variant="outline" disabled={change.isPending}
                          onClick={() => change.mutate({ type: "confirm", id: booking.id })}>
                          Confirmar intenção de comparecer
                        </Button>
                      )}
                      <Button
                        type="button"
                        variant="outline"
                        className="border-red-200 text-red-600 hover:border-red-300 hover:bg-red-50 hover:text-red-700"
                        onClick={() =>
                          setBookingToCancel(
                            booking,
                          )
                        }
                      >
                        Cancelar aula
                      </Button>
                    </div>
                  </div>
                </Card>
              ),
            )}
          </div>
        ))}

        {/* REGRA */}
        <p className="mt-6 text-center text-xs text-muted-foreground">
          Cancelamentos realizados
          com pelo menos 6 horas de
          antecedência devolvem a
          sessão ao seu pacote.
        </p>
      </div>

      {/* MODAL DE CONFIRMAÇÃO */}
      {bookingToCancel && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            {/* ÍCONE */}
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>

            {/* TÍTULO */}
            <h2 className="mt-4 text-xl font-bold text-slate-950">
              Cancelar aula?
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              Confirme os dados da
              aula antes de realizar
              o cancelamento.
            </p>

            {/* DADOS DA AULA */}
            <div className="mt-5 space-y-3 rounded-xl bg-slate-50 p-4">
              {/* DATA */}
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-slate-500">
                  Data
                </span>

                <span className="text-sm font-semibold capitalize text-slate-950">
                  {calendarDate(bookingToCancel.data).toLocaleDateString(
                    "pt-BR",
                    {
                      weekday:
                        "long",
                      day: "2-digit",
                      month:
                        "long",
                    },
                  )}
                </span>
              </div>

              {/* HORÁRIO */}
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-slate-500">
                  Horário
                </span>

                <span className="text-sm font-semibold text-slate-950">
                  {
                    bookingToCancel.horario
                  }
                </span>
              </div>

              {/* PROFISSIONAL */}
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-slate-500">
                  Profissional
                </span>

                <span className="text-sm font-semibold text-slate-950">
                  Prof.{" "}
                  {
                    bookingToCancel.instrutor
                  }
                </span>
              </div>
            </div>

            {/* REGRA DAS 6 HORAS */}
            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
              <div className="flex gap-3">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />

                <p className="text-sm leading-6 text-amber-900">
                  Cancelamentos com{" "}
                  <strong>
                    6 horas ou mais
                  </strong>{" "}
                  de antecedência
                  devolvem a sessão ao
                  seu pacote. Com menos
                  de 6 horas, a sessão
                  não será devolvida.
                </p>
              </div>
            </div>

            {/* BOTÕES */}
            <div className="mt-6 flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  setBookingToCancel(
                    null,
                  )
                }
              >
                Voltar
              </Button>

              <Button
                type="button"
                disabled={change.isPending}
                onClick={confirmCancelBooking}
                className="bg-red-600 text-white hover:bg-red-700"
              >
                Confirmar cancelamento
              </Button>
            </div>
          </div>
        </div>
      )}
    </PatientLayout>
  );
}