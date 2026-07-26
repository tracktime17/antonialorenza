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
import type { PmcPoint } from "@antonia-os/domain";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

export function TrainingCharts({ pmc }: { pmc: PmcPoint[] }) {
  const labels = pmc.map((p) => p.date.slice(5));

  const data = {
    labels,
    datasets: [
      {
        label: "CTL (fitness)",
        data: pmc.map((p) => p.ctl),
        borderColor: "#0072ce",
        backgroundColor: "#0072ce",
        pointRadius: 0,
        tension: 0.3,
      },
      {
        label: "ATL (fatiga)",
        data: pmc.map((p) => p.atl),
        borderColor: "#db2777",
        backgroundColor: "#db2777",
        pointRadius: 0,
        tension: 0.3,
      },
      {
        label: "TSB (forma)",
        data: pmc.map((p) => p.tsb),
        borderColor: "#e85a0c",
        backgroundColor: "#e85a0c",
        pointRadius: 0,
        tension: 0.3,
      },
    ],
  };

  return (
    <div className="rounded border border-app-border bg-app-panel p-4">
      <h3 className="mb-3 text-[11px] uppercase tracking-wide text-app-muted">PMC — Performance Management Chart</h3>
      {pmc.length === 0 ? (
        <p className="text-xs italic text-app-muted-2">Sin entrenamientos registrados todavia.</p>
      ) : (
        <div className="h-64">
          <Line
            data={data}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              scales: { x: { ticks: { maxTicksLimit: 10 } } },
            }}
          />
        </div>
      )}
    </div>
  );
}
