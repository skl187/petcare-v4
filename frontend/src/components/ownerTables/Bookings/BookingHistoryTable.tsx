import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from '../../ui/table';
import Badge from '../../ui/badge/Badge';
// import Checkbox from "../../../../components/form/input/Checkbox";
import Pagination from '../../tables/tableComponents/Pagination';
import useSort from '../../../hooks/useSort';
import SortableTableHeader from '../../tables/tableComponents/SortableTableHeader';
import ImageHoverPreview from '../../tables/tableComponents/ImageHoverPreview';
import { MdEdit } from 'react-icons/md';
import { API_ENDPOINTS } from '../../../constants/api';
import type { VetBooking } from '../../vetTables/Veterinary/VeterinaryBookingsTable';

export type BookingStatus = 'Completed' | 'Cancelled';

// --- API Constants ---
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

export interface BookingHistory {
  id: string;
  petId: string;
  petName: string;
  petPhoto?: string;
  vetName: string;
  vetPhoto?: string;
  appointmentType: string;
  service: string;
  date: string;
  time: string;
  price?: number;
  status: BookingStatus;
  appointmentId?: string;
  appointmentNumber?: string;
  notes?: string;
}

export default function BookingHistoryTable({
  onSelectAppointment,
}: {
  onSelectAppointment?: (appointment: VetBooking) => void;
}) {
  const [rows, setRows] = useState<BookingHistory[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Get auth token
  const getAuthToken = () => sessionStorage.getItem('token') || '';

  // Fetch History
  const fetchHistory = useCallback(async () => {
    setIsLoadingData(true);
    try {
      const response = await fetch(API_ENDPOINTS.OWNER_BOOKINGS.BASE('all'), {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok)
        throw new Error(`Failed to fetch history: ${response.status}`);
      const result = await response.json();
      const list = Array.isArray(result.data?.data)
        ? result.data.data
        : Array.isArray(result.data)
          ? result.data
          : [];

      const items: BookingHistory[] = list.map((a: any) => {
        let appointmentDate = a.appointment_date ?? '';
        if (appointmentDate && appointmentDate.includes('T')) {
          appointmentDate = appointmentDate.split('T')[0];
        }

        const vetName =
          a.vet_first_name && a.vet_last_name
            ? `${a.vet_first_name} ${a.vet_last_name}`
            : '';

        return {
          id: String(a.id),
          petId: String(a.pet_id || ''),
          petName: a.pet_name || '',
          petPhoto: getAppointmentPetImageUrl(
            a.pet_type_icon ||
              a.petTypeIcon ||
              a.pet_photo ||
              a.petPhoto ||
              a.pet_image,
          ),
          vetName: vetName,
          vetPhoto: a.vet_avatar || '/images/users/placeholder.jpg',
          appointmentType: a.appointment_type || '',
          service: a.appointment_type || '',
          date: appointmentDate,
          time: a.appointment_time || '',
          price: Number(a.total_amount) || 0,
          status: a.status || '',
          appointmentId: String(a.id),
          appointmentNumber: a.appointment_number || '',
          notes: a.notes || '',
        };
      });

      setRows(items);
    } catch (error: any) {
      console.error('Error fetching history:', error);
    } finally {
      setIsLoadingData(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const sortColumns = [
    { key: 'appointmentNumber' as const, label: 'Appt #' },
    { key: 'date' as const, label: 'Date & Time' },
    { key: 'petName' as const, label: 'Pet & Vet' },
    { key: 'service' as const, label: 'Service' },
    { key: 'status' as const, label: 'Status & Price' },
  ];

  const filtered = useMemo(() => {
    return rows
      .filter((r) => (statusFilter ? r.status === statusFilter : true))
      .filter((r) => {
        if (!searchQuery) return true;
        return [r.petName, r.vetName, r.service, r.date]
          .join(' ')
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
      });
  }, [rows, statusFilter, searchQuery]);

  const { sortedData, requestSort, sortConfig } = useSort(filtered, {
    key: 'date',
    direction: 'desc',
  } as any);

  const indexOfLast = currentPage * itemsPerPage;
  const currentItems = (sortedData as BookingHistory[]).slice(
    indexOfLast - itemsPerPage,
    indexOfLast,
  );

  return (
    <div className='p-4 bg-white rounded-xl shadow-md'>
      {/* Search & Filter Bar (without add button) */}
      <div className='flex gap-4 items-center justify-between mb-4'>
        <div className='flex-1 flex gap-2'>
          <input
            type='text'
            placeholder='Search by pet, vet, service, date…'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className='flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className='px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white'
          >
            <option value=''>All Status</option>
            <option value='Completed'>Completed</option>
            <option value='Cancelled'>Cancelled</option>
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className='p-8 text-center text-gray-500'>
          {isLoadingData
            ? 'Loading history...'
            : 'No booking history available.'}
        </div>
      ) : (
        <div className='w-full overflow-x-auto rounded-lg border border-gray-200'>
          <div className='min-w-[700px]'>
            <Table className='w-full'>
              <TableHeader className='bg-gray-50'>
                <TableRow>
                  {sortColumns.map((col) => (
                    <SortableTableHeader<BookingHistory>
                      key={col.key}
                      columnKey={col.key as keyof BookingHistory}
                      label={col.label}
                      sortConfig={sortConfig}
                      requestSort={requestSort}
                      className='p-2 py-4 text-left text-xs text-gray-500 font-semibold uppercase tracking-wide'
                    />
                  ))}
                  <TableCell className='p-2 py-4 text-xs text-gray-500 font-semibold uppercase tracking-wide'>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentItems.map((r) => (
                  <TableRow key={r.id} className='hover:bg-gray-50 border-b border-gray-100 last:border-0'>
                    {/* Appt # */}
                    <TableCell className='px-3 py-3'>
                      <span className='text-xs text-gray-800 bg-gray-100 px-2 py-1 rounded whitespace-nowrap'>
                        {r.appointmentNumber || 'N/A'}
                      </span>
                    </TableCell>

                    {/* Date & Time */}
                    <TableCell className='px-3 py-3 min-w-[130px]'>
                      <div className='flex flex-col gap-0.5'>
                        <span className='text-sm text-gray-900 leading-tight'>
                          {r.date
                            ? new Date(r.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                            : 'N/A'}
                        </span>
                        <span className='text-xs text-gray-400 leading-tight'>{r.time || 'N/A'}</span>
                      </div>
                    </TableCell>

                    {/* Pet & Vet */}
                    <TableCell className='px-3 py-3 min-w-[150px]'>
                      <div className='flex flex-col gap-0.5'>
                        <div className='flex items-center gap-2'>
                          <ImageHoverPreview
                            src={r.petPhoto || '/images/pets/placeholder.jpg'}
                            alt={r.petName}
                            className='w-7 h-7 rounded-full flex-shrink-0'
                          />
                          <span className='text-sm text-gray-900 leading-tight'>{r.petName || 'N/A'}</span>
                        </div>
                        <span className='text-xs text-gray-400 leading-tight pl-9'>{r.vetName || 'N/A'}</span>
                      </div>
                    </TableCell>

                    {/* Service */}
                    <TableCell className='px-3 py-3 min-w-[140px]'>
                      <span className='text-sm text-gray-900'>{r.service || 'N/A'}</span>
                    </TableCell>

                    {/* Status & Price */}
                    <TableCell className='px-3 py-3'>
                      <div className='flex flex-col gap-1'>
                        <span className='text-sm text-gray-800'>{r.price ? `$${r.price}` : '—'}</span>
                        <Badge size='sm' color={r.status === 'Completed' ? 'success' : 'error'}>
                          {r.status}
                        </Badge>
                      </div>
                    </TableCell>

                    {/* Actions */}
                    <TableCell className='px-3 py-3'>
                      <div className='flex gap-2'>
                        {/* View button */}
                        <button
                          onClick={() => {
                            if (onSelectAppointment) {
                              onSelectAppointment({
                                id: r.appointmentId || r.id,
                                appointmentId: r.appointmentId || r.id,
                                appointmentNumber: r.appointmentNumber || '',
                                petId: r.petId,
                                petName: r.petName,
                                petPhoto: r.petPhoto,
                                ownerName: '',
                                service: r.service || '',
                                date: r.date || '',
                                time: r.time || '',
                                status: (r.status as any) || 'completed',
                                notes: r.notes,
                              });
                            }
                          }}
                          className='text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50'
                          title='View Details'
                        >
                          <MdEdit className='w-5 h-5' />
                        </button>
                      </div>
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
    </div>
  );
}
