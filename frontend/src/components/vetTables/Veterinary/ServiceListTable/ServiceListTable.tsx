import { MdEdit, MdDelete, MdAdd } from 'react-icons/md';
import { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from '../../../../components/ui/table';
import Badge from '../../../../components/ui/badge/Badge';
import Checkbox from '../../../../components/form/input/Checkbox';
import Pagination from '../../../tables/tableComponents/Pagination';
import useSort from '../../../../hooks/useSort';
import SortableTableHeader from '../../../tables/tableComponents/SortableTableHeader';
import { TableToolbar } from '../../../tables/tableComponents/TableToolbar';
import Switch from '../../../../components/form/switch/Switch';
import ServiceListForm, {
  ServiceFormData,
} from '../../../../pages/VetPageForms/ServiceListForm/ServiceListForm';
import DeleteDialog from '../../../tables/tableComponents/DeleteDailog';

export type ServiceStatus = 'Active' | 'Inactive';

export interface VetService {
  id: number;
  name: string;
  description: string;
  price: number;
  duration: number; // in minutes
  status: ServiceStatus;
}

// --- mock data ---
const mockServices: VetService[] = [
  {
    id: 1,
    name: 'Vaccination',
    description: 'Basic vaccine shot',
    price: 50,
    duration: 20,
    status: 'Active',
  },
  {
    id: 2,
    name: 'General Check-up',
    description: 'Routine health check',
    price: 40,
    duration: 30,
    status: 'Active',
  },
  {
    id: 3,
    name: 'Dental Cleaning',
    description: 'Teeth cleaning service',
    price: 120,
    duration: 60,
    status: 'Inactive',
  },
];

export default function ServiceListTable() {
  const [rows, setRows] = useState<VetService[]>(mockServices);
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [actionDropdown, setActionDropdown] = useState<string>('No actions');
  const [statusUpdate, setStatusUpdate] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [editRow, setEditRow] = useState<VetService | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<number | null>(null);

  const columns = [
    { key: 'name', label: 'Service', className: 'min-w-[160px]' },
    { key: 'description', label: 'Description', className: 'min-w-[220px]' },
    { key: 'price', label: 'Price ($)', className: 'min-w-[100px]' },
    { key: 'duration', label: 'Duration (min)', className: 'min-w-[120px]' },
    { key: 'status', label: 'Status', className: 'min-w-[120px]' },
  ] as const;

  // --- filters ---
  const filtered = useMemo(() => {
    return rows
      .filter((r) => (statusFilter ? r.status === statusFilter : true))
      .filter((r) =>
        [r.name, r.description]
          .join(' ')
          .toLowerCase()
          .includes(searchQuery.toLowerCase()),
      );
  }, [rows, statusFilter, searchQuery]);

  const { sortedData, requestSort, sortConfig } = useSort(filtered, {
    key: 'id',
    direction: 'asc',
  } as any);

  const indexOfLast = currentPage * itemsPerPage;
  const currentItems = (sortedData as VetService[]).slice(
    indexOfLast - itemsPerPage,
    indexOfLast,
  );

  // --- handlers ---
  const toggleSelectRow = (id: number) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };
  const toggleSelectAll = () => {
    setSelectedRows(
      selectedRows.length === rows.length ? [] : rows.map((r) => r.id),
    );
  };

  const handleApplyAction = () => {
    if (actionDropdown === 'Delete') {
      setIsDeleteDialogOpen(true);
    } else if (actionDropdown === 'Status' && statusUpdate) {
      setRows((prev) =>
        prev.map((r) =>
          selectedRows.includes(r.id)
            ? { ...r, status: statusUpdate as ServiceStatus }
            : r,
        ),
      );
      setSelectedRows([]);
    }
  };

  const handleDelete = (id?: number) => {
    setServiceToDelete(id ?? null);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    const updated = serviceToDelete
      ? rows.filter((r) => r.id !== serviceToDelete)
      : rows.filter((r) => !selectedRows.includes(r.id));
    setRows(updated);
    setSelectedRows([]);
    setServiceToDelete(null);
    setIsDeleteDialogOpen(false);
  };

  const handleAddNew = () => setIsAddDialogOpen(true);
  const handleEdit = (row: VetService) => setEditRow(row);

  const confirmAddNew = (data: ServiceFormData) => {
    const newRow: VetService = {
      id: rows.length ? Math.max(...rows.map((r) => r.id)) + 1 : 1,
      name: data.name,
      description: data.code,
      price: Number(data.default_fee),
      duration: Number(data.default_duration_minutes),
      status: data.status === 1 ? 'Active' : 'Inactive',
    };
    setRows([newRow, ...rows]);
    setIsAddDialogOpen(false);
  };

  const confirmEdit = (data: ServiceFormData) => {
    setRows((prev) =>
      prev.map((r) =>
        r.id === editRow?.id
          ? {
              ...r,
              name: data.name,
              description: data.code,
              price: Number(data.default_fee),
              duration: Number(data.default_duration_minutes),
              status: data.status === 1 ? 'Active' : 'Inactive',
            }
          : r,
      ),
    );
    setEditRow(null);
  };

  return (
    <div className='p-4 bg-white rounded-xl shadow-md'>
      <TableToolbar
        onAddNew={handleAddNew}
        addButtonLabel='New Service'
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
        searchPlaceholder='Search services…'
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

      {filtered.length === 0 ? (
        <div className='p-8 text-center text-gray-500'>No services found.</div>
      ) : (
        <div className='w-full overflow-x-auto rounded-lg border border-gray-200'>
          <div className='min-w-[900px]'>
            <Table className='w-full'>
              <TableHeader className='bg-gray-50'>
                <TableRow>
                  <TableCell className='w-10 p-2'>
                    <Checkbox
                      checked={selectedRows.length === rows.length}
                      onChange={toggleSelectAll}
                    />
                  </TableCell>
                  {columns.map((col) => (
                    <SortableTableHeader<VetService>
                      key={col.key}
                      columnKey={col.key as keyof VetService}
                      label={col.label}
                      sortConfig={sortConfig}
                      requestSort={requestSort}
                      className={`p-2 text-left ${col.className}`}
                    />
                  ))}
                  <TableCell className='p-2'>Actions</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentItems.map((r) => (
                  <TableRow key={r.id} className='hover:bg-gray-50'>
                    <TableCell className='p-2'>
                      <Checkbox
                        checked={selectedRows.includes(r.id)}
                        onChange={() => toggleSelectRow(r.id)}
                      />
                    </TableCell>
                    <TableCell className='p-2'>{r.name}</TableCell>
                    <TableCell className='p-2'>{r.description}</TableCell>
                    <TableCell className='p-2'>${r.price.toFixed(2)}</TableCell>
                    <TableCell className='p-2'>{r.duration} min</TableCell>
                    <TableCell className='p-2'>
                      <div className='flex items-center gap-2'>
                        <Badge
                          size='sm'
                          color={r.status === 'Active' ? 'success' : 'error'}
                        >
                          {r.status}
                        </Badge>
                        <Switch
                          label=''
                          checked={r.status === 'Active'}
                          onChange={() => {
                            setRows((prev) =>
                              prev.map((x) =>
                                x.id === r.id
                                  ? {
                                      ...x,
                                      status:
                                        x.status === 'Active'
                                          ? 'Inactive'
                                          : 'Active',
                                    }
                                  : x,
                              ),
                            );
                          }}
                        />
                      </div>
                    </TableCell>
                    <TableCell className='p-2'>
                      <button
                        onClick={() => handleEdit(r)}
                        className='text-blue-600 hover:text-blue-800 mr-2'
                      >
                        <MdEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(r.id)}
                        className='text-red-600 hover:text-red-800'
                      >
                        <MdDelete />
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      <Pagination
        totalItems={filtered.length}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={(n) => {
          setItemsPerPage(n);
          setCurrentPage(1);
        }}
      />

      {(isAddDialogOpen || editRow) && (
        <ServiceListForm
          service={
            editRow
              ? {
                  id: String(editRow.id),
                  code: editRow.description,
                  name: editRow.name,
                  slug: '',
                  default_duration_minutes: editRow.duration,
                  default_fee: editRow.price,
                  status: editRow.status === 'Active' ? 1 : 0,
                }
              : undefined
          }
          onSubmit={editRow ? confirmEdit : confirmAddNew}
          onCancel={() => {
            setIsAddDialogOpen(false);
            setEditRow(null);
          }}
        />
      )}

      <DeleteDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        itemLabel='service'
        description={
          serviceToDelete
            ? 'Are you sure you want to delete this service?'
            : `Are you sure you want to delete ${selectedRows.length} selected services?`
        }
      />
    </div>
  );
}
