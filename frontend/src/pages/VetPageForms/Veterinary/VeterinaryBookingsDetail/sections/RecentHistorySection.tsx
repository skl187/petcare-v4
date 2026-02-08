import { AppointmentDetail } from '../VeterinaryBookingsDetail';

interface RecentHistorySectionProps {
  appointment: AppointmentDetail;
}

export default function RecentHistorySection({
  appointment,
}: RecentHistorySectionProps) {
  return (
    <div className='bg-white rounded-lg shadow-md p-6'>
      <h2 className='text-lg font-bold text-gray-900 mb-6'>RECENT HISTORY</h2>

      <div className='space-y-4'>
        <div>
          <h3 className='text-sm font-semibold text-gray-600 mb-1'>
            Last Visit
          </h3>
          <p className='text-gray-900 font-semibold'>{appointment.lastVisit}</p>
        </div>

        <div className='border-t border-gray-200' />

        <div>
          <h3 className='text-sm font-semibold text-gray-600 mb-1'>
            Total Visits
          </h3>
          <p className='text-gray-900 font-semibold'>
            {appointment.totalVisits}
          </p>
        </div>

        <div className='border-t border-gray-200' />

        <div>
          <h3 className='text-sm font-semibold text-gray-600 mb-1'>
            Active Meds
          </h3>
          <p className='text-gray-900 font-semibold'>
            {appointment.activeMeds}
          </p>
        </div>

        <div className='border-t border-gray-200' />

        <div>
          <h3 className='text-sm font-semibold text-gray-600 mb-1'>
            Allergies
          </h3>
          <p className='text-gray-900 font-semibold'>{appointment.allergies}</p>
        </div>
      </div>
    </div>
  );
}
