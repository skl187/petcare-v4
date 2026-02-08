// src/components/vetTables/Veterinary/VetBookingReviewsTable/VetBookingReviewsTable.tsx
import { MdDelete } from "react-icons/md";
import { useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../../ui/table"; // adjust path if needed
import Checkbox from "../../../form/input/Checkbox";
import Pagination from "../../../../components/tables/tableComponents/Pagination";
import useSort from "../../../../hooks/useSort";
import SortableTableHeader from "../../../../components/tables/tableComponents/SortableTableHeader";
import { OptimizedTableToolbar } from "../../../../components/tables/tableComponents/OptimizedTableToolbar";
import Rating from "../../../../components/tables/tableComponents/Rating";
import ImageHoverPreview from "../../../../components/tables/tableComponents/ImageHoverPreview";
import DeleteDialog from "../../../../components/tables/tableComponents/DeleteDailog";

export interface VetBookingReview {
  id: number;
  bookingId?: number;
  vetId: number; // the veterinarian this review belongs to
  client: {
    name: string;
    email: string;
    image: string;
  };
  pet?: {
    name: string;
    image?: string;
    species?: string;
  };
  message: string;
  rating: number;      // 1..5
  updatedAt: string;   // ISO
}

// ---- Mock (replace with API) ----
const mockVetReviews: VetBookingReview[] = [
  {
    id: 101,
    bookingId: 5001,
    vetId: 1,
    client: { name: "John Doe", email: "john@example.com", image: "/images/clients/client-1.jpg" },
    pet: { name: "Bella", image: "/images/pets/dog.jpg", species: "Dog" },
    message: "Dr. Kim was amazing with Bella. Thorough checkup and super kind.",
    rating: 5,
    updatedAt: "2025-08-10T10:35:00Z",
  },
  {
    id: 102,
    bookingId: 5002,
    vetId: 1,
    client: { name: "Alice Johnson", email: "alice@example.com", image: "/images/clients/client-2.jpg" },
    pet: { name: "Coco", image: "/images/pets/cat.jpg", species: "Cat" },
    message: "Great experience, slight delay but worth the wait.",
    rating: 4,
    updatedAt: "2025-08-08T14:05:00Z",
  },
  {
    id: 103,
    bookingId: 5003,
    vetId: 2,
    client: { name: "Mark Ray", email: "mark@example.com", image: "/images/clients/client-3.jpg" },
    pet: { name: "Rocky", image: "/images/pets/dog2.jpg", species: "Dog" },
    message: "Procedure went smoothly. Dr. Singh explained everything clearly.",
    rating: 5,
    updatedAt: "2025-08-05T09:20:00Z",
  },
  {
    id: 104,
    bookingId: 5004,
    vetId: 1,
    client: { name: "Eva Green", email: "eva@example.com", image: "/images/clients/client-4.jpg" },
    pet: { name: "Milo", image: "/images/pets/cat2.jpg", species: "Cat" },
    message: "Average visit. Clinic was crowded.",
    rating: 3,
    updatedAt: "2025-07-30T16:40:00Z",
  },
];

type Props = {
  /** If provided, shows reviews for this vet only */
  vetId?: number;
};

const VetBookingReviewsTable: React.FC<Props> = ({ vetId }) => {
  const initial = useMemo(
    () => (vetId ? mockVetReviews.filter(r => r.vetId === vetId) : mockVetReviews),
    [vetId]
  );

  const [reviews, setReviews] = useState<VetBookingReview[]>(initial);
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const columns = [
    { key: "client",    label: "Client",     className: "min-w-[220px] font-semibold" },
    { key: "pet",       label: "Pet",        className: "min-w-[180px]" },
    { key: "message",   label: "Review",     className: "min-w-[280px]" },
    { key: "rating",    label: "Rating",     className: "min-w-[120px]" },
    { key: "updatedAt", label: "Updated",    className: "min-w-[160px]" },
    { key: "bookingId", label: "Booking ID", className: "min-w-[120px]" },
  ] as const;

  // Search filter
  const filtered = useMemo(() => {
    if (!searchQuery) return reviews;
    const q = searchQuery.toLowerCase();
    return reviews.filter(r => {
      const hay = [
        r.client.name, r.client.email, r.message,
        r.pet?.name, r.pet?.species, String(r.bookingId ?? "")
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(q);
    });
  }, [reviews, searchQuery]);

  // Sort
  const { sortedData, requestSort, sortConfig } = useSort(filtered, {
    key: "updatedAt",
    direction: "desc",
  } as any);

  // Pagination
  const indexOfLast = currentPage * itemsPerPage;
  const currentItems = (sortedData as VetBookingReview[]).slice(indexOfLast - itemsPerPage, indexOfLast);

  // Selection
  const toggleSelectRow = (id: number) =>
    setSelectedRows(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));
  const toggleSelectAll = () =>
    setSelectedRows(selectedRows.length === reviews.length ? [] : reviews.map(r => r.id));

  // Delete
  const handleDelete = (id?: number) => {
    setReviewToDelete(id ?? null);
    setIsDeleteDialogOpen(true);
  };
  const confirmDelete = () => {
    const updated = reviewToDelete
      ? reviews.filter(r => r.id !== reviewToDelete)
      : reviews.filter(r => !selectedRows.includes(r.id));
    setReviews(updated);
    setSelectedRows([]);
    setReviewToDelete(null);
    setIsDeleteDialogOpen(false);
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="p-4 bg-white rounded-xl shadow-md">
      {/* Toolbar (search + bulk delete) */}
      <OptimizedTableToolbar
        bulkActions={
          selectedRows.length > 0
            ? {
                selectedCount: selectedRows.length,
                options: (
                  <>
                    <option value="No actions">No actions</option>
                    <option value="Delete">Delete</option>
                  </>
                ),
                onActionChange: (action) => {
                  if (action === "Delete") handleDelete();
                },
                actionValue: "No actions",
                onApply: () => {
                  if (selectedRows.length > 0) handleDelete();
                },
              }
            : undefined
        }
        search={{
          query: searchQuery,
          onChange: setSearchQuery,
          placeholder: "Search by client, pet, message, booking id…",
        }}
      />

      {/* Empty state */}
      {filtered.length === 0 ? (
        <div className="rounded-lg border border-gray-200 p-8 text-center text-sm text-gray-600">
          No reviews found.
        </div>
      ) : (
        <div className="w-full overflow-x-auto rounded-lg border border-gray-200">
          <div className="min-w-[1100px]">
            <Table className="w-full">
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableCell className="w-10 p-2 py-3">
                    <Checkbox
                      checked={selectedRows.length === reviews.length && reviews.length > 0}
                      onChange={toggleSelectAll}
                    />
                  </TableCell>

                  {columns.map((col) => (
                    <SortableTableHeader<VetBookingReview>
                      key={col.key}
                      columnKey={col.key as keyof VetBookingReview}
                      label={col.label}
                      sortConfig={sortConfig}
                      requestSort={requestSort}
                      className={`p-2 py-4 text-left text-sm ${col.className}`}
                    />
                  ))}

                  <TableCell className="w-16 p-2 py-4 text-sm font-medium">Actions</TableCell>
                </TableRow>
              </TableHeader>

              <TableBody>
                {currentItems.map((r) => (
                  <TableRow key={r.id} className="hover:bg-gray-50">
                    <TableCell className="p-2 py-4">
                      <Checkbox
                        checked={selectedRows.includes(r.id)}
                        onChange={() => toggleSelectRow(r.id)}
                      />
                    </TableCell>

                    {/* Client */}
                    <TableCell className="p-2 py-4">
                      <div className="flex items-center gap-3">
                        <ImageHoverPreview
                          src={r.client.image}
                          alt={r.client.name}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        <div className="text-sm">
                          <div className="font-medium text-gray-900">{r.client.name}</div>
                          <div className="text-xs text-gray-500">{r.client.email}</div>
                        </div>
                      </div>
                    </TableCell>

                    {/* Pet */}
                    <TableCell className="p-2 py-4">
                      {r.pet ? (
                        <div className="flex items-center gap-3">
                          <ImageHoverPreview
                            src={r.pet.image || "/images/pets/placeholder.jpg"}
                            alt={r.pet.name}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                          <div className="text-sm">
                            <div className="font-medium text-gray-900">{r.pet.name}</div>
                            <div className="text-xs text-gray-500">{r.pet.species || ""}</div>
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">—</span>
                      )}
                    </TableCell>

                    {/* Message */}
                    <TableCell className="p-2 py-4 text-sm text-gray-600">
                      <div className="line-clamp-2">{r.message}</div>
                    </TableCell>

                    {/* Rating */}
                    <TableCell className="p-2 py-4">
                      <Rating value={r.rating} max={5} />
                    </TableCell>

                    {/* Updated */}
                    <TableCell className="p-2 py-4 text-sm text-gray-500">
                      {formatDate(r.updatedAt)}
                    </TableCell>

                    {/* Booking ID */}
                    <TableCell className="p-2 py-4 text-sm">
                      {r.bookingId ? `#${r.bookingId}` : "—"}
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="p-2 py-4">
                      <button
                        onClick={() => handleDelete(r.id)}
                        className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50"
                        title="Delete"
                      >
                        <MdDelete className="w-5 h-5" />
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Pagination */}
      <Pagination
        totalItems={filtered.length}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={(n) => {
          setItemsPerPage(n);
          setCurrentPage(1);
        }}
      />

      {/* Delete Dialog */}
      <DeleteDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        itemLabel="review"
        description={
          reviewToDelete
            ? "Are you sure you want to delete this review?"
            : `Are you sure you want to delete ${selectedRows.length} selected reviews?`
        }
      />
    </div>
  );
};

export default VetBookingReviewsTable;
