import { displayDate, methodName, money, planDisplay, useContracts, usePaymentMethod, usePayments, usePaymentSimulation, useSavePaymentMethod, type Payment, type PaymentMethod } from "@/lib/plans";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Toaster } from "sonner";
import { SchedulingFeedback } from "@/components/dashboard/SchedulingFeedback";
import { useSessionBalance } from "@/lib/scheduling";
import { logout, requirePatient } from "@/lib/auth";
import {
  createFileRoute,
  useNavigate,
} from "@tanstack/react-router";

import {
  useEffect,
  useState,
} from "react";

import {
  BadgeCheck,
  CalendarDays,
  ChevronLeft,
  CircleDollarSign,
  CreditCard,
  FileText,
  HelpCircle,
  ReceiptText,
  WalletCards,
} from "lucide-react";

import { PatientLayout } from "@/components/layout/PatientLayout";
import { Card } from "@/components/ui/card";

import {
  Student,
  getSession,
} from "@/lib/clinic-store";

export const Route = createFileRoute(
  "/gerenciar-pagamentos",
)({
  ssr: false,
  beforeLoad: requirePatient,
  component: ManagePaymentsPage,
});

type SidebarSection =
  | "inicio"
  | "agenda"
  | "aulas"
  | "historico"
  | "perfil"
  | "notificacoes";

function ManagePaymentsPage() {
  const navigate = useNavigate();

  const [student, setStudent] =
    useState<Student | null>(null);

  const [ready, setReady] =
    useState(false);

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
    setReady(true);
  }, [navigate]);

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
    }
  };

  const balance = useSessionBalance();
  const contracts = useContracts();
  const payments = usePayments();
  const method = usePaymentMethod();
  const simulation = usePaymentSimulation();
  const saveMethod = useSavePaymentMethod();
  const [dialog, setDialog] = useState<"method" | "pay" | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("PIX");
  const [receipt, setReceipt] = useState<Payment | null>(null);
  if (!ready || !student) {
    return null;
  }

  const currentPlan = planDisplay(contracts.data?.atual ?? contracts.data?.pendente);
  const pending = payments.data?.find((payment) => payment.status === "PENDENTE");
  const paymentHistory = payments.data?.filter((payment) => payment.status === "PAGO") ?? [];
  const currentInvoice = {
    value: money(pending?.valor),
    dueDate: displayDate(pending?.vencimento),
    status: pending ? "Pendente" : "Sem cobrança pendente",
  };

  const openDialog = (mode: "method" | "pay") => {
    setSelectedMethod(method.data?.forma ?? "PIX");
    setDialog(mode);
  };

  const confirm = () => {
    const options = { onSuccess: () => setDialog(null) };
    if (dialog === "method") saveMethod.mutate(selectedMethod, options);
    if (dialog === "pay" && pending) simulation.mutate({ id: pending.id, forma: selectedMethod }, options);
  };
  const saving = simulation.isPending || saveMethod.isPending;

  return (
    <PatientLayout
      onLogout={handleLogout}
      onNavigate={handleNavigation}
    >
      <Toaster richColors position="top-center" />
      <SchedulingFeedback query={contracts} />
      <SchedulingFeedback query={balance} />
      <SchedulingFeedback query={payments} />
      <SchedulingFeedback query={method} />
      <div className="mx-auto max-w-7xl">
        {/* VOLTAR */}
        <button
          type="button"
          onClick={() =>
            navigate({
              to: "/perfil",
            })
          }
          className="mb-6 flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-primary"
        >
          <ChevronLeft className="h-4 w-4" />
          Voltar para o perfil
        </button>

        {/* CABEÇALHO */}
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-primary">
            Pagamentos
          </p>

          <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-950">
            Gerenciar pagamentos
          </h1>

          <p className="mt-3 max-w-2xl text-slate-600">
            Consulte seu plano, forma de pagamento
            e histórico de cobranças.
          </p>
        </div>

        {/* CONTEÚDO */}
        <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          {/* COLUNA PRINCIPAL */}
          <div className="min-w-0 space-y-6">
            {/* PLANO E PAGAMENTO */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* PLANO ATUAL */}
              <Card className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <WalletCards className="h-6 w-6" />
                    </div>

                    <div>
                      <p className="text-sm font-medium text-slate-500">
                        Plano atual
                      </p>

                      <h2 className="mt-1 text-xl font-bold text-slate-950">
                        {currentPlan.name}
                      </h2>

                      <p className="mt-1 text-sm text-slate-500">
                        {currentPlan.service}
                      </p>
                    </div>
                  </div>

                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                    {currentPlan.status}
                  </span>
                </div>

                <div className="my-6 border-t border-slate-100" />

                <div className="grid gap-4 sm:grid-cols-2">
                  <InformationItem
                    label="Valor"
                    value={currentPlan.price}
                  />

                  <InformationItem
                    label="Próxima renovação"
                    value={currentPlan.renewalDate}
                  />
                </div>

                <div className="mt-5 rounded-xl bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">
                    Sessões disponíveis
                  </p>

                  <p className="mt-1 text-2xl font-bold text-slate-950">
                    {(balance.data?.sessoesDisponiveis ?? "—")}
                  </p>
                </div>
              </Card>

              {/* FORMA DE PAGAMENTO */}
              <Card className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <CreditCard className="h-6 w-6" />
                  </div>

                  <div>
                    <p className="text-sm font-medium text-slate-500">
                      Forma de pagamento
                    </p>

                    <h2 className="mt-1 text-xl font-bold text-slate-950">
                      {methodName(method.data?.forma)}
                    </h2>
                  </div>
                </div>

                <div className="my-6 border-t border-slate-100" />

                <div className="space-y-4">
                  <InformationRow
                    label="Bandeira"
                    value="—"
                  />

                  <InformationRow
                    label="Final"
                    value="—"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => openDialog("method")}
                  className="mt-6 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-primary/30 hover:text-primary"
                >
                  Alterar forma de pagamento
                </button>
              </Card>
            </div>

            {/* COBRANÇA ATUAL */}
            <Card className="p-6">
              <div className="flex flex-wrap items-start justify-between gap-5">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <ReceiptText className="h-6 w-6" />
                  </div>

                  <div>
                    <h2 className="text-xl font-bold text-slate-950">
                      Cobrança atual
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Informações da próxima cobrança
                      do seu plano.
                    </p>
                  </div>
                </div>

                <span className="rounded-full bg-amber-100 px-3 py-1.5 text-sm font-semibold text-amber-700">
                  {currentInvoice.status}
                </span>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <InvoiceInformation
                  icon={CircleDollarSign}
                  label="Valor"
                  value={currentInvoice.value}
                />

                <InvoiceInformation
                  icon={CalendarDays}
                  label="Vencimento"
                  value={currentInvoice.dueDate}
                />

                <InvoiceInformation
                  icon={FileText}
                  label="Referente a"
                  value={currentPlan.name}
                />
              </div>
              <p className="mt-4 text-sm text-slate-600">Pagamento acadêmico simulado, sem cobrança real.</p>
              {pending && <button type="button" onClick={() => openDialog("pay")}
                className="mt-4 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
                Simular pagamento
              </button>}
            </Card>

            {/* HISTÓRICO */}
            <Card className="overflow-hidden">
              <div className="border-b border-slate-100 p-6">
                <h2 className="text-xl font-bold text-slate-950">
                  Histórico de pagamentos
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Consulte suas cobranças e
                  pagamentos anteriores.
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px]">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/70 text-left">
                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Data
                      </th>

                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Descrição
                      </th>

                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Pagamento
                      </th>

                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Valor
                      </th>

                      <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Status
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {payments.isSuccess && paymentHistory.length === 0 && (
                      <tr><td colSpan={5} className="px-6 py-4 text-sm text-slate-600">Nenhum pagamento simulado registrado.</td></tr>
                    )}
                    {paymentHistory.map(
                      (payment) => (
                        <tr
                          key={payment.id}
                          className="border-b border-slate-100 last:border-b-0"
                        >
                          <td className="px-6 py-4 text-sm text-slate-600">
                            {displayDate(payment.pagoEm)}
                          </td>

                          <td className="px-6 py-4 text-sm font-semibold text-slate-950">
                            <button type="button" onClick={() => setReceipt(payment)} className="text-left hover:text-primary">
                              {payment.plano}
                            </button>
                          </td>

                          <td className="px-6 py-4 text-sm text-slate-600">
                            {methodName(payment.forma)}
                          </td>

                          <td className="px-6 py-4 text-sm font-semibold text-slate-950">
                            {money(payment.valor)}
                          </td>

                          <td className="px-6 py-4">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                              <BadgeCheck className="h-3.5 w-3.5" />
                              Pago
                            </span>
                          </td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          {/* COLUNA LATERAL */}
          <div className="min-w-0 space-y-6">
            {/* RESUMO */}
            <Card className="p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <ReceiptText className="h-6 w-6" />
              </div>

              <h2 className="mt-5 text-lg font-bold text-slate-950">
                Resumo financeiro
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Confira os principais dados
                relacionados ao seu plano.
              </p>

              <div className="my-6 border-t border-slate-100" />

              <InformationRow
                label="Plano"
                value={currentPlan.name}
              />

              <div className="my-4 border-t border-slate-100" />

              <InformationRow
                label="Valor"
                value={currentPlan.price}
              />

              <div className="my-4 border-t border-slate-100" />

              <InformationRow
                label="Próxima cobrança"
                value={currentPlan.renewalDate}
              />
            </Card>

            {/* DADOS DE COBRANÇA */}
            <Card className="p-6">
              <h2 className="text-lg font-bold text-slate-950">
                Dados de cobrança
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                As cobranças estão vinculadas aos
                dados cadastrados no seu perfil.
              </p>

              <div className="mt-5 rounded-xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">
                  Titular
                </p>

                <p className="mt-1 font-semibold text-slate-950">
                  {student.name}
                </p>
              </div>
            </Card>

            {/* AJUDA */}
            <Card className="border-primary/20 bg-primary/[0.04] p-6">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-primary shadow-sm">
                  <HelpCircle className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="font-bold text-slate-950">
                    Precisa de ajuda?
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Em caso de dúvidas sobre
                    cobranças ou pagamentos, entre
                    em contato com a clínica.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
      <Dialog open={dialog !== null} onOpenChange={(open) => { if (!open && !saving) setDialog(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{dialog === "pay" ? "Simular pagamento" : "Alterar forma de pagamento"}</DialogTitle>
            <DialogDescription>Simulação acadêmica, sem cobrança ou dados bancários.</DialogDescription>
          </DialogHeader>
          <label htmlFor="simulated-method" className="text-sm font-medium">Forma de pagamento</label>
          <select id="simulated-method" className="rounded-lg border p-2" value={selectedMethod} disabled={saving}
            onChange={(event) => setSelectedMethod(event.target.value === "PIX" ? "PIX" : "CARTAO_CREDITO")}>
            <option value="PIX">PIX simulado</option>
            <option value="CARTAO_CREDITO">Cartão de crédito simulado</option>
          </select>
          {dialog === "pay" && <p className="text-sm">Valor: {money(pending?.valor)}</p>}
          <button type="button" disabled={saving} onClick={confirm}
            className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50">
            {saving ? "Processando…" : dialog === "pay" ? "Confirmar simulação" : "Salvar forma"}
          </button>
        </DialogContent>
      </Dialog>

      <Dialog open={receipt !== null} onOpenChange={(open) => { if (!open) setReceipt(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Comprovante simulado</DialogTitle>
            <DialogDescription>Registro acadêmico, sem valor financeiro.</DialogDescription>
          </DialogHeader>
          {receipt && <div className="space-y-3 text-sm">
            <InformationRow label="Referência" value={String(receipt.id)} />
            <InformationRow label="Plano" value={receipt.plano} />
            <InformationRow label="Vencimento" value={displayDate(receipt.vencimento)} />
            <InformationRow label="Pagamento" value={displayDate(receipt.pagoEm)} />
            <InformationRow label="Forma de pagamento" value={methodName(receipt.forma)} />
            <InformationRow label="Valor simulado" value={money(receipt.valor)} />
          </div>}
        </DialogContent>
      </Dialog>
    </PatientLayout>
  );
}

function InformationItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-sm text-slate-500">
        {label}
      </p>

      <p className="mt-1 font-semibold text-slate-950">
        {value}
      </p>
    </div>
  );
}

function InformationRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm text-slate-500">
        {label}
      </span>

      <span className="text-right text-sm font-semibold text-slate-950">
        {value}
      </span>
    </div>
  );
}

function InvoiceInformation({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof CalendarDays;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
      <div className="flex items-center gap-2 text-slate-500">
        <Icon className="h-4 w-4" />

        <span className="text-sm">
          {label}
        </span>
      </div>

      <p className="mt-2 font-semibold text-slate-950">
        {value}
      </p>
    </div>
  );
}