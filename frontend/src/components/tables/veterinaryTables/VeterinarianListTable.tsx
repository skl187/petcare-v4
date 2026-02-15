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
import VetListForm from '../../../pages/Forms/VetForms/VetListForm';
import Pagination from '../tableComponents/Pagination';
import Switch from '../../form/switch/Switch';
import { IoIosCloseCircle, IoIosCheckmarkCircle } from 'react-icons/io';
import DeleteDialog from '../tableComponents/DeleteDailog';
import { API_ENDPOINTS } from '../../../constants/api';

const VETERINARIANS_API = API_ENDPOINTS.VETERINARIANS.BASE;
const CLINICS_API = API_ENDPOINTS.CLINICS.BASE;
const VET_SERVICES_API = API_ENDPOINTS.VET_SERVICES.BASE;

export interface Clinic {
  id: string;
  name: string;
}

export interface VetService {
  id: string;
  name: string;
}

export interface Veterinarian {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  license_number: string;
  vet_clinic_id: string;
  vet_service_ids: string[];
  status: number;
  clinic_name?: string;
  service_names?: string[];
}

export default function VeterinarianListTable() {
  // State
  const [veterinarians, setVeterinarians] = useState<Veterinarian[]>([]);
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [vetServices, setVetServices] = useState<VetService[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 0 | 1>('all');
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editVeterinarian, setEditVeterinarian] = useState<Veterinarian | null>(
    null,
  );
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [vetToDelete, setVetToDelete] = useState<Veterinarian | null>(null);
  const [fetchError, setFetchError] = useState('');
  const [successBanner, setSuccessBanner] = useState('');

  // Get auth token
  const getAuthToken = () => sessionStorage.getItem('token') || '';

  // Fetch Clinics
  const fetchClinics = useCallback(async () => {
    try {
      const response = await fetch(CLINICS_API, {
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
      setClinics(
        list.map((item: any) => ({
          id: String(item.id),
          name: item.name ?? '',
        })),
      );
    } catch (error) {
      console.error('Error fetching clinics:', error);
      setFetchError('Failed to load clinics');
    }
  }, []);

  // Fetch Vet Services
  const fetchVetServices = useCallback(async () => {
    try {
      const response = await fetch(VET_SERVICES_API, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok)
        throw new Error(`Failed to fetch services: ${response.status}`);
      const result = await response.json();
      const list = Array.isArray(result.data?.data)
        ? result.data.data
        : Array.isArray(result.data)
          ? result.data
          : [];
      setVetServices(
        list.map((item: any) => ({
          id: String(item.id),
          name: item.name ?? '',
        })),
      );
    } catch (error) {
      console.error('Error fetching services:', error);
      setFetchError('Failed to load services');
    }
  }, []);

  // Fetch Veterinarians
  const fetchVeterinarians = useCallback(async () => {
    try {
      const response = await fetch(VETERINARIANS_API, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok)
        throw new Error(`Failed to fetch veterinarians: ${response.status}`);
      const result = await response.json();
      const list = Array.isArray(result.data?.data)
        ? result.data.data
        : Array.isArray(result.data)
          ? result.data
          : [];

      const items: Veterinarian[] = list.map((it: any) => {
        // Extract clinic and service IDs from clinic_mappings
        let clinicId = '';
        let serviceIds: string[] = [];
        let clinicName = 'N/A';

        if (
          it.clinic_mappings &&
          Array.isArray(it.clinic_mappings) &&
          it.clinic_mappings.length > 0
        ) {
          const firstMapping = it.clinic_mappings[0];
          clinicId = firstMapping.clinic?.id || '';
          clinicName = firstMapping.clinic?.name || 'N/A';
          serviceIds = firstMapping.service_ids || [];
        } else if (it.vet_clinic_id) {
          // Fallback for old API format
          clinicId = it.vet_clinic_id;
          clinicName =
            clinics.find((c) => String(c.id) === String(clinicId))?.name ||
            'N/A';
          serviceIds = Array.isArray(it.vet_service_ids)
            ? it.vet_service_ids
            : [];
        }

        // Map service names
        const serviceNames = serviceIds
          .map(
            (id: string) =>
              vetServices.find((s) => String(s.id) === String(id))?.name,
          )
          .filter(Boolean);

        return {
          id: String(it.id),
          first_name: it.first_name ?? '',
          last_name: it.last_name ?? '',
          email: it.email ?? '',
          license_number: it.license_number ?? '',
          vet_clinic_id: clinicId,
          vet_service_ids: serviceIds.map(String),
          status: Number(it.status) ?? 1,
          clinic_name: clinicName,
          service_names: serviceNames,
        };
      });

      setVeterinarians(items);
    } catch (error: any) {
      console.error('Error fetching veterinarians:', error);
      setFetchError(error.message || 'Failed to load veterinarians');
    }
  }, [clinics, vetServices]);

  // Initial load - fetch clinics and services first, then veterinarians
  useEffect(() => {
    const initializeData = async () => {
      await fetchClinics();
      await fetchVetServices();
    };
    initializeData();
  }, [fetchClinics, fetchVetServices]);

  // Fetch veterinarians when clinics and services are loaded
  useEffect(() => {
    if (clinics.length > 0 && vetServices.length > 0) {
      fetchVeterinarians();
    }
  }, [clinics, vetServices, fetchVeterinarians]);

  // Filter
  const filtered = veterinarians.filter((v) => {
    const matchesSearch =
      v.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.license_number.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || v.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const sorted = [...filtered];

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const paginatedVets = sorted.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  const handleEdit = (vet: Veterinarian) => {
    setEditVeterinarian(vet);
    setShowForm(true);
  };

  // Delete
  const confirmDelete = async () => {
    if (!vetToDelete && selectedRows.length === 0) return;
    try {
      if (selectedRows.length > 0) {
        // Bulk delete
        for (const id of selectedRows) {
          await fetch(`${VETERINARIANS_API}/${id}`, {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${getAuthToken()}`,
              'Content-Type': 'application/json',
            },
          });
        }
        setVeterinarians((prev) =>
          prev.filter((v) => !selectedRows.includes(v.id)),
        );
        setSelectedRows([]);
      } else if (vetToDelete) {
        // Single delete
        const response = await fetch(`${VETERINARIANS_API}/${vetToDelete.id}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
            'Content-Type': 'application/json',
          },
        });
        if (!response.ok)
          throw new Error(`Failed to delete: ${response.status}`);
        setVeterinarians((prev) => prev.filter((v) => v.id !== vetToDelete.id));
      }
      setSuccessBanner('Veterinarian(s) deleted successfully');
      setTimeout(() => setSuccessBanner(''), 5000);
    } catch (error: any) {
      setFetchError(error.message || 'Failed to delete');
    } finally {
      setShowDeleteDialog(false);
      setVetToDelete(null);
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
    if (selectedRows.length === paginatedVets.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(paginatedVets.map((v) => v.id));
    }
  };

  // Handle Form Submit
  const handleFormSubmit = async () => {
    // Form handles API call, just refresh the veterinarians list
    await fetchVeterinarians();
  };

  const handleAddNew = () => {
    setShowForm(true);
    setEditVeterinarian(null);
  };

  // Handle Inline Status Update (single veterinarian)
  const handleStatusToggle = async (vetId: string, newStatus: 0 | 1) => {
    try {
      const response = await fetch(`${VETERINARIANS_API}/${vetId}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!response.ok)
        throw new Error(`Failed to update veterinarian: ${response.status}`);

      setVeterinarians((prev) =>
        prev.map((v) => (v.id === vetId ? { ...v, status: newStatus } : v)),
      );
      setSuccessBanner('Veterinarian status updated successfully');
      setTimeout(() => setSuccessBanner(''), 3000);
    } catch (error: any) {
      setFetchError(error.message || 'Failed to update veterinarian status');
    }
  };

  // Handle Bulk Status Update
  const handleBulkStatusUpdate = async (newStatus: 0 | 1) => {
    try {
      for (const id of selectedRows) {
        const response = await fetch(`${VETERINARIANS_API}/${id}`, {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: newStatus }),
        });
        if (!response.ok)
          throw new Error(`Failed to update veterinarian: ${response.status}`);
      }
      setVeterinarians((prev) =>
        prev.map((v) =>
          selectedRows.includes(v.id) ? { ...v, status: newStatus } : v,
        ),
      );
      setSelectedRows([]);
      setSuccessBanner(
        `${selectedRows.length} veterinarian(s) status updated successfully`,
      );
      setTimeout(() => setSuccessBanner(''), 4000);
    } catch (error: any) {
      setFetchError(error.message || 'Failed to update veterinarian status');
    }
  };

  return (
    <div className='p-4 bg-white rounded-xl shadow-md'>
      {/* Error Banner */}
      {fetchError && (
        <div className='mb-4 p-3 bg-red-50 border border-red-200 rounded-lg'>
          <p className='text-sm text-red-800'>{fetchError}</p>
        </div>
      )}

      {/* Success Banner */}
      {successBanner && (
        <div className='mb-4 p-3 bg-green-50 border border-green-200 rounded-lg'>
          <p className='text-sm text-green-800'>{successBanner}</p>
        </div>
      )}

      {/* Toolbar */}
      <div className='flex items-center gap-3 mb-4 flex-wrap'>
        <button
          onClick={handleAddNew}
          className='px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-sm flex items-center gap-2'
        >
          <MdAdd size={18} />
          Add Veterinarian
        </button>
        <div className='flex-1 min-w-[250px]'>
          <input
            type='text'
            placeholder='Search by name, email, or license number...'
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
            {selectedRows.length} selected
          </span>
          <button
            onClick={() => handleBulkStatusUpdate(1)}
            className='px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700'
          >
            Mark Active
          </button>
          <button
            onClick={() => handleBulkStatusUpdate(0)}
            className='px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700'
          >
            Mark Inactive
          </button>
          <button
            onClick={() => setVetToDelete(null)}
            className='ml-auto px-3 py-1 text-xs bg-gray-400 text-white rounded hover:bg-gray-500'
          >
            Clear Selection
          </button>
        </div>
      )}

      {/* Table */}
      <div className='w-full overflow-x-auto rounded-lg border border-gray-200'>
        <div className='min-w-[900px]'>
          <Table className='w-full'>
            <TableHeader className='bg-gray-50'>
              <TableRow>
                <TableCell className='w-10 p-2 py-3'>
                  <Checkbox
                    checked={
                      selectedRows.length === paginatedVets.length &&
                      paginatedVets.length > 0
                    }
                    onChange={toggleSelectAll}
                  />
                </TableCell>
                <TableCell className='p-2 py-4 text-sm font-medium'>
                  First Name
                </TableCell>
                <TableCell className='p-2 py-4 text-sm font-medium'>
                  Last Name
                </TableCell>
                <TableCell className='p-2 py-4 text-sm font-medium'>
                  Email
                </TableCell>
                <TableCell className='p-2 py-4 text-sm font-medium'>
                  License #
                </TableCell>
                <TableCell className='p-2 py-4 text-sm font-medium'>
                  Clinic
                </TableCell>
                <TableCell className='p-2 py-4 text-sm font-medium'>
                  Services
                </TableCell>
                <TableCell className='p-2 py-4 text-sm font-medium'>
                  Status
                </TableCell>
                <TableCell className='w-24 p-2 py-4 text-sm font-medium'>
                  Actions
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody>
              {paginatedVets.map((vet) => (
                <TableRow key={vet.id} className='hover:bg-gray-50'>
                  <TableCell className='p-2 py-4'>
                    <Checkbox
                      checked={selectedRows.includes(vet.id)}
                      onChange={() => toggleRowSelect(vet.id)}
                    />
                  </TableCell>
                  <TableCell className='p-2 py-4 text-sm text-gray-700'>
                    {vet.first_name}
                  </TableCell>
                  <TableCell className='p-2 py-4 text-sm text-gray-700'>
                    {vet.last_name}
                  </TableCell>
                  <TableCell className='p-2 py-4 text-sm text-gray-700'>
                    {vet.email}
                  </TableCell>
                  <TableCell className='p-2 py-4 text-sm text-gray-700'>
                    {vet.license_number}
                  </TableCell>
                  <TableCell className='p-2 py-4 text-sm text-gray-700'>
                    {vet.clinic_name}
                  </TableCell>
                  <TableCell className='p-2 py-4 text-sm text-gray-700'>
                    <div className='flex flex-wrap gap-1'>
                      {vet.service_names && vet.service_names.length > 0 ? (
                        vet.service_names.map((service, idx) => (
                          <Badge key={idx} size='sm' color='info'>
                            {service}
                          </Badge>
                        ))
                      ) : (
                        <span className='text-gray-500'>None</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className='px-2 py-4'>
                    <div className='flex items-center gap-3'>
                      <Badge
                        size='sm'
                        color={vet.status === 1 ? 'success' : 'error'}
                      >
                        {vet.status === 1 ? (
                          <IoIosCheckmarkCircle />
                        ) : (
                          <IoIosCloseCircle />
                        )}
                      </Badge>
                      <Switch
                        label=''
                        checked={vet.status === 1}
                        onChange={(checked) => {
                          handleStatusToggle(vet.id, checked ? 1 : 0);
                        }}
                        color='blue'
                      />
                    </div>
                  </TableCell>
                  <TableCell className='p-2 py-4'>
                    <div className='flex gap-2'>
                      <button
                        onClick={() => handleEdit(vet)}
                        className='text-blue-500 hover:text-blue-700 p-1 rounded hover:bg-blue-50'
                        title='Edit'
                      >
                        <MdEdit className='w-5 h-5' />
                      </button>
                      <button
                        onClick={() => setVetToDelete(vet)}
                        className='text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50'
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

      <Pagination
        totalItems={filtered.length}
        itemsPerPage={itemsPerPage}
        onPageChange={handlePageChange}
        onItemsPerPageChange={handleItemsPerPageChange}
      />

      {/* Add/Edit Dialog */}
      {showForm && (
        <VetListForm
          veterinarian={editVeterinarian || undefined}
          clinics={clinics}
          services={vetServices}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditVeterinarian(null);
          }}
        />
      )}

      {/* Delete Dialog */}
      <DeleteDialog
        isOpen={showDeleteDialog || vetToDelete !== null}
        onClose={() => {
          setShowDeleteDialog(false);
          setVetToDelete(null);
        }}
        onConfirm={confirmDelete}
        itemLabel='Veterinarian'
        description={
          selectedRows.length > 1
            ? `Are you sure you want to delete ${selectedRows.length} selected veterinarians?`
            : 'Are you sure you want to delete this veterinarian?'
        }
      />
    </div>
  );
}
