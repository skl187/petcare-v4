import PageMeta from "../../components/common/PageMeta";
import ComponentCard from "../../components/common/ComponentCard";
import EmpReqListTable from "../../components/tables/userTables/EmpReqListTable";
const EmpRequestList = () => {
  return (
    <>
    <PageMeta title="BracePet Employee Request List Table" description="This is BracePet Employee Request List Table" />
    <div className="space-y-6 p-4">
      <ComponentCard title="Employee Request List Table">
        <EmpReqListTable />
      </ComponentCard>
    </div>
  </>
  )
}

export default EmpRequestList
