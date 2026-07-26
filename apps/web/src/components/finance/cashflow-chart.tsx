"use client";

import { BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, Tooltip } from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export function CashflowChart({
  points,
}: {
  points: { month: string; income: number; expense: number }[];
}) {
  if (points.length === 0) {
    return <p className="text-xs italic text-app-muted-2">Sin movimientos registrados todavia.</p>;
  }

  const data = {
    labels: points.map((p) => p.month),
    datasets: [
      { label: "Ingresos", data: points.map((p) => p.income), backgroundColor: "#16a34a" },
      { label: "Gastos", data: points.map((p) => p.expense), backgroundColor: "#dc2626" },
    ],
  };

  return (
    <div className="h-56">
      <Bar data={data} options={{ responsive: true, maintainAspectRatio: false }} />
    </div>
  );
}
