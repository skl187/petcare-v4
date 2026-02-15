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
import StateLocationForm from '../../../pages/Forms/LocationForms/StateLocationForm';
import { StateLocationFormData } from '../../../pages/Forms/LocationForms/StateLocationForm';
import Pagination from '../tableComponents/Pagination';
import useSort from '../../../hooks/useSort';
import SortableTableHeader from '../tableComponents/SortableTableHeader';
import { TableToolbar } from '../tableComponents/TableToolbar';
import Switch from '../../form/switch/Switch';
import { IoIosCloseCircle, IoIosCheckmarkCircle } from 'react-icons/io';
import DeleteDialog from '../tableComponents/DeleteDailog';

export interface StateLocation {
  id: number;
  name: string;
  country: string;
  status: 'Active' | 'Inactive';
}

// Mock data for states
const mockStates: StateLocation[] = Array.from({ length: 50 }, (_, i) => ({
  id: i + 1,
  name: `State ${i + 1}`,
  country: 'United States',
  status: i % 3 !== 0 ? 'Active' : 'Inactive',
}));

export default function StateLocationTable() {
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [actionDropdown, setActionDropdown] = useState<string>('No actions');
  const [statusUpdate, setStatusUpdate] = useState<string>('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editState, setEditState] = useState<StateLocation | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [states, setStates] = useState<StateLocation[]>(mockStates);
  const [stateToDelete, setStateToDelete] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const columns = [
    {
      key: 'name',
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
  const filteredData = states
    .filter((state) =>
      state.name.toLowerCase().includes(searchQuery.toLowerCase()),
    )
    .filter((state) => (statusFilter ? state.status === statusFilter : true));

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
      selectedRows.length === states.length ? [] : states.map((row) => row.id),
    );
  };

  const handleApplyAction = () => {
    if (actionDropdown === 'Delete') {
      handleDelete();
    } else if (actionDropdown === 'Status' && statusUpdate) {
      const updatedStates = states.map((state) =>
        selectedRows.includes(state.id)
          ? { ...state, status: statusUpdate as 'Active' | 'Inactive' }
          : state,
      );
      setStates(updatedStates);
      setSelectedRows([]);
    }
  };

  const handleDelete = (id?: number) => {
    if (id) {
      setStateToDelete(id);
    } else {
      setStateToDelete(null);
    }
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    let updatedStates: StateLocation[];

    if (stateToDelete) {
      updatedStates = states.filter((state) => state.id !== stateToDelete);
    } else {
      updatedStates = states.filter(
        (state) => !selectedRows.includes(state.id),
      );
    }

    setStates(updatedStates);
    setIsDeleteDialogOpen(false);
    setSelectedRows([]);
    setStateToDelete(null);
  };

  const handleEdit = (state: StateLocation) => {
    setEditState(state);
  };

  const handleAddNew = () => {
    setIsAddDialogOpen(true);
  };

  const toggleStatus = (id: number) => {
    setStates((prev) =>
      prev.map((state) =>
        state.id === id
          ? {
              ...state,
              status: state.status === 'Active' ? 'Inactive' : 'Active',
            }
          : state,
      ),
    );
  };

  const confirmAddNew = (data: StateLocationFormData) => {
    const newState: StateLocation = {
      id: states.length + 1,
      name: data.name,
      country: 'United States',
      status: data.status,
    };
    setStates([...states, newState]);
    setIsAddDialogOpen(false);
  };

  const confirmEdit = (data: StateLocationFormData) => {
    const updatedStates = states.map((state) =>
      state.id === editState?.id
        ? {
            ...state,
            name: data.name,
            status: data.status,
          }
        : state,
    );
    setStates(updatedStates);
    setEditState(null);
  };

  return (
    <div className='p-4 bg-white rounded-xl shadow-md'>
      {/* Header Section */}
      <TableToolbar
        onAddNew={handleAddNew}
        addButtonLabel='Add State'
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
        searchPlaceholder='Search states...'
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
                    checked={selectedRows.length === states.length}
                    onChange={toggleSelectAll}
                  />
                </TableCell>
                {columns.map((column) => (
                  <SortableTableHeader<StateLocation>
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
              {currentItems.map((state) => (
                <TableRow key={state.id} className='hover:bg-gray-50'>
                  <TableCell className='p-2 py-4'>
                    <Checkbox
                      checked={selectedRows.includes(state.id)}
                      onChange={() => toggleSelectRow(state.id)}
                    />
                  </TableCell>

                  <TableCell className='p-2 py-4 text-sm text-gray-900'>
                    {state.name}
                  </TableCell>
                  <TableCell className='p-2 py-4 text-sm text-gray-900'>
                    {state.country}
                  </TableCell>
                  <TableCell className='p-2 py-4'>
                    <div className='flex items-center gap-3'>
                      <Badge
                        size='sm'
                        color={state.status === 'Active' ? 'success' : 'error'}
                      >
                        {state.status === 'Active' ? (
                          <IoIosCheckmarkCircle />
                        ) : (
                          <IoIosCloseCircle />
                        )}
                      </Badge>
                      <Switch
                        label=''
                        checked={state.status === 'Active'}
                        onChange={() => toggleStatus(state.id)}
                      />
                    </div>
                  </TableCell>
                  <TableCell className='p-2 py-4'>
                    <div className='flex gap-2'>
                      <button
                        onClick={() => handleEdit(state)}
                        className='text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50'
                      >
                        <MdEdit className='w-5 h-5' />
                      </button>
                      <button
                        onClick={() => handleDelete(state.id)}
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
      {isAddDialogOpen || editState ? (
        <StateLocationForm
          state={editState}
          onSubmit={editState ? confirmEdit : confirmAddNew}
          onCancel={() => {
            setIsAddDialogOpen(false);
            setEditState(null);
          }}
        />
      ) : null}

      {/* Delete Dialog */}
      {isDeleteDialogOpen && (
        <div className='fixed inset-0 flex items-center justify-center z-50'>
          <div className='bg-white rounded-lg p-6 max-w-md w-full border-b pb-8'>
            <h3 className='text-lg font-medium text-gray-900 mb-4'>
              Confirm Deletion
            </h3>
            <p className='text-sm text-gray-500 mb-6'>
              {stateToDelete
                ? 'Are you sure you want to delete this state?'
                : `Are you sure you want to delete ${selectedRows.length} selected states?`}
            </p>
            <div className='flex justify-end gap-3'>
              <button
                onClick={() => setIsDeleteDialogOpen(false)}
                className='px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50'
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className='px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700'
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
        itemLabel='state Location'
        description={
          selectedRows.length > 1
            ? `Are you sure you want to delete ${selectedRows.length} selected states?`
            : 'Are you sure you want to delete this state?'
        }
      />
    </div>
  );
}
