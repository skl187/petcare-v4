import PageMeta from "../../components/common/PageMeta";
import ComponentCard from "../../components/common/ComponentCard";
import EmployeeTable from "../../components/tables/userTables/EmployeeTable";
const Employees = () => {
  return (
    <>
    <PageMeta title="BracePet Employee Table" description="This is BracePet Employee Table" />
    <div className="space-y-6 p-4">
      <ComponentCard title="Employee Table">
        <EmployeeTable />
      </ComponentCard>
    </div>
  </>
  )
}

export default Employees
