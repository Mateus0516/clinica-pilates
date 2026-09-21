import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useNavigate } from "@tanstack/react-router";

import {
  Booking,
  MAX_PER_SLOT,
  Student,
  getBookings,
  getWeekDates,
  saveBookings,
  updateStudent,
} from "@/lib/clinic-store";

import {
  addBookingNotificationOnce,
  addNotification,
} from "@/lib/notification-store";

import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { SummaryCards } from "@/components/dashboard/SummaryCards";
import { UpcomingBookings } from "@/components/dashboard/UpcomingBookings";
import { WeeklySchedule } from "@/components/dashboard/WeeklySchedule";
import { Sidebar } from "@/components/layout/Sidebar";

import { toast } from "sonner";

type StudentDashboardProps = {
  student: Student;
  onLogout: () => void;
  onUpdate: (student: Student) => void;
};

export function StudentDashboard({
  student,
  onLogout,
  onUpdate,
}: StudentDashboardProps) {
  const navigate = useNavigate();

  const [
    weekOffset,
    setWeekOffset,
  ] = useState(0);

  const [
    sidebarCollapsed,
    setSidebarCollapsed,
  ] = useState(false);

  const [
    bookings,
    setBookings,
  ] = useState<Booking[]>(
    getBookings(),
  );

  const week = useMemo(
    () => getWeekDates(weekOffset),
    [weekOffset],
  );

  const refresh = () => {
    setBookings(
      getBookings(),
    );
  };

  const myBookings =
    bookings.filter(
      (booking) =>
        booking.studentId ===
        student.id,
    );

  const orderedMyBookings = [
    ...myBookings,
  ].sort(
    (bookingA, bookingB) =>
      `${bookingA.date}T${bookingA.time}`.localeCompare(
        `${bookingB.date}T${bookingB.time}`,
      ),
  );

  const nextBooking =
    orderedMyBookings.find(
      (booking) => {
        const bookingDate =
          new Date(
            `${booking.date}T${booking.time}:00`,
          ).getTime();

        return (
          bookingDate >=
          Date.now()
        );
      },
    );

  /*
   * LEMBRETE DA PRÓXIMA AULA
   *
   * Se a próxima aula estiver dentro
   * das próximas 24 horas, criamos
   * uma notificação.
   *
   * addBookingNotificationOnce()
   * impede que a mesma aula gere
   * vários lembretes.
   */
  useEffect(() => {
    if (!nextBooking) {
      return;
    }

    const classDate =
      new Date(
        `${nextBooking.date}T${nextBooking.time}:00`,
      );

    const differenceInHours =
      (classDate.getTime() -
        Date.now()) /
      36e5;

    if (
      differenceInHours < 0 ||
      differenceInHours > 24
    ) {
      return;
    }

    const formattedDate =
      new Date(
        `${nextBooking.date}T00:00:00`,
      ).toLocaleDateString(
        "pt-BR",
      );

    addBookingNotificationOnce({
      studentId:
        student.id,
      bookingId:
        nextBooking.id,
      title:
        "Próxima aula",
      description: `Você tem uma aula com Prof. ${nextBooking.instructor} no dia ${formattedDate} às ${nextBooking.time}.`,
      time: "Agora",
      type: "aula",
    });
  }, [
    nextBooking?.id,
    student.id,
  ]);

  const currentDate =
    new Date();

  const currentMonth =
    currentDate.getMonth();

  const currentYear =
    currentDate.getFullYear();

  const classesThisMonth =
    myBookings.filter(
      (booking) => {
        const bookingDate =
          new Date(
            `${booking.date}T00:00:00`,
          );

        return (
          bookingDate.getMonth() ===
            currentMonth &&
          bookingDate.getFullYear() ===
            currentYear
        );
      },
    ).length;

  /*
   * Meta temporária do frontend.
   *
   * Depois poderá vir do pacote
   * configurado pela clínica.
   */
  const monthlyGoal = 16;

  const goalProgress =
    Math.min(
      Math.round(
        (classesThisMonth /
          monthlyGoal) *
          100,
      ),
      100,
    );

  /*
   * AGENDAR AULA
   */
  const book = (
    date: string,
    time: string,
    instructor: string,
  ) => {
    /*
     * Se o paciente estiver usando
     * um pacote, precisa ter pelo
     * menos uma sessão disponível.
     */
    if (
      student.sessionsRemaining <= 0
    ) {
      toast.error(
        "Você não possui sessões disponíveis no seu pacote.",
      );

      return;
    }

    const allBookings =
      getBookings();

    const alreadyBookedInClass =
      allBookings.some(
        (booking) =>
          booking.date === date &&
          booking.time === time &&
          booking.instructor ===
            instructor &&
          booking.studentId ===
            student.id,
      );

    if (
      alreadyBookedInClass
    ) {
      toast.error(
        "Você já está agendado nesta aula.",
      );

      return;
    }

    const classBookings =
      allBookings.filter(
        (booking) =>
          booking.date === date &&
          booking.time === time &&
          booking.instructor ===
            instructor,
      );

    if (
      classBookings.length >=
      MAX_PER_SLOT
    ) {
      toast.error(
        "Turma cheia (3 alunos).",
      );

      return;
    }

    const alreadyBookedOnDay =
      allBookings.some(
        (booking) =>
          booking.date === date &&
          booking.studentId ===
            student.id,
      );

    if (
      alreadyBookedOnDay
    ) {
      toast.error(
        "Você já tem um agendamento neste dia.",
      );

      return;
    }

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

    saveBookings([
      ...allBookings,
      newBooking,
    ]);

    /*
     * Ao agendar uma aula,
     * uma sessão é consumida
     * do pacote atual.
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

    onUpdate(
      updatedStudent,
    );

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

    refresh();

    toast.success(
      "Aula agendada!",
    );
  };

  /*
   * CANCELAR AULA
   */
  const cancel = (
    booking: Booking,
  ) => {
    const updatedBookings =
      getBookings().filter(
        (currentBooking) =>
          currentBooking.id !==
          booking.id,
      );

    saveBookings(
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
     * Com pelo menos 6 horas
     * de antecedência, a sessão
     * volta para o pacote.
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

      onUpdate(
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
       * a aula é cancelada, mas
       * a sessão permanece utilizada.
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

    refresh();
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
    if (
      section === "inicio"
    ) {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
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

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar
        collapsed={
          sidebarCollapsed
        }
        onToggle={() =>
          setSidebarCollapsed(
            (current) =>
              !current,
          )
        }
        onLogout={
          onLogout
        }
        onNavigate={
          handleNavigation
        }
      />

      <main className="min-w-0 flex-1 p-4 md:p-8">
        <div className="mx-auto max-w-7xl">
          {/* INÍCIO */}
          <section
            id="inicio"
            className="scroll-mt-4"
          >
            <DashboardHeader
              student={
                student
              }
            />

            <SummaryCards
              student={
                student
              }
              nextBooking={
                nextBooking
              }
              classesThisMonth={
                classesThisMonth
              }
              monthlyGoal={
                monthlyGoal
              }
              goalProgress={
                goalProgress
              }
            />
          </section>

          {/* PRÓXIMAS AULAS */}
          <section
            id="minhas-aulas"
            className="scroll-mt-4"
          >
            <UpcomingBookings
              bookings={
                orderedMyBookings
              }
              onCancel={
                cancel
              }
            />
          </section>

          {/* AGENDA */}
          <section
            id="agenda"
            className="scroll-mt-4"
          >
            <WeeklySchedule
              student={
                student
              }
              week={week}
              bookings={
                bookings
              }
              onPreviousWeek={() =>
                setWeekOffset(
                  (
                    currentOffset,
                  ) =>
                    currentOffset -
                    1,
                )
              }
              onNextWeek={() =>
                setWeekOffset(
                  (
                    currentOffset,
                  ) =>
                    currentOffset +
                    1,
                )
              }
              onGoToToday={() =>
                setWeekOffset(0)
              }
              onBook={
                book
              }
              onCancel={
                cancel
              }
            />
          </section>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Máximo de 3 alunos por turma ·
            Cancelamentos com 6 horas ou mais
            devolvem a sessão ao pacote · Limite
            de 1 aula por dia
          </p>
        </div>
      </main>
    </div>
  );
}