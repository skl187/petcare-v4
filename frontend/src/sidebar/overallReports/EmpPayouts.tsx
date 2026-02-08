import PageMeta from "../../components/common/PageMeta";
import ComponentCard from "../../components/common/ComponentCard";
import EmpPayoutsTable from "../../components/tables/overallReportTables/EmpPayoutsTable";
const EmpPayouts = () => {
  return (
    <>
    <PageMeta title="BracePet Employee Payouts Table" description="This is BracePet Employee Payouts Table" />
    <div className="space-y-6 p-4">
      <ComponentCard title="Employee Payouts Table">
        <EmpPayoutsTable />
      </ComponentCard>
    </div>
  </>
  )
}

export default EmpPayouts
