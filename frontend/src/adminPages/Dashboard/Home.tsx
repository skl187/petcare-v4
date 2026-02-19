import { useEffect, useState } from 'react';
import EcommerceMetrics from "../../components/ecommerce/EcommerceMetrics";
import MonthlySalesChart from "../../components/ecommerce/MonthlySalesChart";
import StatisticsChart from "../../components/ecommerce/StatisticsChart";
import MonthlyTarget from "../../components/ecommerce/MonthlyTarget";
import DemographicCard from "../../components/ecommerce/DemographicCard";
import PageMeta from "../../components/common/PageMeta";
import RecentPetBookings from "../../components/ecommerce/RecentPetBookings";
import { fetchAdminDashboard, AdminDashboardData } from '../../services/dashboardService';

export default function Home() {
  const [dashboardData, setDashboardData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        const data = await fetchAdminDashboard();
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
        title="Brace Pet - Admin Dashboard"
        description="Admin Dashboard Overview"
      />
      <div className="grid grid-cols-12 gap-4 md:gap-6">

        <div className="col-span-12 space-y-6 xl:col-span-5">
          <EcommerceMetrics data={dashboardData} />
          <MonthlySalesChart data={dashboardData} />
        </div>
        <div className="col-span-12 xl:col-span-7">
          <RecentPetBookings data={dashboardData} />
        </div>

        <div className="col-span-12">
          <StatisticsChart data={dashboardData} />
        </div>

        <div className="col-span-12 xl:col-span-5">
          <DemographicCard data={dashboardData} />
        </div>

        <div className="col-span-12 xl:col-span-7">
          <MonthlyTarget data={dashboardData} />
        </div>
      </div>
    </>
  );
}
