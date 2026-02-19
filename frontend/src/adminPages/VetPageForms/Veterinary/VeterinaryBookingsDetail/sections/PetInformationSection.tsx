import { AppointmentDetail } from '../VeterinaryBookingsDetail';

interface PetInformationSectionProps {
  appointment: AppointmentDetail;
}

export default function PetInformationSection({
  appointment,
}: PetInformationSectionProps) {
  return (
    <div className='bg-white rounded-lg shadow-md p-4'>
      <h2 className='text-base font-semibold text-gray-900 mb-4'>PET INFORMATION</h2>

      {/* Pet Image */}
      <div className='flex justify-center mb-4'>
        <img
          src={appointment.petPhoto || '/images/pets/placeholder.jpg'}
          alt={appointment.petName}
          className='w-24 h-24 rounded-full object-cover border-2 border-blue-100'
        />
      </div>

      {/* Pet Name */}
      <div className='text-center mb-4'>
        <h3 className='text-xl font-semibold text-gray-900'>
          {appointment.petName}
        </h3>
        <p className='text-sm text-gray-600'>{appointment.petBreed}</p>
      </div>

      {/* Pet Details */}
      <div className='space-y-3'>
        <div className='flex justify-between items-center'>
          <span className='text-sm text-gray-600'>Age</span>
          <span className='text-sm font-medium text-gray-900'>
            {appointment.petAge} years
          </span>
        </div>
        <div className='border-t border-gray-200' />

        <div className='flex justify-between items-center'>
          <span className='text-sm text-gray-600'>Weight</span>
          <span className='text-sm font-medium text-gray-900'>
            {appointment.petWeight}
          </span>
        </div>
        <div className='border-t border-gray-200' />

        <div className='flex justify-between items-center'>
          <span className='text-sm text-gray-600'>Color</span>
          <span className='text-sm font-medium text-gray-900'>
            {appointment.petColor}
          </span>
        </div>
        <div className='border-t border-gray-200' />

        <div className='flex justify-between items-center'>
          <span className='text-sm text-gray-600'>Microchip</span>
          <span className='text-sm font-medium text-gray-900'>
            {appointment.petMicrochip}
          </span>
        </div>
      </div>
    </div>
  );
}
