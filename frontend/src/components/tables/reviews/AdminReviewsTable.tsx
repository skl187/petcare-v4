// src/components/tables/reviews/AdminReviewsTable.tsx
import { MdDelete } from 'react-icons/md';
import { useEffect, useMemo, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from '../../ui/table';
import Checkbox from '../../form/input/Checkbox';
import Pagination from '../tableComponents/Pagination';
import useSort from '../../../hooks/useSort';
import SortableTableHeader from '../tableComponents/SortableTableHeader';
import { OptimizedTableToolbar } from '../tableComponents/OptimizedTableToolbar';
import Rating from '../tableComponents/Rating';
import DeleteDialog from '../tableComponents/DeleteDailog';
import { Review, listReviews, deleteReview } from '../../../services/reviewsService';
import Badge from '../../ui/badge/Badge';

const AdminReviewsTable: React.FC = () => {
  console.log('[AdminReviewsTable] Component rendering...');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviewsData, setReviewsData] = useState<{
    reviews: Review[];
    pagination: any;
  } | null>(null);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Fetch all reviews
  useEffect(() => {
    const loadReviews = async () => {
      try {
        console.log('[AdminReviewsTable] Fetching all reviews...');
        setLoading(true);

        const data = await listReviews({
          page: currentPage,
          limit: itemsPerPage,
          status: statusFilter || undefined,
        });

        console.log('[AdminReviewsTable] API Response:', data);
        setReviewsData(data);
        setError(null);
      } catch (err) {
        console.error('[AdminReviewsTable] Failed to load reviews:', err);
        setError(err instanceof Error ? err.message : 'Failed to load reviews');
      } finally {
        setLoading(false);
      }
    };

    loadReviews();
  }, [currentPage, itemsPerPage, statusFilter]);

  const columns = [
    { key: 'owner', label: 'Pet Owner', className: 'min-w-[200px] font-semibold' },
    { key: 'pet_name', label: 'Pet', className: 'min-w-[120px]' },
    { key: 'veterinarian', label: 'Veterinarian', className: 'min-w-[180px]' },
    { key: 'review_text', label: 'Review', className: 'min-w-[280px]' },
    { key: 'rating', label: 'Rating', className: 'min-w-[100px]' },
    { key: 'status', label: 'Status', className: 'min-w-[100px]' },
    { key: 'created_at', label: 'Date', className: 'min-w-[140px]' },
  ] as const;

  const reviews = reviewsData?.reviews || [];

  // Search filter (client-side for displayed items)
  const filtered = useMemo(() => {
    if (!searchQuery) return reviews;
    const q = searchQuery.toLowerCase();
    return reviews.filter((r) => {
      const ownerName = r.owner_first_name && r.owner_last_name
        ? `${r.owner_first_name} ${r.owner_last_name}`
        : 'Unknown';
      
      const vetName = r.vet_first_name && r.vet_last_name
        ? `${r.vet_first_name} ${r.vet_last_name}`
        : 'Unknown';

      const hay = [
        ownerName,
        r.pet_name || '',
        vetName,
        r.review_text || '',
        r.clinic_name || '',
        r.appointment_number || '',
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return hay.includes(q);
    });
  }, [reviews, searchQuery]);

  // Sort
  const { sortedData, requestSort, sortConfig } = useSort(filtered, {
    key: 'created_at',
    direction: 'desc',
  } as any);

  // Selection
  const toggleSelectRow = (id: string) =>
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  
  const toggleSelectAll = () =>
    setSelectedRows(
      selectedRows.length === reviews.length ? [] : reviews.map((r) => r.id),
    );

  // Delete handler
  const handleDelete = (id?: string) => {
    setReviewToDelete(id ?? null);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      const idsToDelete = reviewToDelete ? [reviewToDelete] : selectedRows;

      for (const id of idsToDelete) {
        await deleteReview(id);
      }

      // Refresh the list
      const data = await listReviews({
        page: currentPage,
        limit: itemsPerPage,
        status: statusFilter || undefined,
      });
      setReviewsData(data);
      setSelectedRows([]);
      setReviewToDelete(null);
      setIsDeleteDialogOpen(false);
    } catch (err) {
      console.error('Failed to delete review:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete review');
    }
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge color="success">{status}</Badge>;
      case 'pending':
        return <Badge color="warning">{status}</Badge>;
      case 'rejected':
        return <Badge color="error">{status}</Badge>;
      default:
        return <Badge color="info">{status}</Badge>;
    }
  };

  if (loading && !reviewsData) {
    return (
      <div className='p-4 bg-white rounded-xl shadow-md'>
        <div className='flex items-center justify-center min-h-[400px]'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600'></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='p-4 bg-white rounded-xl shadow-md'>
        <div className='flex items-center justify-center min-h-[400px]'>
          <div className='text-center'>
            <p className='text-red-500 mb-4'>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='p-4 bg-white rounded-xl shadow-md space-y-4'>
      {/* Filters */}
      <div className='flex items-center gap-4 flex-wrap'>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setCurrentPage(1);
          }}
          className='px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Toolbar (search + bulk delete) */}
      <OptimizedTableToolbar
        bulkActions={
          selectedRows.length > 0
            ? {
                selectedCount: selectedRows.length,
                options: (
                  <>
                    <option value='No actions'>No actions</option>
                    <option value='Delete'>Delete</option>
                  </>
                ),
                onActionChange: (action) => {
                  if (action === 'Delete') handleDelete();
                },
                actionValue: 'No actions',
                onApply: () => {
                  if (selectedRows.length > 0) handleDelete();
                },
              }
            : undefined
        }
        search={{
          query: searchQuery,
          onChange: setSearchQuery,
          placeholder: 'Search by owner, pet, vet, review…',
        }}
      />

      {/* Empty state */}
      {filtered.length === 0 ? (
        <div className='rounded-lg border border-gray-200 p-8 text-center text-sm text-gray-600'>
          No reviews found.
        </div>
      ) : (
        <div className='w-full overflow-x-auto rounded-lg border border-gray-200'>
          <div className='min-w-[1200px]'>
            <Table className='w-full'>
              <TableHeader className='bg-gray-50'>
                <TableRow>
                  <TableCell className='w-10 p-2 py-3'>
                    <Checkbox
                      checked={
                        selectedRows.length === reviews.length &&
                        reviews.length > 0
                      }
                      onChange={toggleSelectAll}
                    />
                  </TableCell>

                  {columns.map((col) => (
                    <SortableTableHeader<Review>
                      key={col.key}
                      columnKey={col.key as keyof Review}
                      label={col.label}
                      sortConfig={sortConfig}
                      requestSort={requestSort}
                      className={`p-2 py-4 text-left text-sm ${col.className}`}
                    />
                  ))}

                  <TableCell className='w-16 p-2 py-4 text-sm font-medium'>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHeader>

              <TableBody>
                {(sortedData as Review[]).map((r) => {
                  const ownerName = r.owner_first_name && r.owner_last_name
                    ? `${r.owner_first_name} ${r.owner_last_name}`
                    : 'Unknown';
                  
                  const vetName = r.vet_first_name && r.vet_last_name
                    ? `${r.vet_first_name} ${r.vet_last_name}`
                    : 'Unknown';

                  const ownerInitials = ownerName !== 'Unknown'
                    ? ownerName
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .toUpperCase()
                    : 'U';

                  return (
                    <TableRow key={r.id} className='hover:bg-gray-50'>
                      <TableCell className='p-2 py-4'>
                        <Checkbox
                          checked={selectedRows.includes(r.id)}
                          onChange={() => toggleSelectRow(r.id)}
                        />
                      </TableCell>

                      {/* Pet Owner */}
                      <TableCell className='p-2 py-4'>
                        <div className='flex items-center gap-3'>
                          <div className='w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm font-medium text-blue-600'>
                            {ownerInitials}
                          </div>
                          <div className='text-sm'>
                            <div className='font-medium text-gray-900'>
                              {ownerName}
                            </div>
                            {r.clinic_name && (
                              <div className='text-xs text-gray-500'>
                                {r.clinic_name}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>

                      {/* Pet Name */}
                      <TableCell className='p-2 py-4 text-sm font-medium text-gray-900'>
                        {r.pet_name || '-'}
                      </TableCell>

                      {/* Veterinarian */}
                      <TableCell className='p-2 py-4'>
                        <div className='text-sm'>
                          <div className='font-medium text-gray-900'>
                            {vetName}
                          </div>
                          {r.appointment_date && (
                            <div className='text-xs text-gray-500'>
                              {new Date(r.appointment_date).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })}
                            </div>
                          )}
                        </div>
                      </TableCell>

                      {/* Review Text */}
                      <TableCell className='p-2 py-4 text-sm text-gray-600'>
                        <div className='line-clamp-2'>
                          {r.review_text || 'No review text'}
                        </div>
                      </TableCell>

                      {/* Rating */}
                      <TableCell className='p-2 py-4'>
                        <Rating value={parseFloat(r.rating)} max={5} />
                        <div className='text-xs text-gray-500 mt-1'>
                          {parseFloat(r.rating).toFixed(1)}/5.0
                        </div>
                      </TableCell>

                      {/* Status */}
                      <TableCell className='p-2 py-4'>
                        {getStatusBadge(r.status)}
                      </TableCell>

                      {/* Date */}
                      <TableCell className='p-2 py-4 text-sm text-gray-500'>
                        {formatDate(r.created_at)}
                      </TableCell>

                      {/* Actions */}
                      <TableCell className='p-2 py-4'>
                        <button
                          onClick={() => handleDelete(r.id)}
                          className='text-red-600 hover:text-red-800 transition-colors'
                          title='Delete review'
                        >
                          <MdDelete className='text-xl' />
                        </button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Pagination */}
      {reviewsData?.pagination && (
        <Pagination
          totalItems={reviewsData.pagination.total}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={(n) => {
            setItemsPerPage(n);
            setCurrentPage(1);
          }}
        />
      )}

      {/* Delete Dialog */}
      <DeleteDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        itemLabel='review'
        description={
          reviewToDelete
            ? 'Are you sure you want to delete this review?'
            : `Are you sure you want to delete ${selectedRows.length} selected reviews?`
        }
      />
    </div>
  );
};

export default AdminReviewsTable;
