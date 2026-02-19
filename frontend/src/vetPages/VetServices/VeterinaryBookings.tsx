import { useState } from 'react';
import PageMeta from '../../components/common/PageMeta';
import ComponentCard from '../../components/common/ComponentCard';
import VeterinaryBookingsTable from '../../components/vetTables/Veterinary/VeterninaryBookingsTable/VeterinaryBookingsTable';
import VeterinaryBookingsDetail from '../../adminPages/VetPageForms/Veterinary/VeterinaryBookingsDetail/VeterinaryBookingsDetail';

const VeterinaryBookings = () => {
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<
    string | null
  >(null);
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);

  // Handler for when edit button is clicked in table
  const handleSelectAppointment = (booking: any) => {
    console.log('Selected appointment:', booking.id, 'petId:', booking.pet_id);
    setSelectedAppointmentId(booking.id);
    setSelectedPetId(booking.pet_id);
  };

  // If an appointment is selected, show the detail view alongside the table
  if (selectedAppointmentId && selectedPetId) {
    return (
      <>
        <PageMeta
          title='BracePet Appointment Details'
          description='Appointment details and workflow'
        />
        <VeterinaryBookingsDetail
          appointmentId={selectedAppointmentId}
          petId={selectedPetId}
          onBack={() => {
            setSelectedAppointmentId(null);
            setSelectedPetId(null);
          }}
        />
      </>
    );
  }

  // Otherwise show the table list view
  return (
    <>
      <PageMeta
        title='BracePet VeterinaryBookings'
        description='This is BracePet VeterinaryBookings'
      />
      <div className='space-y-6 p-4'>
        <ComponentCard title='VeterinaryBookings'>
          <VeterinaryBookingsTable
            onSelectAppointment={handleSelectAppointment}
          />
        </ComponentCard>
      </div>
    </>
  );
};

export default VeterinaryBookings;
