export default function OwnerSpendChart() {
  const months = [
    { m: "Mar", spend: 120 },
    { m: "Apr", spend: 80 },
    { m: "May", spend: 160 },
    { m: "Jun", spend: 90 },
    { m: "Jul", spend: 140 },
    { m: "Aug", spend: 60 },
  ];
  const max = 200;

  return (
    <div className="rounded-2xl border p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold">Spending Trend</h3>
        <span className="text-xs text-muted-foreground">Last 6 months</span>
      </div>
      <div className="h-40 flex items-end gap-2">
        {months.map(x => (
          <div key={x.m} className="flex-1">
            <div
              className="w-full rounded-t-md bg-gray-300 dark:bg-gray-600"
              style={{ height: `${Math.max(10, (x.spend / max) * 100)}%` }}
              title={`${x.m}: $${x.spend}`}
              aria-label={`${x.m} $${x.spend}`}
            />
            <div className="text-[10px] mt-1 text-center">{x.m}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
