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
  password: string;

  /*
   * Quantidade de sessões disponíveis
   * no pacote atual do paciente.
   *
   * No futuro, isso virá do backend
   * de acordo com o plano/pacote
   * configurado pela clínica.
   */
  sessionsRemaining: number;
};

/*
 * Tipo usado somente para migrar
 * usuários antigos que ainda possuem
 * a propriedade "credits" salva
 * no localStorage.
 */
type LegacyStudent = Student & {
  credits?: number;
};

const STUDENTS_KEY =
  "pilates_students";

const BOOKINGS_KEY =
  "pilates_bookings";

const SESSION_KEY =
  "pilates_session";

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

export const INSTRUCTORS = [
  "Ana",
  "Bruno",
];

export const MAX_PER_SLOT = 3;

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

/*
 * Migração temporária:
 *
 * Converte automaticamente usuários
 * antigos que ainda possuem "credits"
 * para o novo campo
 * "sessionsRemaining".
 *
 * Depois que o backend estiver
 * integrado, essa migração poderá
 * ser removida.
 */
function migrateStudent(
  student: LegacyStudent,
): Student {
  /*
   * Usuário já está no formato novo.
   */
  if (
    typeof student.sessionsRemaining ===
    "number"
  ) {
    const {
      credits: _legacyCredits,
      ...currentStudent
    } = student;

    return currentStudent;
  }

  /*
   * Usuário antigo:
   * aproveita a quantidade de sessões do cadastro antigo
   * como quantidade de sessões.
   */
  const sessionsRemaining =
    typeof student.credits === "number"
      ? student.credits
      : 8;

  const {
    credits: _legacyCredits,
    ...studentWithoutCredits
  } = student;

  return {
    ...studentWithoutCredits,
    sessionsRemaining,
  };
}

export function getStudents(): Student[] {
  const storedStudents =
    read<LegacyStudent[]>(
      STUDENTS_KEY,
      [],
    );

  const migratedStudents =
    storedStudents.map(
      migrateStudent,
    );

  /*
   * Atualiza o localStorage
   * para o formato novo.
   */
  write(
    STUDENTS_KEY,
    migratedStudents,
  );

  return migratedStudents;
}

export function saveStudents(
  students: Student[],
) {
  write(
    STUDENTS_KEY,
    students,
  );
}

export function getBookings(): Booking[] {
  return read<Booking[]>(
    BOOKINGS_KEY,
    [],
  );
}

export function saveBookings(
  bookings: Booking[],
) {
  write(
    BOOKINGS_KEY,
    bookings,
  );
}

export function getSession(): Student | null {
  const storedStudent =
    read<LegacyStudent | null>(
      SESSION_KEY,
      null,
    );

  if (!storedStudent) {
    return null;
  }

  const migratedStudent =
    migrateStudent(
      storedStudent,
    );

  /*
   * Atualiza também a sessão
   * atual para o formato novo.
   */
  write(
    SESSION_KEY,
    migratedStudent,
  );

  return migratedStudent;
}

export function setSession(
  student: Student | null,
) {
  if (student) {
    write(
      SESSION_KEY,
      student,
    );

    return;
  }

  if (
    typeof window !== "undefined"
  ) {
    localStorage.removeItem(
      SESSION_KEY,
    );
  }
}

export function login(
  email: string,
  password: string,
): Student {
  const student =
    getStudents().find(
      (currentStudent) =>
        currentStudent.email.toLowerCase() ===
        email.toLowerCase(),
    );

  if (!student) {
    throw new Error(
      "Email não cadastrado.",
    );
  }

  if (
    student.password !==
    password
  ) {
    throw new Error(
      "Senha incorreta.",
    );
  }

  setSession(student);

  return student;
}

export function register(
  name: string,
  email: string,
  password: string,
): Student {
  const students =
    getStudents();

  const alreadyExists =
    students.some(
      (student) =>
        student.email.toLowerCase() ===
        email.toLowerCase(),
    );

  if (alreadyExists) {
    throw new Error(
      "Email já cadastrado. Faça login.",
    );
  }

  const student: Student = {
    id: crypto.randomUUID(),
    name,
    email,
    password,

    /*
     * Valor temporário para o
     * frontend atual.
     *
     * Depois será definido pelo
     * pacote cadastrado pela clínica.
     */
    sessionsRemaining: 8,
  };

  students.push(student);

  saveStudents(students);
  setSession(student);

  return student;
}

export function updateStudent(
  student: Student,
) {
  const students =
    getStudents().map(
      (currentStudent) =>
        currentStudent.id ===
        student.id
          ? student
          : currentStudent,
    );

  saveStudents(students);
  setSession(student);
}

export function getWeekDates(
  offset = 0,
): Date[] {
  const today = new Date();

  const day =
    today.getDay();

  const monday =
    new Date(today);

  monday.setDate(
    today.getDate() -
      ((day + 6) % 7) +
      offset * 7,
  );

  monday.setHours(
    0,
    0,
    0,
    0,
  );

  return Array.from(
    {
      length: 6,
    },
    (_, index) => {
      const date =
        new Date(monday);

      date.setDate(
        monday.getDate() +
          index,
      );

      return date;
    },
  );
}

export function fmtDate(
  date: Date,
): string {
  return date
    .toISOString()
    .slice(0, 10);
}

export function bookingsAt(
  date: string,
  time: string,
  instructor: string,
): Booking[] {
  return getBookings().filter(
    (booking) =>
      booking.date === date &&
      booking.time === time &&
      booking.instructor ===
        instructor,
  );
}

/*
 * Confirma a presença do paciente
 * em um agendamento existente.
 */
export function confirmBooking(
  bookingId: string,
): Booking {
  const bookings =
    getBookings();

  const booking =
    bookings.find(
      (currentBooking) =>
        currentBooking.id ===
        bookingId,
    );

  if (!booking) {
    throw new Error(
      "Agendamento não encontrado.",
    );
  }

  const updatedBooking: Booking = {
    ...booking,
    confirmed: true,
  };

  const updatedBookings =
    bookings.map(
      (currentBooking) =>
        currentBooking.id ===
        bookingId
          ? updatedBooking
          : currentBooking,
    );

  saveBookings(
    updatedBookings,
  );

  return updatedBooking;
}