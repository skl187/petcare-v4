import { useState, useEffect, useMemo } from 'react';
import { Eye, Printer, X } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from '../../ui/table';
import Badge from '../../ui/badge/Badge';
import Checkbox from '../../form/input/Checkbox';
import Pagination from '../tableComponents/Pagination';
import useSort from '../../../hooks/useSort';
import SortableTableHeader from '../tableComponents/SortableTableHeader';
import { TableToolbar } from '../tableComponents/TableToolbar';
import { updatePaymentStatus, AdminPayment } from '../../../services/paymentService';

// ─────────────────────────────────────────────
// Invoice Modal
// ─────────────────────────────────────────────
const InvoiceModal = ({ payment, onClose }: { payment: AdminPayment; onClose: () => void }) => {
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
            <button
              onClick={onClose}
              className='p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg transition print:hidden'
            >
              <X size={16} />
            </button>
          </div>
        </div>

        <div className='px-6 py-5 space-y-4'>
          {/* Invoice meta */}
          <div className='flex justify-between items-start'>
            <div>
              <p className='text-xs text-gray-500 uppercase tracking-wide'>Invoice ID</p>
              <p className='text-sm font-mono text-gray-800'>{payment.id.slice(0, 8).toUpperCase()}</p>
            </div>
            <div className='text-right'>
              <p className='text-xs text-gray-500 uppercase tracking-wide'>Appointment Date</p>
              <p className='text-sm font-medium text-gray-800'>{fmtDate(payment.appointment_date)}</p>
            </div>
          </div>

          {/* Owner + Pet + Vet */}
          <div className='grid grid-cols-2 gap-3'>
            <div className='bg-gray-50 rounded-lg px-4 py-3'>
              <p className='text-xs text-gray-500 mb-1'>Owner</p>
              <p className='text-sm font-medium text-gray-800'>
                {payment.owner_first_name} {payment.owner_last_name}
              </p>
              <p className='text-xs text-gray-400'>{payment.owner_email}</p>
            </div>
            <div className='bg-gray-50 rounded-lg px-4 py-3'>
              <p className='text-xs text-gray-500 mb-1'>Patient (Pet)</p>
              <p className='text-sm font-medium text-gray-800'>{payment.pet_name || '—'}</p>
            </div>
            <div className='bg-gray-50 rounded-lg px-4 py-3'>
              <p className='text-xs text-gray-500 mb-1'>Veterinarian</p>
              <p className='text-sm font-medium text-gray-800'>
                Dr. {payment.vet_first_name} {payment.vet_last_name}
              </p>
            </div>
            <div className='bg-gray-50 rounded-lg px-4 py-3'>
              <p className='text-xs text-gray-500 mb-1'>Clinic</p>
              <p className='text-sm font-medium text-gray-800'>{payment.clinic_name || '—'}</p>
            </div>
          </div>

          {/* Status badge */}
          <div>
            <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${
              payment.payment_status === 'completed' ? 'bg-green-100 text-green-800' :
              payment.payment_status === 'pending'   ? 'bg-yellow-100 text-yellow-800' :
              payment.payment_status === 'failed'    ? 'bg-red-100 text-red-800' :
                                                       'bg-gray-100 text-gray-800'
            }`}>
              {payment.payment_status}
            </span>
          </div>

          {/* Invoice table */}
          <div className='border border-gray-200 rounded-lg overflow-hidden'>
            <table className='w-full text-sm'>
              <thead>
                <tr className='bg-gray-50 border-b border-gray-200'>
                  <th className='px-4 py-2.5 text-left text-xs font-semibold text-gray-600'>Description</th>
                  <th className='px-4 py-2.5 text-right text-xs font-semibold text-gray-600'>Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr className='border-b border-gray-100'>
                  <td className='px-4 py-2.5 text-gray-700'>Consultation Fee</td>
                  <td className='px-4 py-2.5 text-right text-gray-800'>{fmt(payment.consultation_fee)}</td>
                </tr>
                <tr className='border-b border-gray-100'>
                  <td className='px-4 py-2.5 text-gray-700'>Other Charges</td>
                  <td className='px-4 py-2.5 text-right text-gray-800'>{fmt(payment.other_charges)}</td>
                </tr>
                <tr className='border-b border-gray-100'>
                  <td className='px-4 py-2.5 text-gray-700'>Subtotal</td>
                  <td className='px-4 py-2.5 text-right font-medium text-gray-800'>{fmt(payment.subtotal)}</td>
                </tr>
                {parseFloat(payment.discount_amount) > 0 && (
                  <tr className='border-b border-gray-100'>
                    <td className='px-4 py-2.5 text-green-700'>Discount</td>
                    <td className='px-4 py-2.5 text-right text-green-700'>−{fmt(payment.discount_amount)}</td>
                  </tr>
                )}
                {parseFloat(payment.tax_amount) > 0 && (
                  <tr className='border-b border-gray-100'>
                    <td className='px-4 py-2.5 text-gray-700'>Tax</td>
                    <td className='px-4 py-2.5 text-right text-gray-800'>{fmt(payment.tax_amount)}</td>
                  </tr>
                )}
                <tr className='bg-gray-50'>
                  <td className='px-4 py-3 font-semibold text-gray-900'>Total</td>
                  <td className='px-4 py-3 text-right font-bold text-gray-900 text-base'>{fmt(payment.total_amount)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className='grid grid-cols-2 gap-3'>
            <div className='bg-gray-50 rounded-lg px-4 py-3'>
              <p className='text-xs text-gray-500 mb-1'>Payment Method</p>
              <p className='font-medium text-gray-800 capitalize'>{payment.payment_method}</p>
            </div>
            <div className='bg-gray-50 rounded-lg px-4 py-3'>
              <p className='text-xs text-gray-500 mb-1'>Amount Paid</p>
              <p className='font-semibold text-green-600'>{fmt(payment.paid_amount)}</p>
            </div>
            {payment.transaction_id && (
              <div className='col-span-2 bg-gray-50 rounded-lg px-4 py-3'>
                <p className='text-xs text-gray-500 mb-1'>Transaction ID</p>
                <p className='font-mono text-gray-800 text-xs'>{payment.transaction_id}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// Status badge helper
// ─────────────────────────────────────────────
const statusColor = (s: string): 'success' | 'warning' | 'error' | 'dark' =>
  s === 'completed' ? 'success' : s === 'pending' ? 'warning' : s === 'failed' ? 'error' : 'dark';

// ─────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────
interface AdminPaymentsTableProps {
  payments: AdminPayment[];
  loading: boolean;
  error: string | null;
  onStatusChanged: () => void;
}

export default function AdminPaymentsTable({
  payments,
  loading,
  error,
  onStatusChanged,
}: AdminPaymentsTableProps) {
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedPayment, setSelectedPayment] = useState<AdminPayment | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const columns = [
    { key: 'id',             label: 'Invoice #',      className: 'min-w-[110px]' },
    { key: 'pet_name',       label: 'Patient & Owner', className: 'min-w-[160px]' },
    { key: 'appointment_date', label: 'Date',          className: 'min-w-[120px]' },
    { key: 'vet_first_name', label: 'Vet & Clinic',   className: 'min-w-[160px]' },
    { key: 'payment_method', label: 'Method',          className: 'min-w-[100px]' },
    { key: 'total_amount',   label: 'Amount',          className: 'min-w-[120px]' },
    { key: 'payment_status', label: 'Status',          className: 'min-w-[130px]' },
    { key: 'actions',        label: 'Actions',         className: 'min-w-[80px]' },
  ] as const;

  // filtering
  const filtered = useMemo(() => {
    return payments
      .filter((p) => (statusFilter ? p.payment_status === statusFilter : true))
      .filter((p) => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return [
          p.owner_first_name, p.owner_last_name, p.owner_email,
          p.pet_name, p.vet_first_name, p.vet_last_name,
          p.clinic_name, p.payment_method, p.transaction_id ?? '',
        ].join(' ').toLowerCase().includes(q);
      });
  }, [payments, statusFilter, searchQuery]);

  const { sortedData, requestSort, sortConfig } = useSort<AdminPayment>(filtered, {
    key: 'appointment_date',
    direction: 'desc',
  } as any);

  // reset page when filters change
  useEffect(() => { setCurrentPage(1); }, [searchQuery, statusFilter]);

  const indexOfLast = currentPage * itemsPerPage;
  const paginated = (sortedData as AdminPayment[]).slice(indexOfLast - itemsPerPage, indexOfLast);

  // select all on page
  const allChecked = paginated.length > 0 && paginated.every((p) => selectedRows.includes(p.id));
  const toggleAll = () =>
    setSelectedRows(allChecked ? selectedRows.filter((id) => !paginated.find((p) => p.id === id)) : [...new Set([...selectedRows, ...paginated.map((p) => p.id)])]);
  const toggleRow = (id: string) =>
    setSelectedRows((prev) => (prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]));

  const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  const fmt = (v: string | number) => `$${parseFloat(String(v)).toFixed(2)}`;

  const handleStatusChange = async (id: string, status: AdminPayment['payment_status']) => {
    try {
      setUpdatingId(id);
      await updatePaymentStatus(id, status);
      setSuccessMsg('Payment status updated');
      onStatusChanged();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch {
      // silently ignore
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div className='flex items-center justify-center py-12'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600' />
      </div>
    );
  }

  if (error) {
    return (
      <div className='p-4 border border-red-200 bg-red-50 rounded-lg'>
        <p className='text-red-800 text-sm'>{error}</p>
      </div>
    );
  }

  return (
    <div>
      {/* Invoice modal */}
      {selectedPayment && (
        <InvoiceModal payment={selectedPayment} onClose={() => setSelectedPayment(null)} />
      )}

      {/* Success banner */}
      {successMsg && (
        <div className='mb-3 p-3 border border-green-200 bg-green-50 rounded-lg'>
          <p className='text-green-800 text-sm'>{successMsg}</p>
        </div>
      )}

      {/* Toolbar */}
      <TableToolbar
        onAddNew={undefined}
        addButtonLabel=''
        selectedRowsCount={selectedRows.length}
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
        searchPlaceholder='Search by owner, pet, vet, clinic, method…'
        filterOptions={
          <>
            <option value=''>All Statuses</option>
            <option value='pending'>Pending</option>
            <option value='completed'>Completed</option>
            <option value='failed'>Failed</option>
            <option value='cancelled'>Cancelled</option>
          </>
        }
        onFilterChange={(val) => setStatusFilter(val)}
        filterValue={statusFilter}
      />

      {/* Table */}
      <div className='overflow-x-auto'>
        <div style={{ minWidth: 900 }}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell isHeader className='w-10 px-3 py-3'>
                  <Checkbox checked={allChecked} onChange={toggleAll} />
                </TableCell>
                {columns.map((col) => (
                  col.key === 'actions' ? (
                    <TableCell key={col.key} isHeader className={`px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide ${col.className}`}>
                      {col.label}
                    </TableCell>
                  ) : (
                    <SortableTableHeader<AdminPayment>
                      key={col.key}
                      label={col.label}
                      columnKey={col.key}
                      requestSort={requestSort}
                      sortConfig={sortConfig}
                      className={col.className}
                    />
                  )
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className='px-4 py-8 text-center text-gray-400 text-sm'>
                    No payments found
                  </TableCell>
                </TableRow>
              ) : (
                paginated.map((p) => (
                  <TableRow key={p.id} className='hover:bg-gray-50 border-b border-gray-100 last:border-0'>
                    <TableCell className='px-3 py-3 w-10'>
                      <Checkbox checked={selectedRows.includes(p.id)} onChange={() => toggleRow(p.id)} />
                    </TableCell>

                    {/* Invoice # */}
                    <TableCell className='px-4 py-3'>
                      <span className='text-xs text-gray-800 bg-gray-100 px-2 py-1 rounded font-mono whitespace-nowrap'>
                        {p.id.slice(0, 8).toUpperCase()}
                      </span>
                    </TableCell>

                    {/* Patient & Owner (2-row) */}
                    <TableCell className='px-4 py-3'>
                      <p className='text-sm text-gray-900'>{p.pet_name || '—'}</p>
                      <p className='text-xs text-gray-400'>{p.owner_first_name} {p.owner_last_name}</p>
                    </TableCell>

                    {/* Date */}
                    <TableCell className='px-4 py-3 text-sm text-gray-700'>
                      {fmtDate(p.appointment_date)}
                    </TableCell>

                    {/* Vet & Clinic (2-row) */}
                    <TableCell className='px-4 py-3'>
                      <p className='text-sm text-gray-900'>Dr. {p.vet_first_name} {p.vet_last_name}</p>
                      <p className='text-xs text-gray-400'>{p.clinic_name || '—'}</p>
                    </TableCell>

                    {/* Method */}
                    <TableCell className='px-4 py-3 text-sm text-gray-700 capitalize'>
                      {p.payment_method}
                    </TableCell>

                    {/* Amount */}
                    <TableCell className='px-4 py-3'>
                      <p className='text-sm text-gray-900'>{fmt(p.total_amount)}</p>
                      <p className='text-xs text-green-600'>Paid: {fmt(p.paid_amount)}</p>
                    </TableCell>

                    {/* Status */}
                    <TableCell className='px-4 py-3'>
                      <select
                        value={p.payment_status}
                        disabled={updatingId === p.id}
                        onChange={(e) => handleStatusChange(p.id, e.target.value as AdminPayment['payment_status'])}
                        className='text-xs rounded-full px-2 py-1 cursor-pointer border-0 focus:ring-1 focus:ring-blue-500'
                        style={{ background: 'transparent' }}
                      >
                        <option value='pending'>Pending</option>
                        <option value='completed'>Completed</option>
                        <option value='failed'>Failed</option>
                        <option value='cancelled'>Cancelled</option>
                      </select>
                      <Badge color={statusColor(p.payment_status)} size='sm'>
                        {p.payment_status}
                      </Badge>
                    </TableCell>

                    {/* Actions */}
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
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      <Pagination
        totalItems={filtered.length}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={(n) => { setItemsPerPage(n); setCurrentPage(1); }}
      />
    </div>
  );
}
