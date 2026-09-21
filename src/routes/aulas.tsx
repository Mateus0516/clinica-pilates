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
  AlertTriangle,
  CalendarDays,
  Clock3,
  UserRound,
} from "lucide-react";

import { PatientLayout } from "@/components/layout/PatientLayout";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

import {
  Booking,
  Student,
  getBookings,
  getSession,
  saveBookings,
  setSession,
  updateStudent,
} from "@/lib/clinic-store";

import {
  addNotification,
} from "@/lib/notification-store";

import {
  toast,
  Toaster,
} from "sonner";

export const Route = createFileRoute("/aulas")({
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

  const [
    student,
    setStudent,
  ] = useState<Student | null>(
    null,
  );

  const [
    bookings,
    setBookings,
  ] = useState<Booking[]>([]);

  const [
    ready,
    setReady,
  ] = useState(false);

  /*
   * Guarda a aula que o paciente
   * está tentando cancelar.
   *
   * Enquanto houver uma aula aqui,
   * o modal de confirmação aparece.
   */
  const [
    bookingToCancel,
    setBookingToCancel,
  ] = useState<Booking | null>(
    null,
  );

  /*
   * Carrega o paciente atual
   * e seus agendamentos.
   */
  useEffect(() => {
    const currentStudent =
      getSession();

    if (!currentStudent) {
      navigate({
        to: "/paciente",
        replace: true,
      });

      return;
    }

    setStudent(
      currentStudent,
    );

    setBookings(
      getBookings(),
    );

    setReady(true);
  }, [navigate]);

  /*
   * Logout.
   */
  const handleLogout = () => {
    setSession(null);
    setStudent(null);

    navigate({
      to: "/acesso",
      replace: true,
    });
  };

  /*
   * Navegação lateral.
   */
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
  const myBookings =
    useMemo(() => {
      if (!student) {
        return [];
      }

      return bookings
        .filter(
          (booking) =>
            booking.studentId ===
            student.id,
        )
        .filter(
          (booking) => {
            const bookingDate =
              new Date(
                `${booking.date}T${booking.time}:00`,
              );

            return (
              bookingDate.getTime() >=
              Date.now()
            );
          },
        )
        .sort(
          (
            bookingA,
            bookingB,
          ) =>
            `${bookingA.date}T${bookingA.time}`.localeCompare(
              `${bookingB.date}T${bookingB.time}`,
            ),
        );
    }, [
      bookings,
      student,
    ]);

  /*
   * O cancelamento real acontece
   * somente depois da confirmação
   * no modal.
   */
  const confirmCancelBooking =
    () => {
      if (
        !student ||
        !bookingToCancel
      ) {
        return;
      }

      const booking =
        bookingToCancel;

      const updatedBookings =
        getBookings().filter(
          (
            currentBooking,
          ) =>
            currentBooking.id !==
            booking.id,
        );

      saveBookings(
        updatedBookings,
      );

      setBookings(
        updatedBookings,
      );

      const classDate =
        new Date(
          `${booking.date}T${booking.time}:00`,
        );

      const differenceInHours =
        (classDate.getTime() -
          Date.now()) /
        36e5;

      const formattedDate =
        new Date(
          `${booking.date}T00:00:00`,
        ).toLocaleDateString(
          "pt-BR",
        );

      /*
       * Cancelamento com 6 horas
       * ou mais:
       *
       * a sessão volta para
       * o pacote do paciente.
       */
      if (
        differenceInHours >= 6
      ) {
        const updatedStudent: Student = {
          ...student,
          sessionsRemaining:
            student.sessionsRemaining +
            1,
        };

        updateStudent(
          updatedStudent,
        );

        setStudent(
          updatedStudent,
        );

        addNotification({
          studentId:
            student.id,
          bookingId:
            booking.id,
          title:
            "Aula cancelada",
          description: `Sua aula com Prof. ${booking.instructor} do dia ${formattedDate} às ${booking.time} foi cancelada. A sessão foi devolvida ao seu pacote.`,
          time: "Agora",
          type: "cancelamento",
        });

        toast.success(
          "Aula cancelada. A sessão foi devolvida ao seu pacote.",
        );
      } else {
        /*
         * Menos de 6 horas:
         *
         * a aula é cancelada,
         * mas a sessão não retorna
         * para o pacote.
         */
        addNotification({
          studentId:
            student.id,
          bookingId:
            booking.id,
          title:
            "Aula cancelada",
          description: `Sua aula com Prof. ${booking.instructor} do dia ${formattedDate} às ${booking.time} foi cancelada. Como faltavam menos de 6 horas, a sessão não foi devolvida ao pacote.`,
          time: "Agora",
          type: "cancelamento",
        });

        toast.warning(
          "Aula cancelada. Como faltavam menos de 6 horas, a sessão não foi devolvida ao pacote.",
        );
      }

      /*
       * Fecha o modal depois
       * do cancelamento.
       */
      setBookingToCancel(
        null,
      );
    };

  if (
    !ready ||
    !student
  ) {
    return null;
  }

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
              {myBookings.length}
            </p>
          </div>

          {/* SESSÕES DISPONÍVEIS */}
          <div>
            <p className="text-sm text-slate-500">
              Sessões disponíveis
            </p>

            <p className="mt-1 text-2xl font-bold text-primary">
              {
                student.sessionsRemaining
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

        {/* SEM AULAS */}
        {myBookings.length ===
        0 ? (
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
                        {new Date(
                          `${booking.date}T00:00:00`,
                        ).toLocaleDateString(
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
                          booking.time
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
                          booking.instructor
                        }
                      </div>
                    </div>

                    {/* CANCELAR */}
                    <div className="ml-auto">
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
        )}

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
                  {new Date(
                    `${bookingToCancel.date}T00:00:00`,
                  ).toLocaleDateString(
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
                    bookingToCancel.time
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
                    bookingToCancel.instructor
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
                onClick={
                  confirmCancelBooking
                }
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