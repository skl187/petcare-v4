import { MdEdit, MdDelete, MdAdd } from 'react-icons/md';
import { useState, useCallback, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from '../../ui/table';
import Badge from '../../ui/badge/Badge';
import Checkbox from '../../form/input/Checkbox';
import PetCareCenterForm from '../../../adminPages/VetPageForms/PetCareCenterForm/PetCareCenterForm';
import Pagination from '../tableComponents/Pagination';
import useSort from '../../../hooks/useSort';
import SortableTableHeader from '../tableComponents/SortableTableHeader';
import { TableToolbar } from '../tableComponents/TableToolbar';
import DeleteDialog from '../tableComponents/DeleteDailog';
import Switch from '../../form/switch/Switch';
import { IoIosCloseCircle, IoIosCheckmarkCircle } from 'react-icons/io';
import { API_ENDPOINTS } from '../../../constants/api';

const API_BASE = API_ENDPOINTS.CLINICS.BASE;

export interface PetCareCenter {
  id: string;
  name: string;
  slug: string;
  contact_email: string;
  contact_number: string;
  status: number; // 1 = Active, 0 = Inactive
}

export default function PetCareCenterTable() {
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [actionDropdown, setActionDropdown] = useState<string>('No actions');
  const [statusUpdate, setStatusUpdate] = useState<string>('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editClinic, setEditClinic] = useState<PetCareCenter | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const [clinics, setClinics] = useState<PetCareCenter[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  const [clinicToDelete, setClinicToDelete] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const columns = [
    {
      key: 'name',
      label: 'Clinic Name',
      className: 'min-w-[150px] text-gray-700 font-semibold max-w-[200px]',
    },
    {
      key: 'contact_email',
      label: 'Email',
      className: 'min-w-[180px] text-gray-700 max-w-[250px]',
    },
    {
      key: 'contact_number',
      label: 'Phone',
      className: 'min-w-[120px] text-gray-700 max-w-[150px]',
    },
    {
      key: 'status',
      label: 'Status',
      className: 'min-w-[100px] max-w-[200px] text-gray-700 font-semibold',
    },
  ] as const;

  const getAuthToken = () => sessionStorage.getItem('token') || '';

  // Fetch Clinics
  const fetchClinics = useCallback(async () => {
    setIsLoadingData(true);
    setFetchError(null);
    try {
      const response = await fetch(API_BASE, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok)
        throw new Error(`Failed to fetch clinics: ${response.status}`);
      const result = await response.json();
      const list = Array.isArray(result.data?.data)
        ? result.data.data
        : Array.isArray(result.data)
          ? result.data
          : [];

      const items: PetCareCenter[] = list.map((it: any) => ({
        id: String(it.id),
        name: it.name ?? '',
        slug: it.slug ?? '',
        contact_email: it.contact_email ?? '',
        contact_number: it.contact_number ?? '',
        status: Number(it.status) ?? 1,
      }));

      setClinics(items);
    } catch (error: any) {
      console.error('Error fetching clinics:', error);
      setFetchError(error.message || 'Failed to load clinics');
    } finally {
      setIsLoadingData(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchClinics();
  }, [fetchClinics]);

  // Filtered data based on search and status
  const filteredData = clinics
    .filter(
      (clinic) =>
        clinic.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        clinic.contact_email.toLowerCase().includes(searchQuery.toLowerCase()),
    )
    .filter((clinic) => {
      if (!statusFilter) return true;
      const statusNum = statusFilter === 'Active' ? 1 : 0;
      return clinic.status === statusNum;
    });

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

  const toggleSelectRow = (id: string) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id],
    );
  };

  const toggleSelectAll = () => {
    setSelectedRows(
      selectedRows.length === clinics.length && clinics.length > 0
        ? []
        : clinics.map((row) => String(row.id)),
    );
  };

  const handleApplyAction = async () => {
    if (actionDropdown === 'Delete') {
      handleDelete();
    } else if (actionDropdown === 'Status' && statusUpdate) {
      const newStatus = statusUpdate === 'Active' ? 1 : 0;
      const updatedClinics = clinics.map((clinic) =>
        selectedRows.includes(clinic.id)
          ? { ...clinic, status: newStatus }
          : clinic,
      );
      setClinics(updatedClinics);
      setFetchError(null);

      try {
        const token = sessionStorage.getItem('token');
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        await Promise.all(
          selectedRows.map((id) =>
            fetch(`${API_BASE}/${id}`, {
              method: 'PUT',
              headers,
              body: JSON.stringify({ status: newStatus }),
            }),
          ),
        );

        setSuccessBanner(
          `${selectedRows.length} clinic(s) status updated successfully!`,
        );
        setTimeout(() => setSuccessBanner(null), 4000);
      } catch (err) {
        console.error('Failed to update status for selected rows', err);
        setFetchError('Failed to update status for selected rows');
        await fetchClinics();
      }

      setSelectedRows([]);
      setActionDropdown('No actions');
      setStatusUpdate('');
    }
  };

  const handleDelete = (id?: string) => {
    if (id) {
      setClinicToDelete(id);
    } else {
      setClinicToDelete(null);
    }
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    setIsDeleteDialogOpen(false);
    setIsLoadingData(true);
    setFetchError(null);
    try {
      const token = sessionStorage.getItem('token');
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      if (clinicToDelete) {
        const res = await fetch(`${API_BASE}/${clinicToDelete}`, {
          method: 'DELETE',
          headers,
        });

        const txt = await res.text();
        let parsed: any;
        try {
          parsed = txt ? JSON.parse(txt) : {};
        } catch {
          parsed = { message: txt || res.statusText };
        }

        if (!res.ok) {
          const errorMsg = parsed?.message || parsed?.error || res.statusText;
          throw new Error(errorMsg);
        }

        setSuccessBanner('Clinic deleted successfully!');
        setTimeout(() => setSuccessBanner(null), 4000);
      } else {
        // Delete multiple
        await Promise.all(
          selectedRows.map((id) =>
            fetch(`${API_BASE}/${id}`, {
              method: 'DELETE',
              headers,
            }),
          ),
        );
        setSuccessBanner(
          `${selectedRows.length} clinic(s) deleted successfully!`,
        );
        setTimeout(() => setSuccessBanner(null), 4000);
      }

      await fetchClinics();
      setSelectedRows([]);
      setActionDropdown('No actions');
    } catch (err: any) {
      console.error('Error deleting clinic:', err);
      setFetchError(err.message || 'Failed to delete clinic');
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleEdit = (clinic: PetCareCenter) => {
    setEditClinic(clinic);
    setIsAddDialogOpen(true);
  };

  const handleFormClose = () => {
    setEditClinic(null);
    setIsAddDialogOpen(false);
  };

  const handleFormSubmit = async () => {
    await fetchClinics();
    handleFormClose();
  };

  const toggleStatus = async (id: string) => {
    const current = clinics.find((c) => c.id === id);
    if (!current) return;
    const newStatus = current.status === 1 ? 0 : 1;

    // Optimistic update
    setClinics((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c)),
    );
    setFetchError(null);

    try {
      const token = sessionStorage.getItem('token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${API_BASE}/${id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        const txt = await res.text();
        let parsed: any;
        try {
          parsed = txt ? JSON.parse(txt) : {};
        } catch {
          parsed = { message: txt || res.statusText };
        }
        throw new Error(parsed?.message || parsed?.detail || res.statusText);
      }

      setSuccessBanner(
        `Status updated to ${newStatus === 1 ? 'Active' : 'Inactive'}`,
      );
      setTimeout(() => setSuccessBanner(null), 4000);
    } catch (err) {
      console.error('Failed to toggle status:', err);
      setFetchError('Failed to update status');
      // Revert optimistic update
      await fetchClinics();
    }
  };

  return (
    <div className='space-y-6'>
      {/* Error Banner */}
      {fetchError && (
        <div className='rounded-lg bg-red-50 p-4 text-red-800 border border-red-200'>
          <p className='font-semibold'>{fetchError}</p>
        </div>
      )}

      {/* Success Banner */}
      {successBanner && (
        <div className='rounded-lg bg-green-50 p-4 text-green-800 border border-green-200'>
          <p className='font-semibold'>{successBanner}</p>
        </div>
      )}

      {/* Table Toolbar */}
      <TableToolbar
        onAddNew={() => setIsAddDialogOpen(true)}
        addButtonLabel='Add Clinic'
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
        searchPlaceholder='Search by name or email...'
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
                    checked={
                      selectedRows.length === clinics.length &&
                      clinics.length > 0
                    }
                    onChange={toggleSelectAll}
                  />
                </TableCell>
                {columns.map((column) => (
                  <SortableTableHeader<PetCareCenter>
                    key={column.key}
                    columnKey={column.key}
                    label={column.label}
                    sortConfig={sortConfig}
                    requestSort={requestSort}
                    className={`p-2 py-3 text-left text-sm text-gray-900 font-medium ${column.className}`}
                  />
                ))}
                <TableCell className='w-24 p-2 py-3 text-sm font-medium'>
                  Actions
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody>
              {isLoadingData ? (
                <TableRow>
                  <td className='p-4 text-center' colSpan={columns.length + 2}>
                    Loading clinics...
                  </td>
                </TableRow>
              ) : clinics.length === 0 ? (
                <TableRow>
                  <td className='p-4 text-center' colSpan={columns.length + 2}>
                    No clinics found.
                  </td>
                </TableRow>
              ) : (
                currentItems.map((clinic) => (
                  <TableRow key={clinic.id} className='hover:bg-gray-50'>
                    <TableCell className='p-2 py-4'>
                      <Checkbox
                        checked={selectedRows.includes(clinic.id)}
                        onChange={() => toggleSelectRow(clinic.id)}
                      />
                    </TableCell>
                    <TableCell className='p-2 py-4'>
                      <span className='text-sm text-gray-900'>
                        {clinic.name}
                      </span>
                    </TableCell>
                    <TableCell className='p-2 py-4'>
                      <span className='text-sm text-gray-600'>
                        {clinic.contact_email}
                      </span>
                    </TableCell>
                    <TableCell className='p-2 py-4'>
                      <span className='text-sm text-gray-600'>
                        {clinic.contact_number}
                      </span>
                    </TableCell>
                    <TableCell className='p-2 py-4'>
                      <div className='flex items-center gap-3'>
                        <Badge
                          color={clinic.status === 1 ? 'success' : 'error'}
                          size='sm'
                        >
                          <div className='flex items-center gap-2'>
                            {clinic.status === 1 ? (
                              <IoIosCheckmarkCircle className='text-lg' />
                            ) : (
                              <IoIosCloseCircle className='text-lg' />
                            )}
                            {clinic.status === 1 ? 'Active' : 'Inactive'}
                          </div>
                        </Badge>
                        <Switch
                          label=''
                          checked={clinic.status === 1}
                          onChange={() => toggleStatus(clinic.id)}
                        />
                      </div>
                    </TableCell>
                    <TableCell className='p-2 py-4'>
                      <div className='flex gap-3'>
                        <button
                          onClick={() => handleEdit(clinic)}
                          className='text-blue-600 hover:text-blue-800 transition-colors p-2 rounded hover:bg-blue-50'
                          title='Edit'
                        >
                          <MdEdit size={20} />
                        </button>
                        <button
                          onClick={() => handleDelete(clinic.id)}
                          className='text-red-600 hover:text-red-800 transition-colors p-2 rounded hover:bg-red-50'
                          title='Delete'
                        >
                          <MdDelete size={20} />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {currentItems.length === 0 && (
            <div className='text-center py-8 text-gray-500'>
              {isLoadingData ? 'Loading clinics...' : 'No clinics found'}
            </div>
          )}
        </div>
      </div>

      {/* Pagination */}
      <Pagination
        totalItems={filteredData.length}
        itemsPerPage={itemsPerPage}
        onPageChange={handlePageChange}
        onItemsPerPageChange={handleItemsPerPageChange}
      />

      {/* Delete Dialog */}
      <DeleteDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        itemLabel='clinic'
        description={
          selectedRows.length > 1
            ? `Are you sure you want to delete ${selectedRows.length} selected clinics?`
            : 'Are you sure you want to delete this clinic?'
        }
      />

      {/* Form Dialog */}
      {isAddDialogOpen && (
        <PetCareCenterForm
          clinic={editClinic}
          onSubmit={handleFormSubmit}
          onCancel={handleFormClose}
        />
      )}
    </div>
  );
}
