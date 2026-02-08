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
import CountryLocationForm from "../../../pages/Forms/LocationForms/CountryLocationForm";
import { CountryLocationFormData } from "../../../pages/Forms/LocationForms/CountryLocationForm";
import Pagination from "../tableComponents/Pagination";
import useSort from "../../../hooks/useSort";
import SortableTableHeader from "../tableComponents/SortableTableHeader";
import { TableToolbar } from "../tableComponents/TableToolbar";
import Switch from "../../form/switch/Switch";
import { IoIosCloseCircle, IoIosCheckmarkCircle } from "react-icons/io";
import DeleteDialog from "../tableComponents/DeleteDailog";

export interface CountryLocation {
  id: number;
  name: string;
  status: "Active" | "Inactive";
}

// Mock data for countries
const mockCountries: CountryLocation[] = [
  {
    id: 1,
    name: "United States",
    status: "Active",
  },
  {
    id: 2,
    name: "India",
    status: "Active",
  },
];

export default function CountryLocationTable() {
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [actionDropdown, setActionDropdown] = useState<string>("No actions");
  const [statusUpdate, setStatusUpdate] = useState<string>("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editCountry, setEditCountry] = useState<CountryLocation | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [countries, setCountries] = useState<CountryLocation[]>(mockCountries);
  const [countryToDelete, setCountryToDelete] = useState<number | null>(null);
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
      label: "Country Name",
      className: "min-w-[150px] text-gray-700 font-semibold max-w-[200px]",
    },
    {
      key: "status",
      label: "Status",
      className: "min-w-[100px] max-w-[200px] text-gray-700 font-semibold",
    },
  ] as const;

  // Filtered data based on search and status
  const filteredData = countries
    .filter((country) =>
      country.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter((country) =>
      statusFilter ? country.status === statusFilter : true
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
      selectedRows.length === countries.length
        ? []
        : countries.map((row) => row.id)
    );
  };

  const handleApplyAction = () => {
    if (actionDropdown === "Delete") {
      handleDelete();
    } else if (actionDropdown === "Status" && statusUpdate) {
      const updatedCountries = countries.map((country) =>
        selectedRows.includes(country.id)
          ? { ...country, status: statusUpdate as "Active" | "Inactive" }
          : country
      );
      setCountries(updatedCountries);
      setSelectedRows([]);
    }
  };

  const handleDelete = (id?: number) => {
    if (id) {
      setCountryToDelete(id);
    } else {
      setCountryToDelete(null);
    }
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    let updatedCountries: CountryLocation[];

    if (countryToDelete) {
      updatedCountries = countries.filter(
        (country) => country.id !== countryToDelete
      );
    } else {
      updatedCountries = countries.filter(
        (country) => !selectedRows.includes(country.id)
      );
    }

    setCountries(updatedCountries);
    setIsDeleteDialogOpen(false);
    setSelectedRows([]);
    setCountryToDelete(null);
  };

  const handleEdit = (country: CountryLocation) => {
    setEditCountry(country);
  };

  const handleAddNew = () => {
    setIsAddDialogOpen(true);
  };

  const toggleStatus = (id: number) => {
    setCountries((prev) =>
      prev.map((country) =>
        country.id === id
          ? {
              ...country,
              status: country.status === "Active" ? "Inactive" : "Active",
            }
          : country
      )
    );
  };

  const confirmAddNew = (data: CountryLocationFormData) => {
    const newCountry: CountryLocation = {
      id: countries.length + 1,
      name: data.name,
      status: data.status,
    };
    setCountries([...countries, newCountry]);
    setIsAddDialogOpen(false);
  };

  const confirmEdit = (data: CountryLocationFormData) => {
    const updatedCountries = countries.map((country) =>
      country.id === editCountry?.id
        ? {
            ...country,
            name: data.name,
            status: data.status,
          }
        : country
    );
    setCountries(updatedCountries);
    setEditCountry(null);
  };

  return (
    <div className="p-4 bg-white rounded-xl shadow-md">
      {/* Header Section */}
      <TableToolbar
        onAddNew={handleAddNew}
        addButtonLabel="Add Country"
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
        searchPlaceholder="Search countries..."
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
                    checked={selectedRows.length === countries.length}
                    onChange={toggleSelectAll}
                  />
                </TableCell>
                {columns.map((column) => (
                  <SortableTableHeader<CountryLocation>
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
              {currentItems.map((country) => (
                <TableRow key={country.id} className="hover:bg-gray-50">
                  <TableCell className="p-2 py-4">
                    <Checkbox
                      checked={selectedRows.includes(country.id)}
                      onChange={() => toggleSelectRow(country.id)}
                    />
                  </TableCell>
                  <TableCell className="p-2 py-4 text-sm text-gray-900 font-medium">
                    #{country.id}
                  </TableCell>
                  <TableCell className="p-2 py-4 text-sm text-gray-900">
                    {country.name}
                  </TableCell>
                  <TableCell className="p-2 py-4">
                    <div className="flex items-center gap-3">
                      <Badge
                        size="sm"
                        color={country.status === "Active" ? "success" : "error"}
                      >
                        {country.status === "Active" ? <IoIosCheckmarkCircle/>:<IoIosCloseCircle/>}
                      </Badge>
                      <Switch
                        label=""
                        checked={country.status === "Active"}
                        onChange={() => toggleStatus(country.id)}
                      />
                    </div>
                  </TableCell>
                  <TableCell className="p-2 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(country)}
                        className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50"
                      >
                        <MdEdit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(country.id)}
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
      {isAddDialogOpen || editCountry ? (
        <CountryLocationForm
          country={editCountry}
          onSubmit={editCountry ? confirmEdit : confirmAddNew}
          onCancel={() => {
            setIsAddDialogOpen(false);
            setEditCountry(null);
          }}
        />
      ) : null}

      {/* Delete Dialog */}
      <DeleteDialog
  isOpen={isDeleteDialogOpen}
  onClose={() => setIsDeleteDialogOpen(false)}
  onConfirm={confirmDelete}
  itemLabel="Country Location"
  description={
    selectedRows.length > 1
      ? `Are you sure you want to delete ${selectedRows.length} selected countries?`
      : "Are you sure you want to delete this country?"
  }
/>
    </div>
  );
}