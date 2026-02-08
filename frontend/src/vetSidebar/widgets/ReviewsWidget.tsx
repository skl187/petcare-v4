import { VetDashboardData } from "../../services/dashboardService";

interface Props {
  data: VetDashboardData | null;
}

export default function ReviewsWidget({ data }: Props) {
  const reviews = data?.reviews?.recent || [];
  const avgRating = data?.reviews?.avg_rating;
  const totalReviews = data?.reviews?.total_reviews;
  const positiveReviews = data?.reviews?.positive_reviews;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const emptyStars = 5 - fullStars;
    return "★".repeat(fullStars) + "☆".repeat(emptyStars);
  };

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Recent Reviews</h3>
          {avgRating && totalReviews && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {parseFloat(avgRating).toFixed(1)} average from {totalReviews} reviews
            </p>
          )}
        </div>
        {avgRating && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
            <span className="text-2xl font-bold text-amber-500">
              {parseFloat(avgRating).toFixed(1)}
            </span>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              <div className="text-amber-500">★★★★★</div>
              <div>{positiveReviews} positive</div>
            </div>
          </div>
        )}
      </div>

      {reviews.length > 0 ? (
        <div className="grid md:grid-cols-3 gap-3">
          {reviews.map((review) => (
            <div key={review.id} className="rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium text-gray-800 dark:text-white">
                  {review.is_anonymous
                    ? "Anonymous"
                    : `${review.owner_first_name || ''} ${review.owner_last_name || ''}`.trim() || "Anonymous"
                  }
                </div>
                <div className="text-xs text-amber-500">
                  {renderStars(parseFloat(review.rating))}
                </div>
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                {review.pet_name} • {review.appointment_type} • {formatDate(review.created_at)}
              </div>
              {review.review_text && (
                <div className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3">
                  "{review.review_text}"
                </div>
              )}
              {!review.review_text && (
                <div className="text-sm text-gray-400 dark:text-gray-500 italic">
                  No written review
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          No reviews yet
        </div>
      )}
    </div>
  );
}
