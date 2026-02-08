// src/components/vetTables/Veterinary/VetBookingReviewsTable/VetBookingReviewsTable.tsx
import { MdDelete } from 'react-icons/md';
import { useEffect, useMemo, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from '../../../ui/table';
import Checkbox from '../../../form/input/Checkbox';
import Pagination from '../../../../components/tables/tableComponents/Pagination';
import useSort from '../../../../hooks/useSort';
import SortableTableHeader from '../../../../components/tables/tableComponents/SortableTableHeader';
import { OptimizedTableToolbar } from '../../../../components/tables/tableComponents/OptimizedTableToolbar';
import Rating from '../../../../components/tables/tableComponents/Rating';
import DeleteDialog from '../../../../components/tables/tableComponents/DeleteDailog';
import {
  VeterinarianReviewFromAPI,
  VeterinarianReviewsResponse,
} from '../../../../services/reviewsService';
import { API_ENDPOINTS } from '../../../../constants/api';

const VetBookingReviewsTable: React.FC = () => {
  console.log('[VetBookingReviewsTable] Component rendering...');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reviewsData, setReviewsData] =
    useState<VeterinarianReviewsResponse | null>(null);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Fetch reviews using my-reviews endpoint (no ID needed)
  useEffect(() => {
    const loadReviews = async () => {
      try {
        console.log('[VetBookingReviewsTable] Fetching my reviews...');
        setLoading(true);

        const token = sessionStorage.getItem('token');
        const queryParams = new URLSearchParams();
        queryParams.set('page', currentPage.toString());
        queryParams.set('limit', itemsPerPage.toString());

        const url = `${API_ENDPOINTS.REVIEWS.MY_REVIEWS}?${queryParams.toString()}`;
        console.log('[VetBookingReviewsTable] Calling:', url);

        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch reviews: ${response.statusText}`);
        }

        const result = await response.json();
        console.log('[VetBookingReviewsTable] API Response:', result);
        setReviewsData(result.data);
        setError(null);
      } catch (err) {
        console.error('[VetBookingReviewsTable] Failed to load reviews:', err);
        setError(err instanceof Error ? err.message : 'Failed to load reviews');
      } finally {
        setLoading(false);
      }
    };

    loadReviews();
  }, [currentPage, itemsPerPage]);

  const columns = [
    { key: 'user', label: 'Client', className: 'min-w-[220px] font-semibold' },
    { key: 'appointment', label: 'Appointment', className: 'min-w-[180px]' },
    { key: 'review_text', label: 'Review', className: 'min-w-[280px]' },
    { key: 'rating', label: 'Rating', className: 'min-w-[120px]' },
    { key: 'created_at', label: 'Date', className: 'min-w-[160px]' },
    { key: 'is_verified', label: 'Status', className: 'min-w-[100px]' },
  ] as const;

  const reviews = reviewsData?.reviews || [];

  // Search filter (client-side for displayed items)
  const filtered = useMemo(() => {
    if (!searchQuery) return reviews;
    const q = searchQuery.toLowerCase();
    return reviews.filter((r) => {
      const displayName = r.is_anonymous
        ? 'Anonymous'
        : r.owner_first_name && r.owner_last_name
          ? `${r.owner_first_name} ${r.owner_last_name}`
          : 'Unknown';

      const hay = [
        displayName,
        r.review_text || '',
        r.appointment_type || '',
        r.appointment_date || '',
        r.pet_name || '',
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

  // Delete (placeholder - implement delete API call if needed)
  const handleDelete = (id?: string) => {
    setReviewToDelete(id ?? null);
    setIsDeleteDialogOpen(true);
  };
  const confirmDelete = () => {
    // Implement delete API call here
    console.log('Delete review:', reviewToDelete || selectedRows);
    setSelectedRows([]);
    setReviewToDelete(null);
    setIsDeleteDialogOpen(false);
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });

  const formatAppointmentDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

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
    <div className='p-4 bg-white rounded-xl shadow-md'>
      {/* Summary Stats */}
      {reviewsData?.stats && (
        <div className='mb-6 grid grid-cols-1 md:grid-cols-4 gap-4'>
          <div className='p-4 bg-gray-50 rounded-lg'>
            <div className='text-sm text-gray-600'>Average Rating</div>
            <div className='text-2xl font-bold text-gray-900'>
              {parseFloat(reviewsData.stats.average_rating).toFixed(1)}
            </div>
          </div>
          <div className='p-4 bg-gray-50 rounded-lg'>
            <div className='text-sm text-gray-600'>Total Reviews</div>
            <div className='text-2xl font-bold text-gray-900'>
              {reviewsData.stats.total_reviews}
            </div>
          </div>
          <div className='p-4 bg-gray-50 rounded-lg'>
            <div className='text-sm text-gray-600'>Positive Reviews</div>
            <div className='text-2xl font-bold text-gray-900'>
              {reviewsData.stats.positive_reviews}
            </div>
          </div>
          <div className='p-4 bg-gray-50 rounded-lg'>
            <div className='text-sm text-gray-600'>Avg Professionalism</div>
            <div className='text-2xl font-bold text-gray-900'>
              {parseFloat(reviewsData.stats.avg_professionalism || '0').toFixed(
                1,
              )}
            </div>
          </div>
        </div>
      )}

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
          placeholder: 'Search by client, review, appointment…',
        }}
      />

      {/* Empty state */}
      {filtered.length === 0 ? (
        <div className='rounded-lg border border-gray-200 p-8 text-center text-sm text-gray-600'>
          No reviews found.
        </div>
      ) : (
        <div className='w-full overflow-x-auto rounded-lg border border-gray-200'>
          <div className='min-w-[1100px]'>
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
                    <SortableTableHeader<VeterinarianReviewFromAPI>
                      key={col.key}
                      columnKey={col.key as keyof VeterinarianReviewFromAPI}
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
                {(sortedData as VeterinarianReviewFromAPI[]).map((r) => {
                  const displayName = r.is_anonymous
                    ? 'Anonymous'
                    : r.owner_first_name && r.owner_last_name
                      ? `${r.owner_first_name} ${r.owner_last_name}`
                      : 'Unknown';

                  const initials = r.is_anonymous
                    ? 'A'
                    : displayName && displayName !== 'Unknown'
                      ? displayName
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

                      {/* Client */}
                      <TableCell className='p-2 py-4'>
                        <div className='flex items-center gap-3'>
                          <div className='w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium text-gray-600'>
                            {initials}
                          </div>
                          <div className='text-sm'>
                            <div className='font-medium text-gray-900'>
                              {displayName}
                            </div>
                            {r.is_verified && (
                              <div className='text-xs text-green-600'>
                                ✓ Verified
                              </div>
                            )}
                            {r.pet_name && (
                              <div className='text-xs text-gray-500'>
                                Pet: {r.pet_name}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>

                      {/* Appointment */}
                      <TableCell className='p-2 py-4'>
                        {r.appointment_type && r.appointment_date ? (
                          <div className='text-sm'>
                            <div className='font-medium text-gray-900 capitalize'>
                              {r.appointment_type}
                            </div>
                            <div className='text-xs text-gray-500'>
                              {formatAppointmentDate(r.appointment_date)}
                            </div>
                          </div>
                        ) : (
                          <div className='text-sm text-gray-400'>
                            No appointment info
                          </div>
                        )}
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
                        {r.professionalism_rating && (
                          <div className='text-xs text-gray-400 mt-1'>
                            Prof: {r.professionalism_rating.toFixed(1)}
                          </div>
                        )}
                      </TableCell>

                      {/* Date */}
                      <TableCell className='p-2 py-4 text-sm text-gray-500'>
                        {formatDate(r.created_at)}
                      </TableCell>

                      {/* Status */}
                      <TableCell className='p-2 py-4'>
                        <span
                          className={`px-2 py-1 text-xs rounded ${r.is_verified ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}
                        >
                          {r.is_verified ? 'Verified' : 'Unverified'}
                        </span>
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

export default VetBookingReviewsTable;
