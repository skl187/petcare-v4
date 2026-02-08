import { MdOutlineDoneAll, MdOutlinePendingActions, MdPets, MdPeople } from 'react-icons/md';
import { AdminDashboardData } from '../../services/dashboardService';

interface Props {
  data: AdminDashboardData | null;
}

export default function EcommerceMetrics({ data }: Props) {
  const completedAppointments = data?.appointments?.overview?.completed || '0';
  const pendingAppointments = data?.appointments?.overview?.scheduled || '0';
  const totalPets = data?.pets?.total_pets || '0';
  const activeUsers = data?.users?.active_users || '0';

  const metrics = [
    {
      icon: MdOutlineDoneAll,
      label: 'Completed Appointments',
      value: completedAppointments,
      bgColor: 'bg-emerald-100 dark:bg-emerald-900/30',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      icon: MdOutlinePendingActions,
      label: 'Pending Appointments',
      value: pendingAppointments,
      bgColor: 'bg-amber-100 dark:bg-amber-900/30',
      iconColor: 'text-amber-600 dark:text-amber-400',
    },
    {
      icon: MdPets,
      label: 'Total Pets',
      value: totalPets,
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
      iconColor: 'text-blue-600 dark:text-blue-400',
    },
    {
      icon: MdPeople,
      label: 'Active Users',
      value: activeUsers,
      bgColor: 'bg-purple-100 dark:bg-purple-900/30',
      iconColor: 'text-purple-600 dark:text-purple-400',
    },
  ];

  return (
    <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6'>
      {metrics.map((metric) => (
        <div
          key={metric.label}
          className='rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800/50 md:p-6'
        >
          <div className={`flex items-center justify-center w-12 h-12 rounded-xl ${metric.bgColor}`}>
            <metric.icon className={`size-6 ${metric.iconColor}`} />
          </div>

          <div className='flex items-end justify-between mt-5'>
            <div>
              <span className='text-sm text-gray-500 dark:text-gray-400'>
                {metric.label}
              </span>
              <h4 className='mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90'>
                {metric.value}
              </h4>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
