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
    <div className='space-y-4 text-sm'>
      {/* Pet Information */}
      <div>
        <h4 className='text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wide'>
          Pet
        </h4>
        <p className='text-gray-900 font-medium text-sm'>
          {appointment.pet_name || 'N/A'}
        </p>
      </div>

      {/* Owner Information */}
      <div>
        <h4 className='text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wide'>
          Owner
        </h4>
        <p className='text-gray-900 font-medium text-sm'>
          {appointment.first_name} {appointment.last_name}
        </p>
        <p className='text-xs text-gray-600 break-words'>{appointment.email}</p>
      </div>

      {/* Appointment Date & Time */}
      <div className='grid grid-cols-2 gap-3'>
        <div>
          <h4 className='text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wide'>
            Date
          </h4>
          <p className='text-gray-900 text-sm'>
            {appointment.appointment_date
              ? new Date(appointment.appointment_date).toLocaleDateString()
              : 'N/A'}
          </p>
        </div>
        <div>
          <h4 className='text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wide'>
            Time
          </h4>
          <p className='text-gray-900 text-sm'>
            {appointment.appointment_time || 'N/A'}
          </p>
        </div>
      </div>

      {/* Veterinarian & Clinic */}
      <div>
        <h4 className='text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wide'>
          Veterinarian
        </h4>
        <p className='text-gray-900 font-medium text-sm'>
          {appointment.vet_first_name} {appointment.vet_last_name}
        </p>
        <p className='text-xs text-gray-600'>{appointment.clinic_name}</p>
      </div>

      {/* Appointment Type */}
      {appointment.appointment_type && (
        <div>
          <h4 className='text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wide'>
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
          <h4 className='text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide'>
            Services
          </h4>
          <div className='space-y-2 bg-gray-50 p-3 rounded border border-gray-200'>
            {appointment.services.map((service) => (
              <div
                key={service.id}
                className='text-xs text-gray-900 flex justify-between'
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
          <h4 className='text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wide'>
            Chief Complaint
          </h4>
          <p className='text-gray-900 text-sm'>{appointment.chief_complaint}</p>
        </div>
      )}

      {/* Symptoms */}
      {appointment.symptoms && appointment.symptoms.length > 0 && (
        <div>
          <h4 className='text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wide'>
            Symptoms
          </h4>
          <div className='flex flex-wrap gap-1'>
            {appointment.symptoms.map((symptom, index) => (
              <span
                key={index}
                className='inline-block px-2 py-1 rounded text-xs bg-orange-100 text-orange-800'
              >
                {symptom}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Status & Payment */}
      <div className='grid grid-cols-2 gap-3'>
        <div>
          <h4 className='text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wide'>
            Status
          </h4>
          <span className='inline-block px-2 py-1 rounded text-xs font-semibold bg-blue-100 text-blue-800 capitalize'>
            {appointment.status}
          </span>
        </div>
        <div>
          <h4 className='text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wide'>
            Payment
          </h4>
          <span
            className={`inline-block px-2 py-1 rounded text-xs font-semibold capitalize ${
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
      </div>

      {/* Total Amount */}
      <div className='bg-gradient-to-br from-blue-50 to-blue-100 p-3 rounded border border-blue-200'>
        <h4 className='text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wide'>
          Total Amount
        </h4>
        <p className='text-2xl font-bold text-blue-900'>
          ${Number(appointment.total_amount || '0').toFixed(2)}
        </p>
      </div>

      {/* Notes */}
      {appointment.notes && (
        <div>
          <h4 className='text-xs font-semibold text-gray-700 mb-1 uppercase tracking-wide'>
            Notes
          </h4>
          <p className='text-xs text-gray-700 bg-gray-50 p-2 rounded border border-gray-200 leading-relaxed'>
            {appointment.notes}
          </p>
        </div>
      )}
    </div>
  );
}
