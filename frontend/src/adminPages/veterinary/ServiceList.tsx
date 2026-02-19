import PageMeta from "../../components/common/PageMeta";
import ComponentCard from "../../components/common/ComponentCard";
import ServiceListTable from "../../components/tables/veterinaryTables/ServiceListTable";

const ServiceList = () => {
  return (
    <>
      <PageMeta title="BracePet ServiceListTable" description="This is BracePet ServiceListTable" />
      <div className="space-y-6 p-4">
        <ComponentCard title="ServiceListTable">
          <ServiceListTable />
        </ComponentCard>
      </div>
    </>
  )
}

export default ServiceList
