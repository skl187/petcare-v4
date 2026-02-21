import { useEffect, useState } from 'react';
import {
  getVetPayments,
  Payment,
  updatePaymentStatus,
} from '../../services/paymentService';
import { Trash2, DollarSign, X, Eye, Printer } from 'lucide-react';
import DatePickerInput from '../../components/form/DatePickerInput/DatePickerInput';
import Pagination from '../../components/tables/tableComponents/Pagination';

// ─────────────────────────────────────────────
// Invoice Modal
// ─────────────────────────────────────────────
const InvoiceModal = ({ payment, onClose }: { payment: Payment; onClose: () => void }) => {
  const formatCurrency = (amount: string | number) =>
    `$${parseFloat(String(amount)).toFixed(2)}`;

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
    });

  const handlePrint = () => window.print();

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'>
      <div className='bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden'>
        {/* Modal Header */}
        <div className='flex items-center justify-between px-6 py-4 border-b border-gray-200'>
          <h2 className='text-lg font-semibold text-gray-800'>Payment Invoice</h2>
          <div className='flex items-center gap-2'>
            <button
              onClick={handlePrint}
              className='flex items-center gap-1.5 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition print:hidden'
            >
              <Printer size={14} />
              Print
            </button>
            <button
              onClick={onClose}
              className='p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg transition print:hidden'
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Invoice Content */}
        <div id='invoice-content' className='px-6 py-5'>
          <div className='flex justify-between items-start mb-6'>
            <div>
              <p className='text-xs text-gray-500 uppercase tracking-wide'>Invoice ID</p>
              <p className='text-sm font-mono text-gray-800'>{payment.id.slice(0, 8).toUpperCase()}</p>
            </div>
            <div className='text-right'>
              <p className='text-xs text-gray-500 uppercase tracking-wide'>Appointment Date</p>
              <p className='text-sm font-medium text-gray-800'>{formatDate(payment.appointment_date)}</p>
            </div>
          </div>

          <div className='mb-5'>
            <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${
              payment.payment_status === 'completed' ? 'bg-green-100 text-green-800' :
              payment.payment_status === 'pending'   ? 'bg-yellow-100 text-yellow-800' :
              payment.payment_status === 'failed'    ? 'bg-red-100 text-red-800' :
                                                       'bg-gray-100 text-gray-800'
            }`}>
              {payment.payment_status}
            </span>
          </div>

          <div className='border border-gray-200 rounded-lg overflow-hidden mb-4'>
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
                  <td className='px-4 py-2.5 text-right text-gray-800'>{formatCurrency(payment.consultation_fee)}</td>
                </tr>
                <tr className='border-b border-gray-100'>
                  <td className='px-4 py-2.5 text-gray-700'>Other Charges</td>
                  <td className='px-4 py-2.5 text-right text-gray-800'>{formatCurrency(payment.other_charges)}</td>
                </tr>
                <tr className='border-b border-gray-100'>
                  <td className='px-4 py-2.5 text-gray-700'>Subtotal</td>
                  <td className='px-4 py-2.5 text-right font-medium text-gray-800'>{formatCurrency(payment.subtotal)}</td>
                </tr>
                {parseFloat(payment.discount_amount) > 0 && (
                  <tr className='border-b border-gray-100'>
                    <td className='px-4 py-2.5 text-green-700'>Discount</td>
                    <td className='px-4 py-2.5 text-right text-green-700'>-{formatCurrency(payment.discount_amount)}</td>
                  </tr>
                )}
                {parseFloat(payment.tax_amount) > 0 && (
                  <tr className='border-b border-gray-100'>
                    <td className='px-4 py-2.5 text-gray-700'>Tax</td>
                    <td className='px-4 py-2.5 text-right text-gray-800'>{formatCurrency(payment.tax_amount)}</td>
                  </tr>
                )}
                <tr className='bg-gray-50'>
                  <td className='px-4 py-3 font-semibold text-gray-900'>Total</td>
                  <td className='px-4 py-3 text-right font-bold text-gray-900 text-base'>{formatCurrency(payment.total_amount)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className='grid grid-cols-2 gap-4 text-sm'>
            <div className='bg-gray-50 rounded-lg px-4 py-3'>
              <p className='text-xs text-gray-500 mb-1'>Payment Method</p>
              <p className='font-medium text-gray-800 capitalize'>{payment.payment_method}</p>
            </div>
            <div className='bg-gray-50 rounded-lg px-4 py-3'>
              <p className='text-xs text-gray-500 mb-1'>Amount Paid</p>
              <p className='font-semibold text-green-600'>{formatCurrency(payment.paid_amount)}</p>
            </div>
            {payment.transaction_id && (
              <div className='col-span-2 bg-gray-50 rounded-lg px-4 py-3'>
                <p className='text-xs text-gray-500 mb-1'>Transaction ID</p>
                <p className='font-mono text-gray-800 text-xs'>{payment.transaction_id}</p>
              </div>
            )}
            {payment.payment_date && (
              <div className='col-span-2 bg-gray-50 rounded-lg px-4 py-3'>
                <p className='text-xs text-gray-500 mb-1'>Payment Date</p>
                <p className='font-medium text-gray-800'>{formatDate(payment.payment_date)}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────
const PaymentList = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [filtered, setFiltered] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);         // ← added
  const [fromDate, setFromDate] = useState<Date | null>(null);
  const [toDate, setToDate] = useState<Date | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);

  useEffect(() => { loadPayments(); }, []);

  useEffect(() => {
    applyDateFilter(payments, fromDate, toDate);
  }, [payments, fromDate, toDate]); // eslint-disable-line

  const loadPayments = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getVetPayments();
      setPayments(data);
    } catch (err) {
      setError('Failed to load payments. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const applyDateFilter = (data: Payment[], from: Date | null, to: Date | null) => {
    let result = [...data];
    if (from) {
      const fromTs = new Date(from).setHours(0, 0, 0, 0);
      result = result.filter((p) => new Date(p.appointment_date).getTime() >= fromTs);
    }
    if (to) {
      const toTs = new Date(to).setHours(23, 59, 59, 999);
      result = result.filter((p) => new Date(p.appointment_date).getTime() <= toTs);
    }
    setFiltered(result);
    setCurrentPage(1);
  };

  const clearFilters = () => { setFromDate(null); setToDate(null); };

  const handleStatusChange = async (
    paymentId: string,
    newStatus: 'pending' | 'completed' | 'failed' | 'cancelled',
  ) => {
    try {
      setError(null);
      await updatePaymentStatus(paymentId, newStatus);
      setSuccess('Payment status updated successfully');
      await loadPayments();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Failed to update payment status');
      console.error(err);
    }
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
    });

  const formatCurrency = (amount: string | number) =>
    `$${parseFloat(String(amount)).toFixed(2)}`;

  const totalAmount = filtered.reduce((sum, p) => sum + parseFloat(p.total_amount), 0);

  const getStatusBadgeColor = (status: string) => {
    const colors: { [key: string]: string } = {
      pending:   'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
      failed:    'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || colors.pending;
  };

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const paginatedPayments = filtered.slice(indexOfFirstItem, indexOfLastItem);  // ← uses itemsPerPage now

  const handlePageChange = (page: number) => setCurrentPage(page);

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  const isFiltered = fromDate != null || toDate != null;

  if (loading) {
    return (
      <div className='flex items-center justify-center p-8'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
      </div>
    );
  }

  return (
    <div className='p-4 md:p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen'>
      {/* Invoice Modal */}
      {selectedPayment && (
        <InvoiceModal payment={selectedPayment} onClose={() => setSelectedPayment(null)} />
      )}

      {/* Header */}
      <div className='mb-6'>
        <div className='flex items-center gap-3 mb-2'>
          <DollarSign className='w-8 h-8 text-blue-600' />
          <h1 className='text-3xl font-bold text-gray-800'>Payments</h1>
        </div>
        <p className='text-gray-600'>Manage and track all payment transactions</p>
      </div>

      {/* Error / Success Banners */}
      {error && (
        <div className='mb-4 p-4 border border-red-200 bg-red-50 rounded-lg'>
          <p className='text-red-800 text-sm'>{error}</p>
        </div>
      )}
      {success && (
        <div className='mb-4 p-4 border border-green-200 bg-green-50 rounded-lg'>
          <p className='text-green-800 text-sm'>{success}</p>
        </div>
      )}

      {/* Summary Cards + Date Filter */}
      <div className='flex flex-col gap-4 mb-6'>
        <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
          <div className='bg-white rounded-lg shadow-sm p-4 border-l-4 border-blue-500'>
            <p className='text-gray-600 text-sm font-medium'>Total Payments</p>
            <p className='text-2xl font-bold text-gray-800'>{filtered.length}</p>
          </div>
          <div className='bg-white rounded-lg shadow-sm p-4 border-l-4 border-green-500'>
            <p className='text-gray-600 text-sm font-medium'>Completed</p>
            <p className='text-2xl font-bold text-green-600'>
              {filtered.filter((p) => p.payment_status === 'completed').length}
            </p>
          </div>
          <div className='bg-white rounded-lg shadow-sm p-4 border-l-4 border-yellow-500'>
            <p className='text-gray-600 text-sm font-medium'>Pending</p>
            <p className='text-2xl font-bold text-yellow-600'>
              {filtered.filter((p) => p.payment_status === 'pending').length}
            </p>
          </div>
          <div className='bg-white rounded-lg shadow-sm p-4 border-l-4 border-orange-500'>
            <p className='text-gray-600 text-sm font-medium'>
              Total Amount{isFiltered ? ' (filtered)' : ''}
            </p>
            <p className='text-2xl font-bold text-orange-600'>{formatCurrency(totalAmount)}</p>
          </div>
        </div>

        <div className='flex justify-end'>
          <div className='bg-white rounded-lg shadow-sm border border-gray-200 px-4 py-3 flex items-center gap-3'>
            <div className='flex items-center gap-2'>
              <span className='text-xs text-gray-500 whitespace-nowrap'>From</span>
              <div className='w-36'>
                <DatePickerInput
                  value={fromDate}
                  onChange={(date) => setFromDate(date)}
                  maxDate={toDate ?? undefined}
                />
              </div>
            </div>
            <div className='flex items-center gap-2'>
              <span className='text-xs text-gray-500 whitespace-nowrap'>To</span>
              <div className='w-36'>
                <DatePickerInput
                  value={toDate}
                  onChange={(date) => setToDate(date)}
                  minDate={fromDate ?? undefined}
                />
              </div>
            </div>
            {isFiltered && (
              <button
                onClick={clearFilters}
                className='flex items-center gap-1 px-2 py-1.5 text-xs text-gray-500 border border-gray-300 rounded-lg hover:bg-gray-50'
              >
                <X size={12} />
                Clear
              </button>
            )}
            {isFiltered && (
              <span className='text-xs text-blue-600 font-medium whitespace-nowrap'>
                {filtered.length} / {payments.length}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div className='bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden'>
        <div className='overflow-x-auto'>
          <table className='w-full'>
            <thead>
              <tr className='border-b border-gray-200 bg-gray-50'>
                <th className='px-4 py-3 text-left text-xs font-semibold text-gray-700'>Appointment Date</th>
                <th className='px-4 py-3 text-left text-xs font-semibold text-gray-700'>Payment Method</th>
                <th className='px-4 py-3 text-left text-xs font-semibold text-gray-700'>Subtotal</th>
                <th className='px-4 py-3 text-left text-xs font-semibold text-gray-700'>Discount</th>
                <th className='px-4 py-3 text-left text-xs font-semibold text-gray-700'>Tax</th>
                <th className='px-4 py-3 text-left text-xs font-semibold text-gray-700'>Total</th>
                <th className='px-4 py-3 text-left text-xs font-semibold text-gray-700'>Paid</th>
                <th className='px-4 py-3 text-left text-xs font-semibold text-gray-700'>Status</th>
                <th className='px-4 py-3 text-left text-xs font-semibold text-gray-700'>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedPayments.length === 0 ? (
                <tr>
                  <td colSpan={9} className='px-4 py-8 text-center text-gray-500'>
                    {isFiltered ? 'No payments found for the selected date range' : 'No payments found'}
                  </td>
                </tr>
              ) : (
                paginatedPayments.map((payment) => (
                  <tr key={payment.id} className='border-b border-gray-200 hover:bg-gray-50 transition'>
                    <td className='px-4 py-3 text-sm text-gray-700'>{formatDate(payment.appointment_date)}</td>
                    <td className='px-4 py-3 text-sm text-gray-700 capitalize'>{payment.payment_method}</td>
                    <td className='px-4 py-3 text-sm font-medium text-gray-800'>{formatCurrency(payment.subtotal)}</td>
                    <td className='px-4 py-3 text-sm text-gray-700'>{formatCurrency(payment.discount_amount)}</td>
                    <td className='px-4 py-3 text-sm text-gray-700'>{formatCurrency(payment.tax_amount)}</td>
                    <td className='px-4 py-3 text-sm font-semibold text-gray-900'>{formatCurrency(payment.total_amount)}</td>
                    <td className='px-4 py-3 text-sm font-semibold text-green-600'>{formatCurrency(payment.paid_amount)}</td>
                    <td className='px-4 py-3 text-sm'>
                      <select
                        value={payment.payment_status}
                        onChange={(e) =>
                          handleStatusChange(
                            payment.id,
                            e.target.value as 'pending' | 'completed' | 'failed' | 'cancelled',
                          )
                        }
                        className={`px-2 py-1 rounded text-xs font-semibold border-0 cursor-pointer ${getStatusBadgeColor(payment.payment_status)}`}
                      >
                        <option value='pending'>Pending</option>
                        <option value='completed'>Completed</option>
                        <option value='failed'>Failed</option>
                        <option value='cancelled'>Cancelled</option>
                      </select>
                    </td>
                    <td className='px-4 py-3 text-sm'>
                      <div className='flex items-center gap-1'>
                        <button
                          onClick={() => setSelectedPayment(payment)}
                          className='p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition'
                          title='View invoice'
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          onClick={() => {/* Handle delete */}}
                          className='p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition'
                          title='Delete payment'
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <Pagination
        totalItems={filtered.length}
        itemsPerPage={itemsPerPage}
        onPageChange={handlePageChange}
        onItemsPerPageChange={handleItemsPerPageChange}
      />
    </div>
  );
};

export default PaymentList;