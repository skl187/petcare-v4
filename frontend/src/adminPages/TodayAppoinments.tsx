import VetBookingsTable from '../components/tables/veterinaryTables/VetBookingsTable';
import ComponentCard from "../components/common/ComponentCard";
import PageMeta from "../components/common/PageMeta";

const TodayAppointments = () => {
  return (
    <>
      <PageMeta 
        title="BracePet Vet Bookings Table" 
        description="This is BracePet Vet Bookings Table" 
      />

      <div className="space-y-6 p-4">
        <ComponentCard title="Today's Appointments">
          <VetBookingsTable />
        </ComponentCard>
      </div>
    </>
  );
};

export default TodayAppointments;
