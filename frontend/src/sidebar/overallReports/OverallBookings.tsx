import PageMeta from "../../components/common/PageMeta";
import ComponentCard from "../../components/common/ComponentCard";
import OverallBookingsTable from "../../components/tables/overallReportTables/OverallBookingsTable";
const OverallBookings = () => {
  return (
    <>
    <PageMeta title="BracePet Overall Bookings Table" description="This is BracePet Invoice" />
    <div className="space-y-6 p-4">
      <ComponentCard title="Overall Bookings Table">
        <OverallBookingsTable />
      </ComponentCard>
    </div>
  </>
  )
}

export default OverallBookings
