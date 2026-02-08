import { MdEdit, MdDelete, MdAdd } from 'react-icons/md';
import { useState, useEffect, useCallback } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from '../../ui/table';
import Badge from '../../ui/badge/Badge';
import Checkbox from '../../form/input/Checkbox';
import PetTypeForm from '../../../pages/Forms/PetForms/PetTypeForm';
import Pagination from '../tableComponents/Pagination';
import useSort from '../../../hooks/useSort';
import SortableTableHeader from '../tableComponents/SortableTableHeader';
import { TableToolbar } from '../tableComponents/TableToolbar';
import ImageHoverPreview from '../tableComponents/ImageHoverPreview';
import DeleteDialog from '../tableComponents/DeleteDailog';
import Switch from '../../form/switch/Switch';
import { useNavigate } from 'react-router-dom';
import { IoIosCloseCircle, IoIosCheckmarkCircle } from 'react-icons/io';
import { API_ENDPOINTS } from '../../../constants/api';

const API_BASE = API_ENDPOINTS.PET_TYPES.BASE;

export interface PetType {
  id: string;
  name: string;
  image: string;
  breedCount: number;
  status: number; // 1 = Active, 0 = Inactive
}

export default function PetTypeTable() {
  const navigate = useNavigate();
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [actionDropdown, setActionDropdown] = useState<string>('No actions');
  const [statusUpdate, setStatusUpdate] = useState<string>('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editPetType, setEditPetType] = useState<PetType | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const [petTypes, setPetTypes] = useState<PetType[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  const [petTypeToDelete, setPetTypeToDelete] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const columns = [
    {
      key: 'id',
      label: 'ID',
      className: 'min-w-[80px] text-gray-700 font-semibold max-w-[105px]',
    },
    {
      key: 'name',
      label: 'Pet Type',
      className: 'min-w-[150px] text-gray-700 font-semibold max-w-[200px]',
    },
    {
      key: 'breedCount',
      label: 'Pet Breeds',
      className: 'min-w-[100px] text-gray-700 max-w-[150px]',
    },
    {
      key: 'status',
      label: 'Status',
      className: 'min-w-[100px] max-w-[200px] text-gray-700 font-semibold',
    },
  ] as const;

  // Filtered data based on search and status
  const filteredData = petTypes
    .filter((petType) =>
      petType.name.toLowerCase().includes(searchQuery.toLowerCase()),
    )
    .filter((petType) => {
      if (!statusFilter) return true;
      const statusNum = statusFilter === 'Active' ? 1 : 0;
      return petType.status === statusNum;
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
      selectedRows.length === petTypes.length && petTypes.length > 0
        ? []
        : petTypes.map((row) => String(row.id)),
    );
  };

  const handleApplyAction = async () => {
    if (actionDropdown === 'Delete') {
      handleDelete();
    } else if (actionDropdown === 'Status' && statusUpdate) {
      const newStatus = statusUpdate === 'Active' ? 1 : 0;
      // Optimistic UI update for bulk status change, then sync with server
      const updatedPetTypes = petTypes.map((petType) =>
        selectedRows.includes(petType.id)
          ? { ...petType, status: newStatus }
          : petType,
      );
      setPetTypes(updatedPetTypes);
      setFetchError(null);

      // attempt to persist changes
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
          `${selectedRows.length} pet type(s) status updated successfully!`,
        );
        setTimeout(() => setSuccessBanner(null), 4000);
      } catch (err) {
        console.error('Failed to update status for selected rows', err);
        setFetchError('Failed to update status for selected rows');
        // refresh server state
        await fetchPetTypes();
      }

      setSelectedRows([]);
      setActionDropdown('No actions');
      setStatusUpdate('');
    }
  };

  const handleDelete = (id?: string) => {
    if (id) {
      setPetTypeToDelete(id);
    } else {
      setPetTypeToDelete(null);
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

      if (petTypeToDelete) {
        const res = await fetch(`${API_BASE}/${petTypeToDelete}`, {
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

        if (!res.ok)
          throw new Error(parsed?.message || parsed?.detail || res.statusText);
      } else if (selectedRows.length > 0) {
        // sequential delete to handle errors per item
        for (const id of selectedRows) {
          const res = await fetch(`${API_BASE}/${id}`, {
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
          if (!res.ok)
            throw new Error(
              parsed?.message || parsed?.detail || res.statusText,
            );
        }
      }

      await fetchPetTypes();
      setSelectedRows([]);
      setPetTypeToDelete(null);
      setSuccessBanner('Pet type(s) deleted successfully!');
      setTimeout(() => setSuccessBanner(null), 4000);
    } catch (err) {
      console.error('Delete failed:', err);
      const errorMessage = err instanceof Error ? err.message : 'Delete failed';
      setFetchError(`Could not delete pet type(s): ${errorMessage}`);
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleEdit = async (petType: PetType) => {
    try {
      setIsLoadingData(true);
      setFetchError(null);
      const token = sessionStorage.getItem('token');
      const headers: Record<string, string> = { Accept: 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${API_BASE}/${petType.id}`, { headers });
      const txt = await res.text();
      let responseData: any;
      try {
        responseData = txt ? JSON.parse(txt) : {};
      } catch {
        responseData = { message: txt || res.statusText };
      }

      if (!res.ok) {
        const msg =
          responseData?.message ||
          responseData?.error ||
          responseData?.detail ||
          `HTTP ${res.status}: ${res.statusText}`;
        throw new Error(msg);
      }

      const fetchedData = responseData?.data ?? responseData;
      const editData: PetType = {
        id: String(fetchedData.id),
        name: fetchedData.name ?? '',
        image: fetchedData.image ?? '',
        breedCount: fetchedData.breedCount ?? fetchedData.breed_count ?? 0,
        status: Number(fetchedData.status),
      };

      setEditPetType(editData);
      setIsAddDialogOpen(false);
    } catch (err) {
      console.error('Failed to fetch pet type:', err);
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch pet type details';
      setFetchError(`Could not load pet type details: ${errorMessage}`);
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleAddNew = () => {
    setIsAddDialogOpen(true);
    setEditPetType(null);
  };

  const toggleStatus = async (id: string) => {
    const current = petTypes.find((p) => p.id === id);
    if (!current) return;
    const newStatus = current.status === 1 ? 0 : 1;

    // optimistic update
    setPetTypes((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: newStatus } : p)),
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
      // revert on error
      setPetTypes((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status: current.status } : p)),
      );
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to update status';
      setFetchError(`Could not update status: ${errorMessage}`);
    }
  };

  // Fetch pet types from server
  const fetchPetTypes = useCallback(async (signal?: AbortSignal) => {
    setIsLoadingData(true);
    setFetchError(null);
    try {
      const token = sessionStorage.getItem('token');
      const headers: Record<string, string> = { Accept: 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(API_BASE, { headers, signal });
      const txt = await res.text();
      let responseData: any;
      try {
        responseData = txt ? JSON.parse(txt) : {};
      } catch {
        responseData = { message: txt || res.statusText };
      }

      if (!res.ok) {
        const msg =
          responseData?.message ||
          responseData?.error ||
          res.statusText ||
          `Failed to fetch pet types (${res.status})`;
        throw new Error(msg);
      }

      // API response shape: { data: { data: [ ... ], page, limit } }
      const rawList =
        responseData?.data?.data ?? responseData?.data ?? responseData ?? [];
      const list = Array.isArray(rawList) ? rawList : [];

      const items: PetType[] = list.map((it: any) => ({
        id: String(it.id),
        name: it.name ?? '',
        image:
          it.image ?? `/images/pets/${(it.name ?? 'pet').toLowerCase()}.jpg`,
        breedCount: it.breedCount ?? it.breed_count ?? 0,
        status: Number(it.status), // Ensure status is a number
      }));

      setPetTypes(items);
      setSelectedRows([]);

      // keep pagination in sync if backend returns it
      const meta = responseData?.data;
      if (meta && typeof meta === 'object') {
        if (meta.page) setCurrentPage(Number(meta.page));
        if (meta.limit) setItemsPerPage(Number(meta.limit));
      }
    } catch (err: any) {
      if (err?.name === 'AbortError') return;
      console.error('Failed to fetch pet types', err);
      setFetchError(
        err instanceof Error ? err.message : 'Failed to fetch pet types',
      );
    } finally {
      setIsLoadingData(false);
    }
  }, []);

  useEffect(() => {
    const ac = new AbortController();
    fetchPetTypes(ac.signal);
    return () => ac.abort();
  }, [fetchPetTypes]);

  const confirmAddNew = async () => {
    await fetchPetTypes();
    setIsAddDialogOpen(false);
    setSuccessBanner('Pet type created successfully!');
    setTimeout(() => setSuccessBanner(null), 4000);
  };

  const confirmEdit = async () => {
    await fetchPetTypes();
    setEditPetType(null);
    setSuccessBanner('Pet type updated successfully!');
    setTimeout(() => setSuccessBanner(null), 4000);
  };

  const handleBreedCountClick = (petTypeId: string) => {
    navigate(`/petBreed?type=${petTypeId}`);
  };

  return (
    <div className='p-4 bg-white rounded-xl shadow-md'>
      {/* Header Section */}
      <TableToolbar
        onAddNew={handleAddNew}
        addButtonLabel='Add Pet Type'
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
        searchPlaceholder='Search pet types...'
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

      {/* Error Banner */}
      {fetchError && (
        <div className='mt-3 mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200'>
          <div className='flex items-start gap-3'>
            <div className='flex-shrink-0 pt-0.5'>
              <svg
                className='w-5 h-5 text-red-600'
                viewBox='0 0 20 20'
                fill='currentColor'
              >
                <path
                  fillRule='evenodd'
                  d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z'
                  clipRule='evenodd'
                />
              </svg>
            </div>
            <div className='flex-1'>
              <p className='text-red-700 text-sm font-medium'>{fetchError}</p>
              <div className='flex gap-2 mt-2'>
                <button
                  onClick={() => fetchPetTypes()}
                  className='text-sm font-medium text-red-700 hover:text-red-800 underline'
                >
                  Retry
                </button>
                <button
                  onClick={() => setFetchError(null)}
                  className='text-sm font-medium text-red-700 hover:text-red-800 underline'
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Banner */}
      {successBanner && (
        <div className='mt-3 mb-4 px-4 py-3 rounded-lg bg-green-50 border border-green-200'>
          <div className='flex items-start gap-3'>
            <div className='flex-shrink-0 pt-0.5'>
              <svg
                className='w-5 h-5 text-green-600'
                viewBox='0 0 20 20'
                fill='currentColor'
              >
                <path
                  fillRule='evenodd'
                  d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
                  clipRule='evenodd'
                />
              </svg>
            </div>
            <div className='flex-1'>
              <p className='text-green-700 text-sm font-medium'>
                {successBanner}
              </p>
            </div>
            <button
              onClick={() => setSuccessBanner(null)}
              className='flex-shrink-0 text-green-700 hover:text-green-800'
            >
              <svg className='w-5 h-5' viewBox='0 0 20 20' fill='currentColor'>
                <path
                  fillRule='evenodd'
                  d='M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z'
                  clipRule='evenodd'
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className='w-full overflow-x-auto rounded-lg border border-gray-200'>
        <div className='min-w-[800px]'>
          <Table className='w-full'>
            <TableHeader className='bg-gray-50'>
              <TableRow>
                <TableCell className='w-10 p-2 py-3'>
                  <Checkbox
                    checked={
                      selectedRows.length === petTypes.length &&
                      petTypes.length > 0
                    }
                    onChange={toggleSelectAll}
                  />
                </TableCell>
                {columns.map((column) => (
                  <SortableTableHeader<PetType>
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
              {isLoadingData ? (
                <TableRow>
                  <td className='p-4 text-center' colSpan={columns.length + 2}>
                    Loading pet types...
                  </td>
                </TableRow>
              ) : petTypes.length === 0 ? (
                <TableRow>
                  <td className='p-4 text-center' colSpan={columns.length + 2}>
                    No pet types found.
                  </td>
                </TableRow>
              ) : (
                currentItems.map((petType) => (
                  <TableRow key={petType.id} className='hover:bg-gray-50'>
                    <TableCell className='p-2 py-4'>
                      <Checkbox
                        checked={selectedRows.includes(String(petType.id))}
                        onChange={() => toggleSelectRow(String(petType.id))}
                      />
                    </TableCell>
                    <TableCell className='p-2 py-4 text-sm text-gray-900 font-medium'>
                      #{petType.id}
                    </TableCell>
                    <TableCell className='p-2 py-4'>
                      <div className='flex items-center gap-3'>
                        <ImageHoverPreview
                          src={petType.image}
                          alt={petType.name}
                          className='w-10 h-10 rounded-full object-cover'
                        />
                        <span className='text-sm text-gray-900'>
                          {petType.name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className='p-2 py-4'>
                      <button
                        onClick={() =>
                          handleBreedCountClick(String(petType.id))
                        }
                        className='text-blue-600 hover:text-blue-800 font-medium'
                      >
                        {petType.breedCount}
                      </button>
                    </TableCell>
                    <TableCell className='p-2 py-4'>
                      <div className='flex items-center gap-3'>
                        <Badge
                          size='sm'
                          color={petType.status === 1 ? 'success' : 'error'}
                        >
                          {petType.status === 1 ? (
                            <IoIosCheckmarkCircle />
                          ) : (
                            <IoIosCloseCircle />
                          )}
                        </Badge>
                        <Switch
                          label=''
                          checked={petType.status === 1}
                          onChange={() => toggleStatus(petType.id)}
                        />
                      </div>
                    </TableCell>
                    <TableCell className='p-2 py-4'>
                      <div className='flex gap-2'>
                        <button
                          onClick={() => handleEdit(petType)}
                          className='text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50'
                        >
                          <MdEdit className='w-5 h-5' />
                        </button>
                        <button
                          onClick={() => handleDelete(String(petType.id))}
                          className='text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50'
                        >
                          <MdDelete className='w-5 h-5' />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
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
      {isAddDialogOpen || editPetType ? (
        <PetTypeForm
          petType={
            editPetType
              ? {
                  id: String(editPetType.id),
                  name: editPetType.name,
                  status: editPetType.status as 0 | 1,
                  slug: editPetType.name,
                  image: editPetType.image,
                }
              : null
          }
          onSubmit={editPetType ? confirmEdit : confirmAddNew}
          onCancel={() => {
            setIsAddDialogOpen(false);
            setEditPetType(null);
          }}
        />
      ) : null}

      {/* Delete Dialog */}
      <DeleteDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        itemLabel='pet type'
        description={
          selectedRows.length > 1
            ? `Are you sure you want to delete ${selectedRows.length} selected pet types?`
            : 'Are you sure you want to delete this pet type?'
        }
      />
    </div>
  );
}
