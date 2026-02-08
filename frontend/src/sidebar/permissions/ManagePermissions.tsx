import PageMeta from "../../components/common/PageMeta";
import PageBreadCrumb from "../../components/common/PageBreadCrumb";
import PermissionsTable from "../../components/tables/permissionTables/PermissionsTable";

export default function ManagePermissions() {
  return (
    <>
      <PageMeta
        title="Manage Permissions | PetCare Admin"
        description="Manage system permissions"
      />
      <PageBreadCrumb pageTitle="Manage Permissions" />
      <div className="space-y-6">
        <PermissionsTable />
      </div>
    </>
  );
}
