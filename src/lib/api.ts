const baseUrl = (import.meta.env.VITE_API_URL || "http://localhost:8080").replace(/\/+$/, "");

export class ApiError extends Error {
  constructor(public readonly status: number) {
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
  } catch {
    throw new Error("Não foi possível conectar ao servidor. Tente novamente.");
  }

  if (!response.ok) throw new ApiError(response.status);

  return response.json() as Promise<T>;
}
