
import PageMeta from "../../components/common/PageMeta";
import ComponentCard from "../../components/common/ComponentCard";
import MyPetsTable from "../../components/ownerTables/MyPetsTable/MyPetsTable";
const MyPets = () => {
  return (
    <>
    <PageMeta title="BracePet  MyPets" description="This is BracePet  MyPets" />
    <div className="space-y-6 p-4">
      <ComponentCard title=" MyPets">
     <MyPetsTable />
      </ComponentCard>
    </div>
  </>
  )
}

export default MyPets
