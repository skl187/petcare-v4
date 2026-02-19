import { useState } from 'react';
import { API_ENDPOINTS } from '../../../../../constants/api';
import { MdClose } from 'react-icons/md';
import DatePickerInput from '../../../../../components/form/DatePickerInput/DatePickerInput';
import type { AppointmentDetail } from '../VeterinaryBookingsDetail';

interface AppointmentActionsSectionProps {
  appointmentId: string;
  appointmentStatus:
    | 'Pending'
    | 'In Progress'
    | 'Completed'
    | 'Cancelled'
    | 'scheduled'
    | 'confirmed'
    | 'in_progress';
  appointmentData?: AppointmentDetail;
  onStatusUpdate?: () => void;
}

export default function AppointmentActionsSection({
  appointmentId,
  appointmentStatus,
  onStatusUpdate,
}: AppointmentActionsSectionProps) {
  const [showStartConfirm, setShowStartConfirm] = useState(false);
  const [showCompletedConfirm, setShowCompletedConfirm] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showReschedule, setShowReschedule] = useState(false);
  const [showConfirmScheduled, setShowConfirmScheduled] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('');
  const [rescheduleReason, setRescheduleReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleStartAppointment = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch(
        `${API_ENDPOINTS.APPOINTMENTS.DETAIL(appointmentId)}/status`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          body: JSON.stringify({ status: 'in_progress' }),
        },
      );

      if (!response.ok) {
        throw new Error('Failed to start appointment');
      }

      setSuccess('Appointment started successfully');
      setShowStartConfirm(false);
      setTimeout(() => setSuccess(null), 3000);
      onStatusUpdate?.();
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : 'Failed to start appointment';
      setError(errorMsg);
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleRescheduleSubmit = async () => {
    if (!rescheduleDate || !rescheduleTime || !rescheduleReason) {
      setError('Please fill in all fields: date, time, and reason');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const token = sessionStorage.getItem('token');

      // Send only the 3 required fields
      const payload = {
        appointment_date: rescheduleDate,
        appointment_time: rescheduleTime,
        notes: rescheduleReason,
      };

      const response = await fetch(
        `${API_ENDPOINTS.APPOINTMENTS.DETAIL(appointmentId)}/reschedule`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          body: JSON.stringify(payload),
        },
      );

      if (!response.ok) {
        throw new Error('Failed to reschedule appointment');
      }

      setSuccess('Appointment rescheduled successfully');
      setShowReschedule(false);
      setRescheduleDate('');
      setRescheduleTime('');
      setRescheduleReason('');
      setTimeout(() => setSuccess(null), 3000);
      onStatusUpdate?.();
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : 'Failed to reschedule appointment';
      setError(errorMsg);
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleCancellation = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch(
        `${API_ENDPOINTS.APPOINTMENTS.DETAIL(appointmentId)}/status`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          body: JSON.stringify({ status: 'cancelled' }),
        },
      );

      if (!response.ok) {
        throw new Error('Failed to cancel appointment');
      }

      setSuccess('Appointment cancelled successfully');
      setShowCancelConfirm(false);
      setTimeout(() => setSuccess(null), 3000);
      onStatusUpdate?.();
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : 'Failed to cancel appointment';
      setError(errorMsg);
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleted = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch(
        `${API_ENDPOINTS.APPOINTMENTS.DETAIL(appointmentId)}/status`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          body: JSON.stringify({ status: 'completed' }),
        },
      );

      if (!response.ok) {
        throw new Error('Failed to mark appointment as completed');
      }

      setSuccess('Appointment marked as completed successfully');
      setShowCompletedConfirm(false);
      setTimeout(() => setSuccess(null), 3000);
      onStatusUpdate?.();
    } catch (err) {
      const errorMsg =
        err instanceof Error
          ? err.message
          : 'Failed to mark appointment as completed';
      setError(errorMsg);
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmScheduled = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch(
        `${API_ENDPOINTS.APPOINTMENTS.DETAIL(appointmentId)}/status`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          body: JSON.stringify({ status: 'in_progress' }),
        },
      );

      if (!response.ok) {
        throw new Error('Failed to start appointment');
      }

      setSuccess('Appointment started successfully');
      setShowConfirmScheduled(false);
      setTimeout(() => setSuccess(null), 3000);
      onStatusUpdate?.();
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : 'Failed to start appointment';
      setError(errorMsg);
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className='bg-white rounded-lg shadow-md p-4'>
        <h2 className='text-base font-semibold text-gray-900 mb-4'>
          APPOINTMENT ACTIONS
        </h2>

        {error && (
          <div className='mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg'>
            <p className='text-sm'>{error}</p>
          </div>
        )}

        {success && (
          <div className='mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg'>
            <p className='text-sm'>{success}</p>
          </div>
        )}

        {/* Status: scheduled - show only confirm button */}
        {appointmentStatus === 'scheduled' && (
          <div className='grid grid-cols-1 md:grid-cols-1 gap-4'>
            <button
              onClick={() => setShowConfirmScheduled(true)}
              disabled={loading}
              className='px-4 py-2 rounded-md text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 active:scale-95 disabled:bg-gray-400'
            >
              Confirm Appointment
            </button>
          </div>
        )}

        {/* Status: confirmed - show edit hint and start button */}
        {appointmentStatus === 'confirmed' && (
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div className='px-4 py-2 rounded-md bg-gray-100 border border-gray-200 text-gray-700 text-sm font-medium flex items-center justify-center'>
              Edit Mode (Appointment Confirmed)
            </div>
            <button
              onClick={() => setShowStartConfirm(true)}
              disabled={loading}
              className='px-4 py-2 rounded-md text-sm font-medium text-white bg-amber-500 hover:bg-amber-600 active:scale-95 disabled:bg-gray-400'
            >
              Start Appointment
            </button>
          </div>
        )}

        {/* Status: other than scheduled and confirmed - show standard action buttons */}
        {appointmentStatus !== 'scheduled' &&
          appointmentStatus !== 'confirmed' && (
            <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
              {/* Start/Continue Button - hide if already in_progress */}
              {appointmentStatus !== 'in_progress' && (
                <button
                  onClick={() => setShowStartConfirm(true)}
                  disabled={
                    loading ||
                    appointmentStatus === 'Completed' ||
                    appointmentStatus === 'Cancelled'
                  }
                  className={`px-4 py-2 rounded-md text-sm font-medium text-white transition ${
                    appointmentStatus === 'Completed' ||
                    appointmentStatus === 'Cancelled'
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-amber-500 hover:bg-amber-600 active:scale-95'
                  }`}
                >
                  Start Appointment
                </button>
              )}

              {/* Completed Button */}
              <button
                onClick={() => setShowCompletedConfirm(true)}
                disabled={
                  loading ||
                  appointmentStatus === 'Completed' ||
                  appointmentStatus === 'Cancelled'
                }
                className={`px-4 py-2 rounded-md text-sm font-medium text-white transition ${
                  appointmentStatus === 'Completed' ||
                  appointmentStatus === 'Cancelled'
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-green-500 hover:bg-green-600 active:scale-95'
                }`}
              >
                Completed
              </button>

              {/* Reschedule Button */}
              <button
                onClick={() => setShowReschedule(true)}
                disabled={
                  loading ||
                  appointmentStatus === 'Completed' ||
                  appointmentStatus === 'Cancelled'
                }
                className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                  appointmentStatus === 'Completed' ||
                  appointmentStatus === 'Cancelled'
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                    : 'border-2 border-gray-300 text-gray-700 hover:border-gray-400 hover:text-gray-900 active:scale-95'
                }`}
              >
                Reschedule
              </button>

              {/* Cancellation Button */}
              <button
                onClick={() => setShowCancelConfirm(true)}
                disabled={
                  loading ||
                  appointmentStatus === 'Completed' ||
                  appointmentStatus === 'Cancelled'
                }
                className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                  appointmentStatus === 'Completed' ||
                  appointmentStatus === 'Cancelled'
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                    : 'border-2 border-red-300 text-red-600 hover:border-red-400 hover:text-red-700 active:scale-95'
                }`}
              >
                Cancel Appointment
              </button>
            </div>
          )}
      </div>

      {/* Start Appointment Confirmation Modal */}
      {showStartConfirm && (
        <div className='fixed inset-0 flex items-center justify-center z-50 pointer-events-none'>
          <div className='bg-white rounded-lg shadow-2xl p-6 max-w-sm pointer-events-auto'>
            <div className='flex items-center justify-between mb-4'>
              <h3 className='text-lg font-bold text-gray-900'>
                Confirm Start Appointment
              </h3>
              <button
                onClick={() => setShowStartConfirm(false)}
                className='text-gray-500 hover:text-gray-700'
              >
                <MdClose size={24} />
              </button>
            </div>
            <p className='text-gray-700 mb-6'>
              Are you sure you want to start this appointment?
            </p>
            <div className='flex gap-3 justify-end'>
              <button
                onClick={() => setShowStartConfirm(false)}
                className='px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50'
              >
                Cancel
              </button>
              <button
                onClick={handleStartAppointment}
                disabled={loading}
                className='px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 disabled:bg-gray-400'
              >
                {loading ? 'Starting...' : 'Start'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {showReschedule && (
        <div className='fixed inset-0 flex items-center justify-center z-50 pointer-events-none'>
          <div className='bg-white rounded-lg shadow-2xl p-6 max-w-sm pointer-events-auto'>
            <div className='flex items-center justify-between mb-4'>
              <h3 className='text-lg font-bold text-gray-900'>
                Reschedule Appointment
              </h3>
              <button
                onClick={() => {
                  setShowReschedule(false);
                  setRescheduleDate('');
                  setRescheduleTime('');
                  setRescheduleReason('');
                  setError(null);
                }}
                className='text-gray-500 hover:text-gray-700'
              >
                <MdClose size={24} />
              </button>
            </div>
            {error && (
              <div className='mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg'>
                <p className='text-sm'>{error}</p>
              </div>
            )}
            <div className='space-y-4 mb-6'>
              <DatePickerInput
                label='New Date'
                value={rescheduleDate ? new Date(rescheduleDate) : null}
                onChange={(date) => {
                  if (date) {
                    const year = date.getFullYear();
                    const month = String(date.getMonth() + 1).padStart(2, '0');
                    const day = String(date.getDate()).padStart(2, '0');
                    setRescheduleDate(`${year}-${month}-${day}`);
                  }
                }}
              />
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  New Time
                </label>
                <input
                  type='time'
                  value={rescheduleTime}
                  onChange={(e) => setRescheduleTime(e.target.value)}
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                />
              </div>
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Reason for Reschedule
                </label>
                <textarea
                  value={rescheduleReason}
                  onChange={(e) => setRescheduleReason(e.target.value)}
                  placeholder='Enter reason for rescheduling'
                  className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                  rows={3}
                />
              </div>
            </div>
            <div className='flex gap-3 justify-end'>
              <button
                onClick={() => {
                  setShowReschedule(false);
                  setRescheduleDate('');
                  setRescheduleTime('');
                  setRescheduleReason('');
                  setError(null);
                }}
                className='px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50'
              >
                Cancel
              </button>
              <button
                onClick={handleRescheduleSubmit}
                disabled={loading}
                className='px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400'
              >
                {loading ? 'Rescheduling...' : 'Reschedule'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Appointment Confirmation Modal */}
      {showCancelConfirm && (
        <div className='fixed inset-0 flex items-center justify-center z-50 pointer-events-none'>
          <div className='bg-white rounded-lg shadow-2xl p-6 max-w-sm pointer-events-auto'>
            <div className='flex items-center justify-between mb-4'>
              <h3 className='text-lg font-bold text-gray-900'>
                Cancel Appointment
              </h3>
              <button
                onClick={() => setShowCancelConfirm(false)}
                className='text-gray-500 hover:text-gray-700'
              >
                <MdClose size={24} />
              </button>
            </div>
            <p className='text-gray-700 mb-6'>
              Are you sure you want to cancel this appointment? This action
              cannot be undone.
            </p>
            <div className='flex gap-3 justify-end'>
              <button
                onClick={() => setShowCancelConfirm(false)}
                className='px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50'
              >
                No, Keep It
              </button>
              <button
                onClick={handleCancellation}
                disabled={loading}
                className='px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400'
              >
                {loading ? 'Cancelling...' : 'Yes, Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Completed Appointment Confirmation Modal */}
      {showCompletedConfirm && (
        <div className='fixed inset-0 flex items-center justify-center z-50 pointer-events-none'>
          <div className='bg-white rounded-lg shadow-2xl p-6 max-w-sm pointer-events-auto'>
            <div className='flex items-center justify-between mb-4'>
              <h3 className='text-lg font-bold text-gray-900'>
                Mark as Completed
              </h3>
              <button
                onClick={() => setShowCompletedConfirm(false)}
                className='text-gray-500 hover:text-gray-700'
              >
                <MdClose size={24} />
              </button>
            </div>
            <p className='text-gray-700 mb-6'>
              Are you sure you want to mark this appointment as completed?
            </p>
            <div className='flex gap-3 justify-end'>
              <button
                onClick={() => setShowCompletedConfirm(false)}
                className='px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50'
              >
                Cancel
              </button>
              <button
                onClick={handleCompleted}
                disabled={loading}
                className='px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400'
              >
                {loading ? 'Marking...' : 'Yes, Mark as Completed'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Scheduled Appointment Modal */}
      {showConfirmScheduled && (
        <div className='fixed inset-0 flex items-center justify-center z-50 pointer-events-none'>
          <div className='bg-white rounded-lg shadow-2xl p-6 max-w-sm pointer-events-auto'>
            <div className='flex items-center justify-between mb-4'>
              <h3 className='text-lg font-bold text-gray-900'>
                Confirm Appointment
              </h3>
              <button
                onClick={() => setShowConfirmScheduled(false)}
                className='text-gray-500 hover:text-gray-700'
              >
                <MdClose size={24} />
              </button>
            </div>
            <p className='text-gray-700 mb-6'>
              Are you sure you want to confirm this appointment?
            </p>
            <div className='flex gap-3 justify-end'>
              <button
                onClick={() => setShowConfirmScheduled(false)}
                className='px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50'
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmScheduled}
                disabled={loading}
                className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400'
              >
                {loading ? 'Confirming...' : 'Yes, Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
