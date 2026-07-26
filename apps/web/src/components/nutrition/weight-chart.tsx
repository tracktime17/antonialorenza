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

export function WeightChart({ points }: { points: { date: string; weightKg: number }[] }) {
  if (points.length === 0) {
    return <p className="text-xs italic text-app-muted-2">Sin pesajes registrados todavia.</p>;
  }

  const data = {
    labels: points.map((p) => p.date.slice(5)),
    datasets: [
      {
        label: "Peso (kg)",
        data: points.map((p) => p.weightKg),
        borderColor: "#16a34a",
        backgroundColor: "#16a34a",
        pointRadius: 2,
        tension: 0.25,
      },
    ],
  };

  return (
    <div className="h-56">
      <Line
        data={data}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          scales: { x: { ticks: { maxTicksLimit: 10 } } },
        }}
      />
    </div>
  );
}
