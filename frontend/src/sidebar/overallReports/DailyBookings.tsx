import PageMeta from "../../components/common/PageMeta";
import ComponentCard from "../../components/common/ComponentCard";
import DailyBookingsTable from "../../components/tables/overallReportTables/DailyBookingsTable";
const DailyBookings = () => {
  return (
    <>
    <PageMeta title="BracePet Daily Bookings Table" description="This is BracePet Daily Bookings Table" />
    <div className="space-y-6 p-4">
      <ComponentCard title="Daily Bookings Table">
        <DailyBookingsTable />
      </ComponentCard>
    </div>
  </>
  )
}

export default DailyBookings
