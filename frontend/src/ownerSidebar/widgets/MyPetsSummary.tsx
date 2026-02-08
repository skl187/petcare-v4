import { useNavigate } from "react-router-dom";
import { OwnerDashboardData } from "../../services/dashboardService";

interface Props {
  data: OwnerDashboardData | null;
}

export default function MyPetsSummary({ data }: Props) {
  const navigate = useNavigate();
  const pets = data?.pets?.list || [];

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">My Pets</h3>
        <button
          className="text-sm underline underline-offset-4 text-blue-600 dark:text-blue-400"
          onClick={() => navigate('/owner/pets')}
        >
          View all
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {pets.length > 0 ? (
          pets.slice(0, 4).map(p => (
            <div key={p.id} className="rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              <div className="font-medium text-gray-800 dark:text-white">{p.name}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {p.pet_type} {p.breed && `• ${p.breed}`}
              </div>
              <div className="text-sm mt-2 text-gray-600 dark:text-gray-300">
                {parseInt(p.total_appointments) > 0
                  ? `${p.total_appointments} visits`
                  : 'No visits yet'}
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-2 text-center py-8 text-gray-500 dark:text-gray-400">
            No pets registered yet
          </div>
        )}
      </div>
    </div>
  );
}
