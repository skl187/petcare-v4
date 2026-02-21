import { useEffect, useState } from 'react';
import {
  getVetSchedules,
  bulkUpsertSchedules,
} from '../../services/vetScheduleService';
import { API_ENDPOINTS } from '../../constants/api';

const getAuthHeaders = () => {
  const token = sessionStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

interface Schedule {
  id?: string;
  veterinarian_id?: string;
  clinic_id?: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  slot_duration?: number;
  max_appointments_per_slot?: number;
  is_available?: boolean;
  clinic_name?: string;
}

interface Clinic {
  id: string;
  name: string;
}

const dayLabels = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

interface VetScheduleAvailabilityProps {
  veterinarian_id?: string;
  clinic_id?: string;
}

const VetScheduleAvailability = ({}: VetScheduleAvailabilityProps) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [selectedClinic, setSelectedClinic] = useState<string>('');
  const [editedSchedules, setEditedSchedules] = useState<{
    [key: number]: Schedule;
  }>({});

  // Load clinics and schedules on mount
  useEffect(() => {
    loadClinics();
  }, []);

  // Load schedules when clinic changes
  useEffect(() => {
    if (selectedClinic) {
      loadSchedules();
    }
  }, [selectedClinic]);

  const loadClinics = async () => {
    try {
      const url = `${API_ENDPOINTS.VET_SERVICES.CLINICS || '/api/vet-services/my/clinics'}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to load clinics');
      }

      const result = await response.json();
      const clinicsList = result.data || result || [];
      setClinics(clinicsList);

      // Set default selected clinic
      if (clinicsList.length > 0) {
        setSelectedClinic(clinicsList[0].id);
      }
    } catch (err) {
      console.error('Error loading clinics:', err);
      setError('Failed to load clinics');
    }
  };

  const loadSchedules = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getVetSchedules();
      // Initialize edited schedules
      const edits: { [key: number]: Schedule } = {};

      // First, create entries for all 7 days as unavailable (orange)
      for (let day = 0; day < 7; day++) {
        edits[day] = {
          day_of_week: day,
          start_time: '09:00',
          end_time: '17:00',
          is_available: false,
          slot_duration: 30,
          max_appointments_per_slot: 1,
          clinic_id: selectedClinic,
        };
      }

      // Then override with actual data if available (green) - filter by selected clinic
      data.forEach((s: Schedule) => {
        if (s.clinic_id === selectedClinic) {
          edits[s.day_of_week] = { ...s };
        }
      });

      setEditedSchedules(edits);
    } catch (err) {
      setError('Failed to load schedules. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleTimeChange = (
    day: number,
    field: 'start_time' | 'end_time',
    value: string,
  ) => {
    setEditedSchedules((prev) => {
      const existing = prev[day] || {
        day_of_week: day,
        start_time: '09:00',
        end_time: '17:00',
        is_available: true,
        slot_duration: 30,
        max_appointments_per_slot: 1,
      };
      return {
        ...prev,
        [day]: {
          ...existing,
          [field]: value,
        },
      };
    });
  };

  const handleAvailabilityChange = (day: number, available: boolean) => {
    setEditedSchedules((prev) => {
      const existing = prev[day] || {
        day_of_week: day,
        start_time: '09:00',
        end_time: '17:00',
        is_available: true,
        slot_duration: 30,
        max_appointments_per_slot: 1,
      };
      return {
        ...prev,
        [day]: {
          ...existing,
          is_available: available,
        },
      };
    });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      // gather schedules the user has edited or that we loaded from the API
      let schedulesToSave: Schedule[] = Object.values(editedSchedules).filter(
        (s) => s,
      );

      // Ensure all schedules have clinic_id
      schedulesToSave = schedulesToSave.map((s) => ({
        ...s,
        clinic_id: selectedClinic,
      }));

      // if there were no existing schedules at all (first-time setup), create
      // a default week so the backend inserts something instead of wiping data
      if (schedulesToSave.length === 0) {
        for (let day = 0; day < dayLabels.length; day++) {
          schedulesToSave.push({
            day_of_week: day,
            start_time: '09:00',
            end_time: '17:00',
            is_available: true,
            slot_duration: 30,
            max_appointments_per_slot: 1,
            clinic_id: selectedClinic,
          });
        }
      }

      // Validate only days marked as available
      for (const schedule of schedulesToSave) {
        if (schedule.is_available) {
          if (!schedule.start_time || !schedule.end_time) {
            setError(
              'Please fill in start and end times for all available days',
            );
            setSaving(false);
            return;
          }
          if (schedule.start_time >= schedule.end_time) {
            setError('End time must be after start time');
            setSaving(false);
            return;
          }
        }
      }

      await bulkUpsertSchedules(schedulesToSave);
      setSuccess('Schedule updated successfully');
      await loadSchedules();
    } catch (err: any) {
      const msg = err?.message || 'Failed to save schedule. Please try again.';
      setError(msg);
      console.error('Schedule save error:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center p-8'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
      </div>
    );
  }

  return (
    <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-4'>
      <h2 className='text-lg font-semibold mb-4'>Weekly Availability</h2>

      {/* Clinic Selector */}
      <div className='mb-4 flex flex-col gap-2'>
        <label className='text-sm font-medium text-gray-700'>
          Select Hospital/Clinic
        </label>
        <select
          value={selectedClinic}
          onChange={(e) => setSelectedClinic(e.target.value)}
          className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
        >
          {clinics.map((clinic) => (
            <option key={clinic.id} value={clinic.id}>
              {clinic.name}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className='mb-3 p-3 border border-red-200 bg-red-50 rounded-lg text-sm'>
          <p className='text-red-800'>{error}</p>
        </div>
      )}

      {success && (
        <div className='mb-3 p-3 border border-green-200 bg-green-50 rounded-lg text-sm'>
          <p className='text-green-800'>{success}</p>
        </div>
      )}

      {/* Table Header */}
      <div className='hidden md:grid grid-cols-1 md:grid-cols-5 gap-2 mb-3 px-2'>
        <div className='text-xs font-semibold text-gray-700'>Day</div>
        <div className='text-xs font-semibold text-gray-700'>Available</div>
        <div className='text-xs font-semibold text-gray-700'>Start Time</div>
        <div className='text-xs font-semibold text-gray-700'>End Time</div>
        <div className='text-xs font-semibold text-gray-700'>Slot Duration</div>
      </div>

      <div className='space-y-2'>
        {dayLabels.map((dayLabel, dayIndex) => {
          const schedule = editedSchedules[dayIndex] || {
            day_of_week: dayIndex,
            start_time: '09:00',
            end_time: '17:00',
            is_available: false,
            slot_duration: 30,
            max_appointments_per_slot: 1,
          };

          const isAvailable = schedule.is_available;
          const bgColor = isAvailable
            ? 'bg-green-50 hover:bg-green-100'
            : 'bg-orange-50 hover:bg-orange-100';
          const borderColor = isAvailable
            ? 'border-green-200'
            : 'border-orange-200';

          return (
            <div
              key={dayIndex}
              className={`grid grid-cols-1 md:grid-cols-5 gap-2 items-center p-2 ${bgColor} rounded-lg border ${borderColor} transition`}
            >
              {/* Day label */}
              <div className='flex md:block'>
                <span className='md:hidden text-xs font-semibold text-gray-600 mr-2'>
                  Day:
                </span>
                <span className='text-sm font-medium text-gray-800'>
                  {dayLabel}
                </span>
              </div>

              {/* Available toggle */}
              <div className='flex items-center gap-2'>
                <span className='md:hidden text-xs font-semibold text-gray-600'>
                  Available:
                </span>
                <label className='flex items-center cursor-pointer'>
                  <input
                    type='checkbox'
                    checked={schedule.is_available}
                    onChange={(e) =>
                      handleAvailabilityChange(dayIndex, e.target.checked)
                    }
                    className='w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500'
                  />
                </label>
              </div>

              {/* Start time */}
              <div className='flex flex-col gap-1'>
                <span className='md:hidden text-xs font-semibold text-gray-600'>
                  Start:
                </span>
                <input
                  type='time'
                  value={schedule.start_time}
                  onChange={(e) =>
                    handleTimeChange(dayIndex, 'start_time', e.target.value)
                  }
                  disabled={!schedule.is_available}
                  className='text-sm px-2 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-200 disabled:cursor-not-allowed'
                />
              </div>

              {/* End time */}
              <div className='flex flex-col gap-1'>
                <span className='md:hidden text-xs font-semibold text-gray-600'>
                  End:
                </span>
                <input
                  type='time'
                  value={schedule.end_time}
                  onChange={(e) =>
                    handleTimeChange(dayIndex, 'end_time', e.target.value)
                  }
                  disabled={!schedule.is_available}
                  className='text-sm px-2 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-200 disabled:cursor-not-allowed'
                />
              </div>

              {/* Slot duration */}
              <div className='flex flex-col gap-1'>
                <span className='md:hidden text-xs font-semibold text-gray-600'>
                  Duration:
                </span>
                <select
                  value={schedule.slot_duration || 30}
                  onChange={(e) =>
                    setEditedSchedules((prev) => ({
                      ...prev,
                      [dayIndex]: {
                        ...prev[dayIndex],
                        slot_duration: parseInt(e.target.value),
                      },
                    }))
                  }
                  disabled={!schedule.is_available}
                  className='text-sm px-2 py-1.5 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-200 disabled:cursor-not-allowed'
                >
                  <option value='15'>15 min</option>
                  <option value='30'>30 min</option>
                  <option value='45'>45 min</option>
                  <option value='60'>60 min</option>
                </select>
              </div>
            </div>
          );
        })}
      </div>

      <div className='mt-4 flex gap-2'>
        <button
          onClick={handleSave}
          disabled={saving || loading}
          className='bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white text-sm px-4 py-2 rounded-lg transition'
        >
          {saving ? 'Saving...' : 'Save Schedule'}
        </button>
        <button
          onClick={loadSchedules}
          disabled={saving || loading}
          className='bg-gray-200 hover:bg-gray-300 disabled:bg-gray-300 text-gray-800 text-sm px-4 py-2 rounded-lg transition'
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default VetScheduleAvailability;
