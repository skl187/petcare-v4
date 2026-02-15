import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from '../../../../components/ui/table';
import Badge from '../../../../components/ui/badge/Badge';
// import Checkbox from "../../../../components/form/input/Checkbox";
import Pagination from '../../../tables/tableComponents/Pagination';
import useSort from '../../../../hooks/useSort';
import SortableTableHeader from '../../../tables/tableComponents/SortableTableHeader';
import ImageHoverPreview from '../../../tables/tableComponents/ImageHoverPreview';
import { MdEdit } from 'react-icons/md';
import { API_ENDPOINTS } from '../../../../constants/api';
import type { VetBooking } from '../../../vetTables/Veterinary/VeterninaryBookingsTable/VeterinaryBookingsTable';

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

  const columns = [
    { key: 'date', label: 'Date', className: 'min-w-[120px]' },
    { key: 'time', label: 'Time', className: 'min-w-[100px]' },
    { key: 'petName', label: 'Pet', className: 'min-w-[160px]' },
    { key: 'vetName', label: 'Vet', className: 'min-w-[180px]' },
    { key: 'service', label: 'Service', className: 'min-w-[160px]' },
    { key: 'status', label: 'Status', className: 'min-w-[120px]' },
    { key: 'price', label: 'Price', className: 'min-w-[100px]' },
    { key: 'actions', label: 'Actions', className: 'min-w-[80px]' },
  ] as const;

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
          <div className='min-w-[1100px]'>
            <Table className='w-full'>
              <TableHeader className='bg-gray-50'>
                <TableRow>
                  {columns.map((col) => (
                    <SortableTableHeader<BookingHistory>
                      key={col.key}
                      columnKey={col.key as keyof BookingHistory}
                      label={col.label}
                      sortConfig={sortConfig}
                      requestSort={requestSort}
                      className={`p-2 text-left ${col.className}`}
                    />
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentItems.map((r) => (
                  <TableRow key={r.id} className='hover:bg-gray-50'>
                    <TableCell className='p-2'>{r.date}</TableCell>
                    <TableCell className='p-2'>{r.time}</TableCell>
                    <TableCell className='p-2'>
                      <div className='flex items-center gap-2'>
                        <ImageHoverPreview
                          src={r.petPhoto || '/images/pets/placeholder.jpg'}
                          alt={r.petName}
                          className='w-8 h-8 rounded-full'
                        />
                        {r.petName}
                      </div>
                    </TableCell>
                    <TableCell className='p-2'>{r.vetName}</TableCell>
                    <TableCell className='p-2'>{r.service}</TableCell>
                    <TableCell className='p-2'>
                      <Badge
                        size='sm'
                        color={r.status === 'Completed' ? 'success' : 'error'}
                      >
                        {r.status}
                      </Badge>
                    </TableCell>
                    <TableCell className='p-2'>
                      {r.price ? `$${r.price}` : '—'}
                    </TableCell>
                    <TableCell className='p-2'>
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
