import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";

import {
  Booking,
  MAX_PER_SLOT,
  Student,
  getBookings,
  getSession,
  getWeekDates,
  saveBookings,
  setSession,
  updateStudent,
} from "@/lib/clinic-store";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { SummaryCards } from "@/components/dashboard/SummaryCards";
import { UpcomingBookings } from "@/components/dashboard/UpcomingBookings";
import { WeeklySchedule } from "@/components/dashboard/WeeklySchedule";

import { toast, Toaster } from "sonner";

import { CalendarDays } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index,
});


function Index() {
  const [student, setStudent] = useState<Student | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setStudent(getSession());
    setReady(true);
  }, []);

  if (!ready) return null;

  return (
    <div className="min-h-screen bg-background">
      <Toaster richColors position="top-center" />

      {student ? (
        <Dashboard
          student={student}
          onLogout={() => {
            setSession(null);
            setStudent(null);
          }}
          onUpdate={setStudent}
        />
      ) : (
        <Login onLogin={setStudent} />
      )}
    </div>
  );
}

function Login({ onLogin }: { onLogin: (student: Student) => void }) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      const response = await fetch(
        mode === "signup"
          ? "http://localhost:8080/auth/register"
          : "http://localhost:8080/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(
            mode === "signup"
              ? {
                  nome: name,
                  email,
                  senha: password,
                }
              : {
                  email,
                  senha: password,
                },
          ),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();

        throw new Error(
          errorData.erro ||
            (mode === "signup"
              ? "Não foi possível criar a conta."
              : "Email ou senha inválidos."),
        );
      }

      const data = await response.json();

      const studentData: Student = {
        id: String(data.id),
        name: data.nome || name,
        email: data.email || email,
        credits: 8,
        password: "",
      };

      setSession(studentData);
      onLogin(studentData);

      toast.success(
        mode === "signup"
          ? "Conta criada com sucesso!"
          : "Login realizado com sucesso!",
      );
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erro ao conectar.",
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-accent/40 via-background to-secondary">
      <Card className="w-full max-w-md p-8 shadow-xl">
        <div className="flex flex-col items-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-primary/15 flex items-center justify-center mb-3">
            <CalendarDays className="w-7 h-7 text-primary" />
          </div>

          <h1 className="text-2xl font-bold">Studio Pilates</h1>

          <p className="text-sm text-muted-foreground">
            Autoatendimento do aluno
          </p>
        </div>

        <div className="grid grid-cols-2 gap-1 p-1 bg-muted rounded-lg mb-6">
          <button
            type="button"
            onClick={() => setMode("login")}
            className={`py-2 text-sm font-medium rounded-md transition ${
              mode === "login"
                ? "bg-background shadow-sm"
                : "text-muted-foreground"
            }`}
          >
            Entrar
          </button>

          <button
            type="button"
            onClick={() => setMode("signup")}
            className={`py-2 text-sm font-medium rounded-md transition ${
              mode === "signup"
                ? "bg-background shadow-sm"
                : "text-muted-foreground"
            }`}
          >
            Cadastrar
          </button>
        </div>

        <form className="space-y-4" onSubmit={submit}>
          {mode === "signup" && (
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>

              <Input
                id="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Seu nome"
                maxLength={80}
                required
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>

            <Input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="voce@email.com"
              maxLength={120}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>

            <Input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
              maxLength={64}
              required
            />
          </div>

          <Button type="submit" className="w-full">
            {mode === "signup" ? "Criar conta" : "Entrar"}
          </Button>

          {mode === "signup" && (
            <p className="text-xs text-muted-foreground text-center">
              Novos alunos ganham 8 créditos de boas-vindas.
            </p>
          )}
        </form>
      </Card>
    </div>
  );
}

function Dashboard({
  student,
  onLogout,
  onUpdate,
}: {
  student: Student;
  onLogout: () => void;
  onUpdate: (student: Student) => void;
}) {
  const [weekOffset, setWeekOffset] = useState(0);
  const [bookings, setBookings] = useState<Booking[]>(getBookings());

  const week = useMemo(() => getWeekDates(weekOffset), [weekOffset]);

  const refresh = () => {
    setBookings(getBookings());
  };

  const myBookings = bookings.filter(
    (booking) => booking.studentId === student.id,
  );

  const orderedMyBookings = [...myBookings].sort((bookingA, bookingB) =>
    `${bookingA.date}T${bookingA.time}`.localeCompare(
      `${bookingB.date}T${bookingB.time}`,
    ),
  );

  const nextBooking = orderedMyBookings.find((booking) => {
    const bookingDate = new Date(
      `${booking.date}T${booking.time}:00`,
    ).getTime();

    return bookingDate >= Date.now();
  });

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const classesThisMonth = myBookings.filter((booking) => {
    const bookingDate = new Date(`${booking.date}T00:00:00`);

    return (
      bookingDate.getMonth() === currentMonth &&
      bookingDate.getFullYear() === currentYear
    );
  }).length;

  const monthlyGoal = 16;

  const goalProgress = Math.min(
    Math.round((classesThisMonth / monthlyGoal) * 100),
    100,
  );

  const book = (date: string, time: string, instructor: string) => {
    if (student.credits <= 0) {
      toast.error("Você não tem créditos suficientes.");
      return;
    }

    const allBookings = getBookings();

    const alreadyBookedInClass = allBookings.some(
      (booking) =>
        booking.date === date &&
        booking.time === time &&
        booking.instructor === instructor &&
        booking.studentId === student.id,
    );

    if (alreadyBookedInClass) {
      toast.error("Você já está agendado nesta aula.");
      return;
    }

    const classBookings = allBookings.filter(
      (booking) =>
        booking.date === date &&
        booking.time === time &&
        booking.instructor === instructor,
    );

    if (classBookings.length >= MAX_PER_SLOT) {
      toast.error("Turma cheia (3 alunos).");
      return;
    }

    const alreadyBookedOnDay = allBookings.some(
      (booking) =>
        booking.date === date && booking.studentId === student.id,
    );

    if (alreadyBookedOnDay) {
      toast.error("Você já tem um agendamento neste dia.");
      return;
    }

    const newBooking: Booking = {
      id: crypto.randomUUID(),
      studentId: student.id,
      studentName: student.name,
      date,
      time,
      instructor,
    };

    saveBookings([...allBookings, newBooking]);

    const updatedStudent = {
      ...student,
      credits: student.credits - 1,
    };

    updateStudent(updatedStudent);
    onUpdate(updatedStudent);
    refresh();

    toast.success("Aula agendada!");
  };

  const cancel = (booking: Booking) => {
    const updatedBookings = getBookings().filter(
      (currentBooking) => currentBooking.id !== booking.id,
    );

    saveBookings(updatedBookings);

    const classDate = new Date(
      `${booking.date}T${booking.time}:00`,
    );

    const differenceInHours =
      (classDate.getTime() - Date.now()) / 36e5;

    if (differenceInHours >= 6) {
      const updatedStudent = {
        ...student,
        credits: student.credits + 1,
      };

      updateStudent(updatedStudent);
      onUpdate(updatedStudent);

      toast.success(
        "Aula desmarcada. Crédito de reposição liberado.",
      );
    } else {
      toast.warning(
        "Aula desmarcada. Sem reposição porque faltam menos de 6 horas.",
      );
    }

    refresh();
  };

  return (
    <main className="max-w-7xl mx-auto p-4 md:p-8">
      <DashboardHeader
        student={student}
        onLogout={onLogout}
      />

      <SummaryCards
        student={student}
        nextBooking={nextBooking}
        classesThisMonth={classesThisMonth}
        monthlyGoal={monthlyGoal}
        goalProgress={goalProgress}
      />

      <UpcomingBookings
        bookings={orderedMyBookings}
        onCancel={cancel}
      />

      <WeeklySchedule
        student={student}
        week={week}
        bookings={bookings}
        onPreviousWeek={() =>
          setWeekOffset((currentOffset) => currentOffset - 1)
        }
        onNextWeek={() =>
          setWeekOffset((currentOffset) => currentOffset + 1)
        }
        onBook={book}
        onCancel={cancel}
      />

      <p className="text-xs text-muted-foreground text-center mt-6">
        Máximo de 3 alunos por turma · Desmarcar com 6 horas ou mais
        devolve o crédito · Limite de 1 aula por dia
      </p>
    </main>
  );
}