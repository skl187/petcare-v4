interface AppointmentData {
  id: string;
  appointment_number: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
  priority?: string;
  appointment_type?: string;
  chief_complaint?: string;
  notes?: string;
  symptoms?: string[];
  consultation_fee?: string;
  service_fee?: string;
  total_amount?: string;
  payment_status: string;
  first_name: string;
  last_name: string;
  email: string;
  pet_name: string;
  vet_first_name: string;
  vet_last_name: string;
  clinic_name: string;
  payment_info?: {
    id?: string;
    paid_amount?: number;
    total_amount?: number;
    payment_method?: string;
    payment_status?: string;
  };
  services?: Array<{
    id: string;
    code: string;
    name: string;
    default_fee: number;
  }>;
  vet_service_ids?: any[];
}

interface AdminAppointmentDetailProps {
  appointment: AppointmentData | null;
  appointmentId: string;
  onBack?: () => void;
}

export default function AdminAppointmentDetail({
  appointment,
}: AdminAppointmentDetailProps) {
  if (!appointment) {
    return (
      <div className='p-3 bg-gray-100 border border-gray-300 rounded'>
        <p className='text-gray-800 text-sm'>No appointment data available</p>
      </div>
    );
  }

  return (
    <div className='space-y-4 text-md'>
      {/* Pet / Veterinarian / Payment cards */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        {/* Pet card */}
        <div className='bg-white border border-gray-200 rounded-lg shadow-sm p-4'>
          <div className='flex justify-between items-start'>
            <div>
              <h4 className='text-sm font-semibold text-gray-500 uppercase tracking-wide'>
                Pet
              </h4>
              <p className='mt-2 text-sm font-medium text-gray-900'>
                {appointment.pet_name || 'N/A'}
              </p>
              <p className='text-sm text-gray-600 mt-1'>
                {appointment.first_name} {appointment.last_name}
              </p>
              <p className='text-sm text-gray-500 mt-1 break-words'>
                {appointment.email}
              </p>
            </div>
            <div className='text-right'>
              <span className='inline-flex items-center px-2 py-1 text-sm font-semibold bg-indigo-50 text-indigo-700 rounded'>
                #{appointment.appointment_number || '—'}
              </span>
            </div>
          </div>
        </div>

        {/* Veterinarian card */}
        <div className='bg-white border border-gray-200 rounded-lg shadow-sm p-4'>
          <h4 className='text-sm font-semibold text-gray-500 uppercase tracking-wide'>
            Veterinarian
          </h4>
          <div className='mt-2'>
            <p className='text-sm font-medium text-gray-900'>
              {appointment.vet_first_name} {appointment.vet_last_name}
            </p>
            <p className='text-sm text-gray-600 mt-1'>{appointment.clinic_name}</p>
            <div className='mt-3 flex gap-2'>
              <span className='inline-block px-2 py-1 text-sm font-semibold bg-blue-50 text-blue-700 rounded capitalize'>
                {appointment.status}
              </span>
            </div>
          </div>
        </div>

        {/* Payment card */}
        <div className='bg-white border border-gray-200 rounded-lg shadow-sm p-4'>
          <h4 className='text-sm font-semibold text-gray-500 uppercase tracking-wide'>
            Payment
          </h4>
          <div className='mt-2 text-sm'>
            <div className='flex justify-between'>
              <span className='text-gray-600'>Status</span>
              <span
                className={`inline-block px-2 py-1 rounded text-sm font-semibold capitalize ${
                  appointment.payment_status === 'pending'
                    ? 'bg-yellow-100 text-yellow-800'
                    : appointment.payment_status === 'paid'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                }`}
              >
                {appointment.payment_status}
              </span>
            </div>

            <div className='flex justify-between mt-2'>
              <span className='text-gray-600'>Method</span>
              <span className='font-medium text-gray-900'>
                {appointment.payment_info?.payment_method || '—'}
              </span>
            </div>

            <div className='flex justify-between mt-2'>
              <span className='text-gray-600'>Paid</span>
              <span className='font-medium text-gray-900'>
                ${Number(appointment.payment_info?.paid_amount ?? 0).toFixed(2)}
              </span>
            </div>

            <div className='flex justify-between mt-2 border-t border-gray-100 pt-2'>
              <span className='text-gray-600'>Total</span>
              <span className='text-blue-700 font-bold'>
                ${Number(appointment.payment_info?.total_amount ?? appointment.total_amount ?? 0).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Appointment Date & Time */}
      <div className='grid grid-cols-2 gap-3'>
        <div>
          <h4 className='text-sm font-semibold text-gray-700 mb-1 uppercase tracking-wide'>
            Date
          </h4>
          <p className='text-gray-900 text-sm'>
            {appointment.appointment_date
              ? new Date(appointment.appointment_date).toLocaleDateString()
              : 'N/A'}
          </p>
        </div>
        <div>
          <h4 className='text-sm font-semibold text-gray-700 mb-1 uppercase tracking-wide'>
            Time
          </h4>
          <p className='text-gray-900 text-sm'>
            {appointment.appointment_time || 'N/A'}
          </p>
        </div>
      </div>

      {/* Appointment Type */}
      {appointment.appointment_type && (
        <div>
          <h4 className='text-sm font-semibold text-gray-700 mb-1 uppercase tracking-wide'>
            Appointment Type
          </h4>
          <p className='text-gray-900 text-sm capitalize'>
            {appointment.appointment_type}
          </p>
        </div>
      )}

      {/* Services */}
      {appointment.services && appointment.services.length > 0 && (
        <div>
          <h4 className='text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide'>
            Services
          </h4>
          <div className='space-y-2 bg-gray-50 p-3 rounded border border-gray-200'>
            {appointment.services.map((service) => (
              <div
                key={service.id}
                className='text-sm text-gray-900 flex justify-between'
              >
                <span className='font-medium'>{service.name}</span>
                <span className='text-gray-700'>
                  ${Number(service.default_fee).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Chief Complaint */}
      {appointment.chief_complaint && (
        <div>
          <h4 className='text-sm font-semibold text-gray-700 mb-1 uppercase tracking-wide'>
            Chief Complaint
          </h4>
          <p className='text-gray-900 text-sm'>{appointment.chief_complaint}</p>
        </div>
      )}

      {/* Symptoms */}
      {appointment.symptoms && appointment.symptoms.length > 0 && (
        <div>
          <h4 className='text-sm font-semibold text-gray-700 mb-1 uppercase tracking-wide'>
            Symptoms
          </h4>
          <div className='flex flex-wrap gap-1'>
            {appointment.symptoms.map((symptom, index) => (
              <span
                key={index}
                className='inline-block px-2 py-1 rounded text-sm bg-orange-100 text-orange-800'
              >
                {symptom}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Notes */}
      {appointment.notes && (
        <div>
          <h4 className='text-sm font-semibold text-gray-700 mb-1 uppercase tracking-wide'>
            Notes
          </h4>
          <p className='text-sm text-gray-700 bg-gray-50 p-2 rounded border border-gray-200 leading-relaxed'>
            {appointment.notes}
          </p>
        </div>
      )}
    </div>
  );
}
