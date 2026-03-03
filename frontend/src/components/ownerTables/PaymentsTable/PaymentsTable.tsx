import { useState, useEffect, useMemo } from 'react';
import { Eye, X, Printer } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from '../../../components/ui/table';
import Badge from '../../../components/ui/badge/Badge';
import Pagination from '../../tables/tableComponents/Pagination';
import useSort from '../../../hooks/useSort';
import SortableTableHeader from '../../tables/tableComponents/SortableTableHeader';
import { TableToolbar } from '../../tables/tableComponents/TableToolbar';
import { getUserPayments, UserPayment } from '../../../services/paymentService';

// ─────────────────────────────────────────────
// Invoice Modal (owner view — no status edit)
// ─────────────────────────────────────────────
const InvoiceModal = ({ payment, onClose }: { payment: UserPayment; onClose: () => void }) => {
  const fmt = (v: string | number) => `$${parseFloat(String(v)).toFixed(2)}`;
  const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'>
      <div className='bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden'>
        <div className='flex items-center justify-between px-6 py-4 border-b border-gray-200'>
          <h2 className='text-lg font-semibold text-gray-800'>Payment Invoice</h2>
          <div className='flex items-center gap-2'>
            <button
              onClick={() => window.print()}
              className='flex items-center gap-1.5 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition print:hidden'
            >
              <Printer size={14} /> Print
            </button>
            <button onClick={onClose} className='p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg transition print:hidden'>
              <X size={16} />
            </button>
          </div>
        </div>

        <div className='px-6 py-5 space-y-4'>
          <div className='flex justify-between items-start'>
            <div>
              <p className='text-xs text-gray-500 uppercase tracking-wide'>Invoice ID</p>
              <p className='text-sm font-mono text-gray-800'>{payment.id.slice(0, 8).toUpperCase()}</p>
            </div>
            <div className='text-right'>
              <p className='text-xs text-gray-500 uppercase tracking-wide'>Date</p>
              <p className='text-sm font-medium text-gray-800'>{fmtDate(payment.appointment_date)}</p>
            </div>
          </div>

          <div className='grid grid-cols-2 gap-3'>
            <div className='bg-gray-50 rounded-lg px-4 py-3'>
              <p className='text-xs text-gray-500 mb-1'>Pet</p>
              <p className='text-sm font-medium text-gray-800'>{payment.pet_name || '—'}</p>
            </div>
            <div className='bg-gray-50 rounded-lg px-4 py-3'>
              <p className='text-xs text-gray-500 mb-1'>Veterinarian</p>
              <p className='text-sm font-medium text-gray-800'>Dr. {payment.vet_first_name} {payment.vet_last_name}</p>
            </div>
            <div className='col-span-2 bg-gray-50 rounded-lg px-4 py-3'>
              <p className='text-xs text-gray-500 mb-1'>Clinic</p>
              <p className='text-sm font-medium text-gray-800'>{payment.clinic_name || '—'}</p>
            </div>
          </div>

          <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${
            payment.payment_status === 'completed' ? 'bg-green-100 text-green-800' :
            payment.payment_status === 'pending'   ? 'bg-yellow-100 text-yellow-800' :
            payment.payment_status === 'failed'    ? 'bg-red-100 text-red-800' :
                                                     'bg-gray-100 text-gray-800'
          }`}>
            {payment.payment_status}
          </span>

          <div className='border border-gray-200 rounded-lg overflow-hidden'>
            <table className='w-full text-sm'>
              <thead>
                <tr className='bg-gray-50 border-b border-gray-200'>
                  <th className='px-4 py-2.5 text-left text-xs font-semibold text-gray-600'>Description</th>
                  <th className='px-4 py-2.5 text-right text-xs font-semibold text-gray-600'>Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr className='border-b border-gray-100'><td className='px-4 py-2.5 text-gray-700'>Consultation Fee</td><td className='px-4 py-2.5 text-right'>{fmt(payment.consultation_fee)}</td></tr>
                <tr className='border-b border-gray-100'><td className='px-4 py-2.5 text-gray-700'>Other Charges</td><td className='px-4 py-2.5 text-right'>{fmt(payment.other_charges)}</td></tr>
                <tr className='border-b border-gray-100'><td className='px-4 py-2.5 text-gray-700'>Subtotal</td><td className='px-4 py-2.5 text-right font-medium'>{fmt(payment.subtotal)}</td></tr>
                {parseFloat(payment.discount_amount) > 0 && <tr className='border-b border-gray-100'><td className='px-4 py-2.5 text-green-700'>Discount</td><td className='px-4 py-2.5 text-right text-green-700'>−{fmt(payment.discount_amount)}</td></tr>}
                {parseFloat(payment.tax_amount) > 0 && <tr className='border-b border-gray-100'><td className='px-4 py-2.5 text-gray-700'>Tax</td><td className='px-4 py-2.5 text-right'>{fmt(payment.tax_amount)}</td></tr>}
                <tr className='bg-gray-50'><td className='px-4 py-3 font-semibold text-gray-900'>Total</td><td className='px-4 py-3 text-right font-bold text-gray-900 text-base'>{fmt(payment.total_amount)}</td></tr>
              </tbody>
            </table>
          </div>

          <div className='grid grid-cols-2 gap-3'>
            <div className='bg-gray-50 rounded-lg px-4 py-3'><p className='text-xs text-gray-500 mb-1'>Payment Method</p><p className='font-medium capitalize text-gray-800'>{payment.payment_method}</p></div>
            <div className='bg-gray-50 rounded-lg px-4 py-3'><p className='text-xs text-gray-500 mb-1'>Amount Paid</p><p className='font-semibold text-green-600'>{fmt(payment.paid_amount)}</p></div>
          </div>
        </div>
      </div>
    </div>
  );
};

const statusColor = (s: string): 'success' | 'warning' | 'error' | 'dark' =>
  s === 'completed' ? 'success' : s === 'pending' ? 'warning' : s === 'failed' ? 'error' : 'dark';

export default function PaymentsTable() {
  const [payments, setPayments] = useState<UserPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [selectedPayment, setSelectedPayment] = useState<UserPayment | null>(null);

  useEffect(() => {
    getUserPayments()
      .then(setPayments)
      .catch((err) => setError(err.message || 'Failed to load payments'))
      .finally(() => setLoading(false));
  }, []);

  const columns = [
    { key: 'appointment_date', label: 'Date',           className: 'min-w-[120px]' },
    { key: 'pet_name',         label: 'Pet',            className: 'min-w-[120px]' },
    { key: 'vet_first_name',   label: 'Vet & Clinic',   className: 'min-w-[160px]' },
    { key: 'payment_method',   label: 'Method',         className: 'min-w-[110px]' },
    { key: 'total_amount',     label: 'Amount',         className: 'min-w-[110px]' },
    { key: 'payment_status',   label: 'Status',         className: 'min-w-[120px]' },
    { key: 'actions',          label: 'Actions',        className: 'min-w-[80px]' },
  ] as const;

  const filtered = useMemo(() => {
    return payments
      .filter((p) => (statusFilter ? p.payment_status === statusFilter : true))
      .filter((p) => {
        if (!searchQuery) return true;
        return [p.pet_name, p.vet_first_name, p.vet_last_name, p.clinic_name, p.payment_method]
          .join(' ').toLowerCase().includes(searchQuery.toLowerCase());
      });
  }, [payments, statusFilter, searchQuery]);

  const { sortedData, requestSort, sortConfig } = useSort(filtered, {
    key: 'appointment_date',
    direction: 'desc',
  } as any);

  const indexOfLast = currentPage * itemsPerPage;
  const currentItems = (sortedData as UserPayment[]).slice(indexOfLast - itemsPerPage, indexOfLast);

  const fmt = (v: string | number) => `$${parseFloat(String(v)).toFixed(2)}`;
  const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  if (loading) return <div className='flex items-center justify-center py-10'><div className='animate-spin rounded-full h-7 w-7 border-b-2 border-blue-600' /></div>;
  if (error) return <div className='p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm'>{error}</div>;

  return (
    <div className='p-4 bg-white rounded-xl shadow-md'>
      {selectedPayment && (
        <InvoiceModal payment={selectedPayment} onClose={() => setSelectedPayment(null)} />
      )}

      <TableToolbar
        onAddNew={undefined}
        addButtonLabel=''
        selectedRowsCount={0}
        bulkActionsOptions={<></>}
        statusUpdateOptions={<></>}
        showStatusDropdown={false}
        onBulkActionChange={() => {}}
        onStatusUpdateChange={() => {}}
        onApplyAction={() => {}}
        bulkActionValue=''
        statusUpdateValue=''
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder='Search by pet, vet, clinic, method…'
        filterOptions={
          <>
            <option value=''>All Statuses</option>
            <option value='pending'>Pending</option>
            <option value='completed'>Completed</option>
            <option value='failed'>Failed</option>
            <option value='cancelled'>Cancelled</option>
          </>
        }
        onFilterChange={setStatusFilter}
        filterValue={statusFilter}
      />

      {filtered.length === 0 ? (
        <div className='p-8 text-center text-gray-500'>No payments found.</div>
      ) : (
        <div className='w-full overflow-x-auto rounded-lg border border-gray-200'>
          <div className='min-w-[800px]'>
            <Table className='w-full'>
              <TableHeader className='bg-gray-50'>
                <TableRow>
                  {columns.map((col) =>
                    col.key === 'actions' ? (
                      <TableCell key={col.key} isHeader className={`px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide ${col.className}`}>
                        {col.label}
                      </TableCell>
                    ) : (
                      <SortableTableHeader<UserPayment>
                        key={col.key}
                        columnKey={col.key as keyof UserPayment}
                        label={col.label}
                        sortConfig={sortConfig}
                        requestSort={requestSort}
                        className={`px-4 py-3 text-left ${col.className}`}
                      />
                    )
                  )}
                </TableRow>
              </TableHeader>

              <TableBody>
                {currentItems.map((p) => (
                  <TableRow key={p.id} className='hover:bg-gray-50 border-b border-gray-100 last:border-0'>
                    <TableCell className='px-4 py-3 text-sm text-gray-700'>{fmtDate(p.appointment_date)}</TableCell>
                    <TableCell className='px-4 py-3 text-sm text-gray-900'>{p.pet_name || '—'}</TableCell>
                    <TableCell className='px-4 py-3'>
                      <p className='text-sm text-gray-900'>Dr. {p.vet_first_name} {p.vet_last_name}</p>
                      <p className='text-xs text-gray-400'>{p.clinic_name || '—'}</p>
                    </TableCell>
                    <TableCell className='px-4 py-3 text-sm text-gray-700 capitalize'>{p.payment_method}</TableCell>
                    <TableCell className='px-4 py-3'>
                      <p className='text-sm font-semibold text-gray-900'>{fmt(p.total_amount)}</p>
                    </TableCell>
                    <TableCell className='px-4 py-3'>
                      <Badge size='sm' color={statusColor(p.payment_status)}>
                        {p.payment_status}
                      </Badge>
                    </TableCell>
                    <TableCell className='px-4 py-3'>
                      <button
                        onClick={() => setSelectedPayment(p)}
                        className='p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition'
                        title='View invoice'
                      >
                        <Eye size={15} />
                      </button>
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
        onItemsPerPageChange={(n) => { setItemsPerPage(n); setCurrentPage(1); }}
      />
    </div>
  );
}
