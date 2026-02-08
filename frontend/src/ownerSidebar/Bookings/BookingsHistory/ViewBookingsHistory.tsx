import PageMeta from "../../../components/common/PageMeta";
import ComponentCard from "../../../components/common/ComponentCard";
import BookingHistoryTable from "../../../components/ownerTables/Bookings/BookingsHistoryTable/BookingHistoryTable";
const ViewBookingsHistory = () => {
  return (
    <>
    <PageMeta title="BracePet ViewBookingsHistory" description="This is BracePet ViewBookingsHistory" />
    <div className="space-y-6 p-4">
      <ComponentCard title="ViewBookingsHistory">
      <BookingHistoryTable/>
      </ComponentCard>
    </div>
  </>
  )
}

export default ViewBookingsHistory
