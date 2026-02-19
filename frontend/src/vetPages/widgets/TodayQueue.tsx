import { VetDashboardData } from '../../services/dashboardService';

interface Props {
  data: VetDashboardData | null;
}

export default function TodayQueue({ data }: Props) {
  const todayAppts = data?.appointments?.today || [];

  const formatTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const getBadgeClasses = (status: string) => {
    const statusMap: Record<string, string> = {
      scheduled:
        'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
      confirmed:
        'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      in_progress:
        'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
      completed:
        'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
      cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      no_show:
        'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
    };
    return statusMap[status] || statusMap.scheduled;
  };

  const formatStatus = (status: string) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  };

  return (
    <div className='rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 p-5'>
      <h3 className='text-heading-md font-semibold text-gray-800 dark:text-white mb-3'>
        Today's Queue
      </h3>
      {todayAppts.length > 0 ? (
        <ul className='divide-y divide-gray-200 dark:divide-gray-700'>
          {todayAppts.map((appt) => (
            <li
              key={appt.id}
              className='py-3 flex items-center justify-between'
            >
              <div>
                <div className='text-sm font-medium text-gray-800 dark:text-white'>
                  {formatTime(appt.appointment_time)} — {appt.pet_name}
                </div>
                <div className='text-xs text-gray-500 dark:text-gray-400'>
                  {appt.appointment_type} • Owner: {appt.user_first_name}{' '}
                  {appt.user_last_name}
                </div>
              </div>
              <span
                className={`text-xs px-2.5 py-1 rounded-full ${getBadgeClasses(appt.status)}`}
              >
                {formatStatus(appt.status)}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <div className='text-center py-8 text-gray-500 dark:text-gray-400'>
          No appointments scheduled for today
        </div>
      )}
    </div>
  );
}
