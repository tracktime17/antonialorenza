"use client";

import {
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

export function MetricLineChart({
  label,
  color,
  points,
}: {
  label: string;
  color: string;
  points: { date: string; value: number }[];
}) {
  if (points.length === 0) {
    return <p className="text-xs italic text-app-muted-2">Sin datos en este periodo.</p>;
  }

  const data = {
    labels: points.map((p) => p.date.slice(5)),
    datasets: [
      {
        label,
        data: points.map((p) => p.value),
        borderColor: color,
        backgroundColor: color,
        pointRadius: points.length > 60 ? 0 : 2,
        tension: 0.25,
      },
    ],
  };

  return (
    <div className="h-48">
      <Line
        data={data}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: { x: { ticks: { maxTicksLimit: 8 } } },
        }}
      />
    </div>
  );
}
