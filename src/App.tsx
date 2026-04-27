import { useState, useCallback, useEffect } from "react";
// Contenido de las páginas
import CustomersPage from "./pages/CustomersPage";
import DepartamentPage from "./pages/DepartamentPage";
import TestMenuOptionPage from "./pages/TestMenuOptionPage";
import AboutMePage from "./pages/AboutMePage";
// Organizador de la interfaz
import MainLayout from "./layouts/MainLayout";
// Contenedor del menú
import SidebarMenu from "./components/SidebarMenu";
// API y hooks
import { setAuthToken, restoreTokenFromStorage } from "./api/http";
import { menuApi } from "./api/menu";
import { useMenuOptions } from "./api/menu.queries";
// Contexto de autenticación (del profe)
import { useAuth } from "./context/AuthContext";

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
  // ─── Estado global de autenticación (AuthContext → localStorage) ──
  const { user, login: authLogin, logout: authLogout } = useAuth();

  // ─── Estado local ────────────────────────────────────
  const [roleId, setRoleId] = useState<number | null>(() => {
    // Al iniciar, intentar restaurar el roleId desde localStorage
    const storedRole = localStorage.getItem("role");
    if (storedRole && ROLE_TO_ID[storedRole] !== undefined) {
      return ROLE_TO_ID[storedRole];
    }
    return null;
  });
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // ─── Estado de la página actual ──────────────────────
  const [page, setPage] = useState("abtme");

  // ─── Sincronizar token global al restaurar sesión ────
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      restoreTokenFromStorage();
      console.log("[App] Token global restaurado desde localStorage ✅");
    }
  }, []); // Solo al montar (no necesita dependencias, lee directo de localStorage)

  // ─── Hook: carga las opciones de menú SOLO si hay roleId ─
  const {
    data: menuOptions = [],
    isLoading: menuLoading,
    isError: menuError,
    error: menuErrorObj,
  } = useMenuOptions(roleId);

  // ─── Handlers ────────────────────────────────────────
  const handleLogin = useCallback(
    async (role: string) => {
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

        // 1. Configurar el token global (para http())
        setAuthToken(res.token);
        console.log("[App] Token configurado globalmente ✅");

        // 2. Actualizar AuthContext (persiste en localStorage)
        authLogin(res.token, res.username, res.role);

        // 3. Calcular y guardar roleId
        const id = ROLE_TO_ID[res.role] ?? null;
        setRoleId(id);
        localStorage.setItem("role", res.role);

        if (!id) {
          console.warn("[App] ⚠️ Rol no encontrado en ROLE_TO_ID:", res.role);
        }

        setPage("abtme");
      } catch (err: any) {
        console.error("[App] Error en login:", err);
        setLoginError(err.message || "Error al iniciar sesión");
      } finally {
        setIsLoggingIn(false);
      }
    },
    [authLogin],
  );

  const handleLogout = useCallback(() => {
    // 1. Limpiar el token global
    setAuthToken(null);

    // 2. Actualizar AuthContext (limpia localStorage)
    authLogout();

    // 3. Limpiar estado local
    setRoleId(null);
    setLoginError(null);
    setPage("abtme");
  }, [authLogout]);

  // ─── Render de contenido según la página ─────────────
  function renderContent() {
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
          token={user?.token ?? null}
          username={user?.username ?? null}
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
