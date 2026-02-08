import { useEffect, useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import OwnerKPIs from "../widgets/OwnerKPIs";
import UpcomingBookings from "../widgets/UpcomingBookings";
import MyPetsSummary from "../widgets/MyPetsSummary";
import VaccinationReminders from "../widgets/VaccinationReminders";
import PaymentsSummary from "../widgets/PaymentsSummary";
import MessagesPreview from "../widgets/MessagesPreview";
import PendingReviewsWidget from "../widgets/PendingReviewsWidget";
import { fetchOwnerDashboard, OwnerDashboardData } from "../../services/dashboardService";

export default function OwnerDashboard() {
  const [dashboardData, setDashboardData] = useState<OwnerDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        const data = await fetchOwnerDashboard();
        setDashboardData(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard');
        console.error('Dashboard load error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <PageMeta title="Pet Owner Dashboard" description="Overview of your pets, bookings, and payments" />
      <div className="grid grid-cols-12 gap-4 md:gap-6 p-4">
        {/* Left column: KPIs + pets + payments */}
        <div className="col-span-12 xl:col-span-5 space-y-6">
          <OwnerKPIs data={dashboardData} />
          <MyPetsSummary data={dashboardData} />
          <PaymentsSummary data={dashboardData} />
        </div>

        {/* Right column: upcoming bookings + messages + pending reviews */}
        <div className="col-span-12 xl:col-span-7 space-y-6">
          <PendingReviewsWidget />
          <UpcomingBookings data={dashboardData} />
          <MessagesPreview />
        </div>

        {/* Full width: vaccination reminders */}
        <div className="col-span-12">
          <VaccinationReminders data={dashboardData} />
        </div>
      </div>
    </>
  );
}
