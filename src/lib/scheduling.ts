import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ApiError } from "./api";
import { authenticatedRequest, getPatient } from "./auth";
import { addBookingNotificationOnce } from "./notification-store";

export type Slot = {
  data: string;
  horario: string;
  instrutorCodigo: string;
  instrutor: string;
  capacidade: number;
  vagasDisponiveis: number;
};

export type Appointment = {
  id: number;
  data: string;
  horario: string;
  instrutorCodigo: string;
  instrutor: string;
  status: "AGENDADO" | "CANCELADO" | "ENCERRADO";
  criadoEm: string;
  canceladoEm: string | null;
  intencaoPresencaConfirmadaEm: string | null;
  sessaoDevolvida: boolean;
};

type Reservation = Pick<Slot, "data" | "horario" | "instrutorCodigo">;
type Change = { type: "reserve"; slot: Reservation } | { type: "cancel" | "confirm"; id: number };
export const schedulingKey = ["patient-scheduling"] as const;
const clinicZone = "America/Sao_Paulo";

const clinicDateFormat = new Intl.DateTimeFormat("sv-SE", { timeZone: clinicZone });
const clinicOffsetFormat = new Intl.DateTimeFormat("en-US", {
  timeZone: clinicZone,
  timeZoneName: "longOffset",
});

export function clinicDateKey(date: Date) {
  return clinicDateFormat.format(date);
}

export function clinicToday() {
  return clinicDateKey(new Date());
}

// Calendar dates are civil dates. Keep their year/month/day when using browser calendar widgets.
export function calendarDate(date: string) {
  return new Date(`${date}T12:00:00`);
}

export function calendarKey(date: Date) {
  return [
    String(date.getFullYear()).padStart(4, "0"),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

export function clinicWeek(offset: number, today = clinicToday()) {
  const monday = calendarDate(today);
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7) + offset * 7);
  return Array.from({ length: 6 }, (_, index) => {
    const date = new Date(monday);
    date.setDate(date.getDate() + index);
    return date;
  });
}

export function hoursUntil(appointment: Pick<Appointment, "data" | "horario">) {
  const localTime = `${appointment.data}T${appointment.horario}:00`;
  const nominal = Date.parse(`${localTime}Z`);
  const estimate = Date.parse(`${localTime}${clinicOffset(nominal)}`);
  return (Date.parse(`${localTime}${clinicOffset(estimate)}`) - Date.now()) / 3_600_000;
}

function clinicOffset(instant: number) {
  return (
    clinicOffsetFormat
      .formatToParts(instant)
      .find((part) => part.type === "timeZoneName")
      ?.value.slice(3) || "+00:00"
  );
}

export function schedulingError(error: unknown) {
  if (error instanceof ApiError) {
    if (error.status === 401) return "Sua sessão expirou. Entre novamente.";
    if (error.status === 403) return "Seu perfil não tem permissão para esta operação.";
    if ([400, 404, 409, 422].includes(error.status) && error.detail) return error.detail;
    return "Não foi possível concluir a operação. Tente novamente.";
  }
  return error instanceof Error ? error.message : "Não foi possível concluir a operação.";
}

function retry(failures: number, error: unknown) {
  return failures < 1 && !(error instanceof ApiError && error.status < 500);
}

export function useSchedulingQuery<T>(parts: string[], path: `/${string}`, interval?: number) {
  const id = getPatient()?.id;
  return useQuery({
    queryKey: [...schedulingKey, id, ...parts],
    queryFn: ({ signal }) => {
      if (id === undefined || getPatient()?.id !== id) throw new ApiError(401);
      return authenticatedRequest<T>(path, { signal });
    },
    enabled: id !== undefined,
    staleTime: 15_000,
    refetchInterval: interval,
    retry,
  });
}

export function useSlots(start: string, end: string) {
  const params = new URLSearchParams({ inicio: start, fim: end });
  return useSchedulingQuery<Slot[]>(["slots", start, end], `/aulas?${params}`, 30_000);
}

export function useAppointments() {
  return useSchedulingQuery<Appointment[]>(["appointments"], "/agendamentos", 30_000);
}

export function useAppointmentHistory() {
  return useSchedulingQuery<Appointment[]>(["history"], "/agendamentos/historico", 30_000);
}

export function useSessionBalance() {
  return useSchedulingQuery<{ sessoesDisponiveis: number }>(["balance"], "/sessoes/saldo");
}

export function useAppointmentChange() {
  const client = useQueryClient();
  const id = getPatient()?.id;
  return useMutation({
    mutationKey: [...schedulingKey, id],
    scope: { id: `patient-scheduling:${id}` },
    mutationFn: async (change: Change) => {
      if (id === undefined || getPatient()?.id !== id) throw new ApiError(401);
      if (change.type === "reserve") {
        const { data, horario, instrutorCodigo } = change.slot;
        const params = new URLSearchParams({ data, horario, instrutorCodigo });
        const slot = await authenticatedRequest<Slot>(`/aulas/vagas?${params}`);
        if (slot.vagasDisponiveis === 0) throw new ApiError(409, "Este horário está sem vagas.");
        return authenticatedRequest<Appointment>("/agendamentos", {
          method: "POST",
          body: JSON.stringify({ data, horario, instrutorCodigo }),
        });
      }
      if (change.type === "cancel") {
        return authenticatedRequest<Appointment>(`/agendamentos/${change.id}/cancelamento`, {
          method: "POST",
        });
      }
      return authenticatedRequest<Appointment>(`/agendamentos/${change.id}/intencao-presenca`, {
        method: "PUT",
      });
    },
    onSuccess: (appointment, change) => {
      if (getPatient()?.id !== id) return;
      if (change.type === "confirm") {
        toast.success("Intenção de comparecer confirmada.");
        return;
      }
      const canceled = change.type === "cancel";
      const detail = canceled
        ? appointment.sessaoDevolvida
          ? "A sessão foi devolvida."
          : "A sessão não foi devolvida."
        : "";
      const title = canceled ? "Aula cancelada" : "Aula agendada";
      toast.success(detail ? `${title}. ${detail}` : title);
      try {
        addBookingNotificationOnce({
          studentId: String(id),
          bookingId: String(appointment.id),
          title,
          description:
            `${calendarDate(appointment.data).toLocaleDateString("pt-BR")} às ${appointment.horario} com Prof. ${appointment.instrutor}. ${detail}`.trim(),
          time: "Agora",
          type: canceled ? "cancelamento" : "confirmacao",
        });
      } catch {
        // Local notifications are optional. The reservation was already persisted by the API.
      }
    },
    onError: (error) => {
      if (id !== undefined && getPatient()?.id === id) toast.error(schedulingError(error));
    },
    onSettled: () => {
      if (id !== undefined && getPatient()?.id === id) {
        return client.invalidateQueries({ queryKey: [...schedulingKey, id] });
      }
    },
  });
}
