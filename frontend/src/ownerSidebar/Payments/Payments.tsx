
import PageMeta from "../../components/common/PageMeta";
import ComponentCard from "../../components/common/ComponentCard";
import PaymentsTable from "../../components/ownerTables/PaymentsTable/PaymentsTable";
const Payments = () => {
  return (
    <>
    <PageMeta title="BracePet Payments" description="This is BracePet Payments" />
    <div className="space-y-6 p-4">
      <ComponentCard title="Payments">
      <PaymentsTable />
      </ComponentCard>
    </div>
  </>
  )
}

export default Payments
