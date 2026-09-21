export type NotificationType =
  | "confirmacao"
  | "aula"
  | "lembrete"
  | "cancelamento";

export type NotificationItem = {
  id: string;
  studentId: string;
  title: string;
  description: string;
  time: string;
  type: NotificationType;
  read: boolean;
  createdAt: string;

  /*
   * Identificador opcional da aula.
   *
   * Usado principalmente nos
   * lembretes para impedir que
   * a mesma aula gere várias
   * notificações.
   */
  bookingId?: string;
};

const NOTIFICATIONS_KEY =
  "timely_notifications";

/*
 * Retorna todas as notificações.
 */
export function getNotifications(): NotificationItem[] {
  const storedNotifications =
    localStorage.getItem(
      NOTIFICATIONS_KEY,
    );

  if (!storedNotifications) {
    return [];
  }

  try {
    return JSON.parse(
      storedNotifications,
    ) as NotificationItem[];
  } catch {
    return [];
  }
}

/*
 * Salva todas as notificações.
 *
 * Também dispara um evento para
 * atualizar o sino e outras telas.
 */
export function saveNotifications(
  notifications: NotificationItem[],
) {
  localStorage.setItem(
    NOTIFICATIONS_KEY,
    JSON.stringify(notifications),
  );

  window.dispatchEvent(
    new Event(
      "timely-notifications-updated",
    ),
  );
}

/*
 * Adiciona uma nova notificação.
 */
export function addNotification(
  notification: Omit<
    NotificationItem,
    "id" | "createdAt" | "read"
  >,
) {
  const notifications =
    getNotifications();

  const newNotification: NotificationItem = {
    ...notification,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    read: false,
  };

  saveNotifications([
    newNotification,
    ...notifications,
  ]);

  return newNotification;
}

/*
 * Verifica se já existe uma
 * notificação de determinado tipo
 * relacionada a uma aula.
 */
export function hasBookingNotification(
  studentId: string,
  bookingId: string,
  type: NotificationType,
) {
  return getNotifications().some(
    (notification) =>
      notification.studentId ===
        studentId &&
      notification.bookingId ===
        bookingId &&
      notification.type === type,
  );
}

/*
 * Adiciona uma notificação relacionada
 * a uma aula apenas se ela ainda
 * não existir.
 *
 * Evita lembretes duplicados.
 */
export function addBookingNotificationOnce(
  notification: Omit<
    NotificationItem,
    "id" | "createdAt" | "read"
  > & {
    bookingId: string;
  },
) {
  const alreadyExists =
    hasBookingNotification(
      notification.studentId,
      notification.bookingId,
      notification.type,
    );

  if (alreadyExists) {
    return null;
  }

  return addNotification(
    notification,
  );
}

/*
 * Retorna somente as notificações
 * do paciente informado.
 */
export function getStudentNotifications(
  studentId: string,
) {
  return getNotifications()
    .filter(
      (notification) =>
        notification.studentId ===
        studentId,
    )
    .sort(
      (
        notificationA,
        notificationB,
      ) =>
        new Date(
          notificationB.createdAt,
        ).getTime() -
        new Date(
          notificationA.createdAt,
        ).getTime(),
    );
}

/*
 * Marca uma notificação como lida.
 */
export function markNotificationAsRead(
  notificationId: string,
) {
  const updatedNotifications =
    getNotifications().map(
      (notification) =>
        notification.id ===
        notificationId
          ? {
              ...notification,
              read: true,
            }
          : notification,
    );

  saveNotifications(
    updatedNotifications,
  );
}

/*
 * Marca todas as notificações
 * do paciente como lidas.
 */
export function markAllNotificationsAsRead(
  studentId: string,
) {
  const updatedNotifications =
    getNotifications().map(
      (notification) =>
        notification.studentId ===
        studentId
          ? {
              ...notification,
              read: true,
            }
          : notification,
    );

  saveNotifications(
    updatedNotifications,
  );
}

/*
 * Exclui apenas uma notificação.
 */
export function removeNotification(
  notificationId: string,
) {
  const updatedNotifications =
    getNotifications().filter(
      (notification) =>
        notification.id !==
        notificationId,
    );

  saveNotifications(
    updatedNotifications,
  );
}

/*
 * Exclui todas as notificações
 * somente do paciente informado.
 *
 * Notificações de outros pacientes
 * permanecem salvas.
 */
export function removeAllStudentNotifications(
  studentId: string,
) {
  const updatedNotifications =
    getNotifications().filter(
      (notification) =>
        notification.studentId !==
        studentId,
    );

  saveNotifications(
    updatedNotifications,
  );
}

/*
 * Retorna a quantidade de
 * notificações não lidas.
 */
export function getUnreadNotificationCount(
  studentId: string,
) {
  return getStudentNotifications(
    studentId,
  ).filter(
    (notification) =>
      !notification.read,
  ).length;
}