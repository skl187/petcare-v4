import PageMeta from "../../components/common/PageMeta";
import ComponentCard from "../../components/common/ComponentCard";
import NotificationListTable from "../../components/tables/AdminTables/NotificationListTable";

const ListNotification = () => {
  return (
    <>
      <PageMeta title="Notifications List | Dashboard" description="View and manage pending notifications" />
      <div className="space-y-6 p-4">
        <ComponentCard title="Notifications">
          <NotificationListTable />
        </ComponentCard>
      </div>
    </>
  )
}

export default ListNotification;