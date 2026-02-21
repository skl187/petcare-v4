import { useEffect, useState } from 'react';
import { DollarSign, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import PageMeta from '../../components/common/PageMeta';
import AdminPaymentsTable from '../../components/tables/AdminTables/AdminPaymentsTable';
import { getAllPayments, AdminPayment } from '../../services/paymentService';

export default function AdminPayments() {
  const [payments, setPayments] = useState<AdminPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllPayments();
      setPayments(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // Summary computations
  const total = payments.length;
  const completed = payments.filter((p) => p.payment_status === 'completed').length;
  const pending = payments.filter((p) => p.payment_status === 'pending').length;
  const totalAmount = payments.reduce((sum, p) => sum + parseFloat(String(p.total_amount)), 0);

  const fmt = (v: number) => `$${v.toFixed(2)}`;

  const summaryCards = [
    {
      label: 'Total Payments',
      value: total,
      icon: <DollarSign size={22} />,
      borderColor: 'border-blue-500',
      iconBg: 'bg-blue-50 text-blue-600',
    },
    {
      label: 'Completed',
      value: completed,
      icon: <CheckCircle size={22} />,
      borderColor: 'border-green-500',
      iconBg: 'bg-green-50 text-green-600',
    },
    {
      label: 'Pending',
      value: pending,
      icon: <Clock size={22} />,
      borderColor: 'border-yellow-500',
      iconBg: 'bg-yellow-50 text-yellow-600',
    },
    {
      label: 'Total Amount',
      value: fmt(totalAmount),
      icon: <TrendingUp size={22} />,
      borderColor: 'border-orange-500',
      iconBg: 'bg-orange-50 text-orange-600',
    },
  ];

  return (
    <>
      <PageMeta title='Payments | Admin' description='Admin payment management' />

      <div className='space-y-5 p-4 sm:p-6'>
        {/* Page header */}
        <div className='flex items-center gap-3'>
          <div className='p-2 bg-blue-50 rounded-xl text-blue-600'>
            <DollarSign size={24} />
          </div>
          <div>
            <h1 className='text-xl font-bold text-gray-900'>Payments</h1>
            <p className='text-sm text-gray-500'>Overview of all patient payment transactions</p>
          </div>
        </div>

        {/* Summary cards */}
        <div className='grid grid-cols-2 lg:grid-cols-4 gap-4'>
          {summaryCards.map((card) => (
            <div
              key={card.label}
              className={`bg-white rounded-xl shadow-sm border border-gray-100 border-l-4 ${card.borderColor} px-5 py-4 flex items-center gap-4`}
            >
              <div className={`p-2.5 rounded-lg ${card.iconBg}`}>{card.icon}</div>
              <div>
                <p className='text-xs text-gray-500 font-medium'>{card.label}</p>
                <p className='text-xl font-bold text-gray-900'>{card.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Table card */}
        <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-5'>
          <AdminPaymentsTable
            payments={payments}
            loading={loading}
            error={error}
            onStatusChanged={load}
          />
        </div>
      </div>
    </>
  );
}
