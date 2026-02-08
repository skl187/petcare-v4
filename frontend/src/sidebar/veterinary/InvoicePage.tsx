import Invoice from '../../components/tables/veterinaryTables/Invoice';
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";
const VetBookings = () => {
  return (
    <>
      <PageMeta title="BracePet Invoice" description="This is BracePet Invoice" />
      <div className="space-y-6 p-4">
        <ComponentCard title="Invoice">
          <Invoice />
        </ComponentCard>
      </div>
    </>
  );
};

export default VetBookings;
