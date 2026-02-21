import { MdEdit, MdDelete, MdAdd } from 'react-icons/md';
import { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from '../../ui/table';
import Badge from '../../ui/badge/Badge';
import Checkbox from '../../form/input/Checkbox';
import VetBookingForm from '../../../adminPages/Forms/VetForms/VetBookingForm';
import Pagination from '../tableComponents/Pagination';
import useSort from '../../../hooks/useSort';
import SortableTableHeader from '../tableComponents/SortableTableHeader';
import { TableToolbar } from '../tableComponents/TableToolbar';
import DeleteDialog from '../tableComponents/DeleteDailog';
import { API_ENDPOINTS } from '../../../constants/api';
import VeterinaryBookingsDetail from '../../../adminPages/AdminPageForms/VeterinaryBookingsDetail/VeterinaryBookingsDetail';
import AdminAppointmentDetail from '../../../adminPages/AdminPageForms/AdminAppointmentDetail';
import { useAuth } from '../../auth/AuthContext';

export interface Booking {
  id: string;
  appointment_number: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
  priority?: string;
  appointment_type?: string;
  chief_complaint?: string;
  notes?: string;
  symptoms?: string[];
  consultation_fee?: string;
  service_fee?: string;
  total_amount?: string;
  payment_status: string;
  first_name: string;
  last_name: string;
  email: string;
  pet_name: string;
  vet_first_name: string;
  vet_last_name: string;
  clinic_name: string;
  payment_info?: {
    id?: string;
    paid_amount?: number;
    total_amount?: number;
    payment_method?: string;
    payment_status?: string;
  };
  services?: Array<{
    id: string;
    code: string;
    name: string;
    default_fee: number;
  }>;
  vet_service_ids?: any[];
}

// This data is no longer used - appointments are fetched from API
// const mockBookings: Booking[] = Array.from({ length: 100 }, ...);

export default function VetBookingsTable() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin';

  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [actionDropdown, setActionDropdown] = useState<string>('No actions');
  const [statusUpdate, setStatusUpdate] = useState<string>('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editBooking, setEditBooking] = useState<Booking | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<
    string | null
  >(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookingToDelete, setBookingToDelete] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch appointments from API
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        const token = sessionStorage.getItem('token');
        const response = await fetch(API_ENDPOINTS.APPOINTMENTS.BASE, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        });

        if (!response.ok) {
          throw new Error(
            `Failed to fetch appointments: ${response.statusText}`,
          );
        }

        const responseData = await response.json();
        // Handle the nested data structure from the API
        const appointmentsArray =
          responseData.data?.data || responseData.data || [];
        setBookings(appointmentsArray);
        setError(null);
      } catch (err) {
        console.error('Error fetching appointments:', err);
        setError(
          err instanceof Error ? err.message : 'Failed to load appointments',
        );
        setBookings([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  const sortColumns = [
    { key: 'appointment_number' as const, label: 'Appt #' },
    { key: 'first_name' as const, label: 'Pet & Owner' },
    { key: 'appointment_date' as const, label: 'Date & Time' },
    { key: 'vet_first_name' as const, label: 'Veterinarian & Clinic' },
    { key: 'status' as const, label: 'Status' },

    { key: 'total_amount' as const, label: 'Amount' },
  ];

  // Filtered data based on search and status
  const filteredData = bookings
    .filter((booking) =>
      [
        booking.id,
        booking.appointment_number,
        booking.first_name,
        booking.last_name,
        booking.pet_name,
        booking.vet_first_name,
        booking.vet_last_name,
        booking.clinic_name,
      ]
        .join(' ')
        .toLowerCase()
        .includes(searchQuery.toLowerCase()),
    )
    .filter((booking) =>
      statusFilter ? booking.status === statusFilter : true,
    );
  const { sortedData, requestSort, sortConfig } = useSort(filteredData, {
    key: 'id',
    direction: 'asc',
  });

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedData.slice(indexOfFirstItem, indexOfLastItem);
  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handle items per page change
  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to the first page
  };

  const toggleSelectRow = (id: string) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id],
    );
  };

  const toggleSelectAll = () => {
    setSelectedRows(
      selectedRows.length === bookings.length
        ? []
        : bookings.map((row) => row.id),
    );
  };

  const handleApplyAction = () => {
    if (actionDropdown === 'Delete') {
      handleDelete(); // Trigger bulk deletion
    } else if (actionDropdown === 'Status' && statusUpdate) {
      const updatedBookings = bookings.map((booking) =>
        selectedRows.includes(booking.id)
          ? { ...booking, bookingStatus: statusUpdate }
          : booking,
      );
      setBookings(updatedBookings);
      setSelectedRows([]);
    }
  };

  const handleDelete = (id?: string) => {
    if (id) {
      // Set the ID of the booking to delete
      setBookingToDelete(id);
    } else {
      // For bulk deletion, no specific ID is needed
      setBookingToDelete(null);
    }
    // Show the delete dialog box
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    let updatedBookings: Booking[];

    if (bookingToDelete) {
      // Delete a single booking by ID
      updatedBookings = bookings.filter(
        (booking) => booking.id !== bookingToDelete,
      );
    } else {
      // Delete selected rows (bulk deletion)
      updatedBookings = bookings.filter(
        (booking) => !selectedRows.includes(booking.id),
      );
    }

    // Update the state with the new array
    setBookings(updatedBookings);
    setIsDeleteDialogOpen(false);
    setSelectedRows([]); // Clear selected rows
    setBookingToDelete(null); // Reset the booking to delete
  };

  const handleEdit = (booking: Booking) => {
    setSelectedBooking(booking);
    setSelectedAppointmentId(booking.id);
    setShowDetailModal(true);
  };

  const handleAddNew = () => {
    setIsAddDialogOpen(true);
  };

  const confirmAddNew = () => {
    // For now, we'll just close the dialog since API integration would be needed here
    setIsAddDialogOpen(false);
  };

  const confirmEdit = () => {
    // For now, we'll just close the dialog since API integration would be needed here
    setEditBooking(null);
  };

  return (
    <div className='bg-white rounded-xl shadow-md'>
      {/* Loading State */}
      {loading && (
        <div className='flex items-center justify-center py-12'>
          <div className='text-center'>
            <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto mb-4'></div>
            <p className='text-gray-600'>Loading appointments...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className='p-4 bg-red-50 border border-red-200 rounded-lg mb-4'>
          <p className='text-red-700 font-semibold'>Error</p>
          <p className='text-red-600'>{error}</p>
        </div>
      )}

      {/* Table Content */}
      {!loading && (
        <>
          <TableToolbar
            onAddNew={handleAddNew}
            addButtonLabel='Add Booking'
            addButtonIcon={<MdAdd className='w-5 h-5' />}
            showAddButton={!isAdmin}
            selectedRowsCount={selectedRows.length}
            bulkActionsOptions={
              <>
                <option value='No actions'>No actions</option>
                <option value='Delete'>Delete</option>
                <option value='Status'>Booking Status</option>
              </>
            }
            statusUpdateOptions={
              <>
                <option value=''>Select Status</option>
                <option value='Pending'>Pending</option>
                <option value='Accepted'>Accepted</option>
                <option value='Completed'>Completed</option>
                <option value='Completed'>Paid</option>
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
            searchPlaceholder='Search bookings...'
            filterOptions={
              <>
                <option value=''>All Status</option>
                <option value='Pending'>Pending</option>
                <option value='Accepted'>Accepted</option>
                <option value='Completed'>Completed</option>
                <option value='Completed'>Paid</option>
              </>
            }
            onFilterChange={setStatusFilter}
            filterValue={statusFilter}
          />

          {/* Table */}
          <div className='w-full overflow-x-auto rounded-lg border border-gray-200'>
            <div className='min-w-[900px]'>
              <Table className='w-full'>
                <TableHeader className='bg-gray-50'>
                  <TableRow>
                    <TableCell className='w-10 p-2 py-3'>
                      <Checkbox
                        checked={selectedRows.length === bookings.length}
                        onChange={toggleSelectAll}
                      />
                    </TableCell>
                    {sortColumns.map((column) => (
                      <SortableTableHeader<Booking>
                        key={column.key}
                        columnKey={column.key}
                        label={column.label}
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
                  {currentItems.map((booking) => (
                    <TableRow
                      key={booking.id}
                      className='hover:bg-gray-50 border-b border-gray-100 last:border-0'
                    >
                      <TableCell className='px-3 py-3'>
                        <Checkbox
                          checked={selectedRows.includes(booking.id)}
                          onChange={() => toggleSelectRow(booking.id)}
                        />
                      </TableCell>

                      {/* Appointment # */}
                      <TableCell className='px-3 py-3'>
                        <span className='text-xs text-gray-800 bg-gray-100 px-2 py-1 rounded whitespace-nowrap'>
                          {booking.appointment_number || 'N/A'}
                        </span>
                      </TableCell>

                      {/* Patient & Owner */}
                      <TableCell className='px-3 py-3 min-w-[150px]'>
                        <div className='flex flex-col gap-0.5'>
                          <span className='text-sm text-gray-900 leading-tight'>
                            {booking.pet_name || 'N/A'}
                          </span>
                          <span className='text-xs text-gray-400 leading-tight'>
                            {`${booking.first_name || ''} ${booking.last_name || ''}`.trim() || 'N/A'}
                          </span>
                        </div>
                      </TableCell>

                      {/* Date & Time */}
                      <TableCell className='px-3 py-3 min-w-[130px]'>
                        <div className='flex flex-col gap-0.5'>
                          <span className='text-sm text-gray-900 leading-tight'>
                            {new Date(booking.appointment_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                          <span className='text-xs text-gray-400 leading-tight'>
                            {booking.appointment_time || 'N/A'}
                          </span>
                        </div>
                      </TableCell>

                      {/* Veterinarian & Clinic */}
                      <TableCell className='px-3 py-3 min-w-[160px]'>
                        <div className='flex flex-col gap-0.5'>
                          <span className='text-sm text-gray-900 leading-tight'>
                            {`Dr. ${booking.vet_first_name || ''} ${booking.vet_last_name || ''}`.trim() === 'Dr.' ? 'N/A' : `Dr. ${booking.vet_first_name || ''} ${booking.vet_last_name || ''}`.trim()}
                          </span>
                          <span className='text-xs text-gray-400 leading-tight'>
                            {booking.clinic_name || 'N/A'}
                          </span>
                        </div>
                      </TableCell>

                      {/* Status */}
                      <TableCell className='px-3 py-3'>
                        <Badge
                          size='sm'
                          color={
                            booking.status === 'scheduled'
                              ? 'info'
                              : booking.status === 'completed'
                                ? 'success'
                                : booking.status === 'cancelled'
                                  ? 'error'
                                  : 'warning'
                          }
                        >
                          {booking.status}
                        </Badge>
                      </TableCell>

                      {/* Amount & Payment */}
                      <TableCell className='px-3 py-3'>
                        <div className='flex flex-col gap-1'>
                          <span className='text-sm text-gray-800'>
                            ${booking.total_amount || '0.00'}
                          </span>
                          <Badge
                            size='sm'
                            color={booking.payment_status === 'paid' ? 'success' : 'warning'}
                          >
                            {booking.payment_status}
                          </Badge>
                        </div>
                      </TableCell>

                      <TableCell className='px-3 py-3'>
                        <div className='flex gap-2 items-center'>
                          <button
                            onClick={() => handleEdit(booking)}
                            className='text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50'
                            title='View / Edit'
                          >
                            <MdEdit className='w-5 h-5' />
                          </button>
                          <button
                            onClick={() => handleDelete(booking.id)}
                            className='text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50'
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

          {/* Pagination - Keep as is */}
          <Pagination
            totalItems={filteredData.length}
            itemsPerPage={itemsPerPage}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleItemsPerPageChange}
          />
        </>
      )}

      {/* Keep all your existing dialog components exactly as they are */}
      {/* Detail Slider Modal */}
      {showDetailModal && selectedAppointmentId && (
        <>
          {/* Backdrop */}
          <div
            className='fixed inset-0 bg-black/30 z-40'
            onClick={() => {
              setShowDetailModal(false);
              setSelectedAppointmentId(null);
              setSelectedBooking(null);
            }}
          ></div>
          {/* Slider - Positioned below app header */}
          <div
            className='fixed right-0 h-full w-2/3 z-50 flex flex-col bg-white shadow-2xl'
            style={{ top: '64px', height: 'calc(100% - 64px)' }}
          >
            {/* Header - Clean white header */}
            <div className='flex-shrink-0 bg-white px-8 py-6 flex items-center justify-between border-b border-gray-200'>
              <h2 className='text-2xl font-semibold text-gray-800'>
                Appointment Details
              </h2>
              <button
                type='button'
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedAppointmentId(null);
                  setSelectedBooking(null);
                }}
                className='text-gray-400 hover:text-gray-600 text-3xl leading-none'
              >
                ×
              </button>
            </div>
            {/* Content - Scrollable */}
            <div className='flex-1 overflow-y-auto p-8'>
              {isAdmin ? (
                <AdminAppointmentDetail
                  appointment={selectedBooking}
                  appointmentId={selectedAppointmentId}
                  onBack={() => {
                    setShowDetailModal(false);
                    setSelectedAppointmentId(null);
                    setSelectedBooking(null);
                  }}
                />
              ) : (
                <VeterinaryBookingsDetail
                  appointmentId={selectedAppointmentId}
                  onBack={() => {
                    setShowDetailModal(false);
                    setSelectedAppointmentId(null);
                    setSelectedBooking(null);
                  }}
                />
              )}
            </div>
          </div>
        </>
      )}

      {isAddDialogOpen || editBooking ? (
        <VetBookingForm
          booking={editBooking as any}
          onSubmit={editBooking ? confirmEdit : confirmAddNew}
          onCancel={() => {
            setIsAddDialogOpen(false);
            setEditBooking(null);
          }}
        />
      ) : null}

      <DeleteDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        itemLabel='Vet Booking'
        description={
          selectedRows.length > 1
            ? `Are you sure you want to delete ${selectedRows.length} selected bookings?`
            : 'Are you sure you want to delete this booking?'
        }
      />
    </div>
  );
}
