import { VetDashboardData } from "../../services/dashboardService";

interface Props {
  data: VetDashboardData | null;
}

export default function MonthlyTargets({ data }: Props) {
  const earnings = data?.earnings;
  const stats = data?.appointments?.stats;
  const patientStats = data?.patients?.stats;

  const formatCurrency = (amount: string | number) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num || 0);
  };

  // Calculate targets based on actual data
  const monthlyRevenueActual = parseFloat(earnings?.earnings_this_month || '0');
  const monthlyRevenueTarget = Math.max(monthlyRevenueActual * 1.2, 10000); // Dynamic target

  const completedAppts = parseInt(stats?.completed || '0');
  const totalAppts = parseInt(stats?.total_appointments || '0');
  const appointmentTarget = Math.max(totalAppts, 50);

  const newPatients = parseInt(patientStats?.new_patients_this_month || '0');
  const newPatientTarget = Math.max(newPatients * 1.5, 20);

  const targets = [
    {
      label: "Monthly Revenue",
      target: monthlyRevenueTarget,
      actual: monthlyRevenueActual,
      unit: "$",
      format: true
    },
    {
      label: "Completed Appointments",
      target: appointmentTarget,
      actual: completedAppts,
      unit: "",
      format: false
    },
    {
      label: "New Patients",
      target: Math.round(newPatientTarget),
      actual: newPatients,
      unit: "",
      format: false
    },
    {
      label: "Total Patients",
      target: parseInt(patientStats?.total_patients || '0') + 10,
      actual: parseInt(patientStats?.total_patients || '0'),
      unit: "",
      format: false
    },
  ];

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 p-5">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">Monthly Targets</h3>
      <div className="space-y-4">
        {targets.map((t) => {
          const pct = t.target > 0 ? Math.min(100, Math.round((t.actual / t.target) * 100)) : 0;
          const actualDisplay = t.format ? formatCurrency(t.actual) : t.actual;
          const targetDisplay = t.format ? formatCurrency(t.target) : t.target;

          return (
            <div key={t.label}>
              <div className="flex items-center justify-between text-sm">
                <div className="font-medium text-gray-800 dark:text-white">{t.label}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {actualDisplay} / {targetDisplay} ({pct}%)
                </div>
              </div>
              <div className="h-2 rounded bg-gray-200 dark:bg-gray-700 mt-1">
                <div
                  className={`h-2 rounded ${pct >= 100 ? 'bg-emerald-500' : pct >= 75 ? 'bg-blue-500' : pct >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                  style={{ width: `${pct}%` }}
                  aria-label={`${t.label} ${pct}%`}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
