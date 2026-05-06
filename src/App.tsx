import { useState, useCallback, useEffect } from "react";
// Contenido de las páginas
import CustomersPage from "./pages/CustomersPage";
import DepartamentPage from "./pages/DepartamentPage";
import TestMenuOptionPage from "./pages/TestMenuOptionPage";
import AboutMePage from "./pages/AboutMePage";
import DashBoardPage from "./pages/DashBoardPage";
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
// Protección de rutas y Login (del profe)
import LoginPage from "./pages/LoginPage";
import PrivateRoute from "./components/PrivateRoute";

// Mapeo de rol (string) a roleId (número)
const ROLE_TO_ID: Record<string, number> = {
  ADMIN: 1,
  CUSTOMER: 2,
  PROVIDER: 3,
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
  const [page, setPage] = useState("customers");

  // ─── Sincronizar token global al restaurar sesión ────
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      restoreTokenFromStorage();
      console.log("[App] Token global restaurado desde localStorage ✅");
    }
  }, []);

  // ─── Hook: carga las opciones de menú SOLO si hay roleId ─
  const {
    data: menuOptions = [],
    isLoading: menuLoading,
    isError: menuError,
    error: menuErrorObj,
  } = useMenuOptions(roleId);

  // ─── Handler llamado por LoginPage tras login exitoso ──
  const handleLoginSuccess = useCallback(
    async (username: string, password: string) => {
      try {
        const res = await menuApi.login(username, password);

        console.log("[App] Login exitoso:", {
          username: res.username,
          role: res.role,
          token: res.token?.slice(0, 20) + "...",
        });

        // 1. Configurar el token global (para http())
        setAuthToken(res.token);

        // 2. Actualizar AuthContext (persiste en localStorage)
        authLogin(res.token, res.username, res.role);

        // 3. Calcular y guardar roleId
        const id = ROLE_TO_ID[res.role] ?? null;
        setRoleId(id);
        localStorage.setItem("role", res.role);

        if (!id) {
          console.warn("[App] ⚠️ Rol no encontrado en ROLE_TO_ID:", res.role);
        }

        setPage("customers");
      } catch (err) {
        console.error("[App] Error en login:", err);
        // Relanzar para que LoginPage maneje el error
        throw err;
      }
    },
    [authLogin],
  );

  // ─── Handler: cierre de sesión ───────────────────────
  const handleLogout = useCallback(() => {
    setAuthToken(null);
    authLogout();
    setRoleId(null);
    setPage("customers");
  }, [authLogout]);

  // ─── Render de contenido según la página ─────────────
  function renderContent() {
    switch (page) {
      case "customers":
        return <CustomersPage />;
      case "departments":
        return <DepartamentPage />;
      case "providers":
      case "dashboard":
        return <DashBoardPage />;
      case "users":
        return (
          <div className="flex items-center justify-center h-64 text-slate-400 text-xl">
            Próximamente
          </div>
        );
      case "test":
        return <TestMenuOptionPage />;
      case "abtme":
        return <AboutMePage />;
      default:
        return <AboutMePage />;
    }
  }

  // ─── Render de la app (protegida por PrivateRoute) ───
  return (
    <PrivateRoute fallback={<LoginPage onLogin={handleLoginSuccess} />}>
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
            onLogout={handleLogout}
          />
        }
        content={renderContent()}
      />
    </PrivateRoute>
  );
}

export default App;
