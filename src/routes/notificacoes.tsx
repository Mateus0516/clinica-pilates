import { logout, requirePatient } from "@/lib/auth";
import {
  createFileRoute,
  useNavigate,
} from "@tanstack/react-router";

import {
  useMemo,
  useState,
} from "react";

import {
  Bell,
  CalendarDays,
  CheckCheck,
  CheckCircle2,
  Clock3,
  Info,
  Trash2,
  XCircle,
} from "lucide-react";

import { PatientLayout } from "@/components/layout/PatientLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

import { SchedulingFeedback } from "@/components/dashboard/SchedulingFeedback";
import { Toaster } from "sonner";
import { useNotificationChange, useNotifications, useUnreadNotifications, type NotificationItem } from "@/lib/notification-store";

export const Route = createFileRoute("/notificacoes")({
  ssr: false,
  beforeLoad: requirePatient,
  component: NotificationsPage,
});

type SidebarSection =
  | "inicio"
  | "agenda"
  | "aulas"
  | "historico"
  | "perfil"
  | "notificacoes";

function NotificationsPage() {
  const navigate = useNavigate();

  const list = useNotifications();
  const unread = useUnreadNotifications();
  const change = useNotificationChange();
  const notifications = list.data ?? [];
  const [filter, setFilter] = useState<"todas" | "naoLidas">("todas");
  const [deleteTarget, setDeleteTarget] = useState<"all" | number | null>(null);

  const handleLogout = () => {
    logout();
    void navigate({ to: "/acesso", replace: true });
  };

  const handleNavigation = (
    section: SidebarSection,
  ) => {
    const routes = {
      inicio: "/dashboard",
      agenda: "/agenda",
      aulas: "/aulas",
      historico: "/historico",
      perfil: "/perfil",
      notificacoes:
        "/notificacoes",
    } as const;

    navigate({
      to: routes[section],
    });
  };

  const unreadCount = unread.data?.total ?? 0;
  const filteredNotifications = useMemo(
    () => filter === "naoLidas" ? notifications.filter((item) => !item.read) : notifications,
    [filter, notifications],
  );

  const confirmDelete = () => {
    if (deleteTarget === null || change.isPending) return;
    const id = deleteTarget === "all" ? undefined : deleteTarget;
    change.mutate({ action: "delete", id }, { onSuccess: () => setDeleteTarget(null) });
  };

  const openNotification = (notification: NotificationItem) => {
    if (!notification.read) change.mutate({ action: "read", id: notification.id });
    if (notification.destination) void navigate({ to: notification.destination });
  };

  return (
    <PatientLayout
      onLogout={handleLogout}
      onNavigate={
        handleNavigation
      }
    >
      <Toaster richColors position="top-center" />
      <div className="mx-auto max-w-7xl">
        {/* CABEÇALHO */}
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">
              Notificações
            </p>

            <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-950">
              Fique por dentro de
              tudo
            </h1>

            <p className="mt-3 max-w-2xl text-slate-600">
              Acompanhe
              confirmações,
              lembretes e
              atualizações sobre
              seus atendimentos.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {unreadCount >
              0 && (
              <Button
                type="button"
                variant="outline"
                disabled={change.isPending}
                onClick={() => change.mutate({ action: "read" })}
                className="bg-white"
              >
                <CheckCheck className="mr-2 h-4 w-4" />

                Marcar todas como
                lidas
              </Button>
            )}

            {notifications.length >
              0 && (
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  setDeleteTarget("all")
                }
                className="border-red-200 bg-white text-red-600 hover:border-red-300 hover:bg-red-50 hover:text-red-700"
              >
                <Trash2 className="mr-2 h-4 w-4" />

                Excluir todas
              </Button>
            )}
          </div>
        </div>

        {/* RESUMO */}
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <Card className="p-5">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50">
                <Bell className="h-6 w-6 text-blue-600" />
              </div>

              <div>
                <p className="text-2xl font-bold text-slate-950">
                  {
                    notifications.length
                  }
                </p>

                <p className="text-sm font-semibold text-slate-700">
                  Total de
                  notificações
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Todas as suas
                  atualizações
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50">
                <Clock3 className="h-6 w-6 text-amber-600" />
              </div>

              <div>
                <p className="text-2xl font-bold text-slate-950">
                  {unreadCount}
                </p>

                <p className="text-sm font-semibold text-slate-700">
                  Não lidas
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Notificações que
                  precisam da sua
                  atenção
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* FILTROS */}
        <div className="mt-6 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() =>
              setFilter(
                "todas",
              )
            }
            className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${
              filter ===
              "todas"
                ? "border-primary bg-primary text-primary-foreground"
                : "border-slate-200 bg-white text-slate-600 hover:border-primary/40"
            }`}
          >
            Todas
          </button>

          <button
            type="button"
            onClick={() =>
              setFilter(
                "naoLidas",
              )
            }
            className={`rounded-lg border px-4 py-2 text-sm font-medium transition ${
              filter ===
              "naoLidas"
                ? "border-primary bg-primary text-primary-foreground"
                : "border-slate-200 bg-white text-slate-600 hover:border-primary/40"
            }`}
          >
            Não lidas (
            {unreadCount})
          </button>
        </div>

        {/* LISTA */}
        <Card className="mt-6 overflow-hidden">
          <div className="border-b border-slate-200 px-6 py-5">
            <h2 className="text-xl font-bold text-slate-950">
              Suas notificações
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Atualizações recentes
              da sua conta.
            </p>
          </div>

          <SchedulingFeedback query={list} />
          <SchedulingFeedback query={unread} />
          {list.isSuccess && (filteredNotifications.length ===
          0 ? (
            <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
                <Bell className="h-8 w-8 text-slate-500" />
              </div>

              <h3 className="mt-5 text-lg font-bold text-slate-950">
                Nenhuma
                notificação
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Você está em dia
                com todas as suas
                atualizações.
              </p>
            </div>
          ) : (
            <div>
              {filteredNotifications.map(
                (
                  notification,
                ) => (
                  <NotificationRow
                    key={
                      notification.id
                    }
                    notification={
                      notification
                    }
                    onRead={() => change.mutate({ action: "read", id: notification.id })}
                    onRemove={() => setDeleteTarget(notification.id)}
                    onOpen={() => openNotification(notification)}
                    pending={change.isPending}
                  />
                ),
              )}
            </div>
          ))}
        </Card>
      </div>

      {/* MODAL EXCLUIR TODAS */}
      {deleteTarget !== null && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
              <Trash2 className="h-6 w-6 text-red-600" />
            </div>

            <h2 className="mt-4 text-xl font-bold text-slate-950">
              {deleteTarget === "all" ? "Excluir todas as notificações?" : "Excluir notificação?"}
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              {deleteTarget === "all" ? "Todas as suas notificações serão removidas." : "Esta notificação será removida."}
              {" "}Essa ação não poderá ser desfeita.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  setDeleteTarget(null)
                }
              >
                Voltar
              </Button>

              <Button
                type="button"
                disabled={change.isPending}
                onClick={confirmDelete}
                className="bg-red-600 text-white hover:bg-red-700"
              >
                <Trash2 className="mr-2 h-4 w-4" />

                {deleteTarget === "all" ? "Excluir todas" : "Excluir"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </PatientLayout>
  );
}

function NotificationRow({
  notification,
  onRead,
  onRemove,
  onOpen,
  pending,
}: {
  notification: NotificationItem;
  onRead: () => void;
  onRemove: () => void;
  onOpen: () => void;
  pending: boolean;
}) {
  const config = {
    confirmacao: {
      icon: CheckCircle2,
      iconBackground:
        "bg-emerald-50",
      iconColor:
        "text-emerald-600",
    },

    aula: {
      icon: CalendarDays,
      iconBackground:
        "bg-blue-50",
      iconColor:
        "text-blue-600",
    },

    lembrete: {
      icon: Info,
      iconBackground:
        "bg-amber-50",
      iconColor:
        "text-amber-600",
    },

    cancelamento: {
      icon: XCircle,
      iconBackground:
        "bg-red-50",
      iconColor:
        "text-red-600",
    },
  }[notification.type];

  const Icon = config.icon;

  return (
    <div
      className={`flex items-start gap-4 border-b border-slate-100 px-6 py-5 transition last:border-b-0 ${
        notification.read
          ? "bg-white"
          : "bg-slate-50"
      }`}
    >
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${config.iconBackground}`}
      >
        <Icon
          className={`h-5 w-5 ${config.iconColor}`}
        />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          {notification.destination ? (
            <button type="button" onClick={onOpen} className="text-left font-semibold text-slate-950 hover:underline">
              {notification.title}
            </button>
          ) : <p className="font-semibold text-slate-950">{notification.title}</p>}

          {!notification.read && (
            <span className="h-2 w-2 rounded-full bg-blue-500" />
          )}
        </div>

        <p className="mt-1 text-sm leading-6 text-slate-600">
          {
            notification.description
          }
        </p>

        <p className="mt-2 text-xs text-slate-400">
          {notification.time}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        {!notification.read && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={pending}
            onClick={onRead}
            className="text-slate-600"
          >
            <CheckCheck className="mr-2 h-4 w-4" />

            Marcar como lida
          </Button>
        )}

        <Button
          type="button"
          variant="ghost"
          size="icon"
          disabled={pending}
          onClick={onRemove}
          className="text-slate-400 hover:text-red-600"
          aria-label="Excluir notificação"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}