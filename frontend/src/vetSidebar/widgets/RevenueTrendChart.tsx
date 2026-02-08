import { useMemo } from "react";

export default function RevenueTrendChart() {
  // mock monthly revenue; swap with API
  const data = useMemo(
    () => [
      { month: "Jan", revenue: 8200 },
      { month: "Feb", revenue: 9100 },
      { month: "Mar", revenue: 9900 },
      { month: "Apr", revenue: 12000 },
      { month: "May", revenue: 10800 },
      { month: "Jun", revenue: 13600 },
    ],
    []
  );

  return (
    <div className="rounded-2xl border p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold">Revenue Trend</h3>
        <span className="text-xs text-muted-foreground">Last 6 months</span>
      </div>
      {/* Placeholder chart: keep simple divs so you can drop in your chart lib later */}
      <div className="h-40 flex items-end gap-2">
        {data.map((d) => (
          <div key={d.month} className="flex-1">
            <div
              className="w-full rounded-t-md bg-gray-300 dark:bg-gray-600"
              style={{ height: `${Math.max(10, (d.revenue / 14000) * 100)}%` }}
              aria-label={`${d.month} ${d.revenue}`}
              title={`${d.month}: $${d.revenue.toLocaleString()}`}
            />
            <div className="text-[10px] mt-1 text-center">{d.month}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
