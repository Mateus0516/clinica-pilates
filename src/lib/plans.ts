import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRef } from "react";
import { toast } from "sonner";
import { ApiError } from "./api";
import { authenticatedRequest, getPatient } from "./auth";
import { calendarDate, clinicDateKey, schedulingError, schedulingKey, useSchedulingQuery } from "./scheduling";

export type Offer = {
  codigo: string;
  nome: string;
  descricao: string;
  servico: string;
  valor: number;
  sessoes: number;
  meses: number;
  beneficios: string[];
};

export type Contract = {
  id: number;
  plano: Offer;
  contratadoEm: string;
  inicio: string | null;
  vencimento: string | null;
  status: "ATIVO" | "ENCERRADO" | "PENDENTE";
  renovacaoDeId: number | null;
  sessoesDisponiveis: number;
};

export type PaymentMethod = "PIX" | "CARTAO_CREDITO";
type Method = { forma: PaymentMethod | null };
export type Payment = {
  id: number;
  contratacaoId: number;
  plano: string;
  valor: number;
  criadoEm: string;
  vencimento: string | null;
  pagoEm: string | null;
  forma: PaymentMethod | null;
  status: "PENDENTE" | "PAGO";
  simulado: true;
};

type Contracts = { atual: Contract | null; pendente: Contract | null; historico: Contract[] };
const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export function money(value?: number) {
  return value === undefined ? "—" : currency.format(value);
}

export function displayDate(value?: string | null) {
  if (!value) return "—";
  return calendarDate(value.includes("T") ? clinicDateKey(new Date(value)) : value).toLocaleDateString("pt-BR");
}

export function methodName(method?: PaymentMethod | null) {
  if (!method) return "Não definida";
  return method === "PIX" ? "PIX simulado" : "Cartão de crédito simulado";
}

export function periodicity(months?: number) {
  if (months === undefined) return "—";
  return months === 1 ? "Mensal" : `A cada ${months} meses`;
}

export function planDisplay(contract?: Contract | null) {
  return {
    name: contract?.plano.nome ?? "Nenhum plano ativo",
    service: contract?.plano.servico ?? "—",
    status: contract ? { ATIVO: "Ativo", PENDENTE: "Aguardando pagamento", ENCERRADO: "Concluído" }[contract.status] : "Sem plano",
    totalSessions: contract?.plano.sessoes,
    startDate: displayDate(contract?.inicio),
    renewalDate: displayDate(contract?.vencimento),
    periodicity: periodicity(contract?.plano.meses),
    price: money(contract?.plano.valor),
  };
}

export function planProgress(contract?: Contract | null) {
  if (!contract || contract.status === "PENDENTE") return { used: undefined, percentage: 0 };
  const used = contract.plano.sessoes - contract.sessoesDisponiveis;
  return { used, percentage: used / contract.plano.sessoes * 100 };
}

export function usePlanCatalog() {
  return useSchedulingQuery<Offer[]>(["plan-catalog"], "/planos");
}

export function useContracts() {
  return useSchedulingQuery<Contracts>(["contracts"], "/planos/contratacoes");
}

export function usePayments() {
  return useSchedulingQuery<Payment[]>(["payments"], "/pagamentos");
}

export function usePaymentMethod() {
  return useSchedulingQuery<Method>(["payment-method"], "/pagamentos/metodo");
}

function usePlanMutation<T, V>(request: (value: V) => Promise<T>, success: string) {
  const client = useQueryClient();
  const id = getPatient()?.id;
  return useMutation({
    mutationKey: [...schedulingKey, id, "commerce"],
    scope: { id: `patient-commerce:${id}` },
    mutationFn: (value: V) => {
      if (id === undefined || getPatient()?.id !== id) throw new ApiError(401);
      return request(value);
    },
    onSuccess: () => {
      if (getPatient()?.id === id) toast.success(success);
    },
    onError: (error) => {
      if (getPatient()?.id === id) toast.error(schedulingError(error));
    },
    onSettled: () => {
      if (id !== undefined && getPatient()?.id === id) {
        return client.invalidateQueries({ queryKey: [...schedulingKey, id] });
      }
    },
  });
}

export function usePlanOrder() {
  const keys = useRef(new Map<string, string>());
  return usePlanMutation((order: { planoCodigo: string; renovacaoDeId?: number }) => {
    const key = `${order.planoCodigo}:${order.renovacaoDeId ?? ""}`;
    const chave = keys.current.get(key) ?? crypto.randomUUID();
    keys.current.set(key, chave);
    return authenticatedRequest<Payment>("/planos/contratacoes", {
      method: "POST", body: JSON.stringify({ ...order, chave }),
    }).then((payment) => {
      keys.current.delete(key);
      return payment;
    });
  }, "Pedido registrado. Conclua o pagamento simulado.");
}

export function usePaymentSimulation() {
  return usePlanMutation(({ id, forma }: { id: number; forma: PaymentMethod }) =>
    authenticatedRequest<Payment>(`/pagamentos/${id}/simulacao`, {
      method: "POST", body: JSON.stringify({ forma }),
    }), "Pagamento simulado aprovado. Sessões atualizadas.");
}

export function useSavePaymentMethod() {
  return usePlanMutation((forma: PaymentMethod) => authenticatedRequest<Method>("/pagamentos/metodo", {
    method: "PUT", body: JSON.stringify({ forma }),
  }), "Forma de pagamento simulada atualizada.");
}
