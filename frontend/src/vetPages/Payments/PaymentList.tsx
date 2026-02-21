import { useEffect, useState } from 'react';
import {
  getVetPayments,
  Payment,
  updatePaymentStatus,
} from '../../services/paymentService';
import { Trash2, DollarSign } from 'lucide-react';

const PaymentList = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Load payments on mount
  useEffect(() => {
    loadPayments();
  }, []);

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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: string) => {
    return `$${parseFloat(amount).toFixed(2)}`;
  };

  const getStatusBadgeColor = (status: string) => {
    const colors: { [key: string]: string } = {
      pending: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || colors.pending;
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const paginatedPayments = payments.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(payments.length / itemsPerPage);

  if (loading) {
    return (
      <div className='flex items-center justify-center p-8'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600'></div>
      </div>
    );
  }

  return (
    <div className='p-4 md:p-6 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen'>
      {/* Header */}
      <div className='mb-6'>
        <div className='flex items-center gap-3 mb-2'>
          <DollarSign className='w-8 h-8 text-blue-600' />
          <h1 className='text-3xl font-bold text-gray-800'>Payments</h1>
        </div>
        <p className='text-gray-600'>
          Manage and track all payment transactions
        </p>
      </div>

      {/* Error Banner */}
      {error && (
        <div className='mb-4 p-4 border border-red-200 bg-red-50 rounded-lg'>
          <p className='text-red-800 text-sm'>{error}</p>
        </div>
      )}

      {/* Success Banner */}
      {success && (
        <div className='mb-4 p-4 border border-green-200 bg-green-50 rounded-lg'>
          <p className='text-green-800 text-sm'>{success}</p>
        </div>
      )}

      {/* Summary Cards */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4 mb-6'>
        <div className='bg-white rounded-lg shadow-sm p-4 border-l-4 border-blue-500'>
          <p className='text-gray-600 text-sm font-medium'>Total Payments</p>
          <p className='text-2xl font-bold text-gray-800'>{payments.length}</p>
        </div>
        <div className='bg-white rounded-lg shadow-sm p-4 border-l-4 border-green-500'>
          <p className='text-gray-600 text-sm font-medium'>Completed</p>
          <p className='text-2xl font-bold text-green-600'>
            {payments.filter((p) => p.payment_status === 'completed').length}
          </p>
        </div>
        <div className='bg-white rounded-lg shadow-sm p-4 border-l-4 border-yellow-500'>
          <p className='text-gray-600 text-sm font-medium'>Pending</p>
          <p className='text-2xl font-bold text-yellow-600'>
            {payments.filter((p) => p.payment_status === 'pending').length}
          </p>
        </div>
        <div className='bg-white rounded-lg shadow-sm p-4 border-l-4 border-orange-500'>
          <p className='text-gray-600 text-sm font-medium'>Total Amount</p>
          <p className='text-2xl font-bold text-orange-600'>
            {formatCurrency(
              payments.reduce(
                (sum, p) => (parseFloat(p.total_amount) + sum).toString(),
                '0',
              ),
            )}
          </p>
        </div>
      </div>

      {/* Payments Table */}
      <div className='bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden'>
        <div className='overflow-x-auto'>
          <table className='w-full'>
            <thead>
              <tr className='border-b border-gray-200 bg-gray-50'>
                <th className='px-4 py-3 text-left text-xs font-semibold text-gray-700'>
                  Appointment Date
                </th>
                <th className='px-4 py-3 text-left text-xs font-semibold text-gray-700'>
                  Payment Method
                </th>
                <th className='px-4 py-3 text-left text-xs font-semibold text-gray-700'>
                  Subtotal
                </th>
                <th className='px-4 py-3 text-left text-xs font-semibold text-gray-700'>
                  Discount
                </th>
                <th className='px-4 py-3 text-left text-xs font-semibold text-gray-700'>
                  Tax
                </th>
                <th className='px-4 py-3 text-left text-xs font-semibold text-gray-700'>
                  Total
                </th>
                <th className='px-4 py-3 text-left text-xs font-semibold text-gray-700'>
                  Paid
                </th>
                <th className='px-4 py-3 text-left text-xs font-semibold text-gray-700'>
                  Status
                </th>
                <th className='px-4 py-3 text-left text-xs font-semibold text-gray-700'>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedPayments.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className='px-4 py-6 text-center text-gray-500'
                  >
                    No payments found
                  </td>
                </tr>
              ) : (
                paginatedPayments.map((payment) => (
                  <tr
                    key={payment.id}
                    className='border-b border-gray-200 hover:bg-gray-50 transition'
                  >
                    <td className='px-4 py-3 text-sm text-gray-700'>
                      {formatDate(payment.appointment_date)}
                    </td>
                    <td className='px-4 py-3 text-sm text-gray-700 capitalize'>
                      {payment.payment_method}
                    </td>
                    <td className='px-4 py-3 text-sm font-medium text-gray-800'>
                      {formatCurrency(payment.subtotal)}
                    </td>
                    <td className='px-4 py-3 text-sm text-gray-700'>
                      {formatCurrency(payment.discount_amount)}
                    </td>
                    <td className='px-4 py-3 text-sm text-gray-700'>
                      {formatCurrency(payment.tax_amount)}
                    </td>
                    <td className='px-4 py-3 text-sm font-semibold text-gray-900'>
                      {formatCurrency(payment.total_amount)}
                    </td>
                    <td className='px-4 py-3 text-sm font-semibold text-green-600'>
                      {formatCurrency(payment.paid_amount)}
                    </td>
                    <td className='px-4 py-3 text-sm'>
                      <select
                        value={payment.payment_status}
                        onChange={(e) =>
                          handleStatusChange(
                            payment.id,
                            e.target.value as
                              | 'pending'
                              | 'completed'
                              | 'failed'
                              | 'cancelled',
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
                      <button
                        onClick={() => {
                          /* Handle delete if needed */
                        }}
                        className='p-1 text-red-600 hover:bg-red-50 rounded-lg transition'
                        title='Delete payment'
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className='px-4 py-3 border-t border-gray-200 flex items-center justify-between'>
            <div className='text-sm text-gray-600'>
              Page {currentPage} of {totalPages}
            </div>
            <div className='flex gap-2'>
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className='px-3 py-1 text-sm border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50'
              >
                Previous
              </button>
              <button
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
                className='px-3 py-1 text-sm border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50'
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentList;
