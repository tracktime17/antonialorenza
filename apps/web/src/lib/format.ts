export function fmtCLP(n: number): string {
  const sign = n < 0 ? "-" : "";
  return `${sign}$${Math.round(Math.abs(n)).toLocaleString("es-CL")}`;
}

/** Renders decimal minutes as H:MM:SS, matching TrainingPeaks' duration format. */
export function fmtDurationHMS(minutes: number): string {
  const totalSeconds = Math.round(minutes * 60);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
