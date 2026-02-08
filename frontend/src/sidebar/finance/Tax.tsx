import PageMeta from "../../components/common/PageMeta";
import ComponentCard from "../../components/common/ComponentCard";
import TaxTable from "../../components/tables/financeTables/TaxTable";
const Tax = () => {
  return (
    <>
    <PageMeta title="BracePet Tax Table" description="This is BracePet Tax Table" />
    <div className="space-y-6 p-4">
      <ComponentCard title="Tax Table">
        <TaxTable />
      </ComponentCard>
    </div>
  </>
  )
}

export default Tax
