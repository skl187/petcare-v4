import { MdPhone, MdEmail } from 'react-icons/md';
import { AppointmentDetail } from '../VeterinaryBookingsDetail';

interface OwnerInformationSectionProps {
  appointment: AppointmentDetail;
}

export default function OwnerInformationSection({
  appointment,
}: OwnerInformationSectionProps) {
  return (
    <div className='bg-white rounded-lg shadow-md p-6'>
      <h2 className='text-lg font-bold text-gray-900 mb-6'>
        OWNER INFORMATION
      </h2>

      <div className='space-y-4'>
        <div>
          <h3 className='text-sm font-semibold text-gray-700 mb-1'>NAME</h3>
          <p className='text-gray-900 font-semibold text-lg'>
            {appointment.ownerName}
          </p>
        </div>

        <div className='flex items-center gap-2 text-blue-600 hover:text-blue-800 cursor-pointer'>
          <MdPhone className='w-5 h-5' />
          <a href={`tel:${appointment.ownerPhone}`} className='font-medium'>
            {appointment.ownerPhone}
          </a>
        </div>

        <div className='flex items-center gap-2 text-blue-600 hover:text-blue-800 cursor-pointer'>
          <MdEmail className='w-5 h-5' />
          <a href={`mailto:${appointment.ownerEmail}`} className='font-medium'>
            {appointment.ownerEmail}
          </a>
        </div>
      </div>
    </div>
  );
}
