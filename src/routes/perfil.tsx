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
  Bell,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  CircleHelp,
  CalendarCheck2,
  CreditCard,
  KeyRound,
  LogOut,
  Mail,
  Phone,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import { PatientLayout } from "@/components/layout/PatientLayout";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  Student,
  getBookings,
  getSession,
  setSession,
} from "@/lib/clinic-store";

import {
  toast,
  Toaster,
} from "sonner";

export const Route = createFileRoute("/perfil")({
  component: ProfilePage,
});

type SidebarSection =
  | "inicio"
  | "agenda"
  | "aulas"
  | "historico"
  | "perfil"
  | "notificacoes";

function ProfilePage() {
  const navigate = useNavigate();

  const [student, setStudent] =
    useState<Student | null>(null);

  const [ready, setReady] =
    useState(false);

  const [name, setName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [phone, setPhone] =
    useState("");

  const [birthDate, setBirthDate] =
    useState("");

  const [address, setAddress] =
    useState("");

  const [district, setDistrict] =
    useState("");

  const [city, setCity] =
    useState("");

  const [state, setState] =
    useState("");

  const [zipCode, setZipCode] =
    useState("");

  const [emailNotifications, setEmailNotifications] =
    useState(true);

  const [whatsappNotifications, setWhatsappNotifications] =
    useState(true);

  const [pushNotifications, setPushNotifications] =
    useState(true);

  useEffect(() => {
    const currentStudent = getSession();

    if (!currentStudent) {
      navigate({
        to: "/paciente",
        replace: true,
      });

      return;
    }

    setStudent(currentStudent);
    setName(currentStudent.name);
    setEmail(currentStudent.email);

    setReady(true);
  }, [navigate]);

  const handleLogout = () => {
    setSession(null);
    setStudent(null);

    navigate({
      to: "/acesso",
      replace: true,
    });
  };

  const handleNavigation = (
  section: SidebarSection,
) => {
  if (section === "inicio") {
    navigate({
      to: "/dashboard",
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

  const myBookings = useMemo(() => {
    if (!student) {
      return [];
    }

    return getBookings().filter(
      (booking) =>
        booking.studentId === student.id,
    );
  }, [student]);

  const completedClasses =
    myBookings.filter((booking) => {
      const bookingDate =
        new Date(
          `${booking.date}T${booking.time}:00`,
        );

      return bookingDate.getTime() < Date.now();
    }).length;

  const handleSaveProfile = () => {
    if (!student) {
      return;
    }

    if (name.trim().length < 3) {
      toast.error(
        "Informe seu nome completo.",
      );

      return;
    }

    if (!email.trim()) {
      toast.error(
        "Informe seu e-mail.",
      );

      return;
    }

    const updatedStudent: Student = {
      ...student,
      name: name.trim(),
      email: email.trim(),
    };

    setSession(updatedStudent);
    setStudent(updatedStudent);

    toast.success(
      "Perfil atualizado com sucesso!",
    );
  };

  if (!ready || !student) {
    return null;
  }

  const totalSessions = 16;
  const usedSessions = Math.max(
    totalSessions - student.sessionsRemaining,
    0,
  );

  const usedPercentage = Math.min(
    (usedSessions / totalSessions) * 100,
    100,
  );

  return (
    <PatientLayout
      onLogout={handleLogout}
      onNavigate={handleNavigation}
    >
      <Toaster
        richColors
        position="top-center"
      />

      <div className="mx-auto max-w-7xl">
        {/* CABEÇALHO */}
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">
              Perfil
            </p>

            <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-950">
              Gerencie sua conta
            </h1>

            <p className="mt-3 text-slate-600">
              Atualize suas informações pessoais e preferências.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 font-semibold text-primary">
            <CalendarCheck2 className="h-5 w-5" />

            {student.sessionsRemaining}{" "}
            {student.sessionsRemaining === 1
              ? "sessão disponível"
              : "sessões disponíveis"}
          </div>
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_340px]">

          {/* ====================================== */}
          {/* COLUNA PRINCIPAL */}
          {/* ====================================== */}

          <div className="space-y-6">

            {/* PERFIL */}
            <Card className="p-6">
              <div className="flex flex-wrap items-center gap-5">
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <UserRound className="h-12 w-12" />
                </div>

                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-slate-950">
                    {student.name}
                  </h2>

                  <div className="mt-3 space-y-2 text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-primary" />

                      {student.email}
                    </div>

                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-primary" />

                      {phone || "Telefone não informado"}
                    </div>

                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary" />

                      Perfil do paciente
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* DADOS PESSOAIS */}
            <Card className="p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-950">
                    Dados pessoais
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Atualize suas informações pessoais.
                  </p>
                </div>

                <Button
                  type="button"
                  onClick={handleSaveProfile}
                >
                  Salvar alterações
                </Button>
              </div>

              <div className="mt-6 grid gap-5 md:grid-cols-2">

                {/* NOME */}
                <div className="space-y-2">
                  <Label htmlFor="profile-name">
                    Nome completo
                  </Label>

                  <Input
                    id="profile-name"
                    value={name}
                    onChange={(event) =>
                      setName(event.target.value)
                    }
                  />
                </div>

                {/* DATA NASCIMENTO */}
                <div className="space-y-2">
                  <Label htmlFor="profile-birth">
                    Data de nascimento
                  </Label>

                  <Input
                    id="profile-birth"
                    type="date"
                    value={birthDate}
                    onChange={(event) =>
                      setBirthDate(event.target.value)
                    }
                  />
                </div>

                {/* EMAIL */}
                <div className="space-y-2">
                  <Label htmlFor="profile-email">
                    E-mail
                  </Label>

                  <Input
                    id="profile-email"
                    type="email"
                    value={email}
                    onChange={(event) =>
                      setEmail(event.target.value)
                    }
                  />
                </div>

                {/* TELEFONE */}
                <div className="space-y-2">
                  <Label htmlFor="profile-phone">
                    Telefone
                  </Label>

                  <Input
                    id="profile-phone"
                    type="tel"
                    value={phone}
                    onChange={(event) =>
                      setPhone(event.target.value)
                    }
                    placeholder="(61) 99999-9999"
                  />
                </div>

                {/* ENDEREÇO */}
                <div className="space-y-2">
                  <Label htmlFor="profile-address">
                    Endereço
                  </Label>

                  <Input
                    id="profile-address"
                    value={address}
                    onChange={(event) =>
                      setAddress(event.target.value)
                    }
                    placeholder="Rua, número, complemento"
                  />
                </div>

                {/* BAIRRO */}
                <div className="space-y-2">
                  <Label htmlFor="profile-district">
                    Bairro
                  </Label>

                  <Input
                    id="profile-district"
                    value={district}
                    onChange={(event) =>
                      setDistrict(event.target.value)
                    }
                  />
                </div>

                {/* CIDADE */}
                <div className="space-y-2">
                  <Label htmlFor="profile-city">
                    Cidade
                  </Label>

                  <Input
                    id="profile-city"
                    value={city}
                    onChange={(event) =>
                      setCity(event.target.value)
                    }
                  />
                </div>

                {/* ESTADO + CEP */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="profile-state">
                      Estado
                    </Label>

                    <Input
                      id="profile-state"
                      value={state}
                      onChange={(event) =>
                        setState(event.target.value)
                      }
                      placeholder="DF"
                      maxLength={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="profile-zip">
                      CEP
                    </Label>

                    <Input
                      id="profile-zip"
                      value={zipCode}
                      onChange={(event) =>
                        setZipCode(event.target.value)
                      }
                      placeholder="00000-000"
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* SEGURANÇA */}
            <Card className="p-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-950">
                    Segurança
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Gerencie sua senha e segurança da conta.
                  </p>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    toast.info(
                      "Alteração de senha será conectada ao backend em seguida.",
                    )
                  }
                >
                  <KeyRound className="mr-2 h-4 w-4" />
                  Alterar senha
                </Button>
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-4 rounded-xl border border-emerald-100 bg-emerald-50/50 p-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-emerald-600">
                  <ShieldCheck className="h-6 w-6" />
                </div>

                <div className="flex-1">
                  <p className="font-semibold text-slate-950">
                    Sua conta está protegida
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    Sua senha é armazenada de forma criptografada.
                  </p>
                </div>

                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                  Segura
                </span>
              </div>
            </Card>

            {/* PREFERÊNCIAS */}
            <Card className="p-6">
              <h2 className="text-xl font-bold text-slate-950">
                Preferências de comunicação
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Escolha como deseja receber nossas comunicações.
              </p>

              <div className="mt-5 divide-y divide-slate-100">
                <PreferenceRow
                  icon={Mail}
                  title="E-mails"
                  description="Receber novidades e informações por e-mail"
                  enabled={emailNotifications}
                  onChange={() =>
                    setEmailNotifications(
                      (current) => !current,
                    )
                  }
                />

                <PreferenceRow
                  icon={Phone}
                  title="WhatsApp"
                  description="Receber lembretes e avisos por WhatsApp"
                  enabled={whatsappNotifications}
                  onChange={() =>
                    setWhatsappNotifications(
                      (current) => !current,
                    )
                  }
                />

                <PreferenceRow
                  icon={Bell}
                  title="Notificações push"
                  description="Receber notificações no aplicativo"
                  enabled={pushNotifications}
                  onChange={() =>
                    setPushNotifications(
                      (current) => !current,
                    )
                  }
                />
              </div>
            </Card>
          </div>

          {/* ====================================== */}
          {/* COLUNA LATERAL - PROTÓTIPO ORIGINAL */}
          {/* ====================================== */}

          <div className="space-y-6">

            {/* SEU PLANO */}
            <Card className="p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <CalendarCheck2 className="h-5 w-5" />
                </div>

                <h2 className="text-lg font-bold text-slate-950">
                  Seu plano
                </h2>
              </div>

              <div className="mt-6">
                <p className="font-bold text-slate-950">
                  Plano Mensal
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Próxima renovação: 10/09/2026
                </p>
              </div>

              <div className="my-6 border-t border-slate-100" />

              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <CalendarCheck2 className="h-8 w-8" />
                </div>

                <div>
                  <p className="text-sm text-slate-500">
                    Sessões disponíveis
                  </p>

                  <p className="mt-1 text-2xl font-bold text-slate-950">
                    {student.sessionsRemaining}{" "}
                    {student.sessionsRemaining === 1
                      ? "sessão"
                      : "sessões"}
                  </p>
                </div>
              </div>

              <div className="mt-6 h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{
                    width: `${usedPercentage}%`,
                  }}
                />
              </div>

              <p className="mt-3 text-sm text-slate-500">
                {usedSessions} de {totalSessions} sessões utilizadas
              </p>

              <button
                type="button"
                onClick={() =>
                  toast.info(
                    "Detalhes do plano serão implementados em seguida.",
                  )
                }
                className="mt-6 flex w-full items-center justify-between border-t border-slate-100 pt-5 text-sm font-semibold text-primary transition hover:opacity-80"
              >
                Ver detalhes do plano

                <ChevronRight className="h-5 w-5" />
              </button>
            </Card>

            {/* RESUMO DE ATIVIDADES */}
            <Card className="p-6">
              <h2 className="text-lg font-bold text-slate-950">
                Resumo de atividades
              </h2>

              <div className="mt-6 space-y-5">
                <div className="flex items-center gap-3">
                  <CalendarDays className="h-5 w-5 shrink-0 text-slate-500" />

                  <span className="flex-1 text-sm text-slate-600">
                    Aulas realizadas
                  </span>

                  <span className="font-bold text-slate-950">
                    {completedClasses}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-slate-500" />

                  <span className="flex-1 text-sm text-slate-600">
                    Taxa de presença
                  </span>

                  <span className="font-bold text-slate-950">
                    {completedClasses > 0
                      ? "100%"
                      : "—"}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <CalendarDays className="h-5 w-5 shrink-0 text-slate-500" />

                  <span className="flex-1 text-sm text-slate-600">
                    Sequência atual
                  </span>

                  <span className="font-bold text-slate-950">
                    {completedClasses} aulas
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <CalendarDays className="h-5 w-5 shrink-0 text-slate-500" />

                  <span className="flex-1 text-sm text-slate-600">
                    Membro desde
                  </span>

                  <span className="font-bold text-slate-950">
                    Ago 2026
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  navigate({
                    to: "/historico",
                  })
                }
                className="mt-6 flex w-full items-center justify-between border-t border-slate-100 pt-5 text-sm font-semibold text-primary transition hover:opacity-80"
              >
                Ver histórico completo

                <ChevronRight className="h-5 w-5" />
              </button>
            </Card>

            {/* AÇÕES RÁPIDAS */}
            <Card className="p-6">
              <h2 className="text-lg font-bold text-slate-950">
                Ações rápidas
              </h2>

              <div className="mt-5 space-y-1">

                {/* PAGAMENTOS */}
                <button
                  type="button"
                  onClick={() =>
                    toast.info(
                      "Gerenciamento de pagamentos será implementado em seguida.",
                    )
                  }
                  className="flex w-full items-center gap-3 rounded-lg px-2 py-3 text-left text-sm text-slate-600 transition hover:bg-slate-50 hover:text-primary"
                >
                  <CreditCard className="h-5 w-5 shrink-0" />

                  <span className="flex-1">
                    Gerenciar pagamentos
                  </span>

                  <ChevronRight className="h-5 w-5" />
                </button>

                {/* PLANOS */}
                <button
                  type="button"
                  onClick={() =>
                    toast.info(
                      "Meus planos será implementado em seguida.",
                    )
                  }
                  className="flex w-full items-center gap-3 rounded-lg px-2 py-3 text-left text-sm text-slate-600 transition hover:bg-slate-50 hover:text-primary"
                >
                  <UserRound className="h-5 w-5 shrink-0" />

                  <span className="flex-1">
                    Meus planos
                  </span>

                  <ChevronRight className="h-5 w-5" />
                </button>

                {/* AJUDA */}
                <button
                  type="button"
                  onClick={() =>
                    toast.info(
                      "Central de ajuda será implementada em seguida.",
                    )
                  }
                  className="flex w-full items-center gap-3 rounded-lg px-2 py-3 text-left text-sm text-slate-600 transition hover:bg-slate-50 hover:text-primary"
                >
                  <CircleHelp className="h-5 w-5 shrink-0" />

                  <span className="flex-1">
                    Central de ajuda
                  </span>

                  <ChevronRight className="h-5 w-5" />
                </button>

                {/* SAIR */}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 rounded-lg px-2 py-3 text-left text-sm text-slate-600 transition hover:bg-red-50 hover:text-red-600"
                >
                  <LogOut className="h-5 w-5 shrink-0" />

                  <span className="flex-1">
                    Sair da conta
                  </span>

                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </PatientLayout>
  );
}

function PreferenceRow({
  icon: Icon,
  title,
  description,
  enabled,
  onChange,
}: {
  icon: typeof Mail;
  title: string;
  description: string;
  enabled: boolean;
  onChange: () => void;
}) {
  return (
    <div className="flex items-center gap-4 py-4">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Icon className="h-5 w-5" />
      </div>

      <div className="flex-1">
        <p className="font-semibold text-slate-950">
          {title}
        </p>

        <p className="mt-1 text-xs text-slate-500">
          {description}
        </p>
      </div>

      <button
        type="button"
        onClick={onChange}
        className={`relative h-6 w-11 rounded-full transition ${
          enabled
            ? "bg-primary"
            : "bg-slate-200"
        }`}
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow transition ${
            enabled
              ? "left-6"
              : "left-1"
          }`}
        />
      </button>
    </div>
  );
}