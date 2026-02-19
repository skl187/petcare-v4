import { OwnerDashboardData } from "../../services/dashboardService";

interface Props {
  data: OwnerDashboardData | null;
}

export default function PaymentsSummary({ data }: Props) {
  const payments = data?.payments;

  const formatCurrency = (amount: string | number) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(num || 0);
  };

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Payments</h3>
        <button className="text-sm underline underline-offset-4 text-blue-600 dark:text-blue-400">
          See history
        </button>
      </div>

      {payments ? (
        <>
          {/* Payment Stats */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="rounded-xl bg-emerald-50 dark:bg-emerald-900/20 p-3">
              <p className="text-xs text-gray-500 dark:text-gray-400">Total Paid</p>
              <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                {formatCurrency(payments.total_paid)}
              </p>
            </div>
            <div className="rounded-xl bg-amber-50 dark:bg-amber-900/20 p-3">
              <p className="text-xs text-gray-500 dark:text-gray-400">Pending</p>
              <p className="text-lg font-bold text-amber-600 dark:text-amber-400">
                {formatCurrency(payments.total_pending)}
              </p>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">Total Transactions</span>
              <span className="font-medium text-gray-800 dark:text-white">{payments.total_transactions}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500 dark:text-gray-400">Total Amount</span>
              <span className="font-medium text-gray-800 dark:text-white">{formatCurrency(payments.total_amount)}</span>
            </div>
            {parseInt(payments.pending_count) > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Pending Payments</span>
                <span className="font-medium text-amber-600 dark:text-amber-400">{payments.pending_count}</span>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          No payment data available
        </div>
      )}
    </div>
  );
}
