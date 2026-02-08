import { useState } from "react";
import StarRating from "./StarRating";
import { createReview, CreateReviewData } from "../../services/reviewsService";

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointmentId: string;
  appointmentDetails: {
    petName: string;
    vetName: string;
    clinicName: string;
    appointmentDate: string;
    appointmentType: string;
  };
  onReviewSubmitted?: () => void;
}

export default function ReviewModal({
  isOpen,
  onClose,
  appointmentId,
  appointmentDetails,
  onReviewSubmitted,
}: ReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [professionalismRating, setProfessionalismRating] = useState(0);
  const [knowledgeRating, setKnowledgeRating] = useState(0);
  const [communicationRating, setCommunicationRating] = useState(0);
  const [facilityRating, setFacilityRating] = useState(0);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDetailedRatings, setShowDetailedRatings] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      setError("Please select an overall rating");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const reviewData: CreateReviewData = {
        appointment_id: appointmentId,
        rating,
        review_text: reviewText || undefined,
        is_anonymous: isAnonymous,
      };

      // Add detailed ratings if provided
      if (professionalismRating > 0) reviewData.professionalism_rating = professionalismRating;
      if (knowledgeRating > 0) reviewData.knowledge_rating = knowledgeRating;
      if (communicationRating > 0) reviewData.communication_rating = communicationRating;
      if (facilityRating > 0) reviewData.facility_rating = facilityRating;

      await createReview(reviewData);

      onReviewSubmitted?.();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit review");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setRating(0);
    setReviewText("");
    setProfessionalismRating(0);
    setKnowledgeRating(0);
    setCommunicationRating(0);
    setFacilityRating(0);
    setIsAnonymous(false);
    setError(null);
    setShowDetailedRatings(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-lg mx-4 bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
              Leave a Review
            </h2>
            <button
              onClick={handleClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Appointment Info */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900/50">
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-gray-800 dark:text-white">
                {appointmentDetails.petName} - {appointmentDetails.appointmentType}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {appointmentDetails.vetName} at {appointmentDetails.clinicName}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                {appointmentDetails.appointmentDate}
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-5">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-lg">
              {error}
            </div>
          )}

          {/* Overall Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Overall Rating <span className="text-red-500">*</span>
            </label>
            <StarRating rating={rating} onRatingChange={setRating} size="lg" showLabel />
          </div>

          {/* Review Text */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Your Review (optional)
            </label>
            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Share your experience with this appointment..."
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
            />
          </div>

          {/* Detailed Ratings Toggle */}
          <button
            type="button"
            onClick={() => setShowDetailedRatings(!showDetailedRatings)}
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
          >
            {showDetailedRatings ? "Hide" : "Add"} detailed ratings
            <svg
              className={`w-4 h-4 transition-transform ${showDetailedRatings ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Detailed Ratings */}
          {showDetailedRatings && (
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
              <div>
                <StarRating
                  rating={professionalismRating}
                  onRatingChange={setProfessionalismRating}
                  size="sm"
                  showLabel
                  label="Professionalism"
                />
              </div>
              <div>
                <StarRating
                  rating={knowledgeRating}
                  onRatingChange={setKnowledgeRating}
                  size="sm"
                  showLabel
                  label="Knowledge"
                />
              </div>
              <div>
                <StarRating
                  rating={communicationRating}
                  onRatingChange={setCommunicationRating}
                  size="sm"
                  showLabel
                  label="Communication"
                />
              </div>
              <div>
                <StarRating
                  rating={facilityRating}
                  onRatingChange={setFacilityRating}
                  size="sm"
                  showLabel
                  label="Facility"
                />
              </div>
            </div>
          )}

          {/* Anonymous Option */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Submit anonymously (your name won't be shown publicly)
            </span>
          </label>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2.5 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || rating === 0}
              className="flex-1 px-4 py-2.5 text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? "Submitting..." : "Submit Review"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
