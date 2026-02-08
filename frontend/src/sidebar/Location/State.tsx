import PageMeta from "../../components/common/PageMeta";
import ComponentCard from "../../components/common/ComponentCard";
import StateLocationTable from "../../components/tables/LocationTables/StateLocationTable";
const State = () => {
  return (
    <>
    <PageMeta title="BracePet State" description="This is BracePet State" />
    <div className="space-y-6 p-4">
      <ComponentCard title="State">
      <StateLocationTable />
      </ComponentCard>
    </div>
  </>
  )
}

export default State;
