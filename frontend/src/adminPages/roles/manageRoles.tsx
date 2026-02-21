import PageMeta from "../../components/common/PageMeta";
import PageBreadCrumb from "../../components/common/PageBreadCrumb";
import RolesTable from "../../components/tables/AdminTables/RolesTable";

export default function ManageRoles() {
  return (
    <>
      <PageMeta
        title="Manage Roles | PetCare Admin"
        description="Manage roles and permissions"
      />
      <PageBreadCrumb pageTitle="Manage Roles" />
      <div className="space-y-6">
        <RolesTable />
      </div>
    </>
  );
}
