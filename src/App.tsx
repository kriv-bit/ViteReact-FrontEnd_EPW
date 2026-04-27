import { useState } from "react";
//Contenido de la pagina
import CustomersPage from "./pages/CustomersPage";
import DepartamentPage from "./pages/DepartamentPage";
import TestMenuOptionPage from "./pages/TestMenuOptionPage";
//Organizador de la interfaz
import MainLayout from "./layouts/MainLayout";
//Contenedor del menú
import SidebarMenu from "./components/SidebarMenu";
import { useAuth } from "./context/AuthContext";
import LoginPage from "./pages/LoginPage";
import PrivateRoute from "./components/PrivateRoute";
import AboutMePage from "./pages/AboutMePage";
function App() {
  const { user, logout } = useAuth();
  const [page, setPage] = useState("customers");
  const [menuOptions, setMenuOptions] = useState([
    {
      name: "customers",
      content: "Customers",
    },
    {
      name: "departments",
      content: "Departments",
    },
    {
      name: "tmo",
      content: "TMO",
    },
    {
      name: "abtme",
      content: "About Me",
    },
    {
      name: "log-out",
      content: "Log out",
    },
  ]);
  function renderContent() {
    switch (page) {
      case "customers":
        return <CustomersPage />;
      case "departments":
        return <DepartamentPage />;
      case "tmo":
        return <TestMenuOptionPage />;
      case "abtme":
        return <AboutMePage />;
      default:
        return <CustomersPage />;
    }
  }
  const sidebar = (
    <div>
      <SidebarMenu
        current={page}
        onChange={setPage}
        menuOptions={menuOptions}
      />
      <div className="mt-6 border-t pt-4">
        <p className="text-xs text-gray-500 mb-2">Hola, {user?.username}</p>
        <button
          onClick={logout}
          className="text-sm text-red-600 hover:underline"
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  );
  return (
    <PrivateRoute fallback={<LoginPage onSuccess={() => {}} />}>
      <MainLayout sidebar={sidebar} content={renderContent()} />
    </PrivateRoute>
  );
}
export default App;
