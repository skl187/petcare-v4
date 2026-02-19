import { MdEdit } from 'react-icons/md';
import { useState, useMemo, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from '../../../../components/ui/table';
import Badge from '../../../../components/ui/badge/Badge';
import Pagination from '../../../tables/tableComponents/Pagination';
import useSort from '../../../../hooks/useSort';
import SortableTableHeader from '../../../tables/tableComponents/SortableTableHeader';
import { TableToolbar } from '../../../tables/tableComponents/TableToolbar';
import ImageHoverPreview from '../../../tables/tableComponents/ImageHoverPreview';
import VeterinaryBookingsForm, {
  VetBookingFormData,
} from '../../../../adminPages/VetPageForms/Veterinary/VeterinaryBookingsForm/VeterinaryBookingsForm';
import { API_ENDPOINTS } from '../../../../constants/api';
import { useAuth } from '../../../../components/auth/AuthContext';

const VET_BOOKINGS_BASE = API_ENDPOINTS.VETERINARY_BOOKINGS.BASE();
const PET_TYPES_BASE = API_ENDPOINTS.PET_TYPES.BASE;
const VET_API_ORIGIN = new URL(VET_BOOKINGS_BASE, window.location.origin)
  .origin;
const PET_TYPES_API_ORIGIN = new URL(PET_TYPES_BASE, window.location.origin)
  .origin;

const getAppointmentPetImageUrl = (
  imagePath?: string | null,
  apiOrigin: string = VET_API_ORIGIN,
) => {
  const fallback = '/images/pets/placeholder.jpg';
  const raw = imagePath?.trim();

  if (!raw) return fallback;
  if (/^https?:\/\//i.test(raw) || raw.startsWith('data:')) return raw;

  const normalized = raw.startsWith('/') ? raw : `/${raw}`;
  return `${apiOrigin}${normalized}`;
};

export type VetBookingStatus =
  | 'Pending'
  | 'Approved'
  | 'Completed'
  | 'Cancelled'
  | 'scheduled';

export interface VetBooking {
  id: string; // UUID from API
  appointmentId: string; // UUID from API
  appointmentNumber: string; // Appointment number from API
  petId: string; // UUID from API
  petName: string;
  petPhoto?: string;
  ownerName: string;
  service: string;
  date: string;
  time: string;
  status: VetBookingStatus;
  notes?: string;
}

export default function VeterinaryBookingsTable({
  onSelectAppointment,
  filter = 'today',
}: {
  onSelectAppointment?: (booking: VetBooking) => void;
  filter?: 'today' | 'upcoming' | 'all';
}) {
  const { user } = useAuth();
  const [rows, setRows] = useState<VetBooking[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const columns = [
    {
      key: 'appointmentNumber',
      label: 'Appointment #',
      className: 'min-w-[120px]',
    },
    { key: 'date', label: 'Date', className: 'min-w-[120px]' },
    { key: 'time', label: 'Time', className: 'min-w-[100px]' },
    { key: 'petName', label: 'Pet', className: 'min-w-[150px]' },
    { key: 'ownerName', label: 'Owner', className: 'min-w-[150px]' },
    { key: 'service', label: 'Service', className: 'min-w-[160px]' },
    { key: 'status', label: 'Status', className: 'min-w-[120px]' },
  ] as const;

  const filtered = useMemo(() => {
    return rows
      .filter((r) => (statusFilter ? r.status === statusFilter : true))
      .filter((r) =>
        [r.petName, r.ownerName, r.service, r.date]
          .join(' ')
          .toLowerCase()
          .includes(searchQuery.toLowerCase()),
      );
  }, [rows, statusFilter, searchQuery]);

  const { sortedData, requestSort, sortConfig } = useSort(filtered, {
    key: 'date',
    direction: 'asc',
  } as any);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  // Fetch bookings from API
  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = sessionStorage.getItem('token');
        const url = API_ENDPOINTS.VETERINARY_BOOKINGS.BASE(filter);
        console.log('Fetching from URL:', url);
        console.log('Token exists:', !!token);

        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        });

        const petTypesResponse = await fetch(PET_TYPES_BASE, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        });

        console.log('Response status:', response.status);

        if (!response.ok) {
          throw new Error(
            `Failed to fetch bookings: ${response.status} ${response.statusText}`,
          );
        }

        const data = await response.json();
        console.log('Fetched bookings:', data);

        let petTypeIconMap: Record<string, string> = {};
        if (petTypesResponse.ok) {
          const petTypesData = await petTypesResponse.json();
          const petTypesList =
            petTypesData?.data?.data ??
            petTypesData?.data ??
            petTypesData?.rows ??
            [];

          if (Array.isArray(petTypesList)) {
            petTypeIconMap = petTypesList.reduce(
              (acc: Record<string, string>, petType: any) => {
                const key = String(petType?.name || '')
                  .trim()
                  .toLowerCase();

                if (!key) return acc;

                acc[key] = getAppointmentPetImageUrl(
                  petType?.icon_url ||
                    petType?.iconUrl ||
                    petType?.iconurl ||
                    petType?.image,
                  PET_TYPES_API_ORIGIN,
                );

                return acc;
              },
              {},
            );
          }
        }

        // Map API response to VetBooking format
        // Handle nested data structure: response.data.data is the array
        const bookingsArray = data?.data?.data || data?.data || [];
        console.log('Bookings array:', bookingsArray);
        console.log('Bookings array length:', bookingsArray.length);

        if (Array.isArray(bookingsArray) && bookingsArray.length > 0) {
          const mappedBookings: VetBooking[] = bookingsArray.map(
            (booking: any) => {
              // Combine first and last name for owner
              const ownerName =
                [booking.user_first_name, booking.user_last_name]
                  .filter(Boolean)
                  .join(' ') ||
                booking.owner_name ||
                booking.ownerName ||
                '';

              // Get service names from services array
              const serviceNames = booking.services
                ? booking.services.map((s: any) => s.name).join(', ')
                : booking.service_type || booking.service || '';

              const petTypeName = String(
                booking.pet_type_name || booking.petTypeName || '',
              )
                .trim()
                .toLowerCase();

              const mappedPetTypeIcon = petTypeName
                ? petTypeIconMap[petTypeName]
                : undefined;

              const mapped = {
                id: booking.id || booking.appointment_id || '',
                appointmentId: booking.id || booking.appointment_id || '',
                appointmentNumber: booking.appointment_number || '',
                petId: booking.pet_id || '',
                petName: booking.pet_name || booking.petName || '',
                petPhoto: getAppointmentPetImageUrl(
                  booking.pet_type_icon ||
                    booking.petTypeIcon ||
                    mappedPetTypeIcon ||
                    booking.pet_photo ||
                    booking.petPhoto,
                ),
                ownerName: ownerName,
                service: serviceNames,
                date: booking.appointment_date || booking.date || '',
                time: booking.appointment_time || booking.time || '',
                status: (booking.status || 'Pending') as VetBookingStatus,
                notes: booking.notes || '',
              };
              console.log('Mapped booking:', mapped);
              return mapped;
            },
          );
          console.log('Final mapped bookings:', mappedBookings);
          setRows(mappedBookings);
        } else {
          console.log('No bookings array found or empty');
          setRows([]);
        }
      } catch (err) {
        console.error('Error fetching bookings:', err);
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to load bookings';
        console.error('Full error:', err);
        setError(errorMessage);
        setRows([]); // Empty array instead of mock data
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [filter]);
  const indexOfLast = currentPage * itemsPerPage;
  const currentItems = (sortedData as VetBooking[]).slice(
    indexOfLast - itemsPerPage,
    indexOfLast,
  );

  const handleAddNew = () => setIsAddDialogOpen(true);
  const handleEdit = (row: VetBooking) => {
    // Pass the entire booking data to the detail view
    if (onSelectAppointment) {
      onSelectAppointment(row);
    }
  };
  const handleViewDetail = (row: VetBooking) => {
    // Pass the entire booking data to the detail view
    if (onSelectAppointment) {
      onSelectAppointment(row);
    }
  };

  const confirmAddNew = (data: VetBookingFormData) => {
    const newRow: VetBooking = {
      id: crypto.randomUUID(), // Generate UUID for new bookings
      appointmentId: crypto.randomUUID(),
      appointmentNumber: '', // Will be set by API
      petId: data.petName ? crypto.randomUUID() : '', // Will be set properly from API
      ...data,
    };
    setRows([newRow, ...rows]);
    setIsAddDialogOpen(false);
  };

  const statusColor = (s: VetBookingStatus) => {
    switch (s) {
      case 'Pending':
        return 'warning';
      case 'Approved':
        return 'info';
      case 'Completed':
        return 'success';
      case 'Cancelled':
        return 'error';
    }
  };

  return (
    <div className='p-4 bg-white rounded-xl shadow-md'>
      <TableToolbar
        onAddNew={handleAddNew}
        addButtonLabel='New Booking'
        addButtonIcon={<MdEdit className='w-5 h-5' />}
        selectedRowsCount={0}
        bulkActionsOptions={<></>}
        statusUpdateOptions={<></>}
        showStatusDropdown={false}
        showAddButton={user?.role === 'veterinary'}
        onBulkActionChange={() => {}}
        onStatusUpdateChange={() => {}}
        onApplyAction={() => {}}
        bulkActionValue=''
        statusUpdateValue=''
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder='Search by pet, owner, service…'
        filterOptions={
          <>
            <option value=''>All Status</option>
            <option value='scheduled'>Scheduled</option>
            <option value='Pending'>Pending</option>
            <option value='Approved'>Approved</option>
            <option value='Completed'>Completed</option>
            <option value='Cancelled'>Cancelled</option>
          </>
        }
        onFilterChange={setStatusFilter}
        filterValue={statusFilter}
      />

      {error && (
        <div className='mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg'>
          <p className='text-sm font-medium'>{error}</p>
        </div>
      )}

      {loading ? (
        <div className='p-8 text-center text-gray-500'>Loading bookings...</div>
      ) : filtered.length === 0 ? (
        <div className='p-8 text-center text-gray-500'>No bookings found.</div>
      ) : (
        <div className='w-full overflow-x-auto rounded-lg border border-gray-200'>
          <div className='min-w-[900px]'>
            <Table className='w-full'>
              <TableHeader className='bg-gray-50'>
                <TableRow>
                  {columns.map((col) => (
                    <SortableTableHeader<VetBooking>
                      key={col.key}
                      columnKey={col.key as keyof VetBooking}
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
                  <TableRow key={r.id} className='hover:bg-blue-50'>
                    <TableCell className='p-2'>
                      <button
                        className='text-blue-600 hover:text-blue-800 font-medium'
                        onClick={() => handleViewDetail(r)}
                      >
                        {r.appointmentNumber}
                      </button>
                    </TableCell>
                    <TableCell className='p-2'>
                      <button
                        className='text-blue-600 hover:text-blue-800'
                        onClick={() => handleViewDetail(r)}
                      >
                        {r.date}
                      </button>
                    </TableCell>
                    <TableCell className='p-2'>
                      <button
                        className='text-blue-600 hover:text-blue-800'
                        onClick={() => handleViewDetail(r)}
                      >
                        {r.time}
                      </button>
                    </TableCell>
                    <TableCell className='p-2'>
                      <button
                        className='text-blue-600 hover:text-blue-800 flex items-center gap-2'
                        onClick={() => handleViewDetail(r)}
                      >
                        <ImageHoverPreview
                          src={r.petPhoto || '/images/pets/placeholder.jpg'}
                          alt={r.petName}
                          className='w-8 h-8 rounded-full'
                        />
                        {r.petName}
                      </button>
                    </TableCell>
                    <TableCell className='p-2'>
                      <button
                        className='text-blue-600 hover:text-blue-800'
                        onClick={() => handleViewDetail(r)}
                      >
                        {r.ownerName}
                      </button>
                    </TableCell>
                    <TableCell className='p-2'>
                      <button
                        className='text-blue-600 hover:text-blue-800'
                        onClick={() => handleViewDetail(r)}
                      >
                        {r.service}
                      </button>
                    </TableCell>
                    <TableCell className='p-2'>
                      <button
                        className='inline-block'
                        onClick={() => handleViewDetail(r)}
                      >
                        <Badge size='sm' color={statusColor(r.status)}>
                          {r.status}
                        </Badge>
                      </button>
                    </TableCell>
                    <TableCell className='p-2'>
                      <button
                        onClick={() => handleEdit(r)}
                        className='text-blue-600 hover:text-blue-800'
                      >
                        <MdEdit />
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

      {isAddDialogOpen && (
        <VeterinaryBookingsForm
          onSubmit={confirmAddNew}
          onCancel={() => {
            setIsAddDialogOpen(false);
          }}
        />
      )}
    </div>
  );
}
