import { useState } from 'react';
import PageMeta from '../../components/common/PageMeta';
import ComponentCard from '../../components/common/ComponentCard';
import UpcomingBookingsTable from '../../components/ownerTables/Bookings/UpcomingBookingsTable';
import VeterinaryBookingsDetail from '../../adminPages/AdminPageForms/VeterinaryBookingsDetail/VeterinaryBookingsDetail';
import type { VetBooking } from '../../components/vetTables/Veterinary/VeterinaryBookingsTable';

const ViewUpcomingBookings = () => {
  const [selectedAppointment, setSelectedAppointment] =
    useState<VetBooking | null>(null);

  // If an appointment is selected, show the detail view
  if (selectedAppointment) {
    return (
      <>
        <PageMeta
          title='BracePet Appointment Details'
          description='Appointment details and workflow'
        />
        <VeterinaryBookingsDetail
          appointmentData={selectedAppointment}
          readOnly={true}
          onBack={() => {
            setSelectedAppointment(null);
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
            filter='upcoming'
            onSelectAppointment={setSelectedAppointment}
          />
        </ComponentCard>
      </div>
    </>
  );
};

export default ViewUpcomingBookings;
