import { fmtDurationHMS } from "@/lib/format";

export function SummaryPanel({
  ctl,
  atl,
  tsb,
  tsbCaption,
  totals,
}: {
  ctl: number;
  atl: number;
  tsb: number;
  tsbCaption?: string;
  totals: {
    durationMin: number;
    tss: number;
    runKm: number;
    bikeKm: number;
    swimKm: number;
    elevationM: number;
  };
}) {
  return (
    <div className="w-full shrink-0 rounded border border-app-border bg-app-panel p-3 lg:w-[190px]">
      <h3 className="mb-2 text-[10px] uppercase tracking-wide text-app-muted">Summary</h3>

      <div className="mb-1 grid grid-cols-3 gap-1 text-center">
        <div>
          <p className="text-[9px] uppercase text-app-muted">Fitness</p>
          <p className="text-sm font-bold text-bike">{ctl}</p>
          <p className="text-[8.5px] text-app-muted-2">CTL</p>
        </div>
        <div>
          <p className="text-[9px] uppercase text-app-muted">Fatigue</p>
          <p className="text-sm font-bold text-nutri">{atl}</p>
          <p className="text-[8.5px] text-app-muted-2">ATL</p>
        </div>
        <div>
          <p className="text-[9px] uppercase text-app-muted">Form</p>
          <p className="text-sm font-bold text-run">{tsb}</p>
          <p className="text-[8.5px] text-app-muted-2">TSB</p>
        </div>
      </div>
      {tsbCaption && <p className="mb-2 text-center text-[8.5px] italic text-app-muted-2">{tsbCaption}</p>}

      <div className="space-y-1 border-t border-app-border pt-2 text-[11px]">
        <Row label="Total Duration" value={fmtDurationHMS(totals.durationMin)} />
        <Row label="Total TSS" value={Math.round(totals.tss).toString()} />
        <Row label="Swim Distance" value={`${(totals.swimKm * 1000).toFixed(0)} m`} />
        <Row label="Run Distance" value={`${totals.runKm.toFixed(1)} km`} />
        <Row label="Bike" value={`${totals.bikeKm.toFixed(1)} km`} />
        <Row label="El. Gain" value={`${Math.round(totals.elevationM)} m`} />
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-app-muted">{label}</span>
      <span className="font-semibold text-app-text-bright">{value}</span>
    </div>
  );
}
