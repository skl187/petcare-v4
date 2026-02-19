import PageMeta from "../../components/common/PageMeta";
import ComponentCard from "../../components/common/ComponentCard";
import BookingReviewsTable from "../../components/tables/userTables/BookingReviewsTable";
const BookingReviews = () => {
  return (
    <>
    <PageMeta title="BracePet Booking Reviews Table" description="This is BracePet Booking Reviews Table" />
    <div className="space-y-6 p-4">
      <ComponentCard title="Booking Reviews Table">
        <BookingReviewsTable />
      </ComponentCard>
    </div>
  </>
  )
}

export default BookingReviews
