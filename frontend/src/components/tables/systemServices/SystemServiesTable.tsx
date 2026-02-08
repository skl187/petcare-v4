import { MdEdit, MdDelete, MdAdd } from "react-icons/md";
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
import SystemServiceForm from "../../../pages/Forms/SystemServiceForm/SystemServicesForm";
import { SystemServiceFormData } from "../../../pages/Forms/SystemServiceForm/SystemServicesForm";
import Pagination from "../tableComponents/Pagination";
import useSort from "../../../hooks/useSort";
import SortableTableHeader from "../tableComponents/SortableTableHeader";
import { TableToolbar } from "../tableComponents/TableToolbar";
import Switch from "../../form/switch/Switch";
import { IoIosCloseCircle, IoIosCheckmarkCircle } from "react-icons/io";
import ImageHoverPreview from "../tableComponents/ImageHoverPreview";
import DeleteDialog from "../tableComponents/DeleteDailog";

export interface SystemService {
  id: number;
  name: string;
  image: string;
  description: string;
  status: "Active" | "Inactive";
}

// Mock data for system services
const mockServices: SystemService[] = Array.from({ length: 10 }, (_, i) => ({
  id: i + 1,
  name: `Service ${i + 1}`,
  image: `/images/services/service-${(i % 5) + 1}.jpg`,
  description: `Description for service ${i + 1} providing important functionality`,
  status: i % 3 !== 0 ? "Active" : "Inactive",
}));

export default function SystemServicesTable() {
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [actionDropdown, setActionDropdown] = useState<string>("No actions");
  const [statusUpdate, setStatusUpdate] = useState<string>("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editService, setEditService] = useState<SystemService | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [services, setServices] = useState<SystemService[]>(mockServices);
  const [serviceToDelete, setServiceToDelete] = useState<number | null>(null);
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
      className: "min-w-[200px] text-gray-700 font-semibold max-w-[300px]",
    },
    {
      key: "description",
      label: "Description",
      className: "min-w-[250px] text-gray-700 max-w-[400px]",
    },
    {
      key: "status",
      label: "Status",
      className: "min-w-[100px] max-w-[200px] text-gray-700 font-semibold",
    },
  ] as const;

  // Filtered data based on search and status
  const filteredData = services
    .filter((service) =>
      service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter((service) =>
      statusFilter ? service.status === statusFilter : true
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
      selectedRows.length === services.length
        ? []
        : services.map((row) => row.id)
    );
  };

  const handleApplyAction = () => {
    if (actionDropdown === "Delete") {
      handleDelete();
    } else if (actionDropdown === "Status" && statusUpdate) {
      const updatedServices = services.map((service) =>
        selectedRows.includes(service.id)
          ? { ...service, status: statusUpdate as "Active" | "Inactive" }
          : service
      );
      setServices(updatedServices);
      setSelectedRows([]);
    }
  };

  const handleDelete = (id?: number) => {
    if (id) {
      setServiceToDelete(id);
    } else {
      setServiceToDelete(null);
    }
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    let updatedServices: SystemService[];

    if (serviceToDelete) {
      updatedServices = services.filter(
        (service) => service.id !== serviceToDelete
      );
    } else {
      updatedServices = services.filter(
        (service) => !selectedRows.includes(service.id)
      );
    }

    setServices(updatedServices);
    setIsDeleteDialogOpen(false);
    setSelectedRows([]);
    setServiceToDelete(null);
  };

  const handleEdit = (service: SystemService) => {
    setEditService(service);
  };

  const handleAddNew = () => {
    setIsAddDialogOpen(true);
  };

  const toggleStatus = (id: number) => {
    setServices((prev) =>
      prev.map((service) =>
        service.id === id
          ? {
              ...service,
              status: service.status === "Active" ? "Inactive" : "Active",
            }
          : service
      )
    );
  };

  const confirmAddNew = (data: SystemServiceFormData) => {
    const newService: SystemService = {
      id: services.length + 1,
      name: data.name,
      image: data.image instanceof File 
        ? URL.createObjectURL(data.image) 
        : `/images/services/service-${(services.length % 5) + 1}.jpg`,
      description: data.description,
      status: data.status,
    };
    setServices([...services, newService]);
    setIsAddDialogOpen(false);
  };

  const confirmEdit = (data: SystemServiceFormData) => {
    const updatedServices = services.map((service) =>
      service.id === editService?.id
        ? {
            ...service,
            name: data.name,
            image: data.image instanceof File
              ? URL.createObjectURL(data.image)
              : service.image,
            description: data.description,
            status: data.status,
          }
        : service
    );
    setServices(updatedServices);
    setEditService(null);
  };

  return (
    <div className="p-4 bg-white rounded-xl shadow-md">
      {/* Header Section */}
      <TableToolbar
        onAddNew={handleAddNew}
        addButtonLabel="Add Service"
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
        searchPlaceholder="Search services..."
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
        <div className="min-w-[800px]">
          <Table className="w-full">
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableCell className="w-10 p-2 py-3">
                  <Checkbox
                    checked={selectedRows.length === services.length}
                    onChange={toggleSelectAll}
                  />
                </TableCell>
                {columns.map((column) => (
                  <SortableTableHeader<SystemService>
                    key={column.key}
                    columnKey={column.key}
                    label={column.label}
                    sortConfig={sortConfig}
                    requestSort={requestSort}
                    className={`p-2 py-4 text-left text-sm text-gray-100 font-medium ${column.className}`}
                  />
                ))}
                <TableCell className="w-24 p-2 py-4 text-sm font-medium">
                  Actions
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody>
              {currentItems.map((service) => (
                <TableRow key={service.id} className="hover:bg-gray-50">
                  <TableCell className="p-2 py-4">
                    <Checkbox
                      checked={selectedRows.includes(service.id)}
                      onChange={() => toggleSelectRow(service.id)}
                    />
                  </TableCell>
                  <TableCell className="p-2 py-4 text-sm text-gray-900 font-medium">
                    #{service.id}
                  </TableCell>
                  <TableCell className="p-2 py-4">
                    <div className="flex items-center gap-3">
                      <ImageHoverPreview
                        src={service.image}
                        alt={service.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <div className="font-medium text-gray-900">{service.name}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="p-2 py-4 text-sm text-gray-500">
                    {service.description}
                  </TableCell>
                  <TableCell className="p-2 py-4">
                    <div className="flex items-center gap-3">
                      <Badge
                        size="sm"
                        color={service.status === "Active" ? "success" : "error"}
                      >
                        {service.status === "Active" ? <IoIosCheckmarkCircle/> : <IoIosCloseCircle/> }
                      </Badge>
                      <Switch
                        label=""
                        checked={service.status === "Active"}
                        onChange={() => toggleStatus(service.id)}
                      />
                    </div>
                  </TableCell>
                  <TableCell className="p-2 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(service)}
                        className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50"
                      >
                        <MdEdit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(service.id)}
                        className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50"
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
      {isAddDialogOpen || editService ? (
        <SystemServiceForm
          service={editService}
          onSubmit={editService ? confirmEdit : confirmAddNew}
          onCancel={() => {
            setIsAddDialogOpen(false);
            setEditService(null);
          }}
        />
      ) : null}

      {/* Delete Dialog */}
       <DeleteDialog
  isOpen={isDeleteDialogOpen}
  onClose={() => setIsDeleteDialogOpen(false)}
  onConfirm={confirmDelete}
  itemLabel="Vet Booking"
  description={
    selectedRows.length > 1
      ? `Are you sure you want to delete ${selectedRows.length} selected services?`
      : "Are you sure you want to delete this service?"
  }
/>
    </div>
  );
}