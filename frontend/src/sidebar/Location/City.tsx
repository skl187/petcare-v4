import PageMeta from "../../components/common/PageMeta";
import ComponentCard from "../../components/common/ComponentCard";
import CityLocationTable from "../../components/tables/LocationTables/CityLocationTable";
const City = () => {
  return (
    <>
    <PageMeta title="BracePet Cities" description="This is BracePet Cities" />
    <div className="space-y-6 p-4">
      <ComponentCard title="Cities">
      <CityLocationTable />
      </ComponentCard>
    </div>
  </>
  )
}

export default City
