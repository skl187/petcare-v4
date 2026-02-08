import PageMeta from "../../components/common/PageMeta"
import ComponentCard from "../../components/common/ComponentCard"
import CategoryListTable from "../../components/tables/veterinaryTables/CategoryListTable"
const CategoryList = () => {
  return (
    <>
    <PageMeta title="BracePet Category List Table" description="This is BracePet Category List Table" />
    <div className="space-y-6 p-4">
      <ComponentCard title="Category List Table">
        <CategoryListTable />
      </ComponentCard>
    </div>
  </>
  )
}

export default CategoryList
