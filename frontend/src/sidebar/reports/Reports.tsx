import PageMeta from "../../components/common/PageMeta";
import ComponentCard from "../../components/common/ComponentCard";
import MonthlySalesChart from "../../components/ecommerce/MonthlySalesChart";
const Reports = () => {
  return (
    <>
    <PageMeta title="BracePet Reports" description="This is BracePet Reports" />
    <div className="space-y-6 p-4">
      <ComponentCard title="Reports">
        <MonthlySalesChart />
      </ComponentCard>
    </div>
  </>
  )
}

export default Reports
