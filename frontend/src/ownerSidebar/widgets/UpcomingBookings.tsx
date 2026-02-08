import { useNavigate } from "react-router-dom";
import { OwnerDashboardData } from "../../services/dashboardService";

interface Props {
  data: OwnerDashboardData | null;
}

export default function UpcomingBookings({ data }: Props) {
  const navigate = useNavigate();
  const appointments = data?.appointments?.upcoming || [];

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Upcoming Bookings</h3>
        <button
          className="text-sm underline underline-offset-4 text-blue-600 dark:text-blue-400"
          onClick={() => navigate('/owner/upcoming-bookings')}
        >
          Manage
        </button>
      </div>
      <div className="space-y-3">
        {appointments.length > 0 ? (
          appointments.map((a) => (
            <div key={a.id} className="rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="text-sm font-medium text-gray-800 dark:text-white">
                  {formatDate(a.appointment_date)} • {formatTime(a.appointment_time)}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{a.appointment_type}</div>
              </div>
              <div className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                <span className="font-semibold">{a.pet_name}</span> — Dr. {a.vet_first_name} {a.vet_last_name}
              </div>
              <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {a.clinic_name}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No upcoming appointments
          </div>
        )}
      </div>
    </div>
  );
}
