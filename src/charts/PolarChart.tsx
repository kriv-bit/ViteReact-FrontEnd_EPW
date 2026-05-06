import {
  Chart as ChartJS,
  RadialLinearScale,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { PolarArea } from 'react-chartjs-2';

ChartJS.register(RadialLinearScale, ArcElement, Tooltip, Legend);

type ProductData = {
  name: string;
  total: number;
};

type Props = {
  data: ProductData[];
};

export default function PolarChart({ data }: Props) {
  const PolarData = {
    labels: data.map((item) => item.name),
    datasets: [
      {
        label: 'Ventas',
        data: data.map((item) => item.total),
        backgroundColor: [
          'rgba(255, 99, 133, 0.94)',
          'rgba(54, 162, 235, 0.5)',
          'rgba(255, 206, 86, 0.5)',
          'rgba(75, 192, 192, 0.5)',
          'rgba(153, 102, 255, 0.5)',
          'rgba(255, 159, 64, 0.5)',
        ],
        borderWidth: 1,
      },
    ],
  };

  return <PolarArea data={PolarData} />;
}