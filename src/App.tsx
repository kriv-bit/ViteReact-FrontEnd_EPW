import { useState, useCallback } from "react";
// Contenido de las páginas
import DepartamentPage from "./pages/DepartamentPage";
import CustomersPage from "./pages/CustomersPage";
import TestMenuOptionPage from "./pages/TestMenuOptionPage";
import AboutMePage from "./pages/AboutMePage";
// Organizador de la interfaz
import MainLayout from "./layouts/MainLayout";
// Contenedor del menu
import SidebarMenu from "./components/SidebarMenu";
// API y hooks
import { setAuthToken } from "./api/http";
import { menuApi } from "./api/menu";
import { useMenuOptions } from "./api/menu.queries";

// Mapeo de rol (string) a roleId (número)
const ROLE_TO_ID: Record<string, number> = {
  ADMIN: 1,
  CUSTOMER: 2,
  PROVIDER: 3,
};

// Credenciales fijas para cada botón de ingreso rápido
const LOGIN_CREDENTIALS: Record<
  string,
  { username: string; password: string }
> = {
  admin: { username: "admin_user", password: "123" },
  customer: { username: "customer_user", password: "123" },
  provider: { username: "provider_user", password: "123" },
};

function App() {
  // ─── Estado de autenticación ───────────────────────────
  const [token, setToken] = useState<string | null>(null);
  const [roleId, setRoleId] = useState<number | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // ─── Estado de la página actual ────────────────────────
  const [page, setPage] = useState("abtme");

  // ─── Hook: carga las opciones de menú SOLO si hay token ─
  const {
    data: menuOptions = [],
    isLoading: menuLoading,
    isError: menuError,
    error: menuErrorObj,
  } = useMenuOptions(roleId);

  // ─── Handlers ──────────────────────────────────────────
  const handleLogin = useCallback(async (role: string) => {
    const creds = LOGIN_CREDENTIALS[role];
    if (!creds) return;

    setIsLoggingIn(true);
    setLoginError(null);

    try {
      const res = await menuApi.login(creds.username, creds.password);

      console.log("[App] Login exitoso:", {
        username: res.username,
        role: res.role,
        token: res.token?.slice(0, 20) + "...",
      });

      // Configurar el token global ANTES de actualizar el estado
      setAuthToken(res.token);
      console.log("[App] Token configurado globalmente ✅");
      setToken(res.token);
      setUsername(res.username);
      setRoleId(ROLE_TO_ID[res.role] ?? null);
      if (!ROLE_TO_ID[res.role]) {
        console.warn("[App] ⚠️ Rol no encontrado en ROLE_TO_ID:", res.role);
      }
      setPage("abtme");
    } catch (err: any) {
      console.error("[App] Error en login:", err);
      setLoginError(err.message || "Error al iniciar sesión");
    } finally {
      setIsLoggingIn(false);
    }
  }, []);

  const handleLogout = useCallback(() => {
    setToken(null);
    setRoleId(null);
    setUsername(null);
    setLoginError(null);
    setPage("abtme");
    // Limpiar el token global
    setAuthToken(null);
  }, []);

  // ─── Render de contenido según la página ───────────────
  function renderContent() {
    // Si no hay pages definidas para algunas opciones, mostramos AboutMe
    switch (page) {
      case "customers":
        return <CustomersPage />;
      case "departments":
        return <DepartamentPage />;
      case "providers":
      case "users":
        // Placeholder: mientras no existan esas páginas
        return (
          <div className="flex items-center justify-center h-64 text-slate-400 text-xl">
            {page === "providers" ? "Providers" : "Usuarios"} — Próximamente
          </div>
        );
      case "test":
        return <TestMenuOptionPage />;
      case "abtme":
      default:
        return <AboutMePage />;
    }
  }

  return (
    <MainLayout
      sidebar={
        <SidebarMenu
          current={page}
          onChange={setPage}
          token={token}
          username={username}
          menuOptions={menuOptions}
          menuLoading={menuLoading}
          menuError={menuError}
          menuErrorMsg={
            menuErrorObj instanceof Error
              ? menuErrorObj.message
              : String(menuErrorObj ?? "")
          }
          loginError={loginError}
          isLoggingIn={isLoggingIn}
          onLogin={handleLogin}
          onLogout={handleLogout}
        />
      }
      content={renderContent()}
    />
  );
}

export default App;
