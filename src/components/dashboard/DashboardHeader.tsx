import {
  useEffect,
  useState,
} from "react";

import {
  Bell,
  CalendarDays,
  CheckCircle2,
  Info,
  X,
  XCircle,
} from "lucide-react";

import { useNavigate } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";

import type {
  Student,
} from "@/lib/clinic-store";

import {
  getStudentNotifications,
  markNotificationAsRead,
  type NotificationItem,
} from "@/lib/notification-store";

type DashboardHeaderProps = {
  student: Student;
};

export function DashboardHeader({
  student,
}: DashboardHeaderProps) {
  const navigate = useNavigate();

  const [
    notificationsOpen,
    setNotificationsOpen,
  ] = useState(false);

  const [
    notifications,
    setNotifications,
  ] = useState<NotificationItem[]>([]);

  const firstName =
    student.name?.trim().split(" ")[0] ||
    "Aluno";

  const initial =
    firstName.charAt(0).toUpperCase();

  /*
   * Atualiza as notificações
   * do paciente atual.
   */
  const refreshNotifications = () => {
    const updatedNotifications =
      getStudentNotifications(
        student.id,
      );

    setNotifications(
      updatedNotifications,
    );
  };

  /*
   * Carrega as notificações e
   * escuta alterações feitas
   * em outras partes do sistema.
   */
  useEffect(() => {
    refreshNotifications();

    const handleNotificationsUpdated =
      () => {
        refreshNotifications();
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
  }, [student.id]);

  /*
   * Quantidade de notificações
   * ainda não lidas.
   */
  const unreadCount =
    notifications.filter(
      (notification) =>
        !notification.read,
    ).length;

  /*
   * Mostra somente as quatro
   * notificações mais recentes.
   */
  const recentNotifications =
    notifications.slice(0, 4);

  /*
   * Marca uma notificação
   * individual como lida.
   */
  const handleNotificationClick = (
    notification: NotificationItem,
  ) => {
    if (!notification.read) {
      markNotificationAsRead(
        notification.id,
      );

      refreshNotifications();
    }
  };

  /*
   * Define ícone e cores
   * de cada tipo de notificação.
   */
  const getNotificationStyle = (
    notification: NotificationItem,
  ) => {
    if (
      notification.type ===
      "confirmacao"
    ) {
      return {
        icon: CheckCircle2,
        iconColor:
          "text-emerald-600",
        iconBackground:
          "bg-emerald-50",
      };
    }

    if (
      notification.type ===
      "cancelamento"
    ) {
      return {
        icon: XCircle,
        iconColor:
          "text-red-600",
        iconBackground:
          "bg-red-50",
      };
    }

    if (
      notification.type ===
      "aula"
    ) {
      return {
        icon: CalendarDays,
        iconColor:
          "text-blue-600",
        iconBackground:
          "bg-blue-50",
      };
    }

    return {
      icon: Info,
      iconColor:
        "text-amber-600",
      iconBackground:
        "bg-amber-50",
    };
  };

  return (
    <header className="relative mb-8 flex flex-wrap items-center justify-between gap-6">
      {/* SAUDAÇÃO */}
      <div>
        <p className="text-sm font-semibold text-primary">
          Timely • Autoatendimento
        </p>

        <h1 className="mt-1 text-2xl font-bold md:text-3xl">
          Olá, {firstName}! 👋
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          {new Date().toLocaleDateString(
            "pt-BR",
            {
              weekday: "long",
              day: "2-digit",
              month: "long",
              year: "numeric",
            },
          )}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {/* NOTIFICAÇÕES */}
        <div className="relative">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="relative bg-white text-black hover:bg-gray-100"
            aria-label="Notificações"
            onClick={() =>
              setNotificationsOpen(
                (current) =>
                  !current,
              )
            }
          >
            <Bell className="h-4 w-4" />

            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
                {unreadCount > 99
                  ? "99+"
                  : unreadCount}
              </span>
            )}
          </Button>

          {notificationsOpen && (
            <div className="absolute right-0 top-12 z-50 w-[360px] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl">
              {/* CABEÇALHO */}
              <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
                <div>
                  <h2 className="font-semibold text-black">
                    Notificações
                  </h2>

                  <p className="mt-0.5 text-xs text-gray-500">
                    {unreadCount === 0
                      ? "Nenhuma nova notificação"
                      : unreadCount === 1
                        ? "1 nova notificação"
                        : `${unreadCount} novas notificações`}
                  </p>
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-black hover:bg-gray-100"
                  onClick={() =>
                    setNotificationsOpen(
                      false,
                    )
                  }
                  aria-label="Fechar notificações"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* LISTA */}
              <div className="max-h-[360px] overflow-y-auto">
                {recentNotifications.length ===
                0 ? (
                  <div className="px-6 py-10 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                      <Bell className="h-5 w-5 text-gray-400" />
                    </div>

                    <p className="mt-3 text-sm font-semibold text-gray-700">
                      Nenhuma notificação
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      Suas atualizações aparecerão
                      aqui.
                    </p>
                  </div>
                ) : (
                  recentNotifications.map(
                    (notification) => {
                      const style =
                        getNotificationStyle(
                          notification,
                        );

                      const Icon =
                        style.icon;

                      return (
                        <button
                          key={
                            notification.id
                          }
                          type="button"
                          onClick={() =>
                            handleNotificationClick(
                              notification,
                            )
                          }
                          className={`flex w-full gap-3 border-b border-gray-100 px-5 py-4 text-left transition last:border-b-0 ${
                            notification.read
                              ? "bg-white hover:bg-gray-50"
                              : "bg-blue-50/40 hover:bg-blue-50/70"
                          }`}
                        >
                          {/* ÍCONE */}
                          <div
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${style.iconBackground}`}
                          >
                            <Icon
                              className={`h-5 w-5 ${style.iconColor}`}
                            />
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex min-w-0 items-center gap-2">
                                <p
                                  className={`truncate text-sm text-black ${
                                    notification.read
                                      ? "font-medium"
                                      : "font-semibold"
                                  }`}
                                >
                                  {
                                    notification.title
                                  }
                                </p>

                                {!notification.read && (
                                  <span
                                    className="h-2 w-2 shrink-0 rounded-full bg-blue-500"
                                    aria-label="Não lida"
                                  />
                                )}
                              </div>

                              <span className="whitespace-nowrap text-[11px] text-gray-400">
                                {
                                  notification.time
                                }
                              </span>
                            </div>

                            <p className="mt-1 text-xs leading-relaxed text-gray-600">
                              {
                                notification.description
                              }
                            </p>
                          </div>
                        </button>
                      );
                    },
                  )
                )}
              </div>

              {/* RODAPÉ */}
              <div className="border-t border-gray-200 bg-white p-3">
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full text-sm font-semibold text-black hover:bg-gray-100"
                  onClick={() => {
                    setNotificationsOpen(
                      false,
                    );

                    navigate({
                      to: "/notificacoes",
                    });
                  }}
                >
                  Ver todas as notificações
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* SESSÕES DISPONÍVEIS */}
        <div className="flex items-center gap-2 rounded-xl bg-accent px-4 py-2 shadow-sm">
          <CalendarDays className="h-5 w-5 text-accent-foreground" />

          <span className="font-semibold text-accent-foreground">
            {student.sessionsRemaining}{" "}
            {student.sessionsRemaining === 1
              ? "sessão disponível"
              : "sessões disponíveis"}
          </span>
        </div>

        {/* PERFIL */}
        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-primary text-sm font-bold text-primary-foreground shadow-sm transition hover:scale-105"
          aria-label={`Perfil de ${firstName}`}
          title={firstName}
          onClick={() =>
            navigate({
              to: "/perfil",
            })
          }
        >
          {initial}
        </button>
      </div>
    </header>
  );
}