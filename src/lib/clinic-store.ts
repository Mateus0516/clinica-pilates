import { getPatient } from "./auth";

export type Booking = {
  id: string;
  studentId: string;
  studentName: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  instructor: string;
  confirmed?: boolean;
};

export type Student = {
  id: string;
  name: string;
  email: string;
  phone: string;
  birthDate: string;
  sessionsRemaining: number;
};

type LocalStudent = Partial<Pick<Student, "name" | "email" | "sessionsRemaining">>;

const BOOKINGS_KEY = "pilates_bookings";

export const TIME_SLOTS = [
  "07:00",
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
];

function read<T>(
  key: string,
  fallback: T,
): T {
  if (
    typeof window === "undefined"
  ) {
    return fallback;
  }

  try {
    const value =
      localStorage.getItem(key);

    return value
      ? (JSON.parse(value) as T)
      : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(
  key: string,
  value: T,
) {
  if (
    typeof window === "undefined"
  ) {
    return;
  }

  localStorage.setItem(
    key,
    JSON.stringify(value),
  );
}

// Read-only legacy data for profile screens outside the scheduling integration.
export function getBookings(): Booking[] {
  return read<Booking[]>(
    BOOKINGS_KEY,
    [],
  );
}

export function getSession(): Student | null {
  const patient = getPatient();
  if (!patient) return null;

  const local = read<LocalStudent>(`timely_patient_preferences:${patient.id}`, {});
  return {
    id: String(patient.id),
    name: local.name ?? patient.nome,
    email: local.email ?? patient.email,
    phone: patient.telefone ?? "",
    birthDate: patient.dataNascimento ?? "",
    // Regra local preexistente até a integração de planos e sessões.
    sessionsRemaining: local.sessionsRemaining ?? 8,
  };
}

export function updateStudent(student: Student) {
  const current = getSession();
  if (!current || current.id !== student.id) return;

  const key = `timely_patient_preferences:${student.id}`;
  const local = read<LocalStudent>(key, {});
  write(key, {
    ...local,
    ...(current.name !== student.name && { name: student.name }),
    ...(current.email !== student.email && { email: student.email }),
  } satisfies LocalStudent);
}
