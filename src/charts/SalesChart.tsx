import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);
type Props = {
  data: {
    month: string;
    total: number;
  }[];
};
export default function SalesChart({ data }: Props) {
  const chartData = {
    labels: data.map((x) => x.month),
    datasets: [
      {
        label: "Ventas mensuales",
        data: data.map((x) => x.total),
        backgroundColor: [
          "rgba(59, 130, 246, 0.75)",
          "rgba(16, 185, 129, 0.75)",
          "rgba(245, 158, 11, 0.75)",
          "rgba(239, 68, 68, 0.75)",
          "rgba(139, 92, 246, 0.75)",
        ],
        borderColor: [
          "rgb(37, 99, 235)",
          "rgb(5, 150, 105)",
          "rgb(217, 119, 6)",
          "rgb(220, 38, 38)",
          "rgb(124, 58, 237)",
        ],
        borderWidth: 2,
        borderRadius: 10,
      },
    ],
  };
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };
  return <Bar data={chartData} options={options} />;
}
