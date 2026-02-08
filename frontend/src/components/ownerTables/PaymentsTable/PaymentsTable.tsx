import { useState, useMemo } from "react";
import {
  Table, TableBody, TableCell, TableHeader, TableRow,
} from "../../../components/ui/table";
import Badge from "../../../components/ui/badge/Badge";
import Pagination from "../../tables/tableComponents/Pagination";
import useSort from "../../../hooks/useSort";
import SortableTableHeader from "../../tables/tableComponents/SortableTableHeader";
import { TableToolbar } from "../../tables/tableComponents/TableToolbar";

export type PaymentStatus = "Paid" | "Refunded" | "Failed";
export interface Payment {
  id: number;
  date: string;
  amount: number;
  method: string;
  description: string;
  status: PaymentStatus;
}

// mock
const mockPayments: Payment[] = [
  { id: 1, date: "2025-08-01", amount: 200, method: "Credit Card", description: "Dental Cleaning", status: "Paid" },
  { id: 2, date: "2025-07-15", amount: 300, method: "PayPal", description: "Surgery Consult", status: "Refunded" },
];

export default function PaymentsTable() {
  const [rows] = useState<Payment[]>(mockPayments);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const columns = [
    { key: "id", label: "ID", className: "min-w-[80px]" },
    { key: "date", label: "Date", className: "min-w-[120px]" },
    { key: "amount", label: "Amount", className: "min-w-[100px]" },
    { key: "method", label: "Method", className: "min-w-[120px]" },
    { key: "description", label: "Description", className: "min-w-[200px]" },
    { key: "status", label: "Status", className: "min-w-[120px]" },
  ] as const;

  const filtered = useMemo(() => {
    return rows
      .filter(r => (statusFilter ? r.status === statusFilter : true))
      .filter(r => {
        if (!searchQuery) return true;
        return [r.description, r.method, r.date]
          .join(" ")
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
      });
  }, [rows, statusFilter, searchQuery]);

  const { sortedData, requestSort, sortConfig } = useSort(filtered, { key: "date", direction: "desc" } as any);

  const indexOfLast = currentPage * itemsPerPage;
  const currentItems = (sortedData as Payment[]).slice(indexOfLast - itemsPerPage, indexOfLast);

  return (
    <div className="p-4 bg-white rounded-xl shadow-md">
      <TableToolbar
        onAddNew={undefined}
        addButtonLabel=""
        selectedRowsCount={0}
        bulkActionsOptions={<></>}
        statusUpdateOptions={<></>}
        showStatusDropdown={false}
        onBulkActionChange={() => {}}
        onStatusUpdateChange={() => {}}
        onApplyAction={() => {}}
        bulkActionValue=""
        statusUpdateValue=""
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search payments by description/method/date…"
        filterOptions={
          <>
            <option value="">All Status</option>
            <option value="Paid">Paid</option>
            <option value="Refunded">Refunded</option>
            <option value="Failed">Failed</option>
          </>
        }
        onFilterChange={setStatusFilter}
        filterValue={statusFilter}
      />

      {filtered.length === 0 ? (
        <div className="p-8 text-center text-gray-500">No payments found.</div>
      ) : (
       <div className="w-full overflow-x-auto rounded-lg border border-gray-200">
  <div className="min-w-[900px]"> {/* Adjust width depending on columns */}
    <Table className="w-full">
      <TableHeader className="bg-gray-50">
        <TableRow>
          {columns.map(col => (
            <SortableTableHeader<Payment>
              key={col.key}
              columnKey={col.key as keyof Payment}
              label={col.label}
              sortConfig={sortConfig}
              requestSort={requestSort}
              className={`p-2 text-left ${col.className}`}
            />
          ))}
        </TableRow>
      </TableHeader>

      <TableBody>
        {currentItems.map(p => (
          <TableRow key={p.id} className="hover:bg-gray-50">
            <TableCell className="p-2">#{p.id}</TableCell>
            <TableCell className="p-2">{p.date}</TableCell>
            <TableCell className="p-2">${p.amount.toFixed(2)}</TableCell>
            <TableCell className="p-2">{p.method}</TableCell>
            <TableCell className="p-2">{p.description}</TableCell>
            <TableCell className="p-2">
              <Badge
                size="sm"
                color={
                  p.status === "Paid"
                    ? "success"
                    : p.status === "Refunded"
                    ? "warning"
                    : "error"
                }
              >
                {p.status}
              </Badge>
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
        onItemsPerPageChange={n => { setItemsPerPage(n); setCurrentPage(1); }}
      />
    </div>
  );
}
