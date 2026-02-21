import PageMeta from "../../components/common/PageMeta";
import ComponentCard from "../../components/common/ComponentCard";
import AdminReviewsTable from "../../components/tables/reviews/AdminReviewsTable";
// import PageBreadcrumb from "../../components/common/PageBreadCrumb";

const BookingReviews = () => {
  return (
    <>
      <PageMeta 
        title="Booking Reviews - BracePet Admin" 
        description="View and manage all appointment-related reviews" 
      />
      {/* <PageBreadcrumb pageTitle="Booking Reviews" /> */}
      <div className="space-y-6 p-4">
        <ComponentCard title="All Appointment Reviews">
          <AdminReviewsTable />
        </ComponentCard>
      </div>
    </>
  );
};

export default BookingReviews;
