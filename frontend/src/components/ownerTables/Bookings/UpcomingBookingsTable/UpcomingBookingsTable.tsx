import { MdEdit, MdDelete, MdAdd } from 'react-icons/md';
import { useCallback, useMemo, useState, useEffect } from 'react';
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
import DeleteDialog from '../../../tables/tableComponents/DeleteDailog';
import UpcomingBookingsForm from '../../../../pages/OwnerPageForms/BookingsForms/UpcomingBookingsForm/UpcomingBookingsForm';
import { IoIosCheckmarkCircle, IoIosCloseCircle } from 'react-icons/io';
import { API_ENDPOINTS } from '../../../../constants/api';
import type { VetBooking } from '../../../vetTables/Veterinary/VeterninaryBookingsTable/VeterinaryBookingsTable';

// --- API Constants ---
const PETS_API = API_ENDPOINTS.PETS.BASE;
const VETERINARIANS_API = API_ENDPOINTS.VETERINARIANS.BASE;
const CLINICS_API = API_ENDPOINTS.CLINICS.BASE;
const VET_SERVICES_API = API_ENDPOINTS.VET_SERVICES.BASE;
const OWNER_API_ORIGIN = new URL(
  API_ENDPOINTS.OWNER_BOOKINGS.BASE(),
  window.location.origin,
).origin;

const getAppointmentPetImageUrl = (imagePath?: string | null) => {
  const fallback = '/images/pets/placeholder.jpg';
  const raw = imagePath?.trim();

  if (!raw) return fallback;
  if (/^https?:\/\//i.test(raw) || raw.startsWith('data:')) return raw;

  const normalized = raw.startsWith('/') ? raw : `/${raw}`;
  return `${OWNER_API_ORIGIN}${normalized}`;
};

// --- Types ---
export type AppointmentStatus =
  | 'scheduled'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'cancelled'
  | 'no_show'
  | 'rescheduled';

export interface Pet {
  id: string;
  name: string;
  slug?: string;
  image?: string;
}

export interface Veterinarian {
  id: string;
  first_name: string;
  last_name: string;
  avatar?: string;
}

export interface Clinic {
  id: string;
  name: string;
}

export interface VetService {
  id: string;
  name: string;
  default_fee: number;
}

export interface Appointment {
  id: string;
  user_id: string;
  pet_id: string;
  veterinarian_id: string;
  clinic_id: string;
  appointment_date: string;
  appointment_time: string;
  appointment_type: string;
  chief_complaint: string;
  status: AppointmentStatus;
  total_amount: number;
  service_ids: string[] | any[];
  payment_type?: 'online' | 'cash' | 'insurance';
  payment_method?: string;
  insurance_id?: string;
  symptoms?: string[];
  notes?: string;
  pet_name?: string;
  vet_name?: string;
  clinic_name?: string;
  service_names?: string[];
  vet_service_ids?: string[] | any[];
  consultation_fee?: number;
  service_fee?: number;
  payment_info?: any;
  services?: any[];
  appointment_number?: string;
  priority?: string;
  petPhoto?: string;
}

interface UpcomingBookingsTableProps {
  onSelectAppointment?: (appointment: VetBooking) => void;
  filter?: 'today' | 'upcoming' | 'past' | 'all';
}

export default function UpcomingBookingsTable({
  onSelectAppointment,
  filter = 'upcoming',
}: UpcomingBookingsTableProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [pets, setPets] = useState<Pet[]>([]);
  const [veterinarians, setVeterinarians] = useState<Veterinarian[]>([]);
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [vetServices, setVetServices] = useState<VetService[]>([]);

  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] =
    useState<Appointment | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editAppointment, setEditAppointment] = useState<Appointment | null>(
    null,
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [fetchError, setFetchError] = useState('');
  const [successBanner, setSuccessBanner] = useState('');

  // Get auth token
  const getAuthToken = () => sessionStorage.getItem('token') || '';

  // Fetch Pets
  const fetchPets = useCallback(async () => {
    try {
      const response = await fetch(PETS_API, {
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
      setPets(
        list.map((p: any) => ({
          id: String(p.id),
          name: p.name ?? '',
          slug: p.slug ?? '',
          image: p.image ?? '',
        })),
      );
    } catch (error) {
      console.error('Error fetching pets:', error);
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
      setVeterinarians(
        list.map((v: any) => ({
          id: String(v.id),
          first_name: v.first_name ?? '',
          last_name: v.last_name ?? '',
        })),
      );
    } catch (error) {
      console.error('Error fetching veterinarians:', error);
    }
  }, []);

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
        list.map((c: any) => ({
          id: String(c.id),
          name: c.name ?? '',
        })),
      );
    } catch (error) {
      console.error('Error fetching clinics:', error);
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
        throw new Error(`Failed to fetch vet services: ${response.status}`);
      const result = await response.json();
      const list = Array.isArray(result.data?.data)
        ? result.data.data
        : Array.isArray(result.data)
          ? result.data
          : [];
      setVetServices(
        list.map((s: any) => ({
          id: String(s.id),
          name: s.name ?? '',
          default_fee: Number(s.default_fee) || 0,
        })),
      );
    } catch (error) {
      console.error('Error fetching vet services:', error);
    }
  }, []);

  // Fetch Appointments
  const fetchAppointments = useCallback(async () => {
    setIsLoadingData(true);
    setFetchError('');
    try {
      const response = await fetch(API_ENDPOINTS.OWNER_BOOKINGS.BASE(filter), {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok)
        throw new Error(`Failed to fetch appointments: ${response.status}`);
      const result = await response.json();
      const list = Array.isArray(result.data?.data)
        ? result.data.data
        : Array.isArray(result.data)
          ? result.data
          : [];

      const items: Appointment[] = list.map((a: any) => {
        // Extract date part from ISO timestamp (YYYY-MM-DD)
        let appointmentDate = a.appointment_date ?? '';
        if (appointmentDate && appointmentDate.includes('T')) {
          appointmentDate = appointmentDate.split('T')[0];
        }

        // Get vet name from flattened response
        const vetName =
          a.vet_first_name && a.vet_last_name
            ? `${a.vet_first_name} ${a.vet_last_name}`
            : '';

        // Handle both service_ids and vet_service_ids formats
        const serviceIds = a.service_ids || a.vet_service_ids || [];

        // Extract service IDs - handle both string array and object array formats
        const extractedServiceIds = Array.isArray(serviceIds)
          ? serviceIds.map((s: any) =>
              typeof s === 'string' ? s : s.service_id,
            )
          : [];

        const serviceNames =
          a.services && Array.isArray(a.services)
            ? a.services.map((s: any) => s.name).filter(Boolean)
            : extractedServiceIds
                .map(
                  (sid: string) => vetServices.find((s) => s.id === sid)?.name,
                )
                .filter(Boolean) || [];

        return {
          id: String(a.id),
          user_id: String(a.user_id || ''),
          pet_id: String(a.pet_id || ''),
          veterinarian_id: String(a.veterinarian_id || ''),
          clinic_id: String(a.clinic_id || ''),
          appointment_date: appointmentDate,
          appointment_time: a.appointment_time ?? '',
          appointment_type: a.appointment_type ?? '',
          chief_complaint: a.chief_complaint ?? '',
          symptoms: Array.isArray(a.symptoms) ? a.symptoms : [],
          notes: a.notes ?? '',
          status: a.status ?? 'scheduled',
          total_amount: Number(a.total_amount) || 0,
          service_ids: extractedServiceIds,
          vet_service_ids: a.vet_service_ids || [],
          payment_type: a.payment_type || 'cash',
          payment_method:
            a.payment_info?.payment_method || a.payment_method || undefined,
          insurance_id: a.insurance_id || undefined,
          pet_name: a.pet_name || '',
          vet_name: vetName,
          clinic_name: a.clinic_name || '',
          service_names: serviceNames,
          consultation_fee: Number(a.consultation_fee) || 0,
          service_fee: Number(a.service_fee) || 0,
          payment_info: a.payment_info,
          services: a.services,
          appointment_number: a.appointment_number,
          priority: a.priority,
          petPhoto: getAppointmentPetImageUrl(
            a.pet_type_icon ||
              a.petTypeIcon ||
              a.pet_photo ||
              a.petPhoto ||
              a.pet_image,
          ),
        };
      });

      setAppointments(items);
    } catch (error: any) {
      console.error('Error fetching appointments:', error);
      setFetchError(error.message || 'Failed to load appointments');
    } finally {
      setIsLoadingData(false);
    }
  }, [pets, veterinarians, clinics, vetServices, filter]);

  // Initial load
  useEffect(() => {
    fetchPets();
    fetchVeterinarians();
    fetchClinics();
    fetchVetServices();
  }, [fetchPets, fetchVeterinarians, fetchClinics, fetchVetServices]);

  // Fetch appointments when dependencies loaded
  useEffect(() => {
    if (pets.length > 0 && veterinarians.length > 0) {
      fetchAppointments();
    }
  }, [pets, veterinarians, clinics, vetServices, fetchAppointments]);

  // Columns
  const columns = [
    { key: 'appointment_date', label: 'Date', className: 'min-w-[120px]' },
    { key: 'appointment_time', label: 'Time', className: 'min-w-[100px]' },
    { key: 'pet_name', label: 'Pet', className: 'min-w-[180px]' },
    { key: 'vet_name', label: 'Vet', className: 'min-w-[200px]' },
    { key: 'appointment_type', label: 'Type', className: 'min-w-[150px]' },
    { key: 'status', label: 'Status', className: 'min-w-[140px]' },
    { key: 'total_amount', label: 'Amount', className: 'min-w-[100px]' },
  ] as const;

  // Filter + search
  const filteredData = useMemo(() => {
    return appointments
      .filter((a) => (statusFilter ? a.status === statusFilter : true))
      .filter((a) => {
        if (!searchQuery) return true;
        const hay = [
          a.pet_name,
          a.vet_name,
          a.appointment_type,
          a.chief_complaint,
          a.appointment_date,
          a.appointment_time,
          String(a.total_amount),
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        return hay.includes(searchQuery.toLowerCase());
      });
  }, [appointments, statusFilter, searchQuery]);

  // Sort
  const { sortedData, requestSort } = useSort(filteredData, {
    key: 'appointment_date',
    direction: 'desc',
  } as any);

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems: Appointment[] = (sortedData as Appointment[]).slice(
    indexOfFirstItem,
    indexOfLastItem,
  );

  // Selections
  const toggleSelectRow = (id: string) =>
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  const toggleSelectAll = () =>
    setSelectedRows(
      selectedRows.length === appointments.length
        ? []
        : appointments.map((r) => r.id),
    );

  // Delete
  const handleDelete = (appointment?: Appointment) => {
    setAppointmentToDelete(appointment || null);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      if (selectedRows.length > 0) {
        // Bulk delete
        for (const id of selectedRows) {
          await fetch(API_ENDPOINTS.APPOINTMENTS.DETAIL(id), {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${getAuthToken()}`,
              'Content-Type': 'application/json',
            },
          });
        }
        setAppointments((prev) =>
          prev.filter((a) => !selectedRows.includes(a.id)),
        );
        setSelectedRows([]);
      } else if (appointmentToDelete) {
        // Single delete
        const response = await fetch(
          API_ENDPOINTS.APPOINTMENTS.DETAIL(appointmentToDelete.id),
          {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${getAuthToken()}`,
              'Content-Type': 'application/json',
            },
          },
        );
        if (!response.ok)
          throw new Error(`Failed to delete: ${response.status}`);
        setAppointments((prev) =>
          prev.filter((a) => a.id !== appointmentToDelete.id),
        );
      }
      setSuccessBanner('Appointment(s) deleted successfully');
      setTimeout(() => setSuccessBanner(''), 5000);
    } catch (error: any) {
      setFetchError(error.message || 'Failed to delete');
    } finally {
      setIsDeleteDialogOpen(false);
      setAppointmentToDelete(null);
    }
  };

  // Add/Edit
  const handleAddNew = () => setIsAddDialogOpen(true);

  const confirmAddNew = async () => {
    // Form will handle API call
    await fetchAppointments();
    setIsAddDialogOpen(false);
  };

  const confirmEdit = async () => {
    // Form will handle API call
    await fetchAppointments();
    setEditAppointment(null);
  };

  // Status color
  const statusColor = (s: AppointmentStatus) => {
    if (s === 'scheduled') return 'warning';
    if (s === 'confirmed') return 'info';
    if (s === 'in_progress') return 'info';
    if (s === 'completed') return 'success';
    if (s === 'cancelled') return 'error';
    if (s === 'no_show') return 'error';
    return 'info';
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
          New Appointment
        </button>
        <div className='flex-1 min-w-[250px]'>
          <input
            type='text'
            placeholder='Search by pet, vet, date, type...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className='w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className='px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
        >
          <option value=''>All Status</option>
          <option value='scheduled'>Scheduled</option>
          <option value='confirmed'>Confirmed</option>
          <option value='in_progress'>In Progress</option>
          <option value='completed'>Completed</option>
          <option value='cancelled'>Cancelled</option>
          <option value='no_show'>No Show</option>
          <option value='rescheduled'>Rescheduled</option>
        </select>
      </div>

      {/* Bulk Actions */}
      {selectedRows.length > 0 && (
        <div className='mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-3'>
          <span className='text-sm font-medium text-blue-900'>
            {selectedRows.length} appointment(s) selected
          </span>
          <button
            onClick={() => {
              setAppointmentToDelete(null);
              setIsDeleteDialogOpen(true);
            }}
            className='px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700'
          >
            Delete
          </button>
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
                  onClick={() => fetchAppointments()}
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

      {/* Empty state */}
      {filteredData.length === 0 ? (
        <div className='rounded-lg border border-gray-200 p-8 text-center text-sm text-gray-600'>
          {isLoadingData ? 'Loading appointments...' : 'No appointments found.'}
        </div>
      ) : (
        <>
          {/* Table */}
          <div className='w-full overflow-x-auto rounded-lg border border-gray-200'>
            <div className='min-w-[1100px]'>
              <Table className='w-full'>
                <TableHeader className='bg-gray-50'>
                  <TableRow>
                    <TableCell className='w-10 p-2 py-3'>
                      <Checkbox
                        checked={
                          selectedRows.length === appointments.length &&
                          appointments.length > 0
                        }
                        onChange={toggleSelectAll}
                      />
                    </TableCell>
                    {columns.map((col) => (
                      <th
                        key={col.key as string}
                        className={`p-2 py-4 text-left text-sm font-medium cursor-pointer hover:bg-gray-50 ${col.className}`}
                        onClick={() => (requestSort as any)(col.key as string)}
                      >
                        <div className='flex items-center gap-1'>
                          {col.label}
                        </div>
                      </th>
                    ))}
                    <TableCell className='w-36 p-2 py-4 text-sm font-medium'>
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {isLoadingData ? (
                    <TableRow>
                      <td
                        colSpan={columns.length + 2}
                        className='p-8 text-center text-gray-500'
                      >
                        Loading appointments...
                      </td>
                    </TableRow>
                  ) : currentItems.length === 0 ? (
                    <TableRow>
                      <td
                        colSpan={columns.length + 2}
                        className='p-8 text-center text-gray-500'
                      >
                        No appointments found
                      </td>
                    </TableRow>
                  ) : (
                    currentItems.map((a) => (
                      <TableRow key={a.id} className='hover:bg-gray-50'>
                        <TableCell className='p-2 py-4'>
                          <Checkbox
                            checked={selectedRows.includes(a.id)}
                            onChange={() => toggleSelectRow(a.id)}
                          />
                        </TableCell>

                        <TableCell className='p-2 py-4 text-sm'>
                          {a.appointment_date}
                        </TableCell>
                        <TableCell className='p-2 py-4 text-sm'>
                          {a.appointment_time}
                        </TableCell>

                        <TableCell className='p-2 py-4 text-sm font-medium'>
                          {a.pet_name || '-'}
                        </TableCell>
                        <TableCell className='p-2 py-4 text-sm'>
                          {a.vet_name || '-'}
                        </TableCell>
                        <TableCell className='p-2 py-4 text-sm'>
                          {a.appointment_type || 'Not specified'}
                        </TableCell>

                        <TableCell className='p-2 py-4'>
                          <Badge size='sm' color={statusColor(a.status)}>
                            {a.status}
                          </Badge>
                        </TableCell>

                        <TableCell className='p-2 py-4 text-sm font-medium'>
                          ${a.total_amount.toFixed(2)}
                        </TableCell>

                        <TableCell className='p-2 py-4'>
                          <div className='flex gap-2'>
                            {/* View button - always show */}
                            <button
                              onClick={() => {
                                if (onSelectAppointment) {
                                  onSelectAppointment({
                                    id: a.id,
                                    appointmentId: a.id,
                                    appointmentNumber:
                                      a.appointment_number || '',
                                    petId: a.pet_id,
                                    petName: a.pet_name || '',
                                    petPhoto: a.petPhoto,
                                    ownerName: '',
                                    service: a.appointment_type || '',
                                    date: a.appointment_date || '',
                                    time: a.appointment_time || '',
                                    status: (a.status as any) || 'scheduled',
                                    notes: a.notes,
                                  });
                                }
                              }}
                              className='text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50'
                              title='View Details'
                            >
                              <MdEdit className='w-5 h-5' />
                            </button>
                            {/* Delete button - only show when status is NOT in_progress or scheduled */}
                            {a.status !== 'in_progress' &&
                              a.status !== 'scheduled' && (
                                <button
                                  onClick={() => handleDelete(a)}
                                  className='text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50'
                                  title='Delete'
                                >
                                  <MdDelete className='w-5 h-5' />
                                </button>
                              )}
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
            onPageChange={setCurrentPage}
            onItemsPerPageChange={(n) => {
              setItemsPerPage(n);
              setCurrentPage(1);
            }}
          />
        </>
      )}

      {/* Add/Edit Dialog */}
      {(isAddDialogOpen || editAppointment) && (
        <UpcomingBookingsForm
          booking={editAppointment as any}
          pets={pets}
          veterinarians={veterinarians}
          clinics={clinics}
          vetServices={vetServices}
          onSubmit={editAppointment ? confirmEdit : confirmAddNew}
          onCancel={() => {
            setIsAddDialogOpen(false);
            setEditAppointment(null);
          }}
        />
      )}

      {/* Delete Dialog */}
      <DeleteDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        itemLabel='appointment'
        description={
          appointmentToDelete
            ? 'Are you sure you want to delete this appointment?'
            : `Are you sure you want to delete ${selectedRows.length} selected appointments?`
        }
      />
    </div>
  );
}
