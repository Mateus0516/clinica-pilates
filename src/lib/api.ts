const baseUrl = (import.meta.env.VITE_API_URL || "http://localhost:8080").replace(/\/+$/, "");

export class ApiError extends Error {
  constructor(public readonly status: number, public readonly detail?: string) {
    super(`A API respondeu com status ${status}.`);
  }
}

export async function apiRequest<T>(
  path: `/${string}`,
  options: RequestInit = {},
): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set("Accept", "application/json");
  if (options.body) headers.set("Content-Type", "application/json");

  let response: Response;
  try {
    response = await fetch(`${baseUrl}${path}`, { ...options, headers, cache: "no-store" });
  } catch (error) {
    if (options.signal?.aborted) throw error;
    throw new Error("Não foi possível conectar ao servidor. Tente novamente.");
  }

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new ApiError(response.status, typeof body?.erro === "string" ? body.erro : undefined);
  }

  return response.json() as Promise<T>;
}
