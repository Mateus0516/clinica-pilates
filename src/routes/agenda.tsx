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
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Filter,
  UserRound,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PatientLayout } from "@/components/layout/PatientLayout";

import {
  Booking,
  MAX_PER_SLOT,
  Student,
  fmtDate,
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

export const Route = createFileRoute("/agenda")({
  component: AgendaPage,
});

const TIMES = [
  "07:00",
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
];

const PROFESSIONALS = [
  "Todos",
  "Ana",
  "Bruno",
  "Carla",
];

type SidebarSection =
  | "inicio"
  | "agenda"
  | "aulas"
  | "historico"
  | "perfil"
  | "notificacoes";

function AgendaPage() {
  const navigate = useNavigate();

  const [
    student,
    setStudent,
  ] = useState<Student | null>(
    null,
  );

  const [
    ready,
    setReady,
  ] = useState(false);

  const [
    bookings,
    setBookings,
  ] = useState<Booking[]>([]);

  const [
    selectedDate,
    setSelectedDate,
  ] = useState(new Date());

  const [
    period,
    setPeriod,
  ] = useState<
    "todos" | "manha" | "tarde" | "noite"
  >("todos");

  const [
    professional,
    setProfessional,
  ] = useState("Todos");

  /*
   * Horário aguardando confirmação
   * antes de ser agendado.
   */
  const [
    bookingToConfirm,
    setBookingToConfirm,
  ] = useState<{
    time: string;
    instructor: string;
  } | null>(null);

  /*
   * Agendamento aguardando confirmação
   * antes do cancelamento.
   */
  const [
    bookingToCancel,
    setBookingToCancel,
  ] = useState<Booking | null>(
    null,
  );

  /*
   * Carrega a sessão do paciente
   * e os agendamentos existentes.
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

  const monthLabel =
    selectedDate.toLocaleDateString(
      "pt-BR",
      {
        month: "long",
        year: "numeric",
      },
    );

  /*
   * Dias do mês selecionado.
   */
  const daysInMonth =
    useMemo(() => {
      const year =
        selectedDate.getFullYear();

      const month =
        selectedDate.getMonth();

      const lastDay =
        new Date(
          year,
          month + 1,
          0,
        ).getDate();

      return Array.from(
        {
          length: lastDay,
        },
        (_, index) =>
          new Date(
            year,
            month,
            index + 1,
          ),
      );
    }, [selectedDate]);

  /*
   * Filtra os horários por período.
   */
  const filteredTimes =
    TIMES.filter(
      (time) => {
        const hour =
          Number(
            time.split(":")[0],
          );

        if (
          period === "manha"
        ) {
          return hour < 12;
        }

        if (
          period === "tarde"
        ) {
          return (
            hour >= 12 &&
            hour < 18
          );
        }

        if (
          period === "noite"
        ) {
          return hour >= 18;
        }

        return true;
      },
    );

  /*
   * Avança ou volta um mês.
   */
  const changeMonth = (
    direction: number,
  ) => {
    setSelectedDate(
      new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth() +
          direction,
        1,
      ),
    );
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
   * Define o profissional exibido.
   *
   * Enquanto o filtro estiver em
   * "Todos", alternamos Ana e Bruno.
   */
  const getInstructor = (
    index: number,
  ) => {
    if (
      professional !== "Todos"
    ) {
      return professional;
    }

    return index % 2 === 0
      ? "Ana"
      : "Bruno";
  };

  /*
   * Calcula as vagas disponíveis
   * em determinado horário.
   */
  const getAvailableSpots = (
    time: string,
    instructor: string,
  ) => {
    const date =
      fmtDate(
        selectedDate,
      );

    const occupiedSpots =
      bookings.filter(
        (booking) =>
          booking.date ===
            date &&
          booking.time ===
            time &&
          booking.instructor ===
            instructor,
      ).length;

    return Math.max(
      MAX_PER_SLOT -
        occupiedSpots,
      0,
    );
  };

  /*
   * Verifica se o horário
   * selecionado já passou.
   */
  const isTimePast = (
    time: string,
  ) => {
    const date =
      fmtDate(
        selectedDate,
      );

    const classDate =
      new Date(
        `${date}T${time}:00`,
      );

    return (
      classDate.getTime() <
      Date.now()
    );
  };

  /*
   * Procura um agendamento
   * do próprio paciente.
   */
  const getMyBooking = (
    time: string,
    instructor: string,
  ) => {
    if (!student) {
      return undefined;
    }

    const date =
      fmtDate(
        selectedDate,
      );

    return bookings.find(
      (booking) =>
        booking.date ===
          date &&
        booking.time ===
          time &&
        booking.instructor ===
          instructor &&
        booking.studentId ===
          student.id,
    );
  };

  /*
   * CONFIRMAR AGENDAMENTO
   */
  const confirmBooking = () => {
    if (
      !student ||
      !bookingToConfirm
    ) {
      return;
    }

    /*
     * Nesta versão do sistema,
     * o paciente utiliza sessões
     * disponíveis no pacote.
     */
    if (
      student.sessionsRemaining <=
      0
    ) {
      toast.error(
        "Você não possui sessões disponíveis no seu pacote.",
      );

      setBookingToConfirm(
        null,
      );

      return;
    }

    const date =
      fmtDate(
        selectedDate,
      );

    const {
      time,
      instructor,
    } = bookingToConfirm;

    const classDate =
      new Date(
        `${date}T${time}:00`,
      );

    /*
     * Não permite agendamento
     * de horário passado.
     */
    if (
      classDate.getTime() <
      Date.now()
    ) {
      toast.error(
        "Não é possível agendar um horário que já passou.",
      );

      setBookingToConfirm(
        null,
      );

      return;
    }

    const allBookings =
      getBookings();

    /*
     * Impede duplicidade no
     * mesmo atendimento.
     */
    const alreadyBookedInClass =
      allBookings.some(
        (booking) =>
          booking.date ===
            date &&
          booking.time ===
            time &&
          booking.instructor ===
            instructor &&
          booking.studentId ===
            student.id,
      );

    if (
      alreadyBookedInClass
    ) {
      toast.error(
        "Você já está agendado neste atendimento.",
      );

      setBookingToConfirm(
        null,
      );

      return;
    }

    /*
     * Mantemos temporariamente
     * a regra de uma aula por dia.
     */
    const alreadyBookedOnDay =
      allBookings.some(
        (booking) =>
          booking.date ===
            date &&
          booking.studentId ===
            student.id,
      );

    if (
      alreadyBookedOnDay
    ) {
      toast.error(
        "Você já possui um atendimento agendado neste dia.",
      );

      setBookingToConfirm(
        null,
      );

      return;
    }

    /*
     * Verifica a capacidade
     * do horário.
     */
    const classBookings =
      allBookings.filter(
        (booking) =>
          booking.date ===
            date &&
          booking.time ===
            time &&
          booking.instructor ===
            instructor,
      );

    if (
      classBookings.length >=
      MAX_PER_SLOT
    ) {
      toast.error(
        "Este horário não possui mais vagas.",
      );

      setBookingToConfirm(
        null,
      );

      return;
    }

    /*
     * Cria o novo agendamento.
     */
    const newBooking: Booking = {
      id: crypto.randomUUID(),
      studentId:
        student.id,
      studentName:
        student.name,
      date,
      time,
      instructor,
    };

    const updatedBookings = [
      ...allBookings,
      newBooking,
    ];

    saveBookings(
      updatedBookings,
    );

    setBookings(
      updatedBookings,
    );

    /*
     * Uma sessão é utilizada
     * ao realizar o agendamento.
     */
    const updatedStudent: Student = {
      ...student,
      sessionsRemaining:
        student.sessionsRemaining -
        1,
    };

    updateStudent(
      updatedStudent,
    );

    setStudent(
      updatedStudent,
    );

    /*
     * Cria notificação de
     * confirmação.
     */
    addNotification({
      studentId:
        student.id,
      bookingId:
        newBooking.id,
      title:
        "Aula confirmada",
      description: `Sua aula com Prof. ${instructor} foi agendada para ${new Date(
        `${date}T00:00:00`,
      ).toLocaleDateString(
        "pt-BR",
      )} às ${time}.`,
      time: "Agora",
      type: "confirmacao",
    });

    setBookingToConfirm(
      null,
    );

    toast.success(
      "Agendamento realizado com sucesso!",
    );
  };

  /*
   * CONFIRMAR CANCELAMENTO
   */
  const confirmCancel = () => {
    if (
      !student ||
      !bookingToCancel
    ) {
      return;
    }

    const booking =
      bookingToCancel;

    const allBookings =
      getBookings();

    const updatedBookings =
      allBookings.filter(
        (currentBooking) =>
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
     * Com 6 horas ou mais,
     * a sessão volta para o pacote.
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
        "Aula desmarcada. A sessão foi devolvida ao seu pacote.",
      );
    } else {
      /*
       * Com menos de 6 horas,
       * o agendamento é cancelado,
       * mas a sessão não retorna.
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
        "Aula desmarcada. Como faltavam menos de 6 horas, a sessão não foi devolvida ao pacote.",
      );
    }

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
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">
              Agenda
            </p>

            <h1 className="mt-2 text-4xl font-bold text-slate-950">
              Encontre seu próximo atendimento
            </h1>

            <p className="mt-3 max-w-2xl text-slate-600">
              Escolha uma data, filtre os horários e
              encontre o melhor momento para seu
              atendimento.
            </p>
          </div>

          {/* SESSÕES DISPONÍVEIS */}
          <div className="rounded-xl bg-primary/10 px-4 py-3 text-sm font-semibold text-primary">
            {student.sessionsRemaining}{" "}
            {student.sessionsRemaining === 1
              ? "sessão disponível"
              : "sessões disponíveis"}
          </div>
        </div>

        {/* FILTROS */}
        <Card className="mt-8 p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <Filter className="h-4 w-4" />

              Filtrar:
            </div>

            {[
              [
                "todos",
                "Todos",
              ],
              [
                "manha",
                "Manhã",
              ],
              [
                "tarde",
                "Tarde",
              ],
              [
                "noite",
                "Noite",
              ],
            ].map(
              ([
                value,
                label,
              ]) => (
                <button
                  key={
                    value
                  }
                  type="button"
                  onClick={() =>
                    setPeriod(
                      value as typeof period,
                    )
                  }
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                    period ===
                    value
                      ? "bg-primary text-primary-foreground"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {label}
                </button>
              ),
            )}

            <div className="ml-auto flex items-center gap-2">
              <UserRound className="h-4 w-4 text-slate-500" />

              <select
                value={
                  professional
                }
                onChange={(
                  event,
                ) =>
                  setProfessional(
                    event.target
                      .value,
                  )
                }
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-primary"
              >
                {PROFESSIONALS.map(
                  (name) => (
                    <option
                      key={
                        name
                      }
                      value={
                        name
                      }
                    >
                      {name ===
                      "Todos"
                        ? "Todos os profissionais"
                        : `Prof. ${name}`}
                    </option>
                  ),
                )}
              </select>
            </div>
          </div>
        </Card>

        {/* CONTEÚDO */}
        <div className="mt-6 grid gap-6 lg:grid-cols-[380px_1fr]">
          {/* CALENDÁRIO */}
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={() =>
                  changeMonth(
                    -1,
                  )
                }
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <h2 className="font-semibold capitalize text-slate-900">
                {monthLabel}
              </h2>

              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={() =>
                  changeMonth(
                    1,
                  )
                }
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* DIAS DA SEMANA */}
            <div className="mt-5 grid grid-cols-7 gap-2 text-center text-xs font-medium text-slate-400">
              <span>Dom</span>
              <span>Seg</span>
              <span>Ter</span>
              <span>Qua</span>
              <span>Qui</span>
              <span>Sex</span>
              <span>Sáb</span>
            </div>

            {/* DIAS DO MÊS */}
            <div className="mt-2 grid grid-cols-7 gap-2">
              {Array.from({
                length:
                  new Date(
                    selectedDate.getFullYear(),
                    selectedDate.getMonth(),
                    1,
                  ).getDay(),
              }).map(
                (
                  _,
                  index,
                ) => (
                  <div
                    key={`empty-${index}`}
                  />
                ),
              )}

              {daysInMonth.map(
                (date) => {
                  const selected =
                    date.toDateString() ===
                    selectedDate.toDateString();

                  const today =
                    date.toDateString() ===
                    new Date().toDateString();

                  const endOfDay =
                    new Date(
                      date.getFullYear(),
                      date.getMonth(),
                      date.getDate(),
                      23,
                      59,
                      59,
                    );

                  const pastDay =
                    endOfDay.getTime() <
                    Date.now();

                  return (
                    <button
                      key={
                        date.toISOString()
                      }
                      type="button"
                      onClick={() =>
                        setSelectedDate(
                          date,
                        )
                      }
                      className={`aspect-square rounded-xl text-sm font-medium transition ${
                        selected
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : today
                            ? "border border-primary text-primary"
                            : pastDay
                              ? "text-slate-300 hover:bg-slate-50"
                              : "text-slate-700 hover:bg-primary/10 hover:text-primary"
                      }`}
                    >
                      {date.getDate()}
                    </button>
                  );
                },
              )}
            </div>

            {/* DATA SELECIONADA */}
            <div className="mt-6 rounded-xl bg-slate-50 p-4">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-primary" />

                <p className="text-sm font-semibold text-slate-900">
                  Data selecionada
                </p>
              </div>

              <p className="mt-2 text-sm capitalize text-slate-600">
                {selectedDate.toLocaleDateString(
                  "pt-BR",
                  {
                    weekday:
                      "long",
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  },
                )}
              </p>
            </div>
          </Card>

          {/* HORÁRIOS */}
          <Card className="p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-950">
                  Horários disponíveis
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Escolha um horário para continuar.
                </p>
              </div>

              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">
                {filteredTimes.length}{" "}
                horários
              </span>
            </div>

            {/* LISTA DE HORÁRIOS */}
            <div className="mt-6 space-y-3">
              {filteredTimes.map(
                (
                  time,
                  index,
                ) => {
                  const instructor =
                    getInstructor(
                      index,
                    );

                  const available =
                    getAvailableSpots(
                      time,
                      instructor,
                    );

                  const isFull =
                    available <= 0;

                  const isPast =
                    isTimePast(
                      time,
                    );

                  const myBooking =
                    getMyBooking(
                      time,
                      instructor,
                    );

                  const isMine =
                    Boolean(
                      myBooking,
                    );

                  return (
                    <div
                      key={`${time}-${instructor}`}
                      className={`flex flex-wrap items-center gap-4 rounded-xl border-2 p-4 transition ${
                        isMine
                          ? "border-emerald-500 bg-emerald-100 shadow-sm ring-1 ring-emerald-300"
                          : isPast
                            ? "border-slate-200 bg-slate-100/70 opacity-45"
                            : isFull
                              ? "border-red-100 bg-red-50/40 opacity-60"
                              : "border-slate-200 bg-white hover:border-primary/40 hover:shadow-sm"
                      }`}
                    >
                      {/* ÍCONE */}
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                          isMine
                            ? "bg-emerald-600 text-white"
                            : isPast
                              ? "bg-slate-200 text-slate-400"
                              : isFull
                                ? "bg-red-100 text-red-400"
                                : "bg-primary/10 text-primary"
                        }`}
                      >
                        {isMine ? (
                          <Check className="h-6 w-6" />
                        ) : (
                          <Clock3 className="h-5 w-5" />
                        )}
                      </div>

                      {/* HORÁRIO */}
                      <div className="min-w-[100px]">
                        <p
                          className={`text-lg font-bold ${
                            isMine
                              ? "text-emerald-950"
                              : isPast ||
                                  isFull
                                ? "text-slate-500"
                                : "text-slate-950"
                          }`}
                        >
                          {time}
                        </p>

                        <p
                          className={`text-xs ${
                            isMine
                              ? "font-medium text-emerald-700"
                              : "text-slate-500"
                          }`}
                        >
                          Atendimento
                        </p>
                      </div>

                      {/* PROFISSIONAL / VAGAS */}
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p
                            className={`font-medium ${
                              isMine
                                ? "text-emerald-950"
                                : isPast ||
                                    isFull
                                  ? "text-slate-500"
                                  : "text-slate-900"
                            }`}
                          >
                            Prof.{" "}
                            {
                              instructor
                            }
                          </p>

                          {isMine && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-2.5 py-1 text-xs font-bold text-white">
                              <Check className="h-3 w-3" />

                              Aula agendada
                            </span>
                          )}
                        </div>

                        <p
                          className={`mt-1 text-sm ${
                            isMine
                              ? "font-semibold text-emerald-700"
                              : isPast
                                ? "font-medium text-slate-400"
                                : isFull
                                  ? "font-medium text-red-500"
                                  : "text-slate-500"
                          }`}
                        >
                          {isMine
                            ? "Este horário está reservado para você"
                            : isPast
                              ? "Este horário já passou"
                              : isFull
                                ? "Sem vagas disponíveis"
                                : `${available} ${
                                    available ===
                                    1
                                      ? "vaga disponível"
                                      : "vagas disponíveis"
                                  }`}
                        </p>
                      </div>

                      {/* AÇÃO */}
                      {isMine &&
                      myBooking ? (
                        <Button
                          type="button"
                          variant="outline"
                          className="border-red-300 bg-white text-red-600 hover:border-red-400 hover:bg-red-50 hover:text-red-700"
                          onClick={() =>
                            setBookingToCancel(
                              myBooking,
                            )
                          }
                        >
                          Desmarcar
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          disabled={
                            isPast ||
                            isFull
                          }
                          onClick={() => {
                            if (
                              isPast ||
                              isFull
                            ) {
                              return;
                            }

                            setBookingToConfirm({
                              time,
                              instructor,
                            });
                          }}
                        >
                          {isPast
                            ? "Encerrado"
                            : isFull
                              ? "Lotado"
                              : "Agendar"}
                        </Button>
                      )}
                    </div>
                  );
                },
              )}
            </div>

            {/* LEGENDA */}
            <div className="mt-6 flex flex-wrap gap-4 border-t border-slate-100 pt-5 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-primary" />

                Disponível
              </div>

              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-emerald-600" />

                Aula agendada
              </div>

              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-slate-300" />

                Horário encerrado
              </div>

              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-red-300" />

                Lotado
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* MODAL CONFIRMAR AGENDAMENTO */}
      {bookingToConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-[2px]"
          onMouseDown={(
            event,
          ) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              setBookingToConfirm(
                null,
              );
            }
          }}
        >
          <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
            {/* CABEÇALHO */}
            <div className="flex items-start justify-between border-b border-slate-100 p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <CalendarDays className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="text-lg font-bold text-slate-950">
                    Confirmar agendamento
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Confira os dados antes de continuar.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  setBookingToConfirm(
                    null,
                  )
                }
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                aria-label="Fechar"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* CONTEÚDO */}
            <div className="p-6">
              <div className="space-y-4 rounded-xl bg-slate-50 p-5">
                {/* DATA */}
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm text-slate-500">
                    Data
                  </span>

                  <span className="text-sm font-semibold text-slate-900">
                    {selectedDate.toLocaleDateString(
                      "pt-BR",
                    )}
                  </span>
                </div>

                <div className="border-t border-slate-200" />

                {/* HORÁRIO */}
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm text-slate-500">
                    Horário
                  </span>

                  <span className="text-sm font-semibold text-slate-900">
                    {
                      bookingToConfirm.time
                    }
                  </span>
                </div>

                <div className="border-t border-slate-200" />

                {/* PROFISSIONAL */}
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm text-slate-500">
                    Profissional
                  </span>

                  <span className="text-sm font-semibold text-slate-900">
                    Prof.{" "}
                    {
                      bookingToConfirm.instructor
                    }
                  </span>
                </div>
              </div>

              {/* SESSÃO DO PACOTE */}
              <div className="mt-4 flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />

                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    Este agendamento utilizará 1 sessão do seu pacote
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Você possui{" "}
                    {
                      student.sessionsRemaining
                    }{" "}
                    {student.sessionsRemaining ===
                    1
                      ? "sessão disponível."
                      : "sessões disponíveis."}
                  </p>
                </div>
              </div>
            </div>

            {/* BOTÕES */}
            <div className="flex gap-3 border-t border-slate-100 p-6">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() =>
                  setBookingToConfirm(
                    null,
                  )
                }
              >
                Cancelar
              </Button>

              <Button
                type="button"
                className="flex-1"
                onClick={
                  confirmBooking
                }
              >
                Confirmar agendamento
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CONFIRMAR CANCELAMENTO */}
      {bookingToCancel && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-[2px]"
          onMouseDown={(
            event,
          ) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              setBookingToCancel(
                null,
              );
            }
          }}
        >
          <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
            {/* CABEÇALHO */}
            <div className="flex items-start justify-between border-b border-slate-100 p-6">
              <div>
                <h2 className="text-xl font-bold text-slate-950">
                  Cancelar aula?
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  Tem certeza de que deseja desmarcar
                  este atendimento?
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setBookingToCancel(
                    null,
                  )
                }
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                aria-label="Fechar"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* DADOS */}
            <div className="p-6">
              <div className="space-y-4 rounded-xl bg-slate-50 p-5">
                {/* DATA */}
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm text-slate-500">
                    Data
                  </span>

                  <span className="text-sm font-semibold text-slate-900">
                    {new Date(
                      `${bookingToCancel.date}T00:00:00`,
                    ).toLocaleDateString(
                      "pt-BR",
                    )}
                  </span>
                </div>

                <div className="border-t border-slate-200" />

                {/* HORÁRIO */}
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm text-slate-500">
                    Horário
                  </span>

                  <span className="text-sm font-semibold text-slate-900">
                    {
                      bookingToCancel.time
                    }
                  </span>
                </div>

                <div className="border-t border-slate-200" />

                {/* PROFISSIONAL */}
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm text-slate-500">
                    Profissional
                  </span>

                  <span className="text-sm font-semibold text-slate-900">
                    Prof.{" "}
                    {
                      bookingToCancel.instructor
                    }
                  </span>
                </div>
              </div>

              {/* REGRA DE CANCELAMENTO */}
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4">
                <p className="text-sm font-semibold text-red-900">
                  Atenção ao cancelamento
                </p>

                <p className="mt-1 text-xs leading-5 text-red-700">
                  Cancelamentos realizados com pelo
                  menos 6 horas de antecedência
                  devolvem a sessão ao seu pacote.
                </p>
              </div>
            </div>

            {/* BOTÕES */}
            <div className="grid grid-cols-2 gap-3 border-t border-slate-100 p-6">
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
                variant="destructive"
                onClick={
                  confirmCancel
                }
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