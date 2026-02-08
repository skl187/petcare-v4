import { useState } from 'react';
import PageMeta from '../../../components/common/PageMeta';
import ComponentCard from '../../../components/common/ComponentCard';
import UpcomingBookingsTable from '../../../components/ownerTables/Bookings/UpcomingBookingsTable/UpcomingBookingsTable';
import VeterinaryBookingsDetail from '../../../pages/VetPageForms/Veterinary/VeterinaryBookingsDetail/VeterinaryBookingsDetail';

const ViewUpcomingBookings = () => {
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<
    string | null
  >(null);

  // If an appointment is selected, show the detail view
  if (selectedAppointmentId) {
    return (
      <>
        <PageMeta
          title='BracePet Appointment Details'
          description='Appointment details and workflow'
        />
        <VeterinaryBookingsDetail
          appointmentId={selectedAppointmentId}
          readOnly={true}
          onBack={() => {
            setSelectedAppointmentId(null);
          }}
        />
      </>
    );
  }

  // Otherwise show the table list view
  return (
    <>
      <PageMeta
        title='BracePet ViewUpcomingBookings'
        description='This is BracePet ViewUpcomingBookings'
      />
      <div className='space-y-6 p-4'>
        <ComponentCard title='ViewUpcomingBookings'>
          <UpcomingBookingsTable
            onSelectAppointment={setSelectedAppointmentId}
          />
        </ComponentCard>
      </div>
    </>
  );
};

export default ViewUpcomingBookings;
