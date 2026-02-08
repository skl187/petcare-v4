import { MdEdit, MdDelete, MdAdd } from 'react-icons/md';
import { useState, useEffect, useCallback } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from '../../../components/ui/table';
import Badge from '../../../components/ui/badge/Badge';
import Checkbox from '../../../components/form/input/Checkbox';
import MyPetForm from '../../../pages/OwnerPageForms/MyPetsForm/MyPetsForm';
import Pagination from '../../tables/tableComponents/Pagination';
import { IoIosCloseCircle, IoIosCheckmarkCircle } from 'react-icons/io';
import Switch from '../../form/switch/Switch';
import { API_ENDPOINTS } from '../../../constants/api';

const API_BASE = API_ENDPOINTS.PETS.BASE;
const PET_TYPES_API = API_ENDPOINTS.PET_TYPES.BASE;
const BREEDS_API = API_ENDPOINTS.BREEDS.BASE;

export interface PetType {
  id: string;
  name: string;
}

export interface Breed {
  id: string;
  name: string;
  petTypeId: string;
}

export interface Pet {
  id: string;
  name: string;
  slug?: string;
  petTypeId: string;
  petTypeName?: string;
  breedId: string;
  breedName?: string;
  size: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  weight: number;
  height: number;
  weightUnit: 'kg' | 'lb';
  heightUnit: 'cm' | 'inch';
  additionalInfo?: {
    notes?: string;
  };
  status: number;
  image?: string;
}

const MyPetsTable = () => {
  // State
  const [pets, setPets] = useState<Pet[]>([]);
  const [petTypes, setPetTypes] = useState<PetType[]>([]);
  const [breeds, setBreeds] = useState<Breed[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 0 | 1>('all');
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editPet, setEditPet] = useState<Pet | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [petToDelete, setPetToDelete] = useState<Pet | null>(null);
  const [fetchError, setFetchError] = useState('');
  const [successBanner, setSuccessBanner] = useState('');

  // Get auth token
  const getAuthToken = () => sessionStorage.getItem('token') || '';

  // Fetch PetTypes
  const fetchPetTypes = useCallback(async () => {
    try {
      const response = await fetch(PET_TYPES_API, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok)
        throw new Error(`Failed to fetch pet types: ${response.status}`);
      const result = await response.json();
      const list = Array.isArray(result.data?.data)
        ? result.data.data
        : Array.isArray(result.data)
          ? result.data
          : [];
      setPetTypes(
        list.map((it: any) => ({
          id: String(it.id),
          name: it.name ?? '',
        })),
      );
    } catch (error) {
      console.error('Error fetching pet types:', error);
    }
  }, []);

  // Fetch Breeds
  const fetchBreeds = useCallback(async () => {
    try {
      const response = await fetch(BREEDS_API, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok)
        throw new Error(`Failed to fetch breeds: ${response.status}`);
      const result = await response.json();

      const rawList = result?.data?.data ?? result?.data ?? result ?? [];
      const list = Array.isArray(rawList) ? rawList : [];

      const processedBreeds = list.map((it: any) => ({
        id: String(it.id || it.ID || ''),
        name: it.name || it.breed || it.breedName || '',
        petTypeId: String(
          it.pet_type_id || it.petTypeId || it.pet_type || it.petType || '',
        ),
      }));

      console.log(`Fetched ${processedBreeds.length} breeds:`, processedBreeds);
      setBreeds(processedBreeds);
    } catch (error) {
      console.error('Error fetching breeds:', error);
    }
  }, []);

  // Fetch Pets
  const fetchPets = useCallback(async () => {
    setIsLoadingData(true);
    setFetchError('');
    try {
      const response = await fetch(API_BASE, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok)
        throw new Error(`Failed to fetch pets: ${response.status}`);
      const result = await response.json();
      const list = Array.isArray(result.data?.data)
        ? result.data.data
        : Array.isArray(result.data)
          ? result.data
          : [];

      const items: Pet[] = list.map((it: any) => {
        // Map pet_type name to petTypeId by looking up in petTypes array
        const petTypeName = it.pet_type ?? it.petTypeName ?? '';
        const petTypeObj = petTypes.find(
          (pt) => pt.name.toLowerCase() === petTypeName.toLowerCase(),
        );
        const petTypeId =
          petTypeObj?.id || it.petTypeId || it.pet_type_id || '';

        // Map breed name to breedId by looking up in breeds array
        const breedName = it.breed ?? it.breedName ?? '';
        const breedObj = breeds.find(
          (b) => b.name.toLowerCase() === breedName.toLowerCase(),
        );
        const breedId = breedObj?.id || it.breedId || it.breed_id || '';

        // Format date of birth to YYYY-MM-DD
        const dateOfBirth = it.date_of_birth || it.dateOfBirth || '';
        let formattedDate = '';
        if (dateOfBirth) {
          try {
            const date = new Date(dateOfBirth);
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            formattedDate = `${year}-${month}-${day}`;
          } catch (e) {
            formattedDate = dateOfBirth;
          }
        }

        return {
          id: String(it.id),
          name: it.name ?? '',
          slug: it.slug ?? '',
          petTypeId,
          petTypeName,
          breedId,
          breedName,
          size: it.size ?? '',
          dateOfBirth: formattedDate,
          gender: it.gender ?? 'male',
          weight: Number(it.weight) || 0,
          height: Number(it.height) || 0,
          weightUnit: it.weightUnit ?? 'kg',
          heightUnit: it.heightUnit ?? 'cm',
          additionalInfo: it.additionalInfo || { notes: '' },
          status: Number(it.status) ?? 1,
        };
      });

      setPets(items);
    } catch (error: any) {
      console.error('Error fetching pets:', error);
      setFetchError(error.message || 'Failed to load pets');
    } finally {
      setIsLoadingData(false);
    }
  }, [petTypes, breeds]);

  // Initial load - fetch petTypes and breeds first, then pets
  useEffect(() => {
    const initializeData = async () => {
      await fetchPetTypes();
      await fetchBreeds();
    };
    initializeData();
  }, [fetchPetTypes, fetchBreeds]);

  // Fetch pets when petTypes and breeds are loaded
  useEffect(() => {
    if (petTypes.length > 0 && breeds.length > 0) {
      fetchPets();
    }
  }, [petTypes, breeds, fetchPets]);

  // Filter and Sort
  const filtered = pets.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.petTypeName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.breedName?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const sorted = [...filtered];

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const paginatedPets = sorted.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  // Handle Edit - just set the pet for editing, form will fetch it
  const handleEdit = (pet: Pet) => {
    setEditPet(pet);
    setShowForm(true);
  };

  // Toggle Status (status updates via bulk operation or inline toggle)

  // Bulk Delete
  const confirmDelete = async () => {
    if (!petToDelete && selectedRows.length === 0) return;
    try {
      if (selectedRows.length > 0) {
        // Bulk delete
        for (const id of selectedRows) {
          await fetch(`${API_BASE}/${id}`, {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${getAuthToken()}`,
              'Content-Type': 'application/json',
            },
          });
        }
        setPets((prev) => prev.filter((p) => !selectedRows.includes(p.id)));
        setSelectedRows([]);
      } else if (petToDelete) {
        // Single delete
        const response = await fetch(`${API_BASE}/${petToDelete.id}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
            'Content-Type': 'application/json',
          },
        });
        if (!response.ok)
          throw new Error(`Failed to delete: ${response.status}`);
        setPets((prev) => prev.filter((p) => p.id !== petToDelete.id));
      }
      setSuccessBanner('Pet(s) deleted successfully');
      setTimeout(() => setSuccessBanner(''), 5000);
    } catch (error: any) {
      setFetchError(error.message || 'Failed to delete');
    } finally {
      setShowDeleteDialog(false);
      setPetToDelete(null);
    }
  };

  // Toggle Row Select
  const toggleRowSelect = (id: string) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  // Toggle Select All
  const toggleSelectAll = () => {
    if (selectedRows.length === paginatedPets.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(paginatedPets.map((p) => p.id));
    }
  };
  // Handle Form Submit
  const handleFormSubmit = async () => {
    // Form handles API call, just refresh the pets list
    await fetchPets();
  };

  const handleAddNew = () => {
    setShowForm(true);
    setEditPet(null);
  };

  // Handle Bulk Status Update
  const handleBulkStatusUpdate = async (newStatus: 0 | 1) => {
    try {
      for (const id of selectedRows) {
        const response = await fetch(`${API_BASE}/${id}`, {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: newStatus }),
        });
        if (!response.ok)
          throw new Error(`Failed to update pet: ${response.status}`);
      }
      setPets((prev) =>
        prev.map((p) =>
          selectedRows.includes(p.id) ? { ...p, status: newStatus } : p,
        ),
      );
      setSelectedRows([]);
      setSuccessBanner(
        `${selectedRows.length} pet(s) status updated successfully`,
      );
      setTimeout(() => setSuccessBanner(''), 4000);
    } catch (error: any) {
      setFetchError(error.message || 'Failed to update pet status');
    }
  };

  return (
    <div className='p-4 bg-white rounded-xl shadow-md'>
      {/* Toolbar */}
      <div className='flex items-center gap-3 mb-4 flex-wrap'>
        <button
          onClick={handleAddNew}
          className='px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-sm flex items-center gap-2'
        >
          <MdAdd size={18} />
          Add Pet
        </button>
        <div className='flex-1 min-w-[250px]'>
          <input
            type='text'
            placeholder='Search pets by name, type, or breed...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className='w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className='px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
        >
          <option value='all'>All Status</option>
          <option value={1}>Active</option>
          <option value={0}>Inactive</option>
        </select>
      </div>

      {/* Bulk Actions */}
      {selectedRows.length > 0 && (
        <div className='mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-3'>
          <span className='text-sm font-medium text-blue-900'>
            {selectedRows.length} pet(s) selected
          </span>
          <div className='flex gap-2'>
            <button
              onClick={() => handleBulkStatusUpdate(1)}
              className='px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700'
            >
              Mark Active
            </button>
            <button
              onClick={() => handleBulkStatusUpdate(0)}
              className='px-3 py-1 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700'
            >
              Mark Inactive
            </button>
            <button
              onClick={() => {
                setPetToDelete(null);
                setShowDeleteDialog(true);
              }}
              className='px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700'
            >
              Delete
            </button>
          </div>
        </div>
      )}

      {/* Error Banner */}
      {fetchError && (
        <div className='mt-3 mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200'>
          <div className='flex items-start gap-3'>
            <div className='flex-shrink-0 pt-0.5'>
              <IoIosCloseCircle className='w-5 h-5 text-red-600' />
            </div>
            <div className='flex-1'>
              <p className='text-red-700 text-sm font-medium'>{fetchError}</p>
              <div className='flex gap-2 mt-2'>
                <button
                  onClick={() => fetchPets()}
                  className='text-sm font-medium text-red-700 hover:text-red-800 underline'
                >
                  Retry
                </button>
                <button
                  onClick={() => setFetchError('')}
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
              <IoIosCheckmarkCircle className='w-5 h-5 text-green-600' />
            </div>
            <div className='flex-1'>
              <p className='text-green-700 text-sm font-medium'>
                {successBanner}
              </p>
            </div>
            <button
              onClick={() => setSuccessBanner('')}
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
        <div className='min-w-[1000px]'>
          <Table className='w-full'>
            <TableHeader className='bg-gray-50'>
              <TableRow>
                <TableCell className='w-10 p-2 py-3'>
                  <Checkbox
                    checked={
                      selectedRows.length === paginatedPets.length &&
                      paginatedPets.length > 0
                    }
                    onChange={toggleSelectAll}
                  />
                </TableCell>
                <TableCell className='p-2 py-4 text-left text-sm text-gray-700 font-medium min-w-[80px]'>
                  ID
                </TableCell>
                <TableCell className='p-2 py-4 text-left text-sm text-gray-700 font-medium min-w-[150px]'>
                  Pet Name
                </TableCell>
                <TableCell className='p-2 py-4 text-left text-sm text-gray-700 font-medium min-w-[120px]'>
                  Pet Type
                </TableCell>
                <TableCell className='p-2 py-4 text-left text-sm text-gray-700 font-medium min-w-[120px]'>
                  Breed
                </TableCell>
                <TableCell className='p-2 py-4 text-left text-sm text-gray-700 font-medium min-w-[100px]'>
                  Gender
                </TableCell>
                <TableCell className='p-2 py-4 text-left text-sm text-gray-700 font-medium min-w-[100px]'>
                  Weight
                </TableCell>
                <TableCell className='p-2 py-4 text-left text-sm text-gray-700 font-medium min-w-[140px]'>
                  Status
                </TableCell>
                <TableCell className='p-2 py-4 text-right text-sm font-medium min-w-[100px]'>
                  Actions
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody>
              {isLoadingData ? (
                <TableRow>
                  <td className='p-4 text-center' colSpan={9}>
                    Loading pets...
                  </td>
                </TableRow>
              ) : paginatedPets.length === 0 ? (
                <TableRow>
                  <td className='p-4 text-center' colSpan={9}>
                    No pets found.
                  </td>
                </TableRow>
              ) : (
                paginatedPets.map((pet) => (
                  <TableRow key={pet.id} className='hover:bg-gray-50'>
                    <TableCell className='p-2 py-4'>
                      <Checkbox
                        checked={selectedRows.includes(pet.id)}
                        onChange={() => toggleRowSelect(pet.id)}
                      />
                    </TableCell>
                    <TableCell className='p-2 py-4 text-sm text-gray-900 font-medium'>
                      #{pet.id}
                    </TableCell>
                    <TableCell className='p-2 py-4 text-sm text-gray-900 font-medium'>
                      {pet.name}
                    </TableCell>
                    <TableCell className='p-2 py-4 text-sm text-gray-700'>
                      {pet.petTypeName || '-'}
                    </TableCell>
                    <TableCell className='p-2 py-4 text-sm text-gray-700'>
                      {pet.breedName || '-'}
                    </TableCell>
                    <TableCell className='p-2 py-4 text-sm text-gray-700 capitalize'>
                      {pet.gender}
                    </TableCell>
                    <TableCell className='p-2 py-4 text-sm text-gray-700'>
                      {pet.weight} {pet.weightUnit}
                    </TableCell>
                    <TableCell className='p-2 py-4'>
                      <div className='flex items-center gap-3'>
                        <Badge
                          size='sm'
                          color={pet.status === 1 ? 'success' : 'error'}
                        >
                          {pet.status === 1 ? (
                            <IoIosCheckmarkCircle />
                          ) : (
                            <IoIosCloseCircle />
                          )}
                        </Badge>
                        <Switch
                          label=''
                          checked={pet.status === 1}
                          onChange={() => {
                            const newStatus = pet.status === 1 ? 0 : 1;
                            setPets((prev) =>
                              prev.map((p) =>
                                p.id === pet.id
                                  ? { ...p, status: newStatus }
                                  : p,
                              ),
                            );
                            // API call
                            fetch(API_ENDPOINTS.PETS.DETAIL(pet.id), {
                              method: 'PUT',
                              headers: {
                                Authorization: `Bearer ${getAuthToken()}`,
                                'Content-Type': 'application/json',
                              },
                              body: JSON.stringify({ status: newStatus }),
                            }).catch(() => {
                              setFetchError('Failed to update status');
                              setPets((prev) =>
                                prev.map((p) =>
                                  p.id === pet.id
                                    ? { ...p, status: pet.status }
                                    : p,
                                ),
                              );
                            });
                          }}
                        />
                      </div>
                    </TableCell>
                    <TableCell className='p-2 py-4'>
                      <div className='flex gap-2 justify-end'>
                        <button
                          onClick={() => handleEdit(pet)}
                          className='text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50'
                          title='Edit'
                        >
                          <MdEdit className='w-5 h-5' />
                        </button>
                        <button
                          onClick={() => {
                            setPetToDelete(pet);
                            setShowDeleteDialog(true);
                          }}
                          className='text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50'
                          title='Delete'
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
        totalItems={sorted.length}
        itemsPerPage={itemsPerPage}
        onPageChange={handlePageChange}
        onItemsPerPageChange={handleItemsPerPageChange}
      />

      {/* Form Modal */}
      {showForm && (
        <MyPetForm
          pet={editPet as any}
          petTypes={petTypes}
          breeds={breeds}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditPet(null);
          }}
        />
      )}

      {/* Delete Dialog */}
      {showDeleteDialog && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'>
          <div className='bg-white rounded-lg p-6 max-w-sm w-full mx-4 shadow-lg'>
            <h3 className='text-lg font-semibold text-gray-900 mb-2'>
              {selectedRows.length > 0
                ? `Delete ${selectedRows.length} pet(s)?`
                : 'Delete pet?'}
            </h3>
            <p className='text-gray-600 text-sm mb-6'>
              This action cannot be undone.
            </p>
            <div className='flex justify-end gap-3'>
              <button
                onClick={() => {
                  setShowDeleteDialog(false);
                  setPetToDelete(null);
                }}
                className='px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium'
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className='px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium'
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyPetsTable;
