import { MdEdit, MdDelete, MdAdd } from 'react-icons/md';
import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from '../../ui/table';
import Badge from '../../ui/badge/Badge';
import Checkbox from '../../form/input/Checkbox';
import TaxForm from '../../../adminPages/Forms/FinanceForms/TaxForm';
import { TaxFormData } from '../../../adminPages/Forms/FinanceForms/TaxForm';
import Pagination from '../tableComponents/Pagination';
import useSort from '../../../hooks/useSort';
import SortableTableHeader from '../tableComponents/SortableTableHeader';
import { TableToolbar } from '../tableComponents/TableToolbar';
import Switch from '../../form/switch/Switch';
import { IoIosCloseCircle, IoIosCheckmarkCircle } from 'react-icons/io';
import DeleteDialog from '../tableComponents/DeleteDailog';

export interface Tax {
  id: number;
  title: string;
  value: number;
  type: 'fixed' | 'percentage';
  moduleType: 'services' | 'products';
  status: 'active' | 'inactive';
}

// Mock data for taxes
const mockTaxes: Tax[] = [
  {
    id: 1,
    title: 'Service Tax',
    value: 15,
    type: 'percentage',
    moduleType: 'services',
    status: 'active',
  },
  {
    id: 2,
    title: 'Product Tax',
    value: 5,
    type: 'percentage',
    moduleType: 'products',
    status: 'active',
  },
  {
    id: 3,
    title: 'Fixed Handling Tax',
    value: 10,
    type: 'fixed',
    moduleType: 'products',
    status: 'inactive',
  },
  {
    id: 4,
    title: 'Membership Tax',
    value: 20,
    type: 'percentage',
    moduleType: 'services',
    status: 'active',
  },
  {
    id: 5,
    title: 'Shipping Tax',
    value: 8,
    type: 'fixed',
    moduleType: 'products',
    status: 'active',
  },
];

export default function TaxTable() {
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [actionDropdown, setActionDropdown] = useState<string>('No actions');
  const [statusUpdate, setStatusUpdate] = useState<string>('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editTax, setEditTax] = useState<Tax | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [taxes, setTaxes] = useState<Tax[]>(mockTaxes);
  const [taxToDelete, setTaxToDelete] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const columns = [
    {
      key: 'title',
      label: 'Title',
      className: 'min-w-[200px] text-gray-700 font-semibold max-w-[250px]',
    },
    {
      key: 'value',
      label: 'Value',
      className: 'min-w-[120px] text-gray-700 max-w-[180px]',
    },
    {
      key: 'type',
      label: 'Type',
      className: 'min-w-[120px] text-gray-700 max-w-[180px]',
    },
    {
      key: 'moduleType',
      label: 'Module Type',
      className: 'min-w-[150px] text-gray-700 max-w-[200px]',
    },
    {
      key: 'status',
      label: 'Status',
      className: 'min-w-[100px] max-w-[150px] text-gray-700 font-semibold',
    },
  ] as const;

  // Filtered data based on search and filters
  const filteredData = taxes
    .filter((tax) =>
      tax.title.toLowerCase().includes(searchQuery.toLowerCase()),
    )
    .filter((tax) => (statusFilter ? tax.status === statusFilter : true));

  const { sortedData, requestSort, sortConfig } = useSort(filteredData, {
    key: 'id',
    direction: 'asc',
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
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id],
    );
  };

  const toggleSelectAll = () => {
    setSelectedRows(
      selectedRows.length === taxes.length ? [] : taxes.map((row) => row.id),
    );
  };

  const handleApplyAction = () => {
    if (actionDropdown === 'Delete') {
      handleDelete();
    } else if (actionDropdown === 'Status' && statusUpdate) {
      const updatedTaxes = taxes.map((tax) =>
        selectedRows.includes(tax.id)
          ? { ...tax, status: statusUpdate as 'active' | 'inactive' }
          : tax,
      );
      setTaxes(updatedTaxes);
      setSelectedRows([]);
    }
  };

  const handleDelete = (id?: number) => {
    if (id) {
      setTaxToDelete(id);
    } else {
      setTaxToDelete(null);
    }
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    let updatedTaxes: Tax[];

    if (taxToDelete) {
      updatedTaxes = taxes.filter((tax) => tax.id !== taxToDelete);
    } else {
      updatedTaxes = taxes.filter((tax) => !selectedRows.includes(tax.id));
    }

    setTaxes(updatedTaxes);
    setIsDeleteDialogOpen(false);
    setSelectedRows([]);
    setTaxToDelete(null);
  };

  const handleEdit = (tax: Tax) => {
    setEditTax(tax);
  };

  const handleAddNew = () => {
    setIsAddDialogOpen(true);
  };

  const toggleStatus = (id: number) => {
    setTaxes((prev) =>
      prev.map((tax) =>
        tax.id === id
          ? {
              ...tax,
              status: tax.status === 'active' ? 'inactive' : 'active',
            }
          : tax,
      ),
    );
  };

  const confirmAddNew = (data: TaxFormData) => {
    const newTax: Tax = {
      id: taxes.length + 1,
      title: data.title,
      value: data.value,
      type: data.type,
      moduleType: data.moduleType,
      status: data.status,
    };
    setTaxes([...taxes, newTax]);
    setIsAddDialogOpen(false);
  };

  const confirmEdit = (data: TaxFormData) => {
    const updatedTaxes = taxes.map((tax) =>
      tax.id === editTax?.id
        ? {
            ...tax,
            title: data.title,
            value: data.value,
            type: data.type,
            moduleType: data.moduleType,
            status: data.status,
          }
        : tax,
    );
    setTaxes(updatedTaxes);
    setEditTax(null);
  };

  const formatValue = (value: number, type: string) => {
    return type === 'percentage' ? `${value}%` : value.toString();
  };

  return (
    <div className='p-4 bg-white rounded-xl shadow-md'>
      {/* Header Section */}
      <TableToolbar
        onAddNew={handleAddNew}
        addButtonLabel='Add Tax'
        addButtonIcon={<MdAdd className='w-5 h-5' />}
        selectedRowsCount={selectedRows.length}
        bulkActionsOptions={
          <>
            <option value='No actions'>No actions</option>
            <option value='Delete'>Delete</option>
            <option value='Status'>Status</option>
          </>
        }
        statusUpdateOptions={
          <>
            <option value=''>Select Status</option>
            <option value='active'>Active</option>
            <option value='inactive'>Inactive</option>
          </>
        }
        showStatusDropdown={actionDropdown === 'Status'}
        onBulkActionChange={setActionDropdown}
        onStatusUpdateChange={setStatusUpdate}
        onApplyAction={handleApplyAction}
        bulkActionValue={actionDropdown}
        statusUpdateValue={statusUpdate}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filterOptions={
          <>
            <option value=''>All Status</option>
            <option value='active'>Active</option>
            <option value='inactive'>Inactive</option>
          </>
        }
        onFilterChange={setStatusFilter}
        filterValue={statusFilter}
      />

      {/* Table */}
      <div className='w-full overflow-x-auto rounded-lg border border-gray-200'>
        <div className='min-w-[1100px]'>
          <Table className='w-full'>
            <TableHeader className='bg-gray-50'>
              <TableRow>
                <TableCell className='w-10 p-2 py-3'>
                  <Checkbox
                    checked={selectedRows.length === taxes.length}
                    onChange={toggleSelectAll}
                  />
                </TableCell>
                {columns.map((column) => (
                  <SortableTableHeader<Tax>
                    key={column.key}
                    columnKey={column.key}
                    label={column.label}
                    sortConfig={sortConfig}
                    requestSort={requestSort}
                    className={`p-2 py-4 text-left text-sm text-gray-100 font-medium ${column.className}`}
                  />
                ))}
                <TableCell className='w-32 p-2 py-4 text-sm font-medium'>
                  Actions
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody>
              {currentItems.map((tax) => (
                <TableRow key={tax.id} className='hover:bg-gray-50'>
                  <TableCell className='p-2 py-4'>
                    <Checkbox
                      checked={selectedRows.includes(tax.id)}
                      onChange={() => toggleSelectRow(tax.id)}
                    />
                  </TableCell>
                  <TableCell className='p-2 py-4 text-sm font-medium text-gray-900'>
                    {tax.title}
                  </TableCell>
                  <TableCell className='p-2 py-4 text-sm text-gray-500'>
                    {formatValue(tax.value, tax.type)}
                  </TableCell>
                  <TableCell className='p-2 py-4'>
                    <Badge
                      size='sm'
                      color={tax.type === 'percentage' ? 'info' : 'success'}
                    >
                      {tax.type}
                    </Badge>
                  </TableCell>
                  <TableCell className='p-2 py-4 text-sm text-gray-500'>
                    {tax.moduleType}
                  </TableCell>
                  <TableCell className='p-2 py-4'>
                    <div className='flex items-center gap-3'>
                      <Badge
                        size='sm'
                        color={tax.status === 'active' ? 'success' : 'error'}
                      >
                        {tax.status === 'active' ? (
                          <IoIosCheckmarkCircle />
                        ) : (
                          <IoIosCloseCircle />
                        )}
                      </Badge>
                      <Switch
                        label=''
                        checked={tax.status === 'active'}
                        onChange={() => toggleStatus(tax.id)}
                      />
                    </div>
                  </TableCell>
                  <TableCell className='p-2 py-4'>
                    <div className='flex gap-2'>
                      <button
                        onClick={() => handleEdit(tax)}
                        className='text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50'
                        title='Edit'
                      >
                        <MdEdit className='w-5 h-5' />
                      </button>
                      <button
                        onClick={() => handleDelete(tax.id)}
                        className='text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50'
                        title='Delete'
                      >
                        <MdDelete className='w-5 h-5' />
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
      {isAddDialogOpen || editTax ? (
        <TaxForm
          tax={editTax}
          onSubmit={editTax ? confirmEdit : confirmAddNew}
          onCancel={() => {
            setIsAddDialogOpen(false);
            setEditTax(null);
          }}
        />
      ) : null}

      {/* Delete Dialog */}
      <DeleteDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        itemLabel='Tax'
        description={
          selectedRows.length > 1
            ? `Are you sure you want to delete ${selectedRows.length} selected taxes?`
            : 'Are you sure you want to delete this tax?'
        }
      />
    </div>
  );
}
