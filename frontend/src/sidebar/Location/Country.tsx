import PageMeta from "../../components/common/PageMeta";
import ComponentCard from "../../components/common/ComponentCard";
import CountryLocationTable from "../../components/tables/LocationTables/CountryLocationTable";
const Country = () => {
  return (
    <>
    <PageMeta title="BracePet Country" description="This is BracePet Country" />
    <div className="space-y-6 p-4">
      <ComponentCard title="Country">
      <CountryLocationTable />
      </ComponentCard>
    </div>
  </>
  )
}

export default Country
