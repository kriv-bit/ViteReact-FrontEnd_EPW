import { useState } from "react";
import DepartamentPage from "./pages/DepartamentPage";
import CustomersPage from "./pages/CustomersPage";
import MainLayout from "./layouts/MainLayout";
import SidebarMenu from "./components/SidebarMenu";
function App() {
  const [page, setPage] = useState("customers");
  function renderContent() {
    switch (page) {
      case "customers":
        return <CustomersPage />;
      case "departments":
        return <DepartamentPage />;
      default:
        return <CustomersPage />;
    }
  }
  return (
    <MainLayout
      sidebar={<SidebarMenu current={page} onChange={setPage} />}
      content={renderContent()}
    />
  );
}
export default App;
