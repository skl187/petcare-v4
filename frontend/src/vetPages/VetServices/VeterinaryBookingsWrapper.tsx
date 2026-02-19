import { useState } from 'react';
import PageMeta from '../../components/common/PageMeta';
import ComponentCard from '../../components/common/ComponentCard';
import VeterinaryBookingsTable from '../../components/vetTables/Veterinary/VeterninaryBookingsTable/VeterinaryBookingsTable';
import VeterinaryBookingsDetail from '../../pages/VetPageForms/Veterinary/VeterinaryBookingsDetail/VeterinaryBookingsDetail';
import type { VetBooking } from '../../components/vetTables/Veterinary/VeterninaryBookingsTable/VeterinaryBookingsTable';

type TabFilter = 'today' | 'upcoming' | 'all';

const VeterinaryBookings = () => {
  const [selectedAppointment, setSelectedAppointment] =
    useState<VetBooking | null>(null);
  const [activeTab, setActiveTab] = useState<TabFilter>('today');

  if (selectedAppointment) {
    return (
      <>
        <PageMeta
          title='Appointment Details'
          description='Veterinary appointment details'
        />
        <VeterinaryBookingsDetail
          appointmentData={selectedAppointment}
          onBack={() => setSelectedAppointment(null)}
        />
      </>
    );
  }

  return (
    <>
      <PageMeta
        title='BracePet VeterinaryBookings'
        description='This is BracePet VeterinaryBookings'
      />
      <div className='space-y-6 p-4'>
        <ComponentCard title='VeterinaryBookings'>
          {/* Tabs */}
          <div className='flex border-b border-gray-200 mb-6'>
            {(['today', 'upcoming', 'all'] as TabFilter[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 font-medium text-sm transition-colors ${
                  activeTab === tab
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Table for active tab */}
          <VeterinaryBookingsTable
            filter={activeTab}
            onSelectAppointment={setSelectedAppointment}
          />
        </ComponentCard>
      </div>
    </>
  );
};

export default VeterinaryBookings;
