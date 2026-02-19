import PageMeta from "../../components/common/PageMeta";
import ComponentCard from "../../components/common/ComponentCard";
import OwnerAndPetsTable from "../../components/tables/userTables/OwnerAndPetsTable";
const OwnerAndPets = () => {
  return (
    <>
    <PageMeta title="BracePet Owner And Pets Table" description="This is BracePet Owner And Pets Table" />
    <div className="space-y-6 p-4">
      <ComponentCard title="Owner And Pets Table">
        <OwnerAndPetsTable />
      </ComponentCard>
    </div>
  </>
  )
}

export default OwnerAndPets;
