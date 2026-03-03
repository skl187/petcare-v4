import PageMeta from "../../components/common/PageMeta";
import ComponentCard from "../../components/common/ComponentCard";
import VetOwnerAndPetsTable from "../../components/vetTables/Users/VetOwnerAndPetsTable";
const VetDashOwenerAndPets = () => {
  return (
    <>
    <PageMeta title="BracePet VetDashOwenerAndPets" description="This is BracePet VetDashOwenerAndPets" />
    <div className="space-y-6 p-4">
      <ComponentCard title="VetDashOwenerAndPets">
        <VetOwnerAndPetsTable />
      </ComponentCard>
    </div>
  </>
  )
}

export default VetDashOwenerAndPets
