import { useEffect, useState } from "react";
import PageMeta from "../../components/common/PageMeta";
import VetKPIs from "../widgets/VetKPIs";
import TodayQueue from "../widgets/TodayQueue";
import UpcomingAppointments from "../widgets/UpcomingAppointments";
import ReviewsWidget from "../widgets/ReviewsWidget";
import MonthlyTargets from "../widgets/MonthlyTargets";
import { fetchVetDashboard, VetDashboardData } from "../../services/dashboardService";

const VetDashboard = () => {
  const [dashboardData, setDashboardData] = useState<VetDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        const data = await fetchVetDashboard();
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
      <PageMeta
        title="BracePet Vet Dashboard"
        description="Overview for veterinary role"
      />
      <div className="grid grid-cols-12 gap-4 md:gap-6 p-4">

        {/* Left column */}
        <div className="col-span-12 xl:col-span-5 space-y-9">
          <VetKPIs data={dashboardData} />
          <UpcomingAppointments data={dashboardData} />
        </div>

        {/* Right column */}
        <div className="col-span-12 xl:col-span-7 space-y-6">
          <TodayQueue data={dashboardData} />
          <MonthlyTargets data={dashboardData} />
        </div>

        {/* Reviews */}
        <div className="col-span-12">
          <ReviewsWidget data={dashboardData} />
        </div>
      </div>
    </>
  );
};

export default VetDashboard;
