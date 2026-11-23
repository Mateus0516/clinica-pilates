import { useMemo, useState } from "react";

import { useNavigate } from "@tanstack/react-router";

import type { Student } from "@/lib/clinic-store";
import {
  calendarKey,
  clinicToday,
  clinicWeek,
  useAppointmentChange,
  useAppointmentHistory,
  useAppointments,
  useSessionBalance,
  useSlots,
  type Appointment,
  type Slot,
} from "@/lib/scheduling";
import { SchedulingFeedback } from "@/components/dashboard/SchedulingFeedback";

import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { SummaryCards } from "@/components/dashboard/SummaryCards";
import { UpcomingBookings } from "@/components/dashboard/UpcomingBookings";
import { WeeklySchedule } from "@/components/dashboard/WeeklySchedule";
import { Sidebar } from "@/components/layout/Sidebar";

type StudentDashboardProps = {
  student: Student;
  onLogout: () => void;
};

export function StudentDashboard({ student, onLogout }: StudentDashboardProps) {
  const navigate = useNavigate();

  const [weekOffset, setWeekOffset] = useState(0);

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const today = clinicToday();
  const week = useMemo(() => clinicWeek(weekOffset, today), [weekOffset, today]);
  const appointments = useAppointments();
  const history = useAppointmentHistory();
  const balance = useSessionBalance();
  const slots = useSlots(calendarKey(week[0]), calendarKey(week[week.length - 1]));
  const change = useAppointmentChange();
  const bookings = appointments.data ?? [];
  const nextBooking = bookings[0];
  const sessionsRemaining = balance.data?.sessoesDisponiveis;
  const month = today.slice(0, 7);
  const classesThisMonth =
    appointments.data && history.data
      ? [
          ...new Map(
            [...appointments.data, ...history.data].map((booking) => [booking.id, booking]),
          ).values(),
        ].filter((booking) => booking.data.startsWith(month) && booking.status !== "CANCELADO")
          .length
      : undefined;

  const book = (slot: Slot) =>
    change.mutateAsync({ type: "reserve", slot }).then(
      () => true,
      () => false,
    );
  const cancel = (booking: Appointment) =>
    change.mutateAsync({ type: "cancel", id: booking.id }).then(
      () => true,
      () => false,
    );

  const handleNavigation = (
    section: "inicio" | "agenda" | "aulas" | "historico" | "perfil" | "notificacoes",
  ) => {
    if (section === "inicio") {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
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

      return;
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((current) => !current)}
        onLogout={onLogout}
        onNavigate={handleNavigation}
      />

      <main className="min-w-0 flex-1 p-4 md:p-8">
        <div className="mx-auto max-w-7xl">
          {/* INÍCIO */}
          <section id="inicio" className="scroll-mt-4">
            <DashboardHeader student={student} sessionsRemaining={sessionsRemaining} />
            <SchedulingFeedback query={balance} />
            <SchedulingFeedback query={appointments} />
            <SchedulingFeedback query={history} />
            <SummaryCards
              sessionsRemaining={sessionsRemaining}
              nextBooking={nextBooking}
              upcomingCount={appointments.data?.length}
              classesThisMonth={classesThisMonth}
            />
          </section>

          {/* PRÓXIMAS AULAS */}
          <section id="minhas-aulas" className="scroll-mt-4">
            <UpcomingBookings isPending={change.isPending} bookings={bookings} onCancel={cancel} />
          </section>

          {/* AGENDA */}
          <section id="agenda" className="scroll-mt-4">
            <SchedulingFeedback query={slots} />
            <WeeklySchedule
              sessionsRemaining={sessionsRemaining}
              week={week}
              bookings={bookings}
              slots={slots.data ?? []}
              canReserve={slots.isSuccess && appointments.isSuccess}
              isPending={change.isPending}
              onPreviousWeek={() => setWeekOffset((currentOffset) => currentOffset - 1)}
              onNextWeek={() => setWeekOffset((currentOffset) => currentOffset + 1)}
              onGoToToday={() => setWeekOffset(0)}
              onBook={book}
              onCancel={cancel}
            />
          </section>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Máximo de 3 alunos por turma · Cancelamentos com 6 horas ou mais devolvem a sessão ao
            pacote · Limite de 1 aula por dia
          </p>
        </div>
      </main>
    </div>
  );
}
