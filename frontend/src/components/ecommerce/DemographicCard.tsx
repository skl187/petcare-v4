import { useState } from 'react';
import { Dropdown } from '../ui/dropdown/Dropdown';
import { DropdownItem } from '../ui/dropdown/DropdownItem';
import { MoreDotIcon } from '../../icons';
import { AdminDashboardData } from '../../services/dashboardService';
import { MdLocalHospital } from 'react-icons/md';

interface Props {
  data: AdminDashboardData | null;
}

export default function DemographicCard({ data }: Props) {
  const topClinics = data?.clinics?.top || [];
  const totalAppointments = parseInt(data?.appointments?.overview?.total_appointments || '1');
  const clinicStats = data?.clinics?.stats;
  const [isOpen, setIsOpen] = useState(false);

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  const getPercentage = (clinicAppointments: string) => {
    const appts = parseInt(clinicAppointments) || 0;
    return totalAppointments > 0 ? Math.round((appts / totalAppointments) * 100) : 0;
  };

  return (
    <div className='rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800/50 sm:p-6'>
      <div className='flex justify-between'>
        <div>
          <h3 className='text-lg font-semibold text-gray-800 dark:text-white/90'>
            Top Clinics
          </h3>
          <p className='mt-1 text-gray-500 text-theme-sm dark:text-gray-400'>
            Appointments distribution by clinic
          </p>
        </div>
        <div className='relative inline-block'>
          <button className='dropdown-toggle' onClick={toggleDropdown}>
            <MoreDotIcon className='text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 size-6' />
          </button>
          <Dropdown
            isOpen={isOpen}
            onClose={closeDropdown}
            className='w-40 p-2'
          >
            <DropdownItem
              onItemClick={closeDropdown}
              className='flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300'
            >
              View More
            </DropdownItem>
          </Dropdown>
        </div>
      </div>

      {/* Clinic Stats Summary */}
      <div className='grid grid-cols-2 gap-4 my-6'>
        <div className='rounded-xl bg-blue-50 dark:bg-blue-900/20 p-4'>
          <p className='text-xs text-gray-500 dark:text-gray-400'>Total Clinics</p>
          <p className='text-2xl font-bold text-gray-800 dark:text-white mt-1'>
            {clinicStats?.total_clinics || '0'}
          </p>
        </div>
        <div className='rounded-xl bg-emerald-50 dark:bg-emerald-900/20 p-4'>
          <p className='text-xs text-gray-500 dark:text-gray-400'>Active Clinics</p>
          <p className='text-2xl font-bold text-gray-800 dark:text-white mt-1'>
            {clinicStats?.active_clinics || '0'}
          </p>
        </div>
      </div>

      <div className='space-y-5'>
        {topClinics.length > 0 ? (
          topClinics.map((clinic, _index) => {
            const percentage = getPercentage(clinic.total_appointments);
            return (
              <div key={clinic.id} className='flex items-center justify-between'>
                <div className='flex items-center gap-3'>
                  <div className='flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30'>
                    <MdLocalHospital className='text-blue-600 dark:text-blue-400 size-4' />
                  </div>
                  <div>
                    <p className='font-semibold text-gray-800 text-theme-sm dark:text-white/90'>
                      {clinic.name}
                    </p>
                    <span className='block text-gray-500 text-theme-xs dark:text-gray-400'>
                      {clinic.total_appointments} Appointments
                    </span>
                  </div>
                </div>

                <div className='flex w-full max-w-[140px] items-center gap-3'>
                  <div className='relative block h-2 w-full max-w-[100px] rounded-sm bg-gray-200 dark:bg-gray-800'>
                    <div
                      className='absolute left-0 top-0 flex h-full items-center justify-center rounded-sm bg-brand-500 text-xs font-medium text-white'
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <p className='font-medium text-gray-800 text-theme-sm dark:text-white/90'>
                    {percentage}%
                  </p>
                </div>
              </div>
            );
          })
        ) : (
          <div className='text-center py-4 text-gray-500 dark:text-gray-400'>
            No clinic data available
          </div>
        )}
      </div>
    </div>
  );
}
