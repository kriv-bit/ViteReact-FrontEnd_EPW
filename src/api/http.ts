export const API_URL = import.meta.env.VITE_API_URL;

// Token de autenticación global (se configura desde App.tsx)
let authToken: string | null = null;

/**
 * Configura el token JWT que se incluirá en todas las peticiones http()
 * Pasar null para limpiar el token (logout)
 */
export function setAuthToken(token: string | null) {
  console.log(
    "[http.ts] setAuthToken llamado con:",
    token ? token.slice(0, 20) + "..." : "null",
  );
  authToken = token;
}

/**
 * Devuelve el token actual (para debugging)
 */
export function getAuthToken(): string | null {
  return authToken;
}

export async function http<T>(path: string, options?: RequestInit): Promise<T> {
  // Construimos los headers base
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  // Si hay token, lo agregamos al header Authorization
  if (authToken) {
    headers["Authorization"] = `Bearer ${authToken}`;
    console.log(
      `[http.ts] ➡️ GET ${path} — Token incluido: ${authToken.slice(0, 20)}...`,
    );
  } else {
    console.log(`[http.ts] ⚠️ GET ${path} — SIN TOKEN`);
  }

  // Merge con headers adicionales que vengan en options
  if (options?.headers) {
    Object.assign(headers, options.headers);
  }

  const res = await fetch(`${API_URL}${path}`, {
    headers,
    ...options,
  });

  if (!res.ok) {
    const msg = await res.text();
    console.error(`[http.ts] ❌ ${path} — Status ${res.status}: ${msg}`);
    throw new Error(msg || `HTTP ${res.status}`);
  }

  if (res.status === 204) return undefined as T;

  return res.json() as Promise<T>;
}
