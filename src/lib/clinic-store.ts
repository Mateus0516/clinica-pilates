import { getPatient } from "./auth";

export type Student = {
  id: string;
  name: string;
  email: string;
  phone: string;
  birthDate: string;
};

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

export function getSession(): Student | null {
  const patient = getPatient();
  if (!patient) return null;

  return {
    id: String(patient.id),
    name: patient.nome,
    email: patient.email,
    phone: patient.telefone ?? "",
    birthDate: patient.dataNascimento ?? "",
  };
}
