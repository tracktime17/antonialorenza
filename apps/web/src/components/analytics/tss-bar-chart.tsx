"use client";

import { BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Tooltip } from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export function TssBarChart({ points }: { points: { week: string; tss: number }[] }) {
  if (points.length === 0) {
    return <p className="text-xs italic text-app-muted-2">Sin entrenamientos en este periodo.</p>;
  }

  const data = {
    labels: points.map((p) => p.week),
    datasets: [{ label: "TSS semanal", data: points.map((p) => p.tss), backgroundColor: "#e85a0c" }],
  };

  return (
    <div className="h-56">
      <Bar
        data={data}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: { x: { ticks: { maxTicksLimit: 12 } } },
        }}
      />
    </div>
  );
}
