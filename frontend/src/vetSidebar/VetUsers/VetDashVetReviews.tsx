import PageMeta from "../../components/common/PageMeta";
import ComponentCard from "../../components/common/ComponentCard";
import VetBookingReviewsTable from "../../components/vetTables/Users/VetBookingReviews/VetBookingReviewsTable";
const VetDashVetReviews = () => {
  return (
    <>
    <PageMeta title="BracePet VetDashVetReviews" description="This is BracePet VetDashVetReviews" />
    <div className="space-y-6 p-4">
      <ComponentCard title="VetDashVetReviews">
      <VetBookingReviewsTable/>
      </ComponentCard>
    </div>
  </>
  )
}

export default VetDashVetReviews
