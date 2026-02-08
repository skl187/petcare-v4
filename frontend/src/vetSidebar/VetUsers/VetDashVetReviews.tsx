import PageMeta from '../../components/common/PageMeta';
import ComponentCard from '../../components/common/ComponentCard';
import VetBookingReviewsTable from '../../components/vetTables/Users/VetBookingReviews/VetBookingReviewsTable';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';

const VetDashVetReviews = () => {
  return (
    <>
      <PageMeta
        title='My Reviews - BracePet'
        description='View and manage reviews from your clients'
      />
      <PageBreadcrumb pageTitle='My Reviews' />
      <div className='space-y-6'>
        <ComponentCard title='Client Reviews'>
          <VetBookingReviewsTable />
        </ComponentCard>
      </div>
    </>
  );
};

export default VetDashVetReviews;
