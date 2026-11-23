import { redirect } from "@tanstack/react-router";
import { ApiError, apiRequest } from "./api";

type PatientProfile = {
  id: number;
  nome: string;
  email: string;
  telefone: string | null;
  dataNascimento: string | null;
  perfil: string;
};

type Registration = {
  nome: string;
  email: string;
  senha: string;
  telefone: string;
  dataNascimento: string;
};

const tokenKey = "timely_patient_token";
export const sessionEndedEvent = "timely:patient-session-ended";

let patient: PatientProfile | null = null;
let validation: { token: string; promise: Promise<PatientProfile | null> } | undefined;
let expiryTimer: number | undefined;
let loginAttempt = 0;

export function removeLegacyCredentials() {
  localStorage.removeItem("pilates_students");
  localStorage.removeItem("pilates_session");
}

export function getPatient() {
  return patient;
}

export function logout() {
  loginAttempt++;
  window.clearTimeout(expiryTimer);
  sessionStorage.removeItem(tokenKey);
  patient = null;
}

function endSession(token: string) {
  if (sessionStorage.getItem(tokenKey) !== token) return;
  logout();
  window.dispatchEvent(new Event(sessionEndedEvent));
}

function scheduleExpiry(token: string) {
  const payload = token.split(".")[1];
  const { exp } = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
  if (!Number.isFinite(exp)) throw new Error("O servidor retornou um token inválido.");
  const delay = exp * 1000 - Date.now();
  window.clearTimeout(expiryTimer);
  if (delay <= 0) {
    endSession(token);
    return;
  }
  expiryTimer = window.setTimeout(() => endSession(token), delay);
}

export async function authenticatedRequest<T>(
  path: `/${string}`,
  options: RequestInit = {},
): Promise<T> {
  const token = sessionStorage.getItem(tokenKey);
  if (!token) throw new ApiError(401);

  const headers = new Headers(options.headers);
  headers.set("Authorization", `Bearer ${token}`);

  try {
    return await apiRequest<T>(path, { ...options, headers });
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) endSession(token);
    throw error;
  }
}

function validateSession(): Promise<PatientProfile | null> {
  const token = sessionStorage.getItem(tokenKey);
  if (!token) return Promise.resolve(null);
  if (validation?.token === token) return validation.promise;

  const promise = (async () => {
    try {
      const profile = await authenticatedRequest<PatientProfile>("/auth/me");
      if (sessionStorage.getItem(tokenKey) !== token) return null;
      if (profile.perfil !== "PACIENTE") {
        endSession(token);
        return null;
      }
      try {
        scheduleExpiry(token);
      } catch {
        endSession(token);
        return null;
      }
      if (sessionStorage.getItem(tokenKey) !== token) return null;
      patient = profile;
      return profile;
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) return null;
      throw error;
    } finally {
      if (validation?.token === token) validation = undefined;
    }
  })();

  validation = { token, promise };
  return promise;
}

export async function requirePatient() {
  removeLegacyCredentials();
  if (!(await validateSession())) {
    throw redirect({ to: "/paciente", replace: true });
  }
}

export async function login(email: string, senha: string) {
  removeLegacyCredentials();
  logout();
  const attempt = loginAttempt;

  let result: { token: string };
  try {
    result = await apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: email.trim().toLowerCase(), senha }),
    });
  } catch (error) {
    if (error instanceof ApiError && [400, 401].includes(error.status)) {
      throw new Error("E-mail ou senha inválidos.");
    }
    throw error;
  }

  if (attempt !== loginAttempt) throw new Error("A tentativa de login foi substituída.");
  if (!result.token) throw new Error("O servidor não retornou o token de acesso.");
  sessionStorage.setItem(tokenKey, result.token);
  try {
    if (!(await validateSession())) {
      throw new Error("Não foi possível validar uma sessão de paciente com esta conta.");
    }
  } catch (error) {
    if (attempt === loginAttempt) logout();
    throw error;
  }
}

export async function register(registration: Registration) {
  removeLegacyCredentials();
  try {
    await apiRequest<unknown>("/auth/register", {
      method: "POST",
      body: JSON.stringify(registration),
    });
  } catch (error) {
    if (error instanceof ApiError && error.status === 409) {
      throw new Error("Este e-mail já está cadastrado. Faça login.");
    }
    if (error instanceof ApiError && error.status === 400) {
      throw new Error("Confira os dados informados e tente novamente.");
    }
    throw error;
  }
}
