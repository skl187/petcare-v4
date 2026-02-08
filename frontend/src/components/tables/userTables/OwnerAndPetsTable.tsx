import { MdEdit, MdDelete, MdLock, MdNotifications, MdAdd, MdPets } from "react-icons/md";
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../ui/table";
import Badge from "../../ui/badge/Badge";
import Checkbox from "../../form/input/Checkbox";
import OwnerAndPetsForm from "../../../pages/Forms/UserForms/OwnerAndPetsForm";
import { OwnerAndPetsFormData } from "../../../pages/Forms/UserForms/OwnerAndPetsForm";
import Pagination from "../tableComponents/Pagination";
import ChangePasswordForm from "../../../pages/Forms/VetForms/vetformComponents/ChangePasswordForm";
import { ChangePasswordFormData } from "../../../pages/Forms/VetForms/vetformComponents/ChangePasswordForm";
import { PushNotificationFormData } from "../../../pages/Forms/VetForms/vetformComponents/PushNotificationForm";
import PushNotificationForm from "../../../pages/Forms/VetForms/vetformComponents/PushNotificationForm";
import useSort from "../../../hooks/useSort";
import SortableTableHeader from "../tableComponents/SortableTableHeader";
import ImageHoverPreview from "../tableComponents/ImageHoverPreview";
import { TableToolbar } from "../tableComponents/TableToolbar";
import Switch from "../../form/switch/Switch";
import { IoIosCloseCircle, IoIosCheckmarkCircle } from "react-icons/io";
import DeleteDialog from "../tableComponents/DeleteDailog";

export interface OwnerAndPet {
  id: number;
  name: string;
  email: string;
  image: string;
  contactNumber: string;
  petCount: number;
  updatedAt: string;
  gender: "Male" | "Female" | "Other";
  status: "Active" | "Inactive";
}

// Mock data for owners and pets
const mockOwners: OwnerAndPet[] = Array.from({ length: 50 }, (_, i) => ({
  id: i + 1,
  name: `Owner ${i + 1}`,
  email: `owner${i + 1}@example.com`,
  image: `/images/owners/owner-${(i % 5) + 1}.jpg`,
  contactNumber: `+1${Math.floor(1000000000 + Math.random() * 9000000000)}`,
  petCount: Math.floor(Math.random() * 5) + 1,
  updatedAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 86400000).toISOString(),
  gender: ["Male", "Female", "Other"][i % 3] as "Male" | "Female" | "Other",
  status: i % 3 !== 0 ? "Active" : "Inactive",
}));

export default function OwnerAndPetsTable() {
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [isPushNotificationDialogOpen, setIsPushNotificationDialogOpen] = useState(false);
  const [isChangePasswordDialogOpen, setIsChangePasswordDialogOpen] = useState(false);
  const [actionDropdown, setActionDropdown] = useState<string>("No actions");
  const [statusUpdate, setStatusUpdate] = useState<string>("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editOwner, setEditOwner] = useState<OwnerAndPet | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [owners, setOwners] = useState<OwnerAndPet[]>(mockOwners);
  const [ownerToDelete, setOwnerToDelete] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const columns = [
    {
      key: "id",
      label: "ID",
      className: "min-w-[80px] text-gray-700 font-semibold max-w-[105px]",
    },
    {
      key: "name",
      label: "Name",
      className: "min-w-[200px] text-gray-700 font-semibold max-w-[250px]",
    },
    {
      key: "contactNumber",
      label: "Contact Number",
      className: "min-w-[120px] text-gray-700 max-w-[180px]",
    },
    {
      key: "petCount",
      label: "Pet Count",
      className: "min-w-[100px] text-gray-700 max-w-[150px]",
    },
    {
      key: "updatedAt",
      label: "Updated At",
      className: "min-w-[150px] text-gray-700 max-w-[200px]",
    },
    {
      key: "gender",
      label: "Gender",
      className: "min-w-[100px] text-gray-700 max-w-[150px]",
    },
    {
      key: "status",
      label: "Status",
      className: "min-w-[100px] max-w-[150px] text-gray-700 font-semibold",
    },
  ] as const;

  // Filtered data based on search and filters
  const filteredData = owners
    .filter((owner) =>
      owner.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      owner.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      owner.contactNumber.includes(searchQuery)
    )
    .filter((owner) =>
      statusFilter ? owner.status === statusFilter : true
    );

  const { sortedData, requestSort, sortConfig } = useSort(filteredData, {
    key: "id",
    direction: "asc",
  });

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedData.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  const toggleSelectRow = (id: number) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    setSelectedRows(
      selectedRows.length === owners.length
        ? []
        : owners.map((row) => row.id)
    );
  };

  const handleApplyAction = () => {
    if (actionDropdown === "Delete") {
      handleDelete();
    } else if (actionDropdown === "Status" && statusUpdate) {
      const updatedOwners = owners.map((owner) =>
        selectedRows.includes(owner.id)
          ? { ...owner, status: statusUpdate as "Active" | "Inactive" }
          : owner
      );
      setOwners(updatedOwners);
      setSelectedRows([]);
    }
  };

  const handleDelete = (id?: number) => {
    if (id) {
      setOwnerToDelete(id);
    } else {
      setOwnerToDelete(null);
    }
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    let updatedOwners: OwnerAndPet[];

    if (ownerToDelete) {
      updatedOwners = owners.filter(
        (owner) => owner.id !== ownerToDelete
      );
    } else {
      updatedOwners = owners.filter(
        (owner) => !selectedRows.includes(owner.id)
      );
    }

    setOwners(updatedOwners);
    setIsDeleteDialogOpen(false);
    setSelectedRows([]);
    setOwnerToDelete(null);
  };

  const handleEdit = (owner: OwnerAndPet) => {
    setEditOwner(owner);
  };

  const handleAddNew = () => {
    setIsAddDialogOpen(true);
  };

  const updatePetCount = (id: number, increment: boolean) => {
    setOwners(prev =>
      prev.map(owner =>
        owner.id === id
          ? {
              ...owner,
              petCount: increment ? owner.petCount + 1 : Math.max(0, owner.petCount - 1)
            }
          : owner
      )
    );
  };

  const toggleStatus = (id: number) => {
    setOwners((prev) =>
      prev.map((owner) =>
        owner.id === id
          ? {
              ...owner,
              status: owner.status === "Active" ? "Inactive" : "Active",
            }
          : owner
      )
    );
  };

  const handlePushNotification = () => {
    setIsPushNotificationDialogOpen(true);
  };

  const handleChangePassword = () => {
    setIsChangePasswordDialogOpen(true);
  };

  const handlePushNotificationSubmit = (data: PushNotificationFormData) => {
    console.log("Push Notification Sent:", data);
    setIsPushNotificationDialogOpen(false);
  };

  const handleChangePasswordSubmit = (data: ChangePasswordFormData) => {
    console.log("Password Changed:", data);
    setIsChangePasswordDialogOpen(false);
  };

  const confirmAddNew = (data: OwnerAndPetsFormData) => {
    const newOwner: OwnerAndPet = {
      id: owners.length + 1,
      name: data.name,
      email: data.email,
      image:
        data.image instanceof File
          ? URL.createObjectURL(data.image)
          : `/images/owners/owner-${(owners.length % 5) + 1}.jpg`,
      contactNumber: data.contactNumber,
      petCount: data.petCount,
      updatedAt: new Date().toISOString(),
      gender: data.gender,
      status: data.status,
    };
    setOwners([...owners, newOwner]);
    setIsAddDialogOpen(false);
  };

  const confirmEdit = (data: OwnerAndPetsFormData) => {
    const updatedOwners = owners.map((owner) =>
      owner.id === editOwner?.id
        ? {
            ...owner,
            name: data.name,
            email: data.email,
            image:
              data.image instanceof File
                ? URL.createObjectURL(data.image)
                : owner.image,
            contactNumber: data.contactNumber,
            petCount: data.petCount,
            updatedAt: new Date().toISOString(),
            gender: data.gender,
            status: data.status,
          }
        : owner
    );
    setOwners(updatedOwners);
    setEditOwner(null);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="p-4 bg-white rounded-xl shadow-md">
      {/* Header Section */}
      <TableToolbar
        onAddNew={handleAddNew}
        addButtonLabel="Add Owner"
        addButtonIcon={<MdAdd className="w-5 h-5" />}
        selectedRowsCount={selectedRows.length}
        bulkActionsOptions={
          <>
            <option value="No actions">No actions</option>
            <option value="Delete">Delete</option>
            <option value="Status">Status</option>
          </>
        }
        statusUpdateOptions={
          <>
            <option value="">Select Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </>
        }
        showStatusDropdown={actionDropdown === "Status"}
        onBulkActionChange={setActionDropdown}
        onStatusUpdateChange={setStatusUpdate}
        onApplyAction={handleApplyAction}
        bulkActionValue={actionDropdown}
        statusUpdateValue={statusUpdate}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filterOptions={
          <>
            <option value="">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </>
        }
        onFilterChange={setStatusFilter}
        filterValue={statusFilter}
      />

      {/* Table */}
      <div className="w-full overflow-x-auto rounded-lg border border-gray-200">
        <div className="min-w-[1100px]">
          <Table className="w-full">
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableCell className="w-10 p-2 py-3">
                  <Checkbox
                    checked={selectedRows.length === owners.length}
                    onChange={toggleSelectAll}
                  />
                </TableCell>
                {columns.map((column) => (
                  <SortableTableHeader<OwnerAndPet>
                    key={column.key}
                    columnKey={column.key}
                    label={column.label}
                    sortConfig={sortConfig}
                    requestSort={requestSort}
                    className={`p-2 py-4 text-left text-sm text-gray-100 font-medium ${column.className}`}
                  />
                ))}
                <TableCell className="w-32 p-2 py-4 text-sm font-medium">
                  Actions
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody>
              {currentItems.map((owner) => (
                <TableRow key={owner.id} className="hover:bg-gray-50">
                  <TableCell className="p-2 py-4">
                    <Checkbox
                      checked={selectedRows.includes(owner.id)}
                      onChange={() => toggleSelectRow(owner.id)}
                    />
                  </TableCell>
                  <TableCell className="p-2 py-4 text-sm text-gray-900 font-medium">
                    #{owner.id}
                  </TableCell>
                  <TableCell className="p-2 py-4">
                    <div className="flex items-center gap-3">
                      <ImageHoverPreview
                        src={owner.image}
                        alt={owner.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {owner.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {owner.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="p-2 py-4 text-sm text-gray-500">
                    {owner.contactNumber}
                  </TableCell>
                  <TableCell className="p-2 py-4">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => updatePetCount(owner.id, false)}
                        className="text-gray-500 hover:text-red-600"
                        disabled={owner.petCount <= 0}
                      >
                        -
                      </button>
                      <span className="px-2 py-1 bg-gray-100 rounded">
                        {owner.petCount}
                      </span>
                      <button 
                        onClick={() => updatePetCount(owner.id, true)}
                        className="text-gray-500 hover:text-green-600"
                      >
                        +
                      </button>
                      <MdPets className="text-gray-400" />
                    </div>
                  </TableCell>
                  <TableCell className="p-2 py-4 text-sm text-gray-500">
                    {formatDate(owner.updatedAt)}
                  </TableCell>
                  <TableCell className="p-2 py-4">
                    <Badge
                      size="sm"
                      color='success'
                    >
                      {owner.gender}
                    </Badge>
                  </TableCell>
                  <TableCell className="p-2 py-4">
                    <div className="flex items-center gap-3">
                      <Badge
                        size="sm"
                        color={owner.status === "Active" ? "success" : "error"}
                      >
                        {owner.status === "Active" ? <IoIosCheckmarkCircle/>:<IoIosCloseCircle/>}
                      </Badge>
                      <Switch
                        label=""
                        checked={owner.status === "Active"}
                        onChange={() => toggleStatus(owner.id)}
                      />
                    </div>
                  </TableCell>
                  <TableCell className="p-2 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={handlePushNotification}
                        className="text-blue-500 hover:text-blue-700 p-1 rounded hover:bg-blue-50"
                        title="Send Notification"
                      >
                        <MdNotifications className="w-5 h-5" />
                      </button>
                      <button
                        onClick={handleChangePassword}
                        className="text-blue-500 hover:text-blue-700 p-1 rounded hover:bg-blue-50"
                        title="Change Password"
                      >
                        <MdLock className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleEdit(owner)}
                        className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50"
                        title="Edit"
                      >
                        <MdEdit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(owner.id)}
                        className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50"
                        title="Delete"
                      >
                        <MdDelete className="w-5 h-5" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      <Pagination
        totalItems={filteredData.length}
        itemsPerPage={itemsPerPage}
        onPageChange={handlePageChange}
        onItemsPerPageChange={handleItemsPerPageChange}
      />

      {/* Add/Edit Dialog */}
      {isAddDialogOpen || editOwner ? (
        <OwnerAndPetsForm
          owner={editOwner}
          onSubmit={editOwner ? confirmEdit : confirmAddNew}
          onCancel={() => {
            setIsAddDialogOpen(false);
            setEditOwner(null);
          }}
        />
      ) : null}

      {/* Push Notification Dialog */}
      {isPushNotificationDialogOpen && (
        <PushNotificationForm
          onSubmit={handlePushNotificationSubmit}
          onCancel={() => setIsPushNotificationDialogOpen(false)}
        />
      )}

      {/* Change Password Dialog */}
      {isChangePasswordDialogOpen && (
        <ChangePasswordForm
          onSubmit={handleChangePasswordSubmit}
          onCancel={() => setIsChangePasswordDialogOpen(false)}
        />
      )}

      {/* Delete Dialog */}
      {isDeleteDialogOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full border-b pb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Confirm Deletion
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              {ownerToDelete
                ? "Are you sure you want to delete this owner?"
                : `Are you sure you want to delete ${selectedRows.length} selected owners?`}
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsDeleteDialogOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
       <DeleteDialog
  isOpen={isDeleteDialogOpen}
  onClose={() => setIsDeleteDialogOpen(false)}
  onConfirm={confirmDelete}
  itemLabel="Employee Request"
  description={
    selectedRows.length > 1
      ? `Are you sure you want to delete ${selectedRows.length} selected owners?`
      : "Are you sure you want to delete this owner?"
  }
/>
    </div>
  );
}