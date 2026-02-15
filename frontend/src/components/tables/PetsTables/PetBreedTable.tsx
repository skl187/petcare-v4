import { MdEdit, MdDelete, MdAdd } from 'react-icons/md';
import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from '../../ui/table';
import Badge from '../../ui/badge/Badge';
import Checkbox from '../../form/input/Checkbox';
import PetBreedForm from '../../../pages/Forms/PetForms/PetBreedForm';
import Pagination from '../tableComponents/Pagination';
import useSort from '../../../hooks/useSort';
import SortableTableHeader from '../tableComponents/SortableTableHeader';
import { TableToolbar } from '../tableComponents/TableToolbar';
import Switch from '../../form/switch/Switch';
import { IoIosCloseCircle, IoIosCheckmarkCircle } from 'react-icons/io';
import DeleteDialog from '../tableComponents/DeleteDailog';
import { API_ENDPOINTS } from '../../../constants/api';

const API_BASE = API_ENDPOINTS.BREEDS.BASE;
const PET_TYPES_API = API_ENDPOINTS.PET_TYPES.BASE;

export interface PetBreed {
  id: string;
  name: string;
  petTypeId: string;
  petTypeName: string;
  description: string;
  status: number; // 1 = Active, 0 = Inactive
  slug?: string;
}

export interface PetTypeOption {
  id: string;
  name: string;
}

export default function PetBreedTable() {
  const [searchParams] = useSearchParams();
  const petTypeId = searchParams.get('type');

  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [actionDropdown, setActionDropdown] = useState<string>('No actions');
  const [statusUpdate, setStatusUpdate] = useState<string>('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editPetBreed, setEditPetBreed] = useState<PetBreed | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const [petBreeds, setPetBreeds] = useState<PetBreed[]>([]);
  const [petTypes, setPetTypes] = useState<PetTypeOption[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  const [petBreedToDelete, setPetBreedToDelete] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const columns = [
    {
      key: 'name',
      label: 'Breed Name',
      className: 'min-w-[150px] text-gray-700 font-semibold max-w-[200px]',
    },
    {
      key: 'petTypeName',
      label: 'Pet Type',
      className: 'min-w-[150px] text-gray-700 font-semibold max-w-[200px]',
    },
    {
      key: 'description',
      label: 'Description',
      className: 'min-w-[200px] text-gray-700 max-w-[300px]',
    },
    {
      key: 'status',
      label: 'Status',
      className: 'min-w-[100px] max-w-[200px] text-gray-700 font-semibold',
    },
  ] as const;

  // Filtered data - first filter by pet type if provided
  const breedsByType = petTypeId
    ? petBreeds.filter((breed) => breed.petTypeId === petTypeId)
    : petBreeds;

  // Then filter by search and status
  const filteredData = breedsByType
    .filter(
      (breed) =>
        breed.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        breed.petTypeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        breed.description.toLowerCase().includes(searchQuery.toLowerCase()),
    )
    .filter((breed) => {
      if (!statusFilter) return true;
      const statusNum = statusFilter === 'Active' ? 1 : 0;
      return breed.status === statusNum;
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
      selectedRows.length === breedsByType.length && breedsByType.length > 0
        ? []
        : breedsByType.map((row) => String(row.id)),
    );
  };

  const handleApplyAction = async () => {
    if (actionDropdown === 'Delete') {
      handleDelete();
    } else if (actionDropdown === 'Status' && statusUpdate) {
      const newStatus = statusUpdate === 'Active' ? 1 : 0;
      const updatedBreeds = petBreeds.map((breed) =>
        selectedRows.includes(breed.id)
          ? { ...breed, status: newStatus }
          : breed,
      );
      setPetBreeds(updatedBreeds);
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
          `${selectedRows.length} breed(s) status updated successfully!`,
        );
        setTimeout(() => setSuccessBanner(null), 4000);
      } catch (err) {
        console.error('Failed to update status for selected rows', err);
        setFetchError('Failed to update status for selected rows');
        await fetchPetBreeds();
      }

      setSelectedRows([]);
      setActionDropdown('No actions');
      setStatusUpdate('');
    }
  };

  const handleDelete = (id?: string) => {
    if (id) {
      setPetBreedToDelete(id);
    } else {
      setPetBreedToDelete(null);
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

      if (petBreedToDelete) {
        const res = await fetch(`${API_BASE}/${petBreedToDelete}`, {
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

      await fetchPetBreeds();
      setSelectedRows([]);
      setPetBreedToDelete(null);
      setSuccessBanner('Breed(s) deleted successfully!');
      setTimeout(() => setSuccessBanner(null), 4000);
    } catch (err) {
      console.error('Delete failed:', err);
      const errorMessage = err instanceof Error ? err.message : 'Delete failed';
      setFetchError(`Could not delete breed(s): ${errorMessage}`);
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleEdit = async (breed: PetBreed) => {
    try {
      setIsLoadingData(true);
      setFetchError(null);
      const token = sessionStorage.getItem('token');
      const headers: Record<string, string> = { Accept: 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${API_BASE}/${breed.id}`, { headers });
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
      const editData: PetBreed = {
        id: String(fetchedData.id),
        name: fetchedData.name ?? '',
        petTypeId: String(
          fetchedData.petTypeId || fetchedData.pet_type_id || '',
        ),
        petTypeName: fetchedData.petTypeName || fetchedData.pet_type_name || '',
        description: fetchedData.description ?? '',
        status: Number(fetchedData.status),
      };

      setEditPetBreed(editData);
      setIsAddDialogOpen(false);
    } catch (err) {
      console.error('Failed to fetch breed:', err);
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to fetch breed details';
      setFetchError(`Could not load breed details: ${errorMessage}`);
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleAddNew = () => {
    setIsAddDialogOpen(true);
    setEditPetBreed(null);
  };

  const toggleStatus = async (id: string) => {
    const current = petBreeds.find((p) => p.id === id);
    if (!current) return;
    const newStatus = current.status === 1 ? 0 : 1;

    setPetBreeds((prev) =>
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
      setPetBreeds((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status: current.status } : p)),
      );
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to update status';
      setFetchError(`Could not update status: ${errorMessage}`);
    }
  };

  // Fetch pet breeds from server
  const fetchPetBreeds = useCallback(async (signal?: AbortSignal) => {
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
          `Failed to fetch breeds (${res.status})`;
        throw new Error(msg);
      }

      const rawList =
        responseData?.data?.data ?? responseData?.data ?? responseData ?? [];
      const list = Array.isArray(rawList) ? rawList : [];

      const items: PetBreed[] = list.map((it: any) => ({
        id: String(it.id),
        name: it.name ?? '',
        petTypeId: String(it.pet_type_id || it.petTypeId || ''),
        petTypeName: it.pet_type || it.petTypeName || '',
        description: it.description ?? '',
        status: Number(it.status),
        slug: it.slug ?? '',
      }));

      setPetBreeds(items);
      setSelectedRows([]);
    } catch (err: any) {
      if (err?.name === 'AbortError') return;
      console.error('Failed to fetch breeds', err);
      setFetchError(
        err instanceof Error ? err.message : 'Failed to fetch breeds',
      );
    } finally {
      setIsLoadingData(false);
    }
  }, []);

  // Fetch pet types for dropdown
  const fetchPetTypes = useCallback(async () => {
    try {
      const token = sessionStorage.getItem('token');
      const headers: Record<string, string> = { Accept: 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(PET_TYPES_API, { headers });
      const txt = await res.text();
      let responseData: any;
      try {
        responseData = txt ? JSON.parse(txt) : {};
      } catch {
        responseData = { message: txt || res.statusText };
      }

      if (!res.ok) return;

      const rawList =
        responseData?.data?.data ?? responseData?.data ?? responseData ?? [];
      const list = Array.isArray(rawList) ? rawList : [];

      const types: PetTypeOption[] = list.map((it: any) => ({
        id: String(it.id),
        name: it.name ?? '',
      }));

      setPetTypes(types);
    } catch (err) {
      console.error('Failed to fetch pet types', err);
    }
  }, []);

  useEffect(() => {
    const ac = new AbortController();
    fetchPetBreeds(ac.signal);
    fetchPetTypes();
    return () => ac.abort();
  }, [fetchPetBreeds, fetchPetTypes]);

  const confirmAddNew = async () => {
    await fetchPetBreeds();
    setIsAddDialogOpen(false);
    setSuccessBanner('Breed created successfully!');
    setTimeout(() => setSuccessBanner(null), 4000);
  };

  const confirmEdit = async () => {
    await fetchPetBreeds();
    setEditPetBreed(null);
    setSuccessBanner('Breed updated successfully!');
    setTimeout(() => setSuccessBanner(null), 4000);
  };

  return (
    <div className='p-4 bg-white rounded-xl shadow-md'>
      {/* Header Section */}
      <TableToolbar
        onAddNew={handleAddNew}
        addButtonLabel='Add Breed'
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
        searchPlaceholder='Search breeds...'
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
                  onClick={() => fetchPetBreeds()}
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
                      selectedRows.length === filteredData.length &&
                      filteredData.length > 0
                    }
                    onChange={toggleSelectAll}
                  />
                </TableCell>
                {columns.map((column) => (
                  <SortableTableHeader<PetBreed>
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
                    Loading breeds...
                  </td>
                </TableRow>
              ) : currentItems.length === 0 ? (
                <TableRow>
                  <td className='p-4 text-center' colSpan={columns.length + 2}>
                    No breeds found.
                  </td>
                </TableRow>
              ) : (
                currentItems.map((breed) => (
                  <TableRow key={breed.id} className='hover:bg-gray-50'>
                    <TableCell className='p-2 py-4'>
                      <Checkbox
                        checked={selectedRows.includes(String(breed.id))}
                        onChange={() => toggleSelectRow(String(breed.id))}
                      />
                    </TableCell>
                    <TableCell className='p-2 py-4 text-sm text-gray-900'>
                      {breed.name}
                    </TableCell>
                    <TableCell className='p-2 py-4 text-sm text-gray-900'>
                      {breed.petTypeName}
                    </TableCell>
                    <TableCell className='p-2 py-4 text-sm text-gray-500'>
                      {breed.description}
                    </TableCell>
                    <TableCell className='p-2 py-4'>
                      <div className='flex items-center gap-3'>
                        <Badge
                          size='sm'
                          color={breed.status === 1 ? 'success' : 'error'}
                        >
                          {breed.status === 1 ? (
                            <IoIosCheckmarkCircle />
                          ) : (
                            <IoIosCloseCircle />
                          )}
                        </Badge>
                        <Switch
                          label=''
                          checked={breed.status === 1}
                          onChange={() => toggleStatus(breed.id)}
                        />
                      </div>
                    </TableCell>
                    <TableCell className='p-2 py-4'>
                      <div className='flex gap-2'>
                        <button
                          onClick={() => handleEdit(breed)}
                          className='text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50'
                        >
                          <MdEdit className='w-5 h-5' />
                        </button>
                        <button
                          onClick={() => handleDelete(String(breed.id))}
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
      {isAddDialogOpen || editPetBreed ? (
        <PetBreedForm
          petBreed={
            editPetBreed
              ? {
                  id: String(editPetBreed.id),
                  name: editPetBreed.name,
                  petTypeId: String(editPetBreed.petTypeId),
                  petTypeName: editPetBreed.petTypeName,
                  description: editPetBreed.description,
                  status: editPetBreed.status as 0 | 1,
                  slug: editPetBreed.slug,
                }
              : null
          }
          petTypes={petTypes}
          onSubmit={editPetBreed ? confirmEdit : confirmAddNew}
          onCancel={() => {
            setIsAddDialogOpen(false);
            setEditPetBreed(null);
          }}
        />
      ) : null}

      {/* Delete Dialog */}
      <DeleteDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        itemLabel='Pet Breed'
        description={
          selectedRows.length > 1
            ? `Are you sure you want to delete ${selectedRows.length} selected breeds?`
            : 'Are you sure you want to delete this breed?'
        }
      />
    </div>
  );
}
