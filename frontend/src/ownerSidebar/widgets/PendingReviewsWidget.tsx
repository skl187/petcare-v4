import { useState, useEffect } from "react";
import { getPendingReviewAppointments, PendingReviewAppointment } from "../../services/reviewsService";
import ReviewModal from "../../components/reviews/ReviewModal";

export default function PendingReviewsWidget() {
  const [appointments, setAppointments] = useState<PendingReviewAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState<PendingReviewAppointment | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadPendingReviews = async () => {
    try {
      setLoading(true);
      const data = await getPendingReviewAppointments();
      setAppointments(data.appointments);
    } catch (err) {
      console.error("Failed to load pending reviews:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPendingReviews();
  }, []);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleReviewClick = (appointment: PendingReviewAppointment) => {
    setSelectedAppointment(appointment);
    setIsModalOpen(true);
  };

  const handleReviewSubmitted = () => {
    loadPendingReviews();
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 p-5">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">Pending Reviews</h3>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (appointments.length === 0) {
    return null; // Don't show widget if no pending reviews
  }

  return (
    <>
      <div className="rounded-2xl border border-amber-200 dark:border-amber-700/50 bg-amber-50 dark:bg-amber-900/20 p-5">
        <div className="flex items-center gap-2 mb-3">
          <svg className="w-5 h-5 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Pending Reviews</h3>
          <span className="ml-auto bg-amber-500 text-white text-xs font-medium px-2 py-0.5 rounded-full">
            {appointments.length}
          </span>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Share your experience from recent appointments
        </p>

        <div className="space-y-3">
          {appointments.slice(0, 3).map((appt) => (
            <div
              key={appt.id}
              className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700"
            >
              <div>
                <p className="font-medium text-gray-800 dark:text-white text-sm">
                  {appt.pet_name} - {appt.appointment_type}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Dr. {appt.vet_first_name} {appt.vet_last_name} • {formatDate(appt.appointment_date)}
                </p>
              </div>
              <button
                onClick={() => handleReviewClick(appt)}
                className="px-3 py-1.5 text-sm font-medium text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30 rounded-lg hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-colors"
              >
                Review
              </button>
            </div>
          ))}
        </div>

        {appointments.length > 3 && (
          <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-3">
            +{appointments.length - 3} more appointments waiting for review
          </p>
        )}
      </div>

      {selectedAppointment && (
        <ReviewModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedAppointment(null);
          }}
          appointmentId={selectedAppointment.id}
          appointmentDetails={{
            petName: selectedAppointment.pet_name,
            vetName: `Dr. ${selectedAppointment.vet_first_name} ${selectedAppointment.vet_last_name}`,
            clinicName: selectedAppointment.clinic_name,
            appointmentDate: formatDate(selectedAppointment.appointment_date),
            appointmentType: selectedAppointment.appointment_type,
          }}
          onReviewSubmitted={handleReviewSubmitted}
        />
      )}
    </>
  );
}
