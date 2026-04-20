import { useState } from "react";
//Contenido de la PAgina
import DepartamentPage from "./pages/DepartamentPage";
import CustomersPage from "./pages/CustomersPage";
import TestMenuOptionPage from "./pages/TestMenuOptionPage";
import AboutMePage from "./pages/AboutMePage";
//Organizador de la interfaz
import MainLayout from "./layouts/MainLayout";
//Contenedor del menu
import SidebarMenu from "./components/SidebarMenu";

function App() {
  const [page, setPage] = useState("customers");
  const [menuOptions] = useState([
    { name: "customers", content: "Customers" },
    { name: "departments", content: "Departments" },
    { name: "test", content: "Prueba" },
    { name: "abtme", content: "About Me" },
    { name: "log-out", content: "Log Out" },
  ]);
  function renderContent() {
    switch (page) {
      case "customers":
        return <CustomersPage />;
      case "departments":
        return <DepartamentPage />;
      case "test":
        return <TestMenuOptionPage />;
      case "abtme":
        return <AboutMePage />;
      default:
        return <CustomersPage />;
    }
  }
  return (
    <MainLayout
      sidebar={<SidebarMenu current={page} 
      onChange={setPage} 
      menuOptions={menuOptions} 
      />}
      content={renderContent()}
    />
  );
}
export default App;
