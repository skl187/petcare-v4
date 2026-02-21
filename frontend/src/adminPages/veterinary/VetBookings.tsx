import VetBookingsTable from '../../components/tables/veterinaryTables/VetBookingsTable';
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";

const VetBookings = () => {
  return (
    <>
      <PageMeta title="BracePet Vet Bookings Table" description="This is BracePet Vet Bookings Table" />
      <div className="space-y-6 p-4">
        <ComponentCard title="All Appointments">
          <VetBookingsTable />
        </ComponentCard>
      </div>
    </>
  );
};

export default VetBookings;
