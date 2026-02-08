import { useState } from "react";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../ui/table";
import Pagination from "../tableComponents/Pagination";
import { DateRangeFilter } from "../tableComponents/DateRangePicker";
import SortableTableHeader from "../tableComponents/SortableTableHeader";
import useSort from "../../../hooks/useSort";
import { OptimizedTableToolbar } from "../tableComponents/OptimizedTableToolbar";
import { FiCalendar } from "react-icons/fi";

export interface OverallBooking {
  id: number;
  bookingDate: string;
  invoiceId: string;
  staffName: string;
  serviceAmount: number;
  taxAmount: number;
  totalAmount: number;
}

// Mock data for overall bookings
const mockOverallBookings: OverallBooking[] = [
  {
    id: 1,
    bookingDate: new Date(Date.now() - 86400000 * 0).toISOString(),
    invoiceId: "INV-001",
    staffName: "John Doe",
    serviceAmount: 2000,
    taxAmount: 240,
    totalAmount: 2240,
  },
  {
    id: 2,
    bookingDate: new Date(Date.now() - 86400000 * 1).toISOString(),
    invoiceId: "INV-002",
    staffName: "Jane Smith",
    serviceAmount: 1500,
    taxAmount: 180,
    totalAmount: 1680,
  },
  // Add more mock data as needed
];

// Unique staff names for filter
const staffOptions = Array.from(new Set(mockOverallBookings.map(booking => booking.staffName)));

export default function OverallBookingsTable() {
  const [bookings] = useState<OverallBooking[]>(mockOverallBookings);
  const [dateRange, setDateRange] = useState<{ start: Date | null; end: Date | null }>({ 
    start: null, 
    end: null 
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStaff, setSelectedStaff] = useState("");

  const columns = [
    {
      key: "id",
      label: "No.",
      className: "min-w-[50px] text-gray-700 font-semibold max-w-[80px] text-left",
      sortable: false
    },
    {
      key: "bookingDate",
      label: "Booking Date",
      className: "min-w-[120px] text-gray-700 font-semibold max-w-[150px]",
      sortable: true
    },
    {
      key: "invoiceId",
      label: "Inv ID",
      className: "min-w-[100px] text-gray-700 font-semibold max-w-[120px]",
      sortable: true
    },
    {
      key: "staffName",
      label: "Staff",
      className: "min-w-[120px] text-gray-700 font-semibold max-w-[150px]",
      sortable: true
    },
    {
      key: "serviceAmount",
      label: "Service Amount",
      className: "min-w-[120px] text-gray-700 font-semibold max-w-[150px]",
      sortable: true
    },
    {
      key: "taxAmount",
      label: "Taxes",
      className: "min-w-[100px] text-gray-700 font-semibold max-w-[120px]",
      sortable: true
    },
    {
      key: "totalAmount",
      label: "Total Amount",
      className: "min-w-[120px] text-gray-700 font-semibold max-w-[150px]",
      sortable: true
    },
  ] as const;

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Filter by date range and staff
  const filteredData = bookings.filter(booking => {
    // Date range filter
    if (dateRange.start || dateRange.end) {
      const bookingDate = new Date(booking.bookingDate);
      const start = dateRange.start ? new Date(dateRange.start) : new Date(-8640000000000000);
      const end = dateRange.end ? new Date(dateRange.end) : new Date(8640000000000000);
      
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      
      if (!(bookingDate >= start && bookingDate <= end)) {
        return false;
      }
    }

    // Staff filter
    if (selectedStaff && booking.staffName !== selectedStaff) {
      return false;
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        booking.invoiceId.toLowerCase().includes(query) ||
        booking.staffName.toLowerCase().includes(query)
      );
    }

    return true;
  });

  const { sortedData, requestSort, sortConfig } = useSort(filteredData, {
    key: "bookingDate",
    direction: "desc",
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

  const handleDateRangeChange = (start: Date | null, end: Date | null) => {
    setDateRange({ start, end });
    setCurrentPage(1);
  };

  return (
    <div className="p-4 bg-white rounded-xl shadow-md">
      {/* Table Toolbar with search and staff filter */}
   
      <div className="flex justify-end mt-2 mb-2">
          <DateRangeFilter
            startDate={dateRange.start}
            endDate={dateRange.end}
            onChange={handleDateRangeChange}
            placeholder="Filter by date range"
          />
             <OptimizedTableToolbar
        search={{
          query: searchQuery,
          onChange: setSearchQuery,
          placeholder: "Search by Inv ID or Staff"
        }}
        filter={{
          options: (
            <>
              <option value="">All Staff</option>
              {staffOptions.map(staff => (
                <option key={staff} value={staff}>{staff}</option>
              ))}
            </>
          ),
          onChange: setSelectedStaff,
          value: selectedStaff,
          placeholder: "Filter by staff"
        }}
      >
        {/* Date Range Filter as custom content */}
       
      </OptimizedTableToolbar>
        </div>
      {/* Table */}
      <div className="w-full overflow-x-auto rounded-lg border border-gray-200 min-h-[300px]">
        <Table className="w-full">
          <TableHeader className="bg-gray-50">
            <TableRow>
              {columns.map((column) => (
                column.sortable ? (
                  <SortableTableHeader<OverallBooking>
                    key={column.key}
                    columnKey={column.key}
                    label={column.label}
                    sortConfig={sortConfig}
                    requestSort={requestSort}
                    className={`p-2 py-4 text-left text-sm text-gray-100 font-medium ${column.className}`}
                  />
                ) : (
                  <th 
                    key={column.key} 
                    className={`p-2 py-4 text-sm ${column.className}`}
                  >
                    {column.label}
                  </th>
                )
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentItems.length > 0 ? (
              currentItems.map((booking, index) => (
                <TableRow key={booking.id} className="hover:bg-gray-50">
                  <TableCell className="p-2 py-4 text-sm text-gray-500">
                    {indexOfFirstItem + index + 1}
                  </TableCell>
                  <TableCell className="p-2 py-4 text-sm text-gray-500">
                    {formatDate(booking.bookingDate)}
                  </TableCell>
                  <TableCell className="p-2 py-4 text-sm font-medium text-gray-900">
                    {booking.invoiceId}
                  </TableCell>
                  <TableCell className="p-2 py-4 text-sm text-gray-500">
                    {booking.staffName}
                  </TableCell>
                  <TableCell className="p-2 py-4 text-sm text-gray-500">
                    {formatCurrency(booking.serviceAmount)}
                  </TableCell>
                  <TableCell className="p-2 py-4 text-sm  text-gray-500">
                    {formatCurrency(booking.taxAmount)}
                  </TableCell>
                  <TableCell className="p-2 py-4 text-sm font-medium text-gray-900">
                    {formatCurrency(booking.totalAmount)}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell  className="h-[250px] text-center">
                  <div className="flex flex-col items-center justify-center h-full text-gray-500">
                    <FiCalendar className="w-8 h-8 mb-2" />
                    <p>No bookings found</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {filteredData.length > 0 && (
        <Pagination
          totalItems={filteredData.length}
          itemsPerPage={itemsPerPage}
          onPageChange={handlePageChange}
          onItemsPerPageChange={handleItemsPerPageChange}
        />
      )}
    </div>
  );
}