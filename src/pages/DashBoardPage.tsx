import { useDashboardSummary } from "../api/dashboard.queries";
import SalesChart from "../charts/SalesChart";
import ProductsChart from "../charts/ProductsChart";
import PolarChart from "../charts/PolarChart";

export default function DashboardPage() {
  const { data, isLoading } =
    useDashboardSummary();
  if (isLoading) {
    return <p>Cargando dashboard...</p>;
  }
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">
          Dashboard
        </h1>
        <p className="text-slate-500">
          Indicadores simulados para análisis visual.
        </p>
      </div>
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-blue-600 text-white rounded-xl p-4 shadow">
          <p>Completed</p>
          <h2 className="text-4xl font-bold">
            {data?.completed}
          </h2>
        </div>
        <div className="bg-amber-500 text-white rounded-xl p-4 shadow">
          <p>Pending</p>
          <h2 className="text-4xl font-bold">
            {data?.pending}
          </h2>
        </div>
        <div className="bg-rose-500 text-white rounded-xl p-4 shadow">
          <p>Cancelled</p>
          <h2 className="text-4xl font-bold">
            {data?.cancelled}
          </h2>
        </div>
      </div>
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border p-4 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">
            Ventas mensuales
          </h2>
          <SalesChart
            data={data?.monthlySales ?? []}
          />
        </div>
        <div className="bg-white rounded-xl border p-4 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">
            Productos más vendidos
          </h2>
          <ProductsChart
            data={data?.topProducts ?? []}
          />
        </div>
      </div>
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border p-4 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">
            Productos más vendidos 2 
          </h2>
          <PolarChart
            data={data?.topProducts ?? []}
          />
        </div>
      </div>

    </div>
  );
}