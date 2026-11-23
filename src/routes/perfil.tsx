import { displayDate, planProgress, useContracts } from "@/lib/plans";
import { changePatientPassword, getPatient, logout, requirePatient, updatePatient, updateCommunicationPreferences, type CommunicationPreferences } from "@/lib/auth";
import {
  createFileRoute,
  useNavigate,
} from "@tanstack/react-router";

import {
  type FormEvent,
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

import { ApiError } from "@/lib/api";
import { clinicToday, useAppointmentHistory, useSessionBalance } from "@/lib/scheduling";
import { SchedulingFeedback } from "@/components/dashboard/SchedulingFeedback";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

import {
  toast,
  Toaster,
} from "sonner";

export const Route = createFileRoute("/perfil")({
  ssr: false,
  beforeLoad: requirePatient,
  component: ProfilePage,
});

type SidebarSection =
  | "inicio"
  | "agenda"
  | "aulas"
  | "historico"
  | "perfil"
  | "notificacoes";

function profileError(error: unknown) {
  if (error instanceof ApiError) {
    if (error.status === 401) return "Sua sessão expirou. Entre novamente.";
    if (error.status === 403) return "Acesso exclusivo para pacientes.";
    if (error.status === 400 || error.status === 409) return error.detail ?? "Confira os dados informados.";
  }
  return "Não foi possível concluir a operação. Tente novamente.";
}

function ProfilePage() {
  const navigate = useNavigate();

  const [student, setStudent] = useState(getPatient);
  const [name, setName] = useState(student?.nome ?? "");
  const [email, setEmail] = useState(student?.email ?? "");
  const [phone, setPhone] = useState(student?.telefone ?? "");
  const [birthDate, setBirthDate] = useState(student?.dataNascimento ?? "");
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const balance = useSessionBalance();
  const contracts = useContracts();
  const currentPlan = contracts.data?.atual;
  const { used: usedPlanSessions, percentage: planPercentage } = planProgress(currentPlan);
  const history = useAppointmentHistory();
  const sessionsRemaining = balance.data?.sessoesDisponiveis;
  const completedClasses = history.data?.filter((booking) => booking.status === "ENCERRADO").length;

  const [address, setAddress] = useState(student?.endereco?.logradouro ?? "");
  const [district, setDistrict] = useState(student?.endereco?.bairro ?? "");
  const [city, setCity] = useState(student?.endereco?.cidade ?? "");
  const [state, setState] = useState(student?.endereco?.estado ?? "");
  const [zipCode, setZipCode] = useState(student?.endereco?.cep ?? "");
  const [savingPreferences, setSavingPreferences] = useState(false);
  const preferences = student?.preferencias;

  const handlePreference = async (channel: keyof CommunicationPreferences) => {
    if (!preferences || savingPreferences || savingProfile || savingPassword) return;
    setSavingPreferences(true);
    try {
      const profile = await updateCommunicationPreferences({ ...preferences, [channel]: !preferences[channel] });
      setStudent(profile);
      toast.success("Preferência atualizada.");
    } catch (error) {
      toast.error(profileError(error));
    } finally {
      setSavingPreferences(false);
    }
  };

  const handleLogout = () => {
    logout();
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

  const handleSaveProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (savingProfile || savingPassword || savingPreferences) return;
    setSavingProfile(true);
    try {
      const profile = await updatePatient({
        nome: name, email, telefone: phone, dataNascimento: birthDate,
        endereco: { logradouro: address, bairro: district, cidade: city, estado: state, cep: zipCode },
      });
      setStudent(profile);
      setName(profile.nome);
      setEmail(profile.email);
      setPhone(profile.telefone ?? "");
      setBirthDate(profile.dataNascimento ?? "");
      setAddress(profile.endereco.logradouro ?? "");
      setDistrict(profile.endereco.bairro ?? "");
      setCity(profile.endereco.cidade ?? "");
      setState(profile.endereco.estado ?? "");
      setZipCode(profile.endereco.cep ?? "");
      toast.success("Perfil atualizado com sucesso.");
    } catch (error) {
      toast.error(profileError(error));
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (savingPassword || savingProfile || savingPreferences) return;
    const form = new FormData(event.currentTarget);
    setSavingPassword(true);
    try {
      await changePatientPassword({
        senhaAtual: String(form.get("senhaAtual") ?? ""),
        novaSenha: String(form.get("novaSenha") ?? ""),
        confirmacaoNovaSenha: String(form.get("confirmacaoNovaSenha") ?? ""),
      });
      await navigate({ to: "/paciente", replace: true });
      toast.success("Senha alterada. Entre novamente com sua nova senha.");
    } catch (error) {
      toast.error(profileError(error));
    } finally {
      setSavingPassword(false);
    }
  };

  if (!student) return null;

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
              Atualize suas informações
              pessoais e preferências.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 font-semibold text-primary">
            <CalendarCheck2 className="h-5 w-5" />

            {sessionsRemaining ?? "—"}{" "}
            {sessionsRemaining === 1
              ? "sessão disponível"
              : "sessões disponíveis"}
          </div>
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_340px]">
          {/* COLUNA PRINCIPAL */}
          <div className="space-y-6">
            {/* PERFIL */}
            <Card className="p-6">
              <div className="flex flex-wrap items-center gap-5">
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <UserRound className="h-12 w-12" />
                </div>

                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-slate-950">
                    {student.nome}
                  </h2>

                  <div className="mt-3 space-y-2 text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-primary" />

                      {student.email}
                    </div>

                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-primary" />

                      {phone ||
                        "Telefone não informado"}
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
              <form onSubmit={handleSaveProfile} aria-busy={savingProfile}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-950">
                    Dados pessoais
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Atualize suas informações
                    pessoais.
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={savingProfile || savingPassword || savingPreferences}
                >
                  {savingProfile ? "Salvando…" : "Salvar alterações"}
                </Button>
              </div>

              <div className="mt-6 grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="profile-name">
                    Nome completo
                  </Label>

                  <Input
                    id="profile-name"
                    required minLength={3} maxLength={80} autoComplete="name"
                    disabled={savingProfile}
                    value={name}
                    onChange={(event) =>
                      setName(
                        event.target.value,
                      )
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="profile-birth">
                    Data de nascimento
                  </Label>

                  <Input
                    id="profile-birth"
                    required min="1900-01-01" max={clinicToday()} autoComplete="bday"
                    disabled={savingProfile}
                    type="date"
                    value={birthDate}
                    onChange={(event) =>
                      setBirthDate(
                        event.target.value,
                      )
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="profile-email">
                    E-mail
                  </Label>

                  <Input
                    id="profile-email"
                    required maxLength={120} autoComplete="email"
                    disabled={savingProfile}
                    type="email"
                    value={email}
                    onChange={(event) =>
                      setEmail(
                        event.target.value,
                      )
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="profile-phone">
                    Telefone
                  </Label>

                  <Input
                    id="profile-phone"
                    required maxLength={30} autoComplete="tel"
                    disabled={savingProfile}
                    type="tel"
                    value={phone}
                    onChange={(event) =>
                      setPhone(
                        event.target.value,
                      )
                    }
                    placeholder="(61) 99999-9999"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="profile-address">
                    Endereço
                  </Label>

                  <Input
                    id="profile-address"
                    value={address}
                    onChange={(event) => setAddress(event.target.value)}
                    disabled={savingProfile}
                    maxLength={180}
                    placeholder="Rua, número, complemento"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="profile-district">
                    Bairro
                  </Label>

                  <Input
                    id="profile-district"
                    value={district}
                    onChange={(event) => setDistrict(event.target.value)}
                    disabled={savingProfile}
                    maxLength={100}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="profile-city">
                    Cidade
                  </Label>

                  <Input
                    id="profile-city"
                    value={city}
                    onChange={(event) => setCity(event.target.value)}
                    disabled={savingProfile}
                    maxLength={100}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="profile-state">
                      Estado
                    </Label>

                    <Input
                      id="profile-state"
                    value={state}
                    onChange={(event) => setState(event.target.value)}
                    disabled={savingProfile}
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
                    onChange={(event) => setZipCode(event.target.value)}
                    disabled={savingProfile}
                    maxLength={9}
                      placeholder="00000-000"
                    />
                  </div>
                </div>
              </div>
              </form>
            </Card>

            {/* SEGURANÇA */}
            <Card className="p-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-950">
                    Segurança
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Gerencie sua senha e
                    segurança da conta.
                  </p>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setPasswordOpen(true)}
                  disabled={savingProfile}
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
                    Sua senha é protegida com hash BCrypt.
                  </p>
                </div>

                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                  Segura
                </span>
              </div>
            </Card>

            <Dialog open={passwordOpen} onOpenChange={(open) => {
              if (!savingPassword) setPasswordOpen(open);
            }}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Alterar senha</DialogTitle>
                  <DialogDescription>
                    Use pelo menos oito caracteres, com letra e número. Após salvar, entre novamente.
                  </DialogDescription>
                </DialogHeader>
                <form className="space-y-4" onSubmit={handleChangePassword} aria-busy={savingPassword}>
                  <fieldset className="space-y-4" disabled={savingPassword}>
                    <div className="space-y-2">
                      <Label htmlFor="profile-current-password">Senha atual</Label>
                      <Input id="profile-current-password" name="senhaAtual" type="password" autoComplete="current-password" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="profile-new-password">Nova senha</Label>
                      <Input id="profile-new-password" name="novaSenha" type="password" autoComplete="new-password" required minLength={8} maxLength={72} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="profile-confirm-password">Confirme a nova senha</Label>
                      <Input id="profile-confirm-password" name="confirmacaoNovaSenha" type="password" autoComplete="new-password" required maxLength={72} />
                    </div>
                    <Button type="submit">{savingPassword ? "Alterando…" : "Salvar nova senha"}</Button>
                  </fieldset>
                </form>
              </DialogContent>
            </Dialog>

            {/* PREFERÊNCIAS */}
            <Card className="p-6">
              <h2 className="text-xl font-bold text-slate-950">
                Preferências de comunicação
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Escolha como deseja receber
                nossas comunicações.
              </p>

              <div className="mt-5 divide-y divide-slate-100">
                <PreferenceRow
                  icon={Mail}
                  title="E-mails"
                  description="Receber novidades e informações por e-mail"
                  enabled={preferences?.email ?? false}
                  disabled={!preferences || savingPreferences || savingProfile || savingPassword}
                  onChange={() => void handlePreference("email")}
                />

                <PreferenceRow
                  icon={Phone}
                  title="WhatsApp"
                  description="Receber lembretes e avisos por WhatsApp"
                  enabled={preferences?.whatsapp ?? false}
                  disabled={!preferences || savingPreferences || savingProfile || savingPassword}
                  onChange={() => void handlePreference("whatsapp")}
                />

                <PreferenceRow
                  icon={Bell}
                  title="Notificações push"
                  description="Receber notificações no aplicativo"
                  enabled={preferences?.push ?? false}
                  disabled={!preferences || savingPreferences || savingProfile || savingPassword}
                  onChange={() => void handlePreference("push")}
                />
              </div>
            </Card>
          </div>

          {/* COLUNA LATERAL */}
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
                  {currentPlan?.plano.nome ?? "Nenhum plano ativo"}
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Próxima renovação:{" "}
                  {displayDate(currentPlan?.vencimento)}
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
                    {sessionsRemaining ?? "—"}{" "}
                    {sessionsRemaining ===
                    1
                      ? "sessão"
                      : "sessões"}
                  </p>
                </div>
              </div>

              <div className="mt-6 h-2 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${planPercentage}%` }} />
              </div>

              <p className="mt-3 text-sm text-slate-500">
                {usedPlanSessions ?? "—"} de {currentPlan?.plano.sessoes ?? "—"} sessões utilizadas
              </p>

              <SchedulingFeedback query={balance} />
              <SchedulingFeedback query={contracts} />

              <button
                type="button"
                onClick={() =>
                  navigate({
                    to: "/detalhes-plano",
                  })
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
                    Aulas encerradas
                  </span>

                  <span className="font-bold text-slate-950">
                    {completedClasses ?? "—"}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-slate-500" />

                  <span className="flex-1 text-sm text-slate-600">
                    Taxa de presença
                  </span>

                  <span className="font-bold text-slate-950">
                    —
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <CalendarDays className="h-5 w-5 shrink-0 text-slate-500" />

                  <span className="flex-1 text-sm text-slate-600">
                    Sequência atual
                  </span>

                  <span className="font-bold text-slate-950">
                    —
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <CalendarDays className="h-5 w-5 shrink-0 text-slate-500" />

                  <span className="flex-1 text-sm text-slate-600">
                    Membro desde
                  </span>

                  <span className="font-bold text-slate-950">
                    —
                  </span>
                </div>
              </div>

              <SchedulingFeedback query={history} />

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
                    navigate({
                      to: "/gerenciar-pagamentos",
                    })
                  }
                  className="flex w-full items-center gap-3 rounded-lg px-2 py-3 text-left text-sm text-slate-600 transition hover:bg-slate-50 hover:text-primary"
                >
                  <CreditCard className="h-5 w-5 shrink-0" />

                  <span className="flex-1">
                    Gerenciar pagamentos
                  </span>

                  <ChevronRight className="h-5 w-5" />
                </button>

                {/* MEUS PLANOS */}
                <button
                  type="button"
                  onClick={() =>
                    navigate({
                      to: "/meus-planos",
                    })
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
                    navigate({
                      to: "/central-ajuda",
                    })
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
  disabled,
  onChange,
}: {
  icon: typeof Mail;
  title: string;
  description: string;
  enabled: boolean;
  disabled: boolean;
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
        role="switch"
        aria-label={title}
        aria-checked={enabled}
        disabled={disabled}
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