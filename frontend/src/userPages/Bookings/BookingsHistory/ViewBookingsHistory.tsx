import { useState } from 'react';
import PageMeta from '../../../components/common/PageMeta';
import ComponentCard from '../../../components/common/ComponentCard';
import BookingHistoryTable from '../../../components/ownerTables/Bookings/BookingsHistoryTable/BookingHistoryTable';
import VeterinaryBookingsDetail from '../../../adminPages/VetPageForms/Veterinary/VeterinaryBookingsDetail/VeterinaryBookingsDetail';
import type { VetBooking } from '../../../components/vetTables/Veterinary/VeterninaryBookingsTable/VeterinaryBookingsTable';

const ViewBookingsHistory = () => {
  const [selectedAppointment, setSelectedAppointment] =
    useState<VetBooking | null>(null);

  // If appointment is selected, show detail view
  if (selectedAppointment) {
    return (
      <>
        <PageMeta
          title='BracePet Booking Details'
          description='This is BracePet Booking Details'
        />
        <div className='space-y-6 p-4'>
          <ComponentCard title='Booking Details'>
            <VeterinaryBookingsDetail
              appointmentData={selectedAppointment}
              readOnly={true}
              onBack={() => setSelectedAppointment(null)}
            />
          </ComponentCard>
        </div>
      </>
    );
  }

  // Otherwise show the history table
  return (
    <>
      <PageMeta
        title='BracePet ViewBookingsHistory'
        description='This is BracePet ViewBookingsHistory'
      />
      <div className='space-y-6 p-4'>
        <ComponentCard title='ViewBookingsHistory'>
          <BookingHistoryTable onSelectAppointment={setSelectedAppointment} />
        </ComponentCard>
      </div>
    </>
  );
};

export default ViewBookingsHistory;
