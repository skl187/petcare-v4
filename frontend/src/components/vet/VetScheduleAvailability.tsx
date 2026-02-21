import { useEffect, useState } from 'react';
import { getVetSchedules, bulkUpsertSchedules } from '../../services/vetScheduleService';

interface Schedule {
  id?: string;
  veterinarian_id: string;
  clinic_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  slot_duration?: number;
  max_appointments_per_slot?: number;
  is_available?: boolean;
  clinic_name?: string;
}

const dayLabels = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

interface VetScheduleAvailabilityProps {
  veterinarian_id: string;
  clinic_id: string;
}

const VetScheduleAvailability = ({ veterinarian_id, clinic_id }: VetScheduleAvailabilityProps) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editedSchedules, setEditedSchedules] = useState<{ [key: number]: Schedule }>({});

  // Load schedules on mount
  useEffect(() => {
    loadSchedules();
  }, [veterinarian_id, clinic_id]);

  const loadSchedules = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getVetSchedules(veterinarian_id, clinic_id);
      // Initialize edited schedules
      const edits: { [key: number]: Schedule } = {};
      data.forEach((s: Schedule) => {
        edits[s.day_of_week] = { ...s };
      });
      setEditedSchedules(edits);
    } catch (err) {
      setError('Failed to load schedules. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleTimeChange = (day: number, field: 'start_time' | 'end_time', value: string) => {
    setEditedSchedules(prev => {
      const existing = prev[day] || {
        veterinarian_id,
        clinic_id,
        day_of_week: day,
        start_time: '09:00',
        end_time: '17:00',
        is_available: true,
        slot_duration: 30,
        max_appointments_per_slot: 1
      };
      return {
        ...prev,
        [day]: {
          ...existing,
          [field]: value
        }
      };
    });
  };

  const handleAvailabilityChange = (day: number, available: boolean) => {
    setEditedSchedules(prev => {
      const existing = prev[day] || {
        veterinarian_id,
        clinic_id,
        day_of_week: day,
        start_time: '09:00',
        end_time: '17:00',
        is_available: true,
        slot_duration: 30,
        max_appointments_per_slot: 1
      };
      return {
        ...prev,
        [day]: {
          ...existing,
          is_available: available
        }
      };
    });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      // gather schedules the user has edited or that we loaded from the API
      let schedulesToSave: Schedule[] = Object.values(editedSchedules).filter(s => s);

      // if there were no existing schedules at all (first-time setup), create
      // a default week so the backend inserts something instead of wiping data
      if (schedulesToSave.length === 0) {
        for (let day = 0; day < dayLabels.length; day++) {
          schedulesToSave.push({
            veterinarian_id,
            clinic_id,
            day_of_week: day,
            start_time: '09:00',
            end_time: '17:00',
            is_available: true,
            slot_duration: 30,
            max_appointments_per_slot: 1
          });
        }
      }

      // Validate only days marked as available
      for (const schedule of schedulesToSave) {
        if (schedule.is_available) {
          if (!schedule.start_time || !schedule.end_time) {
            setError('Please fill in start and end times for all available days');
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

      await bulkUpsertSchedules(veterinarian_id, clinic_id, schedulesToSave);
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
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-semibold mb-6">Weekly Availability</h2>

      {error && (
        <div className="mb-4 p-4 border border-red-200 bg-red-50 rounded-lg">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 border border-green-200 bg-green-50 rounded-lg">
          <p className="text-green-800">{success}</p>
        </div>
      )}

      <div className="space-y-4">
        {dayLabels.map((dayLabel, dayIndex) => {
          const schedule = editedSchedules[dayIndex] || {
            veterinarian_id,
            clinic_id,
            day_of_week: dayIndex,
            start_time: '09:00',
            end_time: '17:00',
            is_available: true,
            slot_duration: 30,
            max_appointments_per_slot: 1
          };

          return (
            <div key={dayIndex} className="p-4 border border-gray-200 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                {/* Day label */}
                <div className="md:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {dayLabel}
                  </label>
                </div>

                {/* Available toggle */}
                <div className="flex items-center">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={schedule.is_available}
                      onChange={(e) => handleAvailabilityChange(dayIndex, e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Available</span>
                  </label>
                </div>

                {/* Start time */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={schedule.start_time}
                    onChange={(e) => handleTimeChange(dayIndex, 'start_time', e.target.value)}
                    disabled={!schedule.is_available}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                </div>

                {/* End time */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={schedule.end_time}
                    onChange={(e) => handleTimeChange(dayIndex, 'end_time', e.target.value)}
                    disabled={!schedule.is_available}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                </div>

                {/* Slot duration */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Slot Duration (min)
                  </label>
                  <select
                    value={schedule.slot_duration || 30}
                    onChange={(e) => setEditedSchedules(prev => ({
                      ...prev,
                      [dayIndex]: {
                        ...prev[dayIndex],
                        slot_duration: parseInt(e.target.value)
                      }
                    }))}
                    disabled={!schedule.is_available}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="15">15 min</option>
                    <option value="30">30 min</option>
                    <option value="45">45 min</option>
                    <option value="60">60 min</option>
                  </select>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex gap-3">
        <button
          onClick={handleSave}
          disabled={saving || loading}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg transition"
        >
          {saving ? 'Saving...' : 'Save Schedule'}
        </button>
        <button
          onClick={loadSchedules}
          disabled={saving || loading}
          className="bg-gray-200 hover:bg-gray-300 disabled:bg-gray-300 text-gray-800 px-6 py-2 rounded-lg transition"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default VetScheduleAvailability;
