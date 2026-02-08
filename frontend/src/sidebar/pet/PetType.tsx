import PageMeta from "../../components/common/PageMeta";
import ComponentCard from "../../components/common/ComponentCard";
import PetTypeTable from "../../components/tables/PetsTables/PetTypeTable";
const PetType = () => {
  return (
    <>
    <PageMeta title="BracePet  PetType" description="This is BracePet  PetType" />
    <div className="space-y-6 p-4">
      <ComponentCard title=" PetType">
      <PetTypeTable />
      </ComponentCard>
    </div>
  </>
  )
}

export default PetType
