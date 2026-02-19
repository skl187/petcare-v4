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
import CityLocationForm from '../../../adminPages/Forms/LocationForms/CityLocationForm';
import { CityLocationFormData } from '../../../adminPages/Forms/LocationForms/CityLocationForm';
import Pagination from '../tableComponents/Pagination';
import useSort from '../../../hooks/useSort';
import SortableTableHeader from '../tableComponents/SortableTableHeader';
import { TableToolbar } from '../tableComponents/TableToolbar';
import Switch from '../../form/switch/Switch';
import { IoIosCloseCircle, IoIosCheckmarkCircle } from 'react-icons/io';
import DeleteDialog from '../tableComponents/DeleteDailog';

export interface CityLocation {
  id: number;
  name: string;
  state: string;
  country: string;
  status: 'Active' | 'Inactive';
}

// Mock data for cities
const mockCities: CityLocation[] = Array.from({ length: 50 }, (_, i) => ({
  id: i + 1,
  name: `City ${i + 1}`,
  state: `State ${(i % 10) + 1}`,
  country: 'United States',
  status: i % 3 !== 0 ? 'Active' : 'Inactive',
}));

export default function CityLocationTable() {
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [actionDropdown, setActionDropdown] = useState<string>('No actions');
  const [statusUpdate, setStatusUpdate] = useState<string>('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editCity, setEditCity] = useState<CityLocation | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [cities, setCities] = useState<CityLocation[]>(mockCities);
  const [cityToDelete, setCityToDelete] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const columns = [
    {
      key: 'name',
      label: 'City Name',
      className: 'min-w-[150px] text-gray-700 font-semibold max-w-[200px]',
    },
    {
      key: 'state',
      label: 'State Name',
      className: 'min-w-[150px] text-gray-700 font-semibold max-w-[200px]',
    },
    {
      key: 'country',
      label: 'Country Name',
      className: 'min-w-[150px] text-gray-700 font-semibold max-w-[200px]',
    },
    {
      key: 'status',
      label: 'Status',
      className: 'min-w-[100px] max-w-[200px] text-gray-700 font-semibold',
    },
  ] as const;

  // Filtered data based on search and status
  const filteredData = cities
    .filter(
      (city) =>
        city.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        city.state.toLowerCase().includes(searchQuery.toLowerCase()),
    )
    .filter((city) => (statusFilter ? city.status === statusFilter : true));

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
      selectedRows.length === cities.length ? [] : cities.map((row) => row.id),
    );
  };

  const handleApplyAction = () => {
    if (actionDropdown === 'Delete') {
      handleDelete();
    } else if (actionDropdown === 'Status' && statusUpdate) {
      const updatedCities = cities.map((city) =>
        selectedRows.includes(city.id)
          ? { ...city, status: statusUpdate as 'Active' | 'Inactive' }
          : city,
      );
      setCities(updatedCities);
      setSelectedRows([]);
    }
  };

  const handleDelete = (id?: number) => {
    if (id) {
      setCityToDelete(id);
    } else {
      setCityToDelete(null);
    }
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    let updatedCities: CityLocation[];

    if (cityToDelete) {
      updatedCities = cities.filter((city) => city.id !== cityToDelete);
    } else {
      updatedCities = cities.filter((city) => !selectedRows.includes(city.id));
    }

    setCities(updatedCities);
    setIsDeleteDialogOpen(false);
    setSelectedRows([]);
    setCityToDelete(null);
  };

  const handleEdit = (city: CityLocation) => {
    setEditCity(city);
  };

  const handleAddNew = () => {
    setIsAddDialogOpen(true);
  };

  const toggleStatus = (id: number) => {
    setCities((prev) =>
      prev.map((city) =>
        city.id === id
          ? {
              ...city,
              status: city.status === 'Active' ? 'Inactive' : 'Active',
            }
          : city,
      ),
    );
  };

  const confirmAddNew = (data: CityLocationFormData) => {
    const newCity: CityLocation = {
      id: cities.length + 1,
      name: data.name,
      state: data.state,
      country: 'United States',
      status: data.status,
    };
    setCities([...cities, newCity]);
    setIsAddDialogOpen(false);
  };

  const confirmEdit = (data: CityLocationFormData) => {
    const updatedCities = cities.map((city) =>
      city.id === editCity?.id
        ? {
            ...city,
            name: data.name,
            state: data.state,
            status: data.status,
            updatedAt: new Date().toISOString(),
          }
        : city,
    );
    setCities(updatedCities);
    setEditCity(null);
  };

  return (
    <div className='p-4 bg-white rounded-xl shadow-md'>
      {/* Header Section */}
      <TableToolbar
        onAddNew={handleAddNew}
        addButtonLabel='Add City'
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
            <option value='Active'>Active</option>
            <option value='Inactive'>Inactive</option>
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
        searchPlaceholder='Search cities or states...'
        filterOptions={
          <>
            <option value=''>All Status</option>
            <option value='Active'>Active</option>
            <option value='Inactive'>Inactive</option>
          </>
        }
        onFilterChange={setStatusFilter}
        filterValue={statusFilter}
      />

      {/* Table */}
      <div className='w-full overflow-x-auto rounded-lg border border-gray-200'>
        <div className='min-w-[800px]'>
          <Table className='w-full'>
            <TableHeader className='bg-gray-50'>
              <TableRow>
                <TableCell className='w-10 p-2 py-3'>
                  <Checkbox
                    checked={selectedRows.length === cities.length}
                    onChange={toggleSelectAll}
                  />
                </TableCell>
                {columns.map((column) => (
                  <SortableTableHeader<CityLocation>
                    key={column.key}
                    columnKey={column.key}
                    label={column.label}
                    sortConfig={sortConfig}
                    requestSort={requestSort}
                    className={`p-2 py-4 text-left text-sm text-gray-100 font-medium ${column.className}`}
                  />
                ))}
                <TableCell className='w-24 p-2 py-4 text-sm font-medium'>
                  Actions
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody>
              {currentItems.map((city) => (
                <TableRow key={city.id} className='hover:bg-gray-50'>
                  <TableCell className='p-2 py-4'>
                    <Checkbox
                      checked={selectedRows.includes(city.id)}
                      onChange={() => toggleSelectRow(city.id)}
                    />
                  </TableCell>

                  <TableCell className='p-2 py-4 text-sm text-gray-900'>
                    {city.name}
                  </TableCell>
                  <TableCell className='p-2 py-4 text-sm text-gray-900'>
                    {city.state}
                  </TableCell>
                  <TableCell className='p-2 py-4 text-sm text-gray-900'>
                    {city.country}
                  </TableCell>
                  <TableCell className='p-2 py-4'>
                    <div className='flex items-center gap-3'>
                      <Badge
                        size='sm'
                        color={city.status === 'Active' ? 'success' : 'error'}
                      >
                        {city.status === 'Active' ? (
                          <IoIosCheckmarkCircle />
                        ) : (
                          <IoIosCloseCircle />
                        )}
                      </Badge>
                      <Switch
                        label=''
                        checked={city.status === 'Active'}
                        onChange={() => toggleStatus(city.id)}
                      />
                    </div>
                  </TableCell>
                  <TableCell className='p-2 py-4'>
                    <div className='flex gap-2'>
                      <button
                        onClick={() => handleEdit(city)}
                        className='text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50'
                      >
                        <MdEdit className='w-5 h-5' />
                      </button>
                      <button
                        onClick={() => handleDelete(city.id)}
                        className='text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50'
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
      {isAddDialogOpen || editCity ? (
        <CityLocationForm
          city={editCity}
          onSubmit={editCity ? confirmEdit : confirmAddNew}
          onCancel={() => {
            setIsAddDialogOpen(false);
            setEditCity(null);
          }}
        />
      ) : null}

      {/* Delete Dialog */}
      <DeleteDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        itemLabel='City Location'
        description={
          selectedRows.length > 1
            ? `Are you sure you want to delete ${selectedRows.length} selected cities?`
            : 'Are you sure you want to delete this city?'
        }
      />
    </div>
  );
}
