import PageMeta from "../../components/common/PageMeta";
import ComponentCard from "../../components/common/ComponentCard";
import PetBreedTable from "../../components/tables/AdminTables/PetBreedTable";
const PetBreed = () => {
  return (
    <>
    <PageMeta title="BracePet  PetBreed" description="This is BracePet  PetBreed" />
    <div className="space-y-6 p-4">
      <ComponentCard title="Pet Breed">
      <PetBreedTable />
      </ComponentCard>
    </div>
  </>
  )
}
export default PetBreed
