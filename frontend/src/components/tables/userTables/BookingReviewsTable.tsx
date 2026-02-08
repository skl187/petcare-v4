import { MdDelete } from "react-icons/md";
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../ui/table";
import Checkbox from "../../form/input/Checkbox";
import Pagination from "../tableComponents/Pagination";
import useSort from "../../../hooks/useSort";
import SortableTableHeader from "../tableComponents/SortableTableHeader";
import { OptimizedTableToolbar } from "../tableComponents/OptimizedTableToolbar";
import Rating from "../tableComponents/Rating";
import ImageHoverPreview from "../tableComponents/ImageHoverPreview";
import DeleteDialog from "../tableComponents/DeleteDailog";

export interface BookingReview {
  id: number;
  client: {
    name: string;
    email: string;
    image: string;
  };
  employee: {
    name: string;
    email: string;
    image: string;
  };
  message: string;
  rating: number;
  updatedAt: string;
}

// Mock data for booking reviews
const mockBookingReviews: BookingReview[] = [
  {
    id: 1,
    client: {
      name: "John Doe",
      email: "john@example.com",
      image: "/images/clients/client-1.jpg",
    },
    employee: {
      name: "Jane Smith",
      email: "jane@example.com",
      image: "/images/employees/employee-1.jpg",
    },
    message: "Great service! Very professional and friendly.",
    rating: 5,
    updatedAt: "2023-05-15T10:30:00Z",
  },
  {
    id: 2,
    client: {
      name: "Alice Johnson",
      email: "alice@example.com",
      image: "/images/clients/client-2.jpg",
    },
    employee: {
      name: "Bob Brown",
      email: "bob@example.com",
      image: "/images/employees/employee-2.jpg",
    },
    message: "Good experience overall, but was a bit late.",
    rating: 4,
    updatedAt: "2023-05-14T14:45:00Z",
  },
  {
    id: 3,
    client: {
      name: "Charlie Wilson",
      email: "charlie@example.com",
      image: "/images/clients/client-3.jpg",
    },
    employee: {
      name: "Diana Miller",
      email: "diana@example.com",
      image: "/images/employees/employee-3.jpg",
    },
    message: "Excellent work, highly recommended!",
    rating: 5,
    updatedAt: "2023-05-13T09:15:00Z",
  },
  {
    id: 4,
    client: {
      name: "Eva Green",
      email: "eva@example.com",
      image: "/images/clients/client-4.jpg",
    },
    employee: {
      name: "Frank White",
      email: "frank@example.com",
      image: "/images/employees/employee-4.jpg",
    },
    message: "Average service, could be better.",
    rating: 3,
    updatedAt: "2023-05-12T16:20:00Z",
  },
  {
    id: 5,
    client: {
      name: "George Black",
      email: "george@example.com",
      image: "/images/clients/client-5.jpg",
    },
    employee: {
      name: "Hannah Lee",
      email: "hannah@example.com",
      image: "/images/employees/employee-5.jpg",
    },
    message: "Not satisfied with the service quality.",
    rating: 2,
    updatedAt: "2023-05-11T11:10:00Z",
  },
];

export default function BookingReviewsTable() {
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [reviews, setReviews] = useState<BookingReview[]>(mockBookingReviews);
  const [reviewToDelete, setReviewToDelete] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const columns = [
    {
      key: "client",
      label: "Client",
      className: "min-w-[200px] text-gray-700 font-semibold max-w-[250px]",
    },
    {
      key: "employee",
      label: "Employee",
      className: "min-w-[200px] text-gray-700 font-semibold max-w-[250px]",
    },
    {
      key: "message",
      label: "Message",
      className: "min-w-[250px] text-gray-700 max-w-[300px]",
    },
    {
      key: "rating",
      label: "Rating",
      className: "min-w-[120px] text-gray-700 max-w-[150px]",
    },
    {
      key: "updatedAt",
      label: "Updated",
      className: "min-w-[150px] text-gray-700 max-w-[180px]",
    },
  ] as const;

  // Filtered data based on search
  const filteredData = reviews.filter((review) =>
    review.client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    review.client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    review.employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    review.employee.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    review.message.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

  const toggleSelectRow = (id: number) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    setSelectedRows(
      selectedRows.length === reviews.length
        ? []
        : reviews.map((row) => row.id)
    );
  };

  const handleDelete = (id?: number) => {
    if (id) {
      setReviewToDelete(id);
    } else {
      setReviewToDelete(null);
    }
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    let updatedReviews: BookingReview[];

    if (reviewToDelete) {
      updatedReviews = reviews.filter(
        (review) => review.id !== reviewToDelete
      );
    } else {
      updatedReviews = reviews.filter(
        (review) => !selectedRows.includes(review.id)
      );
    }

    setReviews(updatedReviews);
    setIsDeleteDialogOpen(false);
    setSelectedRows([]);
    setReviewToDelete(null);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="p-4 bg-white rounded-xl shadow-md">
      {/* Header Section */}
      <OptimizedTableToolbar
        bulkActions={
          selectedRows.length > 0 ? {
            selectedCount: selectedRows.length,
            options: (
              <>
                <option value="No actions">No actions</option>
                <option value="Delete">Delete</option>
              </>
            ),
            onActionChange: (action) => {
              if (action === "Delete") {
                handleDelete();
              }
            },
            actionValue: "No actions",
            onApply: () => {
              if (selectedRows.length > 0) {
                handleDelete();
              }
            },
          } : undefined
        }
        search={{
          query: searchQuery,
          onChange: setSearchQuery,
          placeholder: "Search reviews...",
        }}
      />

      {/* Table */}
      <div className="w-full overflow-x-auto rounded-lg border border-gray-200">
        <div className="min-w-[1200px]">
          <Table className="w-full">
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableCell className="w-10 p-2 py-3">
                  <Checkbox
                    checked={selectedRows.length === reviews.length && reviews.length > 0}
                    onChange={toggleSelectAll}
                  />
                </TableCell>
                {columns.map((column) => (
                  <SortableTableHeader<BookingReview>
                    key={column.key}
                    columnKey={column.key}
                    label={column.label}
                    sortConfig={sortConfig}
                    requestSort={requestSort}
                    className={`p-2 py-4 text-left text-sm text-gray-100 font-medium ${column.className}`}
                  />
                ))}
                <TableCell className="w-20 p-2 py-4 text-sm font-medium">
                  Actions
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody>
              {currentItems.map((review) => (
                <TableRow key={review.id} className="hover:bg-gray-50">
                  <TableCell className="p-2 py-4">
                    <Checkbox
                      checked={selectedRows.includes(review.id)}
                      onChange={() => toggleSelectRow(review.id)}
                    />
                  </TableCell>
                  <TableCell className="p-2 py-4">
                    <div className="flex items-center gap-3">
                      <ImageHoverPreview
                        src={review.client.image}
                        alt={review.client.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {review.client.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {review.client.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="p-2 py-4">
                    <div className="flex items-center gap-3">
                      <ImageHoverPreview
                        src={review.employee.image}
                        alt={review.employee.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {review.employee.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {review.employee.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="p-2 py-4 text-sm text-gray-500">
                    <div className="line-clamp-2">
                      {review.message}
                    </div>
                  </TableCell>
                  <TableCell className="p-2 py-4">
                    <Rating value={review.rating} max={5} />
                  </TableCell>
                  <TableCell className="p-2 py-4 text-sm text-gray-500">
                    {formatDate(review.updatedAt)}
                  </TableCell>
                  <TableCell className="p-2 py-4">
                    <button
                      onClick={() => handleDelete(review.id)}
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

      {/* Pagination */}
      <Pagination
        totalItems={filteredData.length}
        itemsPerPage={itemsPerPage}
        onPageChange={handlePageChange}
        onItemsPerPageChange={handleItemsPerPageChange}
      />

       <DeleteDialog
  isOpen={isDeleteDialogOpen}
  onClose={() => setIsDeleteDialogOpen(false)}
  onConfirm={confirmDelete}
  itemLabel="Booking Review"
  description={
    selectedRows.length > 1
      ? `Are you sure you want to delete ${selectedRows.length} selected reviews?`
      : "Are you sure you want to delete this review?"
  }
/>
    </div>
  );
}