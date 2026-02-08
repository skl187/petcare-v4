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
import CategoryListForm from "../../../pages/Forms/VetForms/CategoryListForm";
import { CategoryFormData } from "../../../pages/Forms/VetForms/CategoryListForm";
import Pagination from "../tableComponents/Pagination";
import useSort from "../../../hooks/useSort";
import SortableTableHeader from "../tableComponents/SortableTableHeader";
import { TableToolbar } from "../tableComponents/TableToolbar";
import Switch from "../../form/switch/Switch";
import { IoIosCloseCircle, IoIosCheckmarkCircle } from "react-icons/io";
import ImageHoverPreview from "../tableComponents/ImageHoverPreview";
import DeleteDialog from "../tableComponents/DeleteDailog";

export interface Category {
  id: number;
  name: string;
  image: string;
  updatedAt: string;
  createdAt: string;
  status: "Active" | "Inactive";
}

// Mock data for categories
const mockCategories: Category[] = Array.from({ length: 50 }, (_, i) => ({
  id: i + 1,
  name: `Category ${i + 1}`,
  image: `/images/categories/category-${(i % 5) + 1}.jpg`,
  updatedAt: new Date(Date.now() - i * 86400000).toISOString(),
  createdAt: new Date(Date.now() - i * 86400000).toISOString(),
  status: i % 3 !== 0 ? "Active" : "Inactive",
}));

export default function CategoryListTable() {
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [actionDropdown, setActionDropdown] = useState<string>("No actions");
  const [statusUpdate, setStatusUpdate] = useState<string>("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>(mockCategories);
  const [categoryToDelete, setCategoryToDelete] = useState<number | null>(null);
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
      className: "min-w-[150px] text-gray-700 font-semibold max-w-[200px]",
    },
    {
      key: "createdAt",
      label: "Created At",
      className: "min-w-[150px] text-gray-700 max-w-[200px]",
    },
    {
      key: "updatedAt",
      label: "Updated At",
      className: "min-w-[150px] text-gray-700 max-w-[200px]",
    },
    {
      key: "status",
      label: "Status",
      className: "min-w-[100px] max-w-[200px] text-gray-700 font-semibold",
    },
  ] as const;

  // Filtered data based on search and status
  const filteredData = categories
    .filter((category) =>
      category.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter((category) =>
      statusFilter ? category.status === statusFilter : true
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
      selectedRows.length === categories.length
        ? []
        : categories.map((row) => row.id)
    );
  };

  const handleApplyAction = () => {
    if (actionDropdown === "Delete") {
      handleDelete();
    } else if (actionDropdown === "Status" && statusUpdate) {
      const updatedCategories = categories.map((category) =>
        selectedRows.includes(category.id)
          ? { ...category, status: statusUpdate as "Active" | "Inactive" }
          : category
      );
      setCategories(updatedCategories);
      setSelectedRows([]);
    }
  };

  const handleDelete = (id?: number) => {
    if (id) {
      setCategoryToDelete(id);
    } else {
      setCategoryToDelete(null);
    }
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    let updatedCategories: Category[];

    if (categoryToDelete) {
      updatedCategories = categories.filter(
        (category) => category.id !== categoryToDelete
      );
    } else {
      updatedCategories = categories.filter(
        (category) => !selectedRows.includes(category.id)
      );
    }

    setCategories(updatedCategories);
    setIsDeleteDialogOpen(false);
    setSelectedRows([]);
    setCategoryToDelete(null);
  };

  const handleEdit = (category: Category) => {
    setEditCategory(category);
  };

  const handleAddNew = () => {
    setIsAddDialogOpen(true);
  };

  const toggleStatus = (id: number) => {
    setCategories((prev) =>
      prev.map((category) =>
        category.id === id
          ? {
              ...category,
              status: category.status === "Active" ? "Inactive" : "Active",
            }
          : category
      )
    );
  };

  const confirmAddNew = (data: CategoryFormData) => {
    const newCategory: Category = {
      id: categories.length + 1,
      name: data.name,
      image:
        data.image instanceof File
          ? URL.createObjectURL(data.image)
          : `/images/categories/category-${(categories.length % 5) + 1}.jpg`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: data.status,
    };
    setCategories([...categories, newCategory]);
    setIsAddDialogOpen(false);
  };

  const confirmEdit = (data: CategoryFormData) => {
    const updatedCategories = categories.map((category) =>
      category.id === editCategory?.id
        ? {
            ...category,
            name: data.name,
            image:
              data.image instanceof File
                ? URL.createObjectURL(data.image)
                : category.image,
            status: data.status,
            updatedAt: new Date().toISOString(),
          }
        : category
    );
    setCategories(updatedCategories);
    setEditCategory(null);
  };

  return (
    <div className="p-4 bg-white rounded-xl shadow-md">
      {/* Header Section */}
      <TableToolbar
        onAddNew={handleAddNew}
        addButtonLabel="Add Category"
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
        searchPlaceholder="Search categories..."
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
                    checked={selectedRows.length === categories.length}
                    onChange={toggleSelectAll}
                  />
                </TableCell>
                {columns.map((column) => (
                  <SortableTableHeader<Category>
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
              {currentItems.map((category) => (
                <TableRow key={category.id} className="hover:bg-gray-50">
                  <TableCell className="p-2 py-4">
                    <Checkbox
                      checked={selectedRows.includes(category.id)}
                      onChange={() => toggleSelectRow(category.id)}
                    />
                  </TableCell>
                  <TableCell className="p-2 py-4 text-sm text-gray-900 font-medium">
                    #{category.id}
                  </TableCell>
                  <TableCell className="p-2 py-4">
                    <div className="flex items-center gap-3">
                    <ImageHoverPreview
                          src={category.image}
                          alt={category.name}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      <span className="text-sm text-gray-900">
                        {category.name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="p-2 py-4 text-sm text-gray-500">
                    {new Date(category.createdAt).toLocaleString()}
                  </TableCell>
                  <TableCell className="p-2 py-4 text-sm text-gray-500">
                    {new Date(category.updatedAt).toLocaleString()}
                  </TableCell>
                  <TableCell className="p-2 py-4">
                    <div className="flex items-center gap-3">
                      <Badge
                        size="sm"
                        color={category.status === "Active" ? "success" : "error"}
                      >
                        {category.status === "Active" ? <IoIosCheckmarkCircle/>:<IoIosCloseCircle/>}
                      </Badge>
                      <Switch
                        label=""
                        checked={category.status === "Active"}
                        onChange={() => toggleStatus(category.id)}
                      />
                    </div>
                  </TableCell>
                  <TableCell className="p-2 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(category)}
                        className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50"
                      >
                        <MdEdit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(category.id)}
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
      {isAddDialogOpen || editCategory ? (
        <CategoryListForm
          category={editCategory}
          onSubmit={editCategory ? confirmEdit : confirmAddNew}
          onCancel={() => {
            setIsAddDialogOpen(false);
            setEditCategory(null);
          }}
        />
      ) : null}

      {/* Delete Dialog */}
       <DeleteDialog
  isOpen={isDeleteDialogOpen}
  onClose={() => setIsDeleteDialogOpen(false)}
  onConfirm={confirmDelete}
  itemLabel="Category List"
  description={
    selectedRows.length > 1
      ? `Are you sure you want to delete ${selectedRows.length} selected categories?`
      : "Are you sure you want to delete this category?"
  }
/>
    </div>
  );
}