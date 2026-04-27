import { http, API_URL } from "./http";

export type MenuOption = {
  name: string;
  content: string;
};

export type AuthResponse = {
  token: string;
  username: string;
  role: string;
};

export const menuApi = {
  /**
   * Hace login con credenciales y devuelve token + rol
   * (usa fetch directo porque es un endpoint público)
   */
  login: async (username: string, password: string): Promise<AuthResponse> => {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) {
      const msg = await res.text();
      throw new Error(msg || `HTTP ${res.status}`);
    }
    return res.json();
  },

  /**
   * Obtiene las opciones de menú según el roleId.
   * El token JWT se agrega automáticamente desde http()
   */
  getByRole: async (roleId: number): Promise<MenuOption[]> => {
    return http<MenuOption[]>(`/api/menu/${roleId}`);
  },
};
