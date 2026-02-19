import { OwnerDashboardData } from "../../services/dashboardService";

interface Props {
  data: OwnerDashboardData | null;
}

export default function VaccinationReminders({ data }: Props) {
  const alerts = data?.medical?.vaccination_alerts || [];

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getAlertBadge = (status: string) => {
    if (status === 'overdue') {
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
    }
    return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
  };

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Care & Vaccination Reminders</h3>
        <button className="text-sm underline underline-offset-4 text-blue-600 dark:text-blue-400">View all</button>
      </div>
      {alerts.length > 0 ? (
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {alerts.map((x) => (
            <li key={x.id} className="py-3 flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-800 dark:text-white">
                  {x.pet_name} — {x.vaccine_name}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Due: {formatDate(x.next_due_date)}
                </div>
              </div>
              <span className={`text-xs px-2.5 py-1 rounded-full ${getAlertBadge(x.alert_status)}`}>
                {x.alert_status === 'overdue' ? 'Overdue' : 'Due Soon'}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          No vaccination reminders at this time
        </div>
      )}
    </div>
  );
}
