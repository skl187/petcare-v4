import { AppointmentDetail } from '../VeterinaryBookingsDetail';

interface PetInformationSectionProps {
  appointment: AppointmentDetail;
}

export default function PetInformationSection({
  appointment,
}: PetInformationSectionProps) {
  return (
    <div className='bg-white rounded-lg shadow-md p-6'>
      <h2 className='text-lg font-bold text-gray-900 mb-6'>PET INFORMATION</h2>

      {/* Pet Image */}
      <div className='flex justify-center mb-6'>
        <img
          src={appointment.petPhoto || '/images/pets/placeholder.jpg'}
          alt={appointment.petName}
          className='w-32 h-32 rounded-full object-cover border-4 border-blue-100'
        />
      </div>

      {/* Pet Name */}
      <div className='text-center mb-6'>
        <h3 className='text-2xl font-bold text-gray-900'>
          {appointment.petName}
        </h3>
        <p className='text-gray-600'>{appointment.petBreed}</p>
      </div>

      {/* Pet Details */}
      <div className='space-y-4'>
        <div className='flex justify-between items-center'>
          <span className='text-gray-700 font-medium'>Age</span>
          <span className='text-gray-900 font-semibold'>
            {appointment.petAge} years
          </span>
        </div>
        <div className='border-t border-gray-200' />

        <div className='flex justify-between items-center'>
          <span className='text-gray-700 font-medium'>Weight</span>
          <span className='text-gray-900 font-semibold'>
            {appointment.petWeight}
          </span>
        </div>
        <div className='border-t border-gray-200' />

        <div className='flex justify-between items-center'>
          <span className='text-gray-700 font-medium'>Color</span>
          <span className='text-gray-900 font-semibold'>
            {appointment.petColor}
          </span>
        </div>
        <div className='border-t border-gray-200' />

        <div className='flex justify-between items-center'>
          <span className='text-gray-700 font-medium'>Microchip</span>
          <span className='text-gray-900 font-semibold'>
            {appointment.petMicrochip}
          </span>
        </div>
      </div>
    </div>
  );
}
