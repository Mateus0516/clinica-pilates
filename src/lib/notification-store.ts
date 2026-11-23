import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { toast } from "sonner";
import { ApiError } from "./api";
import { authenticatedRequest, getPatient } from "./auth";
import { schedulingError, schedulingKey, useSchedulingQuery } from "./scheduling";

const destinations = ["/aulas", "/historico", "/gerenciar-pagamentos", "/detalhes-plano", "/meus-planos"] as const;

type NotificationDto = {
  id: number;
  titulo: string;
  mensagem: string;
  criadaEm: string;
  tipo: "confirmacao" | "aula" | "lembrete" | "cancelamento";
  lida: boolean;
  destino: string | null;
};

const timeFormat = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short", timeStyle: "short", timeZone: "America/Sao_Paulo",
});

function notification(dto: NotificationDto) {
  return {
    id: dto.id,
    title: dto.titulo,
    description: dto.mensagem,
    time: timeFormat.format(new Date(dto.criadaEm)),
    type: dto.tipo,
    read: dto.lida,
    destination: destinations.find((path) => path === dto.destino),
  };
}

export type NotificationItem = ReturnType<typeof notification>;

export function useNotifications() {
  const query = useSchedulingQuery<NotificationDto[]>(["notifications", "list"], "/notificacoes", 30_000);
  const data = useMemo(() => query.data?.map(notification), [query.data]);
  return { ...query, data };
}

export function useUnreadNotifications() {
  return useSchedulingQuery<{ total: number }>(["notifications", "unread"], "/notificacoes/nao-lidas", 30_000);
}

type Change = { action: "read" | "delete"; id?: number };

export function useNotificationChange() {
  const client = useQueryClient();
  const patient = getPatient()?.id;
  return useMutation({
    mutationKey: [...schedulingKey, patient, "notifications"],
    scope: { id: `patient-notifications:${patient}` },
    mutationFn: ({ action, id }: Change) => {
      if (patient === undefined || patient !== getPatient()?.id) throw new ApiError(401);
      const path = id === undefined ? "/notificacoes" : `/notificacoes/${id}` as const;
      return action === "read"
        ? authenticatedRequest<void>(`${path}/leitura`, { method: "PUT" })
        : authenticatedRequest<void>(path, { method: "DELETE" });
    },
    onError: (error) => {
      if (patient === getPatient()?.id) toast.error(schedulingError(error));
    },
    onSettled: () => {
      if (patient !== undefined && patient === getPatient()?.id) {
        return client.invalidateQueries({ queryKey: [...schedulingKey, patient, "notifications"] });
      }
    },
  });
}
