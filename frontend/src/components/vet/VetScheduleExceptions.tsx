import { useEffect, useState } from 'react';
import { getScheduleExceptions, createScheduleException, deleteScheduleException } from '../../services/vetScheduleService';
import { Trash2, Plus } from 'lucide-react';

interface ScheduleException {
  id?: string;
  veterinarian_id: string;
  clinic_id?: string;
  exception_date: string;
  exception_type: 'leave' | 'holiday' | 'emergency' | 'conference' | 'other';
  start_time?: string;
  end_time?: string;
  reason?: string;
  is_recurring?: boolean;
}

interface VetScheduleExceptionsProps {
  veterinarian_id: string;
  clinic_id?: string;
}

const VetScheduleExceptions = ({ veterinarian_id, clinic_id }: VetScheduleExceptionsProps) => {
  const [exceptions, setExceptions] = useState<ScheduleException[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Partial<ScheduleException>>({
    exception_type: 'leave',
    is_recurring: false
  });

  useEffect(() => {
    loadExceptions();
  }, [veterinarian_id, clinic_id]);

  const loadExceptions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getScheduleExceptions(veterinarian_id, clinic_id);
      setExceptions(data);
    } catch (err) {
      setError('Failed to load exceptions. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddException = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError(null);

      if (!formData.exception_date) {
        setError('Please select a date');
        setSaving(false);
        return;
      }

      const newException: ScheduleException = {
        veterinarian_id,
        clinic_id,
        exception_date: formData.exception_date,
        exception_type: formData.exception_type || 'leave',
        start_time: formData.start_time,
        end_time: formData.end_time,
        reason: formData.reason,
        is_recurring: formData.is_recurring || false
      };

      await createScheduleException(newException);
      setSuccess('Exception added successfully');
      setFormData({ exception_type: 'leave', is_recurring: false });
      setShowForm(false);
      await loadExceptions();
    } catch (err) {
      setError('Failed to add exception. Please try again.');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteException = async (exceptionId: string) => {
    if (!window.confirm('Are you sure you want to remove this exception?')) return;

    try {
      setDeleting(exceptionId);
      setError(null);
      await deleteScheduleException(exceptionId);
      setSuccess('Exception removed successfully');
      await loadExceptions();
    } catch (err) {
      setError('Failed to delete exception. Please try again.');
      console.error(err);
    } finally {
      setDeleting(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
  };

  const getExceptionBadgeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      leave: 'bg-blue-100 text-blue-800',
      holiday: 'bg-red-100 text-red-800',
      emergency: 'bg-orange-100 text-orange-800',
      conference: 'bg-purple-100 text-purple-800',
      other: 'bg-gray-100 text-gray-800'
    };
    return colors[type] || colors.other;
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
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Schedule Exceptions</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus size={16} />
          Add Exception
        </button>
      </div>

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

      {/* Add Exception Form */}
      {showForm && (
        <form onSubmit={handleAddException} className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Exception Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.exception_type || 'leave'}
                onChange={(e) => setFormData({ ...formData, exception_type: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="leave">Leave</option>
                <option value="holiday">Holiday</option>
                <option value="emergency">Emergency</option>
                <option value="conference">Conference</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.exception_date || ''}
                onChange={(e) => setFormData({ ...formData, exception_date: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Start Time (optional) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Time (Optional)
              </label>
              <input
                type="time"
                value={formData.start_time || ''}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* End Time (optional) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Time (Optional)
              </label>
              <input
                type="time"
                value={formData.end_time || ''}
                onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Reason */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason (Optional)
            </label>
            <input
              type="text"
              value={formData.reason || ''}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              placeholder="e.g., Annual leave, Medical conference"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Recurring */}
          <div className="mb-4 flex items-center">
            <input
              type="checkbox"
              id="recurring"
              checked={formData.is_recurring || false}
              onChange={(e) => setFormData({ ...formData, is_recurring: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
            />
            <label htmlFor="recurring" className="ml-2 text-sm text-gray-700">
              Recurring annually
            </label>
          </div>

          {/* Form Buttons */}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition"
            >
              {saving ? 'Adding...' : 'Add Exception'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg transition"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Exceptions List */}
      {exceptions.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No schedule exceptions yet. Add one to indicate leave, holidays, or other unavailable times.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {exceptions.map((exception) => (
            <div key={exception.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getExceptionBadgeColor(exception.exception_type)}`}>
                    {exception.exception_type.charAt(0).toUpperCase() + exception.exception_type.slice(1)}
                  </span>
                  <span className="font-medium text-gray-900">
                    {formatDate(exception.exception_date)}
                  </span>
                  {exception.is_recurring && (
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                      Recurring
                    </span>
                  )}
                </div>
                {exception.start_time && exception.end_time && (
                  <p className="text-sm text-gray-600 mb-1">
                    {exception.start_time} - {exception.end_time}
                  </p>
                )}
                {exception.reason && (
                  <p className="text-sm text-gray-600">
                    {exception.reason}
                  </p>
                )}
              </div>
              <button
                onClick={() => handleDeleteException(exception.id!)}
                disabled={deleting === exception.id}
                className="ml-4 p-2 text-red-600 hover:bg-red-50 rounded-lg transition disabled:text-gray-400"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VetScheduleExceptions;
