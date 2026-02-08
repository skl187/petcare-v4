import PageMeta from "../../components/common/PageMeta";
import ComponentCard from "../../components/common/ComponentCard";
import AppPageTable from "../../components/tables/PageTable/AppPageTable";
const AppPage = () => {
  return (
    <>
    <PageMeta title="BracePet  AppPage" description="This is BracePet  AppPage" />
    <div className="space-y-6 p-4">
      <ComponentCard title=" AppPage">
      <AppPageTable />
      </ComponentCard>
    </div>
  </>
  )
}


export default AppPage
