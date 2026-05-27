import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Booking,
  INSTRUCTORS,
  MAX_PER_SLOT,
  Student,
  TIME_SLOTS,
  fmtDate,
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
import { toast, Toaster } from "sonner";
import {
  CalendarDays,
  LogOut,
  Coins,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export const Route = createFileRoute("/")({ component: Index });

const WEEKDAYS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

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

function Login({ onLogin }: { onLogin: (s: Student) => void }) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

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
          body: JSON.stringify({
            nome: name,
            email,
            senha: password,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Erro ao conectar com o servidor");
      }

      const data = await response.json();

      const studentData: Student = {
        id: String(data.id),
        name: data.nome || name,
        email: data.email || email,
        credits: 8,
      };

      setSession(studentData);
      onLogin(studentData);

      toast.success(
        mode === "signup"
          ? "Conta criada com sucesso!"
          : "Login realizado com sucesso!"
      );
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Erro ao conectar"
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-accent/40 via-background to-secondary">
      <Card className="w-full max-w-md p-8 shadow-xl">
        <div className="flex flex-col items-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-3">
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
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome"
                maxLength={80}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="voce@email.com"
              maxLength={120}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              maxLength={64}
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
  onUpdate: (s: Student) => void;
}) {
  const [weekOffset, setWeekOffset] = useState(0);
  const [bookings, setBookings] = useState<Booking[]>(getBookings());
  const week = useMemo(() => getWeekDates(weekOffset), [weekOffset]);

  const refresh = () => setBookings(getBookings());

  const myBookings = bookings.filter((b) => b.studentId === student.id);

  const book = (date: string, time: string, instructor: string) => {
    if (student.credits <= 0)
      return toast.error("Você não tem créditos suficientes.");

    const all = getBookings();

    if (
      all.some(
        (b) =>
          b.date === date &&
          b.time === time &&
          b.instructor === instructor &&
          b.studentId === student.id
      )
    )
      return toast.error("Você já está agendado nesta aula.");

    if (
      all.filter(
        (b) =>
          b.date === date &&
          b.time === time &&
          b.instructor === instructor
      ).length >= MAX_PER_SLOT
    )
      return toast.error("Turma cheia (3 alunos).");

    if (all.some((b) => b.date === date && b.studentId === student.id))
      return toast.error("Você já tem um agendamento neste dia.");

    const newBooking: Booking = {
      id: crypto.randomUUID(),
      studentId: student.id,
      studentName: student.name,
      date,
      time,
      instructor,
    };

    saveBookings([...all, newBooking]);

    const updated = { ...student, credits: student.credits - 1 };
    updateStudent(updated);
    onUpdate(updated);
    refresh();

    toast.success("Aula agendada!");
  };

  const cancel = (b: Booking) => {
    const all = getBookings().filter((x) => x.id !== b.id);
    saveBookings(all);

    const slotTime = new Date(`${b.date}T${b.time}:00`);
    const diffH = (slotTime.getTime() - Date.now()) / 36e5;

    if (diffH >= 6) {
      const updated = { ...student, credits: student.credits + 1 };
      updateStudent(updated);
      onUpdate(updated);
      toast.success("Aula desmarcada. Crédito de reposição liberado.");
    } else {
      toast.warning("Aula desmarcada. Sem reposição (menos de 6h).");
    }

    refresh();
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8">
      <header className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
            <CalendarDays className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold leading-tight">Studio Pilates</h1>
            <p className="text-sm text-muted-foreground">
              Olá, {student.name}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent">
            <Coins className="w-4 h-4 text-accent-foreground" />
            <span className="font-semibold text-accent-foreground">
              {student.credits} créditos
            </span>
          </div>

          <Button variant="outline" size="sm" onClick={onLogout}>
            <LogOut className="w-4 h-4 mr-1" /> Sair
          </Button>
        </div>
      </header>

      {myBookings.length > 0 && (
        <Card className="p-4 mb-6">
          <h2 className="font-semibold mb-3">Minhas próximas aulas</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {myBookings
              .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time))
              .map((b) => (
                <div
                  key={b.id}
                  className="flex items-center justify-between p-3 rounded-lg border bg-secondary/40"
                >
                  <div className="text-sm">
                    <div className="font-medium">
                      {new Date(b.date + "T00:00").toLocaleDateString("pt-BR", {
                        weekday: "short",
                        day: "2-digit",
                        month: "2-digit",
                      })}{" "}
                      • {b.time}
                    </div>
                    <div className="text-muted-foreground text-xs">
                      Instrutor(a) {b.instructor}
                    </div>
                  </div>

                  <Button size="sm" variant="ghost" onClick={() => cancel(b)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
          </div>
        </Card>
      )}

      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">Agenda da semana</h2>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setWeekOffset((w) => w - 1)}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>

            <span className="text-sm text-muted-foreground min-w-[120px] text-center">
              {week[0].toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "short",
              })}{" "}
              —{" "}
              {week[5].toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "short",
              })}
            </span>

            <Button
              size="sm"
              variant="outline"
              onClick={() => setWeekOffset((w) => w + 1)}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[720px] grid grid-cols-[80px_repeat(6,1fr)] gap-1">
            <div />

            {week.map((d, i) => (
              <div key={i} className="text-center py-2">
                <div className="text-xs text-muted-foreground uppercase">
                  {WEEKDAYS[i]}
                </div>
                <div className="font-semibold">
                  {d.getDate().toString().padStart(2, "0")}
                </div>
              </div>
            ))}

            {TIME_SLOTS.map((time) => (
              <FragmentRow key={time}>
                <div className="flex items-center justify-end pr-2 text-sm text-muted-foreground">
                  {time}
                </div>

                {week.map((d, i) => {
                  const date = fmtDate(d);
                  const isPast =
                    new Date(`${date}T${time}:00`).getTime() < Date.now();

                  return (
                    <div
                      key={time + i}
                      className="space-y-1 p-1 rounded-md bg-muted/40 min-h-[72px]"
                    >
                      {INSTRUCTORS.map((inst) => {
                        const slotBookings = bookings.filter(
                          (b) =>
                            b.date === date &&
                            b.time === time &&
                            b.instructor === inst
                        );

                        const mine = slotBookings.some(
                          (b) => b.studentId === student.id
                        );

                        const full = slotBookings.length >= MAX_PER_SLOT;

                        return (
                          <button
                            key={inst}
                            disabled={isPast || (full && !mine)}
                            onClick={() => {
                              if (mine) {
                                const b = slotBookings.find(
                                  (x) => x.studentId === student.id
                                )!;
                                cancel(b);
                              } else {
                                book(date, time, inst);
                              }
                            }}
                            className={
                              "w-full text-[10px] leading-tight rounded px-1.5 py-1 transition border " +
                              (mine
                                ? "bg-success text-success-foreground border-success"
                                : full
                                  ? "bg-destructive/10 text-destructive border-destructive/20 cursor-not-allowed"
                                  : isPast
                                    ? "opacity-40 cursor-not-allowed bg-background"
                                    : "bg-background hover:bg-primary hover:text-primary-foreground border-border")
                            }
                          >
                            <div className="flex items-center justify-between gap-1">
                              <span className="font-medium">{inst}</span>
                              <span className="flex items-center gap-0.5">
                                {mine && <Check className="w-3 h-3" />}
                                {slotBookings.length}/{MAX_PER_SLOT}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  );
                })}
              </FragmentRow>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mt-4 text-xs text-muted-foreground">
          <Legend color="bg-background border" label="Disponível" />
          <Legend color="bg-success" label="Você está agendado" />
          <Legend color="bg-destructive/20" label="Turma cheia" />
        </div>
      </Card>

      <p className="text-xs text-muted-foreground text-center mt-6">
        Máximo 3 alunos por turma · Desmarcar com 6h+ devolve crédito · 1 aula
        por dia
      </p>
    </div>
  );
}

function FragmentRow({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`inline-block w-3 h-3 rounded ${color}`} />
      <span>{label}</span>
    </div>
  );
}