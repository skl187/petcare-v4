import PageMeta from "../../components/common/PageMeta";
import ComponentCard from "../../components/common/ComponentCard";
import SystemServicesTable from "../../components/tables/systemServices/SystemServiesTable";
const SystemServices = () => {
  return (
    <>
    <PageMeta title="BracePet  System Services Table" description="This is BracePet  System Services Table" />
    <div className="space-y-6 p-4">
      <ComponentCard title=" System Services Table">
      <SystemServicesTable />
      </ComponentCard>
    </div>
  </>
  )
}

export default SystemServices
