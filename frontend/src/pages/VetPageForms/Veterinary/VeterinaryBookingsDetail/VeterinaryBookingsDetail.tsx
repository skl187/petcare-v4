import { useState, useEffect } from 'react';
import { MdArrowBack } from 'react-icons/md';
import { API_ENDPOINTS } from '../../../../constants/api';
import type { VetBooking } from '../../../../components/vetTables/Veterinary/VeterninaryBookingsTable/VeterinaryBookingsTable';
import {
  PetInformationSection,
  OwnerInformationSection,
  RecentHistorySection,
  AppointmentDetailsSection,
  AppointmentWorkflowSection,
  AppointmentActionsSection,
} from './sections';

export interface AppointmentDetail {
  id: string;
  appointmentNumber: string;
  date: string;
  time: string;
  reason: string;
  status:
    | 'Pending'
    | 'In Progress'
    | 'Completed'
    | 'Cancelled'
    | 'scheduled'
    | 'confirmed'
    | 'in_progress';
  notes: string;
  petId: string;
  petName: string;
  petBreed: string;
  petAge: number;
  petWeight: string;
  petColor: string;
  petMicrochip: string;
  petPhoto?: string;
  ownerId: string;
  ownerName: string;
  ownerPhone: string;
  ownerEmail: string;
  lastVisit: string;
  totalVisits: number;
  activeMeds: string;
  allergies: string;
  medical_records?: Array<{
    id: string;
    record_type: string;
    record_date: string;
    diagnosis: string;
    followup_required: boolean;
    followup_date?: string;
  }>;
  prescriptions?: Array<{
    id: string;
    valid_until?: string;
    notes?: string;
  }>;
  lab_tests?: Array<{
    id: string;
    test_name: string;
    test_type: string;
    urgency?: string;
    ordered_date?: string;
    status?: string;
    result_date?: string | null;
  }>;
  vaccinations?: Array<{
    id: string;
    vaccine_name: string;
    vaccine_type: string;
    vaccination_date?: string;
    next_due_date?: string | null;
    manufacturer?: string | null;
    batch_number?: string | null;
    site_of_injection?: string | null;
    adverse_reactions?: string | null;
    certificate_issued?: boolean;
    certificate_number?: string | null;
    cost?: string | number | null;
    notes?: string | null;
    medical_record_id?: string;
    appointment_id?: string;
    pet_id?: string;
    veterinarian_id?: string;
  }>;
}

interface VeterinaryBookingsDetailProps {
  appointmentData?: VetBooking;
  appointmentId?: string;
  petId?: string;
  onBack?: () => void;
  readOnly?: boolean; // For owner role - view only, no edit/add actions
}

export default function VeterinaryBookingsDetail({
  onBack,
  appointmentData,
  appointmentId: passedAppointmentId,
  petId: passedPetId,
  readOnly = false,
}: VeterinaryBookingsDetailProps) {
  const [activeTab, setActiveTab] = useState<
    'medical-record' | 'prescriptions' | 'lab-tests' | 'vaccinations'
  >('medical-record');
  const [appointment, setAppointment] = useState<AppointmentDetail | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshAppointmentDetails = async () => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch(
        API_ENDPOINTS.APPOINTMENTS.DETAIL(appointment!.id),
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        },
      );

      if (!response.ok) {
        throw new Error('Failed to refresh appointment details');
      }

      const data = await response.json();
      console.log('Appointment data refreshed:', data);

      // Map API response to AppointmentDetail interface
      const updatedAppointment: AppointmentDetail = {
        id: data.data?.id || appointment!.id,
        appointmentNumber:
          data.data?.appointment_number || appointment!.appointmentNumber,
        date: data.data?.appointment_date || appointment!.date,
        time: data.data?.appointment_time || appointment!.time,
        reason: data.data?.service_type || appointment!.reason,
        status: (data.data?.status || appointment!.status) as any,
        notes: data.data?.notes || appointment!.notes || '',
        petId: data.data?.pet_id || appointment!.petId,
        petName: data.data?.pet_name || appointment!.petName,
        petBreed: data.data?.pet_breed || '',
        petAge: data.data?.pet_age || 0,
        petWeight: data.data?.pet_weight || '',
        petColor: data.data?.pet_color || '',
        petMicrochip: data.data?.pet_microchip || '',
        petPhoto: data.data?.pet_photo || appointment!.petPhoto,
        ownerId: data.data?.user_id || '',
        ownerName:
          data.data?.first_name && data.data?.last_name
            ? `${data.data.first_name} ${data.data.last_name}`
            : appointment!.ownerName,
        ownerPhone: data.data?.clinic_phone || '',
        ownerEmail: data.data?.user_email || '',
        lastVisit: '',
        totalVisits: 0,
        activeMeds: '',
        allergies: '',
        medical_records: data.data?.medical_records || [],
        prescriptions: data.data?.prescriptions || [],
        lab_tests: data.data?.lab_tests || [],
        vaccinations: data.data?.vaccinations || [],
      };
      console.log(
        '🔄 Refresh - medical_records:',
        updatedAppointment.medical_records,
      );
      console.log(
        '🔄 Refresh - prescriptions:',
        updatedAppointment.prescriptions,
      );
      console.log('🔄 Refresh - lab_tests:', updatedAppointment.lab_tests);
      console.log(
        '🔄 Refresh - vaccinations:',
        updatedAppointment.vaccinations,
      );
      setAppointment(updatedAppointment);
    } catch (err) {
      console.error('Error refreshing appointment:', err);
    } finally {
      setLoading(false);
    }
  };

  const defaultAppointment: AppointmentDetail = {
    id: '1',
    appointmentNumber: 'APT-001',
    date: '2024-01-27',
    time: '09:00',
    reason: 'Routine Checkup',
    status: 'Pending',
    notes: 'Annual physical examination. Check for any abnormalities.',
    petId: '1',
    petName: 'Max',
    petBreed: 'Golden Retriever',
    petAge: 5,
    petWeight: '28.5 kg',
    petColor: 'Golden',
    petMicrochip: 'MC123456789',
    petPhoto: '/images/pets/golden-retriever.jpg',
    ownerId: '1',
    ownerName: 'John Smith',
    ownerPhone: '555-0101',
    ownerEmail: 'john@email.com',
    lastVisit: 'Jan 20, 2024',
    totalVisits: 8,
    activeMeds: 'None',
    allergies: 'None recorded',
  };

  useEffect(() => {
    // If appointmentData is provided, fetch full details from API using appointmentId
    if (appointmentData) {
      const fetchFullAppointmentDetails = async () => {
        setLoading(true);
        setError(null);
        try {
          const token = sessionStorage.getItem('token');
          const response = await fetch(
            API_ENDPOINTS.APPOINTMENTS.DETAIL(appointmentData.id),
            {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                ...(token && { Authorization: `Bearer ${token}` }),
              },
            },
          );

          if (!response.ok) {
            throw new Error('Failed to fetch appointment details');
          }

          const data = await response.json();
          console.log('Full appointment data received:', data);

          // Map API response to AppointmentDetail interface
          const apiAppointment: AppointmentDetail = {
            id: data.data?.id || appointmentData.id,
            appointmentNumber:
              data.data?.appointment_number ||
              appointmentData.appointmentNumber,
            date: data.data?.appointment_date || appointmentData.date,
            time: data.data?.appointment_time || appointmentData.time,
            reason:
              data.data?.service_type ||
              appointmentData.service ||
              'Appointment',
            status: (data.data?.status || appointmentData.status) as any,
            notes: data.data?.notes || appointmentData.notes || '',
            petId: data.data?.pet_id || appointmentData.petId,
            petName: data.data?.pet_name || appointmentData.petName,
            petBreed: data.data?.pet_breed || '',
            petAge: data.data?.pet_age || 0,
            petWeight: data.data?.pet_weight || '',
            petColor: data.data?.pet_color || '',
            petMicrochip: data.data?.pet_microchip || '',
            petPhoto: data.data?.pet_photo || appointmentData.petPhoto,
            ownerId: data.data?.user_id || '',
            ownerName:
              data.data?.first_name && data.data?.last_name
                ? `${data.data.first_name} ${data.data.last_name}`
                : appointmentData.ownerName,
            ownerPhone: data.data?.clinic_phone || '',
            ownerEmail: data.data?.user_email || '',
            lastVisit: '',
            totalVisits: 0,
            activeMeds: '',
            allergies: '',
            medical_records: data.data?.medical_records || [],
            prescriptions: data.data?.prescriptions || [],
            lab_tests: data.data?.lab_tests || [],
            vaccinations: data.data?.vaccinations || [],
          };

          console.log(
            '📋 Mapped medical_records:',
            apiAppointment.medical_records,
          );
          console.log('📋 Mapped prescriptions:', apiAppointment.prescriptions);
          console.log('📋 Mapped lab_tests:', apiAppointment.lab_tests);
          console.log('📋 Mapped vaccinations:', apiAppointment.vaccinations);

          console.log('Mapped full appointment:', apiAppointment);
          setAppointment(apiAppointment);
          setLoading(false);
        } catch (err) {
          console.error('Error fetching full appointment details:', err);
          // Fall back to mapped basic data
          const mappedData: AppointmentDetail = {
            id: appointmentData.id,
            appointmentNumber: appointmentData.appointmentNumber,
            date: appointmentData.date,
            time: appointmentData.time,
            reason: appointmentData.service,
            status: appointmentData.status as any,
            notes: appointmentData.notes || '',
            petId: appointmentData.petId,
            petName: appointmentData.petName,
            petBreed: '',
            petAge: 0,
            petWeight: '',
            petColor: '',
            petMicrochip: '',
            petPhoto: appointmentData.petPhoto,
            ownerId: '',
            ownerName: appointmentData.ownerName,
            ownerPhone: '',
            ownerEmail: '',
            lastVisit: '',
            totalVisits: 0,
            activeMeds: '',
            allergies: '',
          };
          setAppointment(mappedData);
          setLoading(false);
        }
      };

      fetchFullAppointmentDetails();
      return;
    }

    const fetchAppointment = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log(
          'Fetching appointment with ID:',
          passedAppointmentId,
          'petId:',
          passedPetId,
        );

        // TODO: Replace with actual API call
        const token = sessionStorage.getItem('token');
        const appointmentIdToFetch = passedAppointmentId || 'default';

        const response = await fetch(
          API_ENDPOINTS.VETERINARY_BOOKINGS.DETAIL(appointmentIdToFetch),
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              ...(token && { Authorization: `Bearer ${token}` }),
            },
          },
        );

        const data = await response.json();
        console.log('Appointment data received:', data);

        if (response.ok && data.data) {
          // Map API response to AppointmentDetail interface
          const apiAppointment: AppointmentDetail = {
            id:
              data.data.id ||
              data.data.appointment_id ||
              passedAppointmentId ||
              '1',
            appointmentNumber:
              data.data.appointmentNumber ||
              data.data.appointment_number ||
              'APT-001',
            date: data.data.date || data.data.appointment_date || '2024-01-27',
            time: data.data.time || data.data.appointment_time || '09:00',
            reason:
              data.data.reason ||
              data.data.appointment_reason ||
              'Routine Checkup',
            status: data.data.status || 'Pending',
            notes: data.data.notes || '',
            petId: data.data.petId || data.data.pet_id || passedPetId || '1',
            petName: data.data.petName || data.data.pet_name || 'Pet',
            petBreed: data.data.petBreed || data.data.pet_breed || '',
            petAge: data.data.petAge || data.data.pet_age || 0,
            petWeight: data.data.petWeight || data.data.pet_weight || '',
            petColor: data.data.petColor || data.data.pet_color || '',
            petMicrochip:
              data.data.petMicrochip || data.data.pet_microchip || '',
            petPhoto: data.data.petPhoto || data.data.pet_photo || '',
            ownerId: data.data.ownerId || data.data.owner_id || '1',
            ownerName: data.data.ownerName || data.data.owner_name || 'Owner',
            ownerPhone: data.data.ownerPhone || data.data.owner_phone || '',
            ownerEmail: data.data.ownerEmail || data.data.owner_email || '',
            lastVisit: data.data.lastVisit || data.data.last_visit || '',
            totalVisits: data.data.totalVisits || data.data.total_visits || 0,
            activeMeds: data.data.activeMeds || data.data.active_meds || '',
            allergies: data.data.allergies || '',
          };
          console.log('Mapped appointment:', apiAppointment);
          setAppointment(apiAppointment);
        } else {
          console.log('API error or no data, using default appointment');
          setAppointment(defaultAppointment);
        }
      } catch (err) {
        console.error('Fetch error:', err);
        setError(
          err instanceof Error ? err.message : 'Failed to fetch appointment',
        );
        // Use default appointment on error
        setAppointment(defaultAppointment);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointment();
  }, [passedAppointmentId, passedPetId, appointmentData]);

  return (
    <div className='min-h-screen bg-gray-50 p-4 md:p-8'>
      {/* Header */}
      <div className='mb-8'>
        <button
          onClick={onBack}
          className='flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4 font-medium'
        >
          <MdArrowBack className='w-5 h-5' />
          Back
        </button>

        {error && (
          <div className='mb-4 p-3 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded-lg'>
            <p className='text-sm font-medium'>{error}</p>
          </div>
        )}

        {loading ? (
          <div className='bg-white rounded-lg shadow p-6'>
            <p className='text-gray-600'>Loading appointment details...</p>
          </div>
        ) : appointment ? (
          <>
            <div className='flex items-center justify-between'>
              <div>
                <h1 className='text-3xl font-bold text-gray-900'>
                  {appointment.petName}'s Appointment
                </h1>
                <p className='text-gray-600 mt-1'>
                  {appointment.date} {appointment.time} • {appointment.reason}
                </p>
              </div>
              <div className='text-right'>
                <span
                  className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${
                    appointment.status === 'Pending'
                      ? 'bg-blue-100 text-blue-700'
                      : appointment.status === 'In Progress'
                        ? 'bg-yellow-100 text-yellow-700'
                        : appointment.status === 'Completed'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                  }`}
                >
                  {appointment.status}
                </span>
              </div>
            </div>

            {/* Main Content Grid */}
            <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8'>
              {/* Left Column - Pet & Owner Info */}
              <div className='lg:col-span-1 space-y-6'>
                <PetInformationSection appointment={appointment} />
                <OwnerInformationSection appointment={appointment} />
                <RecentHistorySection appointment={appointment} />
              </div>

              {/* Right Column - Appointment Details & Workflow */}
              <div className='lg:col-span-2 space-y-6'>
                {!readOnly && (
                  <AppointmentActionsSection
                    appointmentId={appointment.id}
                    appointmentStatus={appointment.status}
                    onStatusUpdate={refreshAppointmentDetails}
                  />
                )}
                <AppointmentDetailsSection appointment={appointment} />
                <AppointmentWorkflowSection
                  appointment={appointment}
                  activeTab={activeTab}
                  onTabChange={setActiveTab}
                  onRefreshAppointment={refreshAppointmentDetails}
                  readOnly={readOnly}
                />
              </div>
            </div>
          </>
        ) : (
          <div className='bg-white rounded-lg shadow p-6'>
            <p className='text-gray-600'>No appointment found</p>
          </div>
        )}
      </div>
    </div>
  );
}
