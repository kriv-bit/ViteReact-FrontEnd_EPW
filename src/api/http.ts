export const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080";

// Token de autenticación global (se sincroniza con localStorage)
let authToken: string | null = null;

/**
 * Configura el token JWT que se incluirá en todas las peticiones http().
 * También lo persiste en localStorage para que sobreviva a recargas.
 * Pasar null para limpiar el token (logout).
 */
export function setAuthToken(token: string | null) {
  console.log(
    "[http.ts] setAuthToken llamado con:",
    token ? token.slice(0, 20) + "..." : "null",
  );

  authToken = token;

  // Sincronizar con localStorage (persistencia al estilo del profe)
  if (token) {
    localStorage.setItem("token", token);
  } else {
    localStorage.removeItem("token");
  }
}

/**
 * Devuelve el token actual (para debugging)
 */
export function getAuthToken(): string | null {
  return authToken;
}

/**
 * Inicializa el token global desde localStorage (útil al cargar la app).
 * Se llama una vez desde App.tsx cuando se restaura la sesión.
 */
export function restoreTokenFromStorage(): string | null {
  const stored = localStorage.getItem("token");
  if (stored) {
    authToken = stored;
    console.log("[http.ts] Token restaurado desde localStorage ✅");
  }
  return authToken;
}

export async function http<T>(path: string, options?: RequestInit): Promise<T> {
  // Construimos los headers base
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  // Si hay token (global o en localStorage), lo agregamos al header Authorization
  const token = authToken ?? localStorage.getItem("token");
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
    console.log(
      `[http.ts] ➡️ ${options?.method ?? "GET"} ${path} — Token incluido: ${token.slice(0, 20)}...`,
    );
  } else {
    console.log(`[http.ts] ⚠️ ${options?.method ?? "GET"} ${path} — SIN TOKEN`);
  }

  // Merge con headers adicionales que vengan en options
  if (options?.headers) {
    Object.assign(headers, options.headers);
  }

  const res = await fetch(`${API_URL}${path}`, {
    headers,
    ...options,
  });

  // Si el servidor responde 401, el token expiró → limpiar sesión
  if (res.status === 401) {
    console.error("[http.ts] ❌ 401 Unauthorized — Sesión expirada");
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    authToken = null;
    throw new Error("Sesión expirada");
  }

  if (!res.ok) {
    const msg = await res.text();
    console.error(`[http.ts] ❌ ${path} — Status ${res.status}: ${msg}`);
    throw new Error(msg || `HTTP ${res.status}`);
  }

  if (res.status === 204) return undefined as T;

  return res.json() as Promise<T>;
}
