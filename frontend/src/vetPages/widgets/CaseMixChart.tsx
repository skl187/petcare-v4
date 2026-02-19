export default function CaseMixChart() {
  // mock breakdown by service type
  const items = [
    { label: "Wellness/Exam", pct: 32 },
    { label: "Vaccinations", pct: 24 },
    { label: "Diagnostics", pct: 18 },
    { label: "Surgery", pct: 14 },
    { label: "Dental", pct: 12 },
  ];

  return (
    <div className="rounded-2xl border p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold">Case Mix (Last 30 days)</h3>
        <span className="text-xs text-muted-foreground">Top categories</span>
      </div>
      <div className="space-y-3">
        {items.map((it) => (
          <div key={it.label}>
            <div className="flex items-center justify-between text-sm">
              <span>{it.label}</span>
              <span className="font-medium">{it.pct}%</span>
            </div>
            <div className="h-2 rounded bg-muted">
              <div
                className="h-2 rounded bg-gray-400 dark:bg-gray-600"
                style={{ width: `${it.pct}%` }}
                aria-label={`${it.label} ${it.pct}%`}
                title={`${it.label}: ${it.pct}%`}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
