import { useState } from "react";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../ui/table";
import Pagination from "../tableComponents/Pagination";
import { DateRangeFilter } from "../tableComponents/DateRangePicker";
import SortableTableHeader from "../tableComponents/SortableTableHeader";
import useSort from "../../../hooks/useSort";
import { FiCalendar } from "react-icons/fi";
export interface DailyBooking {
  id: number;
  bookingDate: string;
  numberOfBookings: number;
  totalAmount: number;
  taxAmount: number;
  finalAmount: number;
}

// Mock data for daily bookings
const mockDailyBookings: DailyBooking[] = [
  {
    id: 1,
    bookingDate: new Date(Date.now() - 86400000 * 0).toISOString(), // Today
    numberOfBookings: 12,
    totalAmount: 2400,
    taxAmount: 288,
    finalAmount: 2688,
  },
  {
    id: 2,
    bookingDate: new Date(Date.now() - 86400000 * 1).toISOString(), // Yesterday
    numberOfBookings: 8,
    totalAmount: 1600,
    taxAmount: 192,
    finalAmount: 1792,
  },
  {
    id: 3,
    bookingDate: new Date(Date.now() - 86400000 * 2).toISOString(),
    numberOfBookings: 15,
    totalAmount: 3000,
    taxAmount: 360,
    finalAmount: 3360,
  },
  {
    id: 4,
    bookingDate: new Date(Date.now() - 86400000 * 3).toISOString(),
    numberOfBookings: 6,
    totalAmount: 1200,
    taxAmount: 144,
    finalAmount: 1344,
  },
  {
    id: 5,
    bookingDate: new Date(Date.now() - 86400000 * 4).toISOString(),
    numberOfBookings: 10,
    totalAmount: 2000,
    taxAmount: 240,
    finalAmount: 2240,
  },
  {
    id: 6,
    bookingDate: new Date(Date.now() - 86400000 * 5).toISOString(),
    numberOfBookings: 7,
    totalAmount: 1400,
    taxAmount: 168,
    finalAmount: 1568,
  },
  {
    id: 7,
    bookingDate: new Date(Date.now() - 86400000 * 6).toISOString(),
    numberOfBookings: 9,
    totalAmount: 1800,
    taxAmount: 216,
    finalAmount: 2016,
  },
];


export default function DailyBookingsTable() {
  const [bookings] = useState<DailyBooking[]>(mockDailyBookings);
  const [dateRange, setDateRange] = useState<{ start: Date | null; end: Date | null }>({ 
    start: null, 
    end: null 
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);


  const columns = [
    {
      key: "id",
      label: "No.",
      className: "min-w-[50px] text-gray-700 font-semibold max-w-[250px]",
    },
    {
      key: "bookingDate",
      label: "Booking Date",
      className: "min-w-[70px] text-gray-700 font-semibold max-w-[150px]",
    },
    {
      key: "numberOfBookings",
      label: "Number Of Bookings",
      className: "min-w-[70px] text-gray-700 font-semibold max-w-[100px]",
    },
    {
      key: "totalAmount",
      label: "Total Amount",
      className: "min-w-[80px] text-gray-700 font-semibold max-w-[150px]",
    },
    {
      key: "taxAmount",
      label: "Tax Amount",
      className: "min-w-[80px] text-gray-700  font-semibold max-w-[180px]",
    },
    {
      key: "finalAmount",
      label: "Final Amount",
      className: "min-w-[80px] text-gray-700 font-semibold max-w-[100px]",
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

  // Filter by date range
  const filteredData = bookings.filter(booking => {
    if (!dateRange.start && !dateRange.end) return true;
    
    const bookingDate = new Date(booking.bookingDate);
    const start = dateRange.start ? new Date(dateRange.start) : new Date(-8640000000000000);
    const end = dateRange.end ? new Date(dateRange.end) : new Date(8640000000000000);
    
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    
    return bookingDate >= start && bookingDate <= end;
  });

  const { sortedData, requestSort, sortConfig } = useSort(filteredData, {
    key: "id",
    direction: "asc",
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
   
      <div className="flex justify-end mb-4"> 
        <DateRangeFilter
          startDate={dateRange.start}
          endDate={dateRange.end}
          onChange={handleDateRangeChange}
          placeholder="Filter by date range"
        />
      </div>

      {/* Table with fixed height */}
      <div className="w-full overflow-x-auto rounded-lg border border-gray-200 min-h-[300px]">
        <Table className="w-full">
          <TableHeader className="bg-gray-50">
            <TableRow>
              {columns.map((column) => (
                <SortableTableHeader<DailyBooking>
                  key={column.key}
                  columnKey={column.key}
                  label={column.label}
                  sortConfig={sortConfig}
                  requestSort={requestSort}
                  className={`p-2 py-4 text-left text-sm text-gray-100 font-medium ${column.className}`}
                />
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
                  <TableCell className="p-2 py-4 text-sm font-medium text-gray-900">
                    {formatDate(booking.bookingDate)}
                  </TableCell>
                  <TableCell className="p-2 py-4 text-sm text-gray-500">
                    {booking.numberOfBookings}
                  </TableCell>
                  <TableCell className="p-2 py-4 text-sm text-gray-500">
                    {formatCurrency(booking.totalAmount)}
                  </TableCell>
                  <TableCell className="p-2 py-4 text-sm text-gray-500">
                    {formatCurrency(booking.taxAmount)}
                  </TableCell>
                  <TableCell className="p-2 py-4 text-sm text-gray-900 font-medium">
                    {formatCurrency(booking.finalAmount)}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell className="h-[250px] text-center">
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

      {/* Pagination - keep exactly as is */}
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