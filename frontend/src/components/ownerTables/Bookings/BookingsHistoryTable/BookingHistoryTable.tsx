import { useState, useMemo } from "react";
import {
  Table, TableBody, TableCell, TableHeader, TableRow,
} from "../../../../components/ui/table";
import Badge from "../../../../components/ui/badge/Badge";
// import Checkbox from "../../../../components/form/input/Checkbox";
import Pagination from "../../../tables/tableComponents/Pagination";
import useSort from "../../../../hooks/useSort";
import SortableTableHeader from "../../../tables/tableComponents/SortableTableHeader";
import { TableToolbar } from "../../../tables/tableComponents/TableToolbar";
import ImageHoverPreview from "../../../tables/tableComponents/ImageHoverPreview";

export type BookingStatus = "Completed" | "Cancelled";
export interface BookingHistory {
  id: number;
  petName: string;
  petPhoto?: string;
  vetName: string;
  vetPhoto?: string;
  service: string;
  date: string;
  time: string;
  price?: number;
  status: BookingStatus;
}

// --- mock data ---
const mockHistory: BookingHistory[] = [
  {
    id: 9001,
    petName: "Bella",
    petPhoto: "/images/pets/dog.jpg",
    vetName: "Dr. Kim",
    vetPhoto: "/images/vets/kim.jpg",
    service: "Dental Cleaning",
    date: "2025-08-01",
    time: "09:00",
    price: 200,
    status: "Completed",
  },
  {
    id: 9002,
    petName: "Rocky",
    petPhoto: "/images/pets/dog2.jpg",
    vetName: "Dr. Singh",
    vetPhoto: "/images/vets/singh.jpg",
    service: "Surgery Consult",
    date: "2025-07-15",
    time: "14:00",
    price: 300,
    status: "Cancelled",
  },
];

export default function BookingHistoryTable() {
  const [rows] = useState<BookingHistory[]>(mockHistory);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const columns = [
    { key: "id", label: "ID", className: "min-w-[80px]" },
    { key: "date", label: "Date", className: "min-w-[120px]" },
    { key: "time", label: "Time", className: "min-w-[100px]" },
    { key: "petName", label: "Pet", className: "min-w-[160px]" },
    { key: "vetName", label: "Vet", className: "min-w-[180px]" },
    { key: "service", label: "Service", className: "min-w-[160px]" },
    { key: "status", label: "Status", className: "min-w-[120px]" },
    { key: "price", label: "Price", className: "min-w-[100px]" },
  ] as const;

  const filtered = useMemo(() => {
    return rows
      .filter(r => (statusFilter ? r.status === statusFilter : true))
      .filter(r => {
        if (!searchQuery) return true;
        return [r.petName, r.vetName, r.service, r.date]
          .join(" ")
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
      });
  }, [rows, statusFilter, searchQuery]);

  const { sortedData, requestSort, sortConfig } = useSort(filtered, { key: "date", direction: "desc" } as any);

  const indexOfLast = currentPage * itemsPerPage;
  const currentItems = (sortedData as BookingHistory[]).slice(indexOfLast - itemsPerPage, indexOfLast);

  return (
    <div className="p-4 bg-white rounded-xl shadow-md">
      <TableToolbar
        onAddNew={undefined} // no add for history
        addButtonLabel=""
        selectedRowsCount={0}
        bulkActionsOptions={<></>} // no bulk actions
        statusUpdateOptions={<></>}
        showStatusDropdown={false}
        onBulkActionChange={() => {}}
        onStatusUpdateChange={() => {}}
        onApplyAction={() => {}}
        bulkActionValue=""
        statusUpdateValue=""
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search by pet, vet, service, date…"
        filterOptions={
          <>
            <option value="">All Status</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </>
        }
        onFilterChange={setStatusFilter}
        filterValue={statusFilter}
      />

      {filtered.length === 0 ? (
        <div className="p-8 text-center text-gray-500">No booking history available.</div>
      ) : (
        <div className="w-full overflow-x-auto rounded-lg border border-gray-200">
  <div className="min-w-[1000px]">
    <Table className="w-full">
      <TableHeader className="bg-gray-50">
        <TableRow>
          {columns.map(col => (
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
        {currentItems.map(r => (
          <TableRow key={r.id} className="hover:bg-gray-50">
            <TableCell className="p-2">#{r.id}</TableCell>
            <TableCell className="p-2">{r.date}</TableCell>
            <TableCell className="p-2">{r.time}</TableCell>
            <TableCell className="p-2">
              <div className="flex items-center gap-2">
                <ImageHoverPreview
                  src={r.petPhoto || "/images/pets/placeholder.jpg"}
                  alt={r.petName}
                  className="w-8 h-8 rounded-full"
                />
                {r.petName}
              </div>
            </TableCell>
            <TableCell className="p-2">
              <div className="flex items-center gap-2">
                <ImageHoverPreview
                  src={r.vetPhoto || "/images/users/placeholder.jpg"}
                  alt={r.vetName}
                  className="w-8 h-8 rounded-full"
                />
                {r.vetName}
              </div>
            </TableCell>
            <TableCell className="p-2">{r.service}</TableCell>
            <TableCell className="p-2">
              <Badge size="sm" color={r.status === "Completed" ? "success" : "error"}>
                {r.status}
              </Badge>
            </TableCell>
            <TableCell className="p-2">{r.price ? `$${r.price}` : "—"}</TableCell>
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
