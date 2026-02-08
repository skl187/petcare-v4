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
import VetBookingForm from '../../../pages/Forms/VetForms/VetBookingForm';
import Pagination from '../tableComponents/Pagination';
import useSort from '../../../hooks/useSort';
import SortableTableHeader from '../tableComponents/SortableTableHeader';
import { TableToolbar } from '../tableComponents/TableToolbar';
import DeleteDialog from '../tableComponents/DeleteDailog';
import { API_ENDPOINTS } from '../../../constants/api';
import VeterinaryBookingsDetail from '../../../pages/VetPageForms/Veterinary/VeterinaryBookingsDetail/VeterinaryBookingsDetail';
import AdminAppointmentDetail from '../../../pages/VetPageForms/Veterinary/AdminAppointmentDetail/AdminAppointmentDetail';
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

  const columns = [
    {
      key: 'id',
      label: 'ID',
      className: 'min-w-[80px] text-gray-700 font-semibold max-w-[105px]',
    },
    {
      key: 'appointment_number',
      label: 'Appointment #',
      className: 'min-w-[150px] text-gray-700 font-semibold max-w-[200px]',
    },
    {
      key: 'first_name',
      label: 'Owner',
      className: 'min-w-[150px] text-gray-700 font-semibold max-w-[200px]',
    },
    {
      key: 'pet_name',
      label: 'Pet',
      className: 'min-w-[120px] text-gray-700 max-w-[150px]',
    },
    {
      key: 'appointment_date',
      label: 'Date & Time',
      className: 'min-w-[150px] text-gray-700 font-semibold max-w-[200px]',
    },
    {
      key: 'vet_first_name',
      label: 'Veterinarian',
      className: 'min-w-[150px] text-gray-700 max-w-[200px]',
    },
    {
      key: 'clinic_name',
      label: 'Clinic',
      className: 'min-w-[150px] text-gray-700 max-w-[200px]',
    },
    {
      key: 'status',
      label: 'Status',
      className: 'min-w-[120px] text-gray-700 max-w-[150px]',
    },
    {
      key: 'payment_status',
      label: 'Payment Status',
      className: 'min-w-[150px] text-gray-700 max-w-[200px]',
    },
    {
      key: 'total_amount',
      label: 'Total Amount',
      className: 'min-w-[120px] text-gray-700 max-w-[150px]',
    },
  ] as const;

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
    <div className='p-4 bg-white rounded-xl shadow-md'>
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

          {/* Table - Made horizontally scrollable on small screens */}
          <div className='w-full overflow-x-auto rounded-lg border border-gray-200'>
            <div className='min-w-[1024px]'>
              {' '}
              {/* Minimum width to ensure all columns are visible */}
              <Table className='w-full'>
                <TableHeader className='bg-gray-50'>
                  <TableRow>
                    <TableCell className='w-10 p-2 py-3'>
                      <Checkbox
                        checked={selectedRows.length === bookings.length}
                        onChange={toggleSelectAll}
                      />
                    </TableCell>
                    {columns.map((column) => (
                      <SortableTableHeader<Booking>
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
                  {currentItems.map((booking) => (
                    <TableRow key={booking.id} className='hover:bg-gray-50'>
                      <TableCell className='p-2 py-4'>
                        <Checkbox
                          checked={selectedRows.includes(booking.id)}
                          onChange={() => toggleSelectRow(booking.id)}
                        />
                      </TableCell>
                      {columns.map((column) => (
                        <TableCell
                          key={`${booking.id}-${column.key}`}
                          className={`p-2 py-4 text-sm text-gray-900 ${column.className}`}
                        >
                          {column.key === 'appointment_date' ? (
                            new Date(
                              booking.appointment_date,
                            ).toLocaleDateString() +
                            ' ' +
                            booking.appointment_time
                          ) : column.key === 'total_amount' ? (
                            `$${booking.total_amount || '0.00'}`
                          ) : column.key === 'status' ? (
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
                          ) : column.key === 'payment_status' ? (
                            <Badge
                              size='sm'
                              color={
                                booking.payment_status === 'paid'
                                  ? 'success'
                                  : 'warning'
                              }
                            >
                              {booking.payment_status}
                            </Badge>
                          ) : (
                            (booking as any)[column.key] || 'N/A'
                          )}
                        </TableCell>
                      ))}
                      <TableCell className='p-2 py-4'>
                        <div className='flex gap-2'>
                          <button
                            onClick={() => handleEdit(booking)}
                            className='text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50'
                          >
                            <MdEdit className='w-5 h-5' />
                          </button>
                          <button
                            onClick={() => handleDelete(booking.id)}
                            className='text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50'
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
