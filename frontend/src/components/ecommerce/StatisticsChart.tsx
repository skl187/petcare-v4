import Chart from 'react-apexcharts';
import { ApexOptions } from 'apexcharts';
import { AdminDashboardData } from '../../services/dashboardService';

interface Props {
  data: AdminDashboardData | null;
}

export default function StatisticsChart({ data }: Props) {
  // Extract trends data for chart
  const trends = data?.appointments?.trends || [];
  const hasData = trends.length > 0;

  const chartLabels = hasData
    ? trends.map(t => {
        const date = new Date(t.appointment_date);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      })
    : ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'];

  const completedData = hasData
    ? trends.map(t => parseInt(t.completed) || 0)
    : [0, 0, 0, 0, 0, 0, 0];

  const totalData = hasData
    ? trends.map(t => parseInt(t.total) || 0)
    : [0, 0, 0, 0, 0, 0, 0];

  const options: ApexOptions = {
    legend: {
      show: true,
      position: 'top',
      horizontalAlign: 'left',
    },
    colors: ['#465FFF', '#10B981'],
    chart: {
      fontFamily: 'Outfit, sans-serif',
      height: 310,
      type: 'line',
      toolbar: {
        show: false,
      },
    },
    stroke: {
      curve: 'smooth',
      width: [2, 2],
    },
    fill: {
      type: 'gradient',
      gradient: {
        opacityFrom: 0.55,
        opacityTo: 0,
      },
    },
    markers: {
      size: 0,
      strokeColors: '#fff',
      strokeWidth: 2,
      hover: {
        size: 6,
      },
    },
    grid: {
      xaxis: {
        lines: {
          show: false,
        },
      },
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    tooltip: {
      enabled: true,
      x: {
        show: true,
      },
    },
    xaxis: {
      type: 'category',
      categories: chartLabels,
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
      tooltip: {
        enabled: false,
      },
    },
    yaxis: {
      labels: {
        style: {
          fontSize: '12px',
          colors: ['#6B7280'],
        },
      },
      title: {
        text: '',
        style: {
          fontSize: '0px',
        },
      },
    },
  };

  const series = [
    {
      name: 'Total Appointments',
      data: totalData,
    },
    {
      name: 'Completed',
      data: completedData,
    },
  ];

  // Summary stats
  const totalAppointments = parseInt(data?.appointments?.overview?.total_appointments || '0');
  const completedAppointments = parseInt(data?.appointments?.overview?.completed || '0');
  const completionRate = totalAppointments > 0
    ? Math.round((completedAppointments / totalAppointments) * 100)
    : 0;

  return (
    <div className='rounded-2xl border border-gray-200 bg-white px-5 pb-5 pt-5 dark:border-gray-700 dark:bg-gray-800/50 sm:px-6 sm:pt-6'>
      <div className='flex flex-col gap-5 mb-6 sm:flex-row sm:justify-between'>
        <div className='w-full'>
          <h3 className='text-lg font-semibold text-gray-800 dark:text-white/90'>
            Appointment Trends
          </h3>
          <p className='mt-1 text-gray-500 text-theme-sm dark:text-gray-400'>
            Weekly appointment activity overview
          </p>
        </div>
        <div className='flex items-start w-full gap-4 sm:justify-end'>
          <div className='text-right'>
            <p className='text-xs text-gray-500 dark:text-gray-400'>Total</p>
            <p className='text-lg font-semibold text-gray-800 dark:text-white'>{totalAppointments}</p>
          </div>
          <div className='text-right'>
            <p className='text-xs text-gray-500 dark:text-gray-400'>Completed</p>
            <p className='text-lg font-semibold text-emerald-600'>{completedAppointments}</p>
          </div>
          <div className='text-right'>
            <p className='text-xs text-gray-500 dark:text-gray-400'>Rate</p>
            <p className='text-lg font-semibold text-blue-600'>{completionRate}%</p>
          </div>
        </div>
      </div>

      <div className='max-w-full overflow-x-auto custom-scrollbar'>
        <div className='min-w-[600px] xl:min-w-full'>
          <Chart options={options} series={series} type='area' height={310} />
        </div>
      </div>
    </div>
  );
}
