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

import {
  Student,
  getSession,
  setSession,
} from "@/lib/clinic-store";

import {
  NotificationItem,
  getStudentNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  removeAllStudentNotifications,
  removeNotification,
} from "@/lib/notification-store";

export const Route = createFileRoute("/notificacoes")({
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

  const [student, setStudent] =
    useState<Student | null>(null);

  const [ready, setReady] =
    useState(false);

  const [
    notifications,
    setNotifications,
  ] = useState<NotificationItem[]>([]);

  const [filter, setFilter] =
    useState<"todas" | "naoLidas">(
      "todas",
    );

  const [
    deleteAllConfirmationOpen,
    setDeleteAllConfirmationOpen,
  ] = useState(false);

  const loadNotifications = (
    studentId: string,
  ) => {
    setNotifications(
      getStudentNotifications(
        studentId,
      ),
    );
  };

  useEffect(() => {
    const currentStudent =
      getSession();

    if (!currentStudent) {
      navigate({
        to: "/paciente",
        replace: true,
      });

      return;
    }

    setStudent(currentStudent);

    loadNotifications(
      currentStudent.id,
    );

    setReady(true);

    const handleNotificationsUpdated =
      () => {
        loadNotifications(
          currentStudent.id,
        );
      };

    window.addEventListener(
      "timely-notifications-updated",
      handleNotificationsUpdated,
    );

    return () => {
      window.removeEventListener(
        "timely-notifications-updated",
        handleNotificationsUpdated,
      );
    };
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

  const unreadCount =
    notifications.filter(
      (notification) =>
        !notification.read,
    ).length;

  const filteredNotifications =
    useMemo(() => {
      if (
        filter === "naoLidas"
      ) {
        return notifications.filter(
          (notification) =>
            !notification.read,
        );
      }

      return notifications;
    }, [
      filter,
      notifications,
    ]);

  const markAllAsRead = () => {
    if (!student) {
      return;
    }

    markAllNotificationsAsRead(
      student.id,
    );

    loadNotifications(
      student.id,
    );
  };

  const markAsRead = (
    id: string,
  ) => {
    if (!student) {
      return;
    }

    markNotificationAsRead(id);

    loadNotifications(
      student.id,
    );
  };

  const handleRemoveNotification = (
    id: string,
  ) => {
    if (!student) {
      return;
    }

    removeNotification(id);

    loadNotifications(
      student.id,
    );
  };

  const handleRemoveAllNotifications =
    () => {
      if (!student) {
        return;
      }

      removeAllStudentNotifications(
        student.id,
      );

      loadNotifications(
        student.id,
      );

      setDeleteAllConfirmationOpen(
        false,
      );
    };

  if (!ready || !student) {
    return null;
  }

  return (
    <PatientLayout
      onLogout={handleLogout}
      onNavigate={
        handleNavigation
      }
    >
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
                onClick={
                  markAllAsRead
                }
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
                  setDeleteAllConfirmationOpen(
                    true,
                  )
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

          {filteredNotifications.length ===
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
                    onRead={() =>
                      markAsRead(
                        notification.id,
                      )
                    }
                    onRemove={() =>
                      handleRemoveNotification(
                        notification.id,
                      )
                    }
                  />
                ),
              )}
            </div>
          )}
        </Card>
      </div>

      {/* MODAL EXCLUIR TODAS */}
      {deleteAllConfirmationOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
              <Trash2 className="h-6 w-6 text-red-600" />
            </div>

            <h2 className="mt-4 text-xl font-bold text-slate-950">
              Excluir todas as
              notificações?
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              Todas as suas
              notificações serão
              removidas. Essa ação
              não poderá ser
              desfeita.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  setDeleteAllConfirmationOpen(
                    false,
                  )
                }
              >
                Voltar
              </Button>

              <Button
                type="button"
                onClick={
                  handleRemoveAllNotifications
                }
                className="bg-red-600 text-white hover:bg-red-700"
              >
                <Trash2 className="mr-2 h-4 w-4" />

                Excluir todas
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
}: {
  notification: NotificationItem;
  onRead: () => void;
  onRemove: () => void;
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
          <p className="font-semibold text-slate-950">
            {
              notification.title
            }
          </p>

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