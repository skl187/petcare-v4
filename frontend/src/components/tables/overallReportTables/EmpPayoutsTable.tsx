import { useState } from "react";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "../../ui/table";
import Pagination from "../tableComponents/Pagination";
import { DateRangeFilter } from "../tableComponents/DateRangePicker";
import SortableTableHeader from "../tableComponents/SortableTableHeader";
import useSort from "../../../hooks/useSort";
import { OptimizedTableToolbar } from "../tableComponents/OptimizedTableToolbar";
import { FiDollarSign } from "react-icons/fi";

export interface EmpPayout {
  id: number;
  paymentDate: string;
  staffName: string;
  commissionAmount: number;
  paymentType: 'cash' | 'card';
  totalPay: number;
}

// Mock data for employee payouts
const mockEmpPayouts: EmpPayout[] = [
  {
    id: 1,
    paymentDate: new Date(Date.now() - 86400000 * 0).toISOString(),
    staffName: "John Doe",
    commissionAmount: 200,
    paymentType: 'card',
    totalPay: 1000,
  },
  {
    id: 2,
    paymentDate: new Date(Date.now() - 86400000 * 1).toISOString(),
    staffName: "Jane Smith",
    commissionAmount: 150,
    paymentType: 'cash',
    totalPay: 750,
  },
  {
    id: 3,
    paymentDate: new Date(Date.now() - 86400000 * 2).toISOString(),
    staffName: "Mike Johnson",
    commissionAmount: 300,
    paymentType: 'card',
    totalPay: 1500,
  },
  {
    id: 4,
    paymentDate: new Date(Date.now() - 86400000 * 3).toISOString(),
    staffName: "Sarah Williams",
    commissionAmount: 180,
    paymentType: 'cash',
    totalPay: 900,
  },
];

export default function EmpPayoutsTable() {
  const [payouts] = useState<EmpPayout[]>(mockEmpPayouts);
  const [dateRange, setDateRange] = useState<{ start: Date | null; end: Date | null }>({ 
    start: null, 
    end: null 
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStaff, setSelectedStaff] = useState("");

  // Get unique staff names for filter
  const staffOptions = Array.from(new Set(mockEmpPayouts.map(payout => payout.staffName)));

  const columns = [
    {
      key: "id",
      label: "No.",
      className: "min-w-[50px] text-gray-700 font-semibold max-w-[80px] text-left",
      sortable: false
    },
    {
      key: "paymentDate",
      label: "Payment Date",
      className: "min-w-[120px] text-gray-700 font-semibold max-w-[150px]",
      sortable: true
    },
    {
      key: "staffName",
      label: "Staff",
      className: "min-w-[120px] text-gray-700 font-semibold max-w-[150px]",
      sortable: true
    },
    {
      key: "commissionAmount",
      label: "Commission Amount",
      className: "min-w-[150px] text-gray-700 font-semibold max-w-[180px]",
      sortable: true
    },
    {
      key: "paymentType",
      label: "Payment Type",
      className: "min-w-[120px] text-gray-700 font-semibold max-w-[150px]",
      sortable: true
    },
    {
      key: "totalPay",
      label: "Total Pay",
      className: "min-w-[150px] text-gray-700 font-semibold max-w-[180px]",
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

  // Format payment type
  const formatPaymentType = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

 
  const filteredData = payouts.filter(payout => {
    // Date range filter
    if (dateRange.start || dateRange.end) {
      const payoutDate = new Date(payout.paymentDate);
      const start = dateRange.start ? new Date(dateRange.start) : new Date(-8640000000000000);
      const end = dateRange.end ? new Date(dateRange.end) : new Date(8640000000000000);
      
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      
      if (!(payoutDate >= start && payoutDate <= end)) {
        return false;
      }
    }

    // Staff filter
    if (selectedStaff && payout.staffName !== selectedStaff) {
      return false;
    }


    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return payout.staffName.toLowerCase().includes(query);
    }

    return true;
  });

  const { sortedData, requestSort, sortConfig } = useSort(filteredData, {
    key: "paymentDate",
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
      {/* Table Toolbar with search and filters */}
      <div className="flex flex-wrap justify-end items-center gap-3 mb-2">
      <OptimizedTableToolbar
        search={{
          query: searchQuery,
          onChange: setSearchQuery,
          placeholder: "Search by staff name"
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
        </OptimizedTableToolbar>

          
          <DateRangeFilter
            startDate={dateRange.start}
            endDate={dateRange.end}
            onChange={handleDateRangeChange}
            placeholder="Filter by date range"
          />
        
      
      </div>
      {/* Table */}
      <div className="w-full overflow-x-auto rounded-lg border border-gray-200 min-h-[300px]">
        <Table className="w-full">
          <TableHeader className="bg-gray-50">
            <TableRow>
              {columns.map((column) => (
                column.sortable ? (
                  <SortableTableHeader<EmpPayout>
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
              currentItems.map((payout, index) => (
                <TableRow key={payout.id} className="hover:bg-gray-50">
                  <TableCell className="p-2 py-4 text-sm text-gray-900">
                    {indexOfFirstItem + index + 1}
                  </TableCell>
                  <TableCell className="p-2 py-4 text-sm text-gray-900">
                    {formatDate(payout.paymentDate)}
                  </TableCell>
                  <TableCell className="p-2 py-4 text-sm text-gray-900">
                    {payout.staffName}
                  </TableCell>
                  <TableCell className="p-2 py-4 text-sm text-gray-900">
                    {formatCurrency(payout.commissionAmount)}
                  </TableCell>
                  <TableCell className="p-2 py-4 text-sm text-gray-900">
                    {formatPaymentType(payout.paymentType)}
                  </TableCell>
                  <TableCell className="p-2 py-4 text-sm text-gray-900">
                    {formatCurrency(payout.totalPay)}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell className="h-[250px] text-center">
                  <div className="flex flex-col items-center justify-center h-full text-gray-500">
                    <FiDollarSign className="w-8 h-8 mb-2" />
                    <p>No payouts found</p>
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