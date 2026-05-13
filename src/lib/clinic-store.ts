export type Booking = {
  id: string;
  studentId: string;
  studentName: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  instructor: string;
};

export type Student = {
  id: string;
  name: string;
  email: string;
  password: string;
  credits: number;
};

const STUDENTS_KEY = "pilates_students";
const BOOKINGS_KEY = "pilates_bookings";
const SESSION_KEY = "pilates_session";

export const TIME_SLOTS = ["07:00", "08:00", "09:00", "10:00", "17:00", "18:00", "19:00", "20:00"];
export const INSTRUCTORS = ["Ana", "Bruno"];
export const MAX_PER_SLOT = 3;

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const v = localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}
function write<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

export function getStudents(): Student[] {
  return read<Student[]>(STUDENTS_KEY, []);
}
export function saveStudents(s: Student[]) { write(STUDENTS_KEY, s); }

export function getBookings(): Booking[] {
  return read<Booking[]>(BOOKINGS_KEY, []);
}
export function saveBookings(b: Booking[]) { write(BOOKINGS_KEY, b); }

export function getSession(): Student | null {
  return read<Student | null>(SESSION_KEY, null);
}
export function setSession(s: Student | null) {
  if (s) write(SESSION_KEY, s); else if (typeof window !== "undefined") localStorage.removeItem(SESSION_KEY);
}

export function login(email: string, password: string): Student {
  const s = getStudents().find((x) => x.email.toLowerCase() === email.toLowerCase());
  if (!s) throw new Error("Email não cadastrado.");
  if (s.password !== password) throw new Error("Senha incorreta.");
  setSession(s);
  return s;
}

export function register(name: string, email: string, password: string): Student {
  const students = getStudents();
  if (students.some((x) => x.email.toLowerCase() === email.toLowerCase()))
    throw new Error("Email já cadastrado. Faça login.");
  const s: Student = { id: crypto.randomUUID(), name, email, password, credits: 8 };
  students.push(s);
  saveStudents(students);
  setSession(s);
  return s;
}

export function updateStudent(s: Student) {
  const students = getStudents().map((x) => (x.id === s.id ? s : x));
  saveStudents(students);
  setSession(s);
}

export function getWeekDates(offset = 0): Date[] {
  const today = new Date();
  const day = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((day + 6) % 7) + offset * 7);
  monday.setHours(0, 0, 0, 0);
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

export function fmtDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function bookingsAt(date: string, time: string, instructor: string): Booking[] {
  return getBookings().filter(
    (b) => b.date === date && b.time === time && b.instructor === instructor,
  );
}
