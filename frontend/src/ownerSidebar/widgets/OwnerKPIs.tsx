import { OwnerDashboardData } from "../../services/dashboardService";

interface Props {
  data: OwnerDashboardData | null;
}

export default function OwnerKPIs({ data }: Props) {
  const activePets = parseInt(data?.pets?.stats?.active_pets || '0');
  const upcomingVisits = parseInt(data?.appointments?.stats?.upcoming || '0');
  const pendingPayments = parseInt(data?.payments?.pending_count || '0');
  const totalAppointments = parseInt(data?.appointments?.stats?.total_appointments || '0');

  const kpis = [
    { label: "Active Pets", value: activePets },
    { label: "Upcoming Visits", value: upcomingVisits },
    { label: "Pending Payments", value: pendingPayments },
    { label: "Total Visits", value: totalAppointments },
  ];

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 p-5">
      <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white">At a Glance</h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {kpis.map(k => (
          <div key={k.label} className="rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <div className="text-xs text-gray-500 dark:text-gray-400">{k.label}</div>
            <div className="text-2xl font-bold mt-1 text-gray-800 dark:text-white">{k.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
