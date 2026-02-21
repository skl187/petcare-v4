import TodaysAppointmentsTable from '../components/tables/AdminTables/TodaysAppointmensTable';
import ComponentCard from "../components/common/ComponentCard";
import PageMeta from "../components/common/PageMeta";

const TodaysAppointments = () => {
  return (
    <>
      <PageMeta 
        title="BracePet Vet Bookings Table" 
        description="This is BracePet Vet Bookings Table" 
      />

      <div className="space-y-6 p-4">
        <ComponentCard title="Today's Appointments">
          <TodaysAppointmentsTable />
        </ComponentCard>
      </div>
    </>
  );
};

export default TodaysAppointments;
