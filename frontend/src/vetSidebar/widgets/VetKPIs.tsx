import { VetDashboardData } from "../../services/dashboardService";

interface Props {
  data: VetDashboardData | null;
}

export default function VetKPIs({ data }: Props) {
  const _stats = data?.appointments?.stats;
  const todayAppts = data?.appointments?.today || [];
  const avgRating = data?.reviews?.avg_rating;

  const kpis = [
    {
      label: "Appointments Today",
      value: todayAppts.length.toString()
    },
    {
      label: "Completed Today",
      value: todayAppts.filter(a => a.status === 'completed').length.toString()
    },
    {
      label: "Total Patients",
      value: data?.patients?.stats?.total_patients || '0'
    },
    {
      label: "Satisfaction",
      value: avgRating ? `${parseFloat(avgRating).toFixed(1)}★` : 'N/A'
    },
  ];

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 p-5">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">Today's KPIs</h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {kpis.map((k) => (
          <div key={k.label} className="rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <div className="text-xs text-gray-500 dark:text-gray-400">{k.label}</div>
            <div className="text-2xl font-bold text-gray-800 dark:text-white mt-1">{k.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
