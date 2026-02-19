import { MdRefresh } from 'react-icons/md';
import { useState, useEffect, useCallback } from 'react';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '../../ui/table';
import Badge from '../../ui/badge/Badge';
import Pagination from '../tableComponents/Pagination';
import useSort from '../../../hooks/useSort';
import SortableTableHeader from '../tableComponents/SortableTableHeader';
import { TableToolbar } from '../tableComponents/TableToolbar';
import { listPendingNotifications, resendNotification } from '../../../services/notificationService';
import { showToast } from '../../ui/toast/showToast';

export interface NotificationItem {
  id: string;
  user_id?: string;
  notification_key?: string;
  channel: string;
  template_key: string;
  locale: string;
  payload?: Record<string, any>;
  status: 'pending' | 'sent' | 'failed';
  error?: string;
  retry_count?: number;
  scheduled_at?: string;
  sent_at?: string;
  created_at?: string;
  email?: string;
  phone?: string;
}

export default function NotificationListTable() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'sent' | 'failed'>('all');
  const [filterChannel, setFilterChannel] = useState<'all' | 'email' | 'sms' | 'push'>('all');
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [actionDropdown, setActionDropdown] = useState('No actions');

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const columns = [
    { key: 'notification_key', label: 'Key', className: 'min-w-[140px] text-gray-700 font-semibold' },
    { key: 'channel', label: 'Channel', className: 'min-w-[80px] text-gray-700' },
    { key: 'template_key', label: 'Template', className: 'min-w-[140px] text-gray-700' },
    { key: 'status', label: 'Status', className: 'min-w-[100px] text-gray-700' },
    { key: 'email', label: 'Email/Target', className: 'min-w-[180px] text-gray-700' },
    { key: 'scheduled_at', label: 'Scheduled', className: 'min-w-[160px] text-gray-700 text-sm' },
    { key: 'retry_count', label: 'Retries', className: 'min-w-[70px] text-gray-700 text-center' },
  ] as const;

  const fetchData = useCallback(async () => {
    setIsLoadingData(true);
    setFetchError(null);
    try {
      const data = await listPendingNotifications();
      setNotifications(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error('Error fetching notifications:', err);
      setFetchError(err.message || 'Failed to load notifications');
    } finally {
      setIsLoadingData(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const filtered = notifications.filter((n) => {
    if (filterStatus !== 'all' && n.status !== filterStatus) return false;
    if (filterChannel !== 'all' && n.channel !== filterChannel) return false;

    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (n.notification_key || '').toLowerCase().includes(q) ||
      (n.template_key || '').toLowerCase().includes(q) ||
      (n.email || '').toLowerCase().includes(q) ||
      (n.channel || '').toLowerCase().includes(q)
    );
  });

  const { sortedData, requestSort, sortConfig } = useSort(filtered as any, { key: 'scheduled_at', direction: 'desc' } as any);

  const totalItems = sortedData.length;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedData.slice(indexOfFirstItem, indexOfLastItem);

  const handleResend = async (id: string) => {
    if (!window.confirm('Resend this notification?')) return;
    try {
      setIsLoadingData(true);
      await resendNotification(id);
      showToast('Notification scheduled for resend', 'success');
      fetchData();
    } catch (err: any) {
      showToast(err.message || 'Failed to resend', 'error');
    } finally {
      setIsLoadingData(false);
    }
  };

  const getStatusColor = (status: string): 'success' | 'warning' | 'error' | 'info' => {
    switch (status) {
      case 'sent':
        return 'success';
      case 'failed':
        return 'error';
      case 'pending':
        return 'warning';
      default:
        return 'info';
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString().slice(0, 5);
  };

  const handleApplyAction = () => {
    if (actionDropdown === 'Delete') {
      // Handle bulk delete
      setSelectedRows([]);
    }
  };

  return (
    <div className='space-y-4'>
      {fetchError && (
        <div className='p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700'>
          {fetchError}
        </div>
      )}

      <TableToolbar
        searchPlaceholder='Search by key, template, email...'
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedRowsCount={selectedRows.length}
        bulkActionsOptions={
          <>
            <option value='No actions'>No actions</option>
          </>
        }
        onBulkActionChange={setActionDropdown}
        onApplyAction={handleApplyAction}
        bulkActionValue={actionDropdown}
        filterOptions={
          <>
            <option value='all'>All Status</option>
            <option value='pending'>Pending</option>
            <option value='sent'>Sent</option>
            <option value='failed'>Failed</option>
          </>
        }
        onFilterChange={(val) => setFilterStatus(val as any)}
        filterValue={filterStatus}
      />

      <div className='flex gap-2 mb-4'>
        <select
          value={filterChannel}
          onChange={(e) => setFilterChannel(e.target.value as any)}
          className='px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500'
        >
          <option value='all'>All Channels</option>
          <option value='email'>Email</option>
          <option value='sms'>SMS</option>
          <option value='push'>Push</option>
        </select>
        <button
          onClick={fetchData}
          disabled={isLoadingData}
          className='px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded border flex items-center gap-2'
        >
          <MdRefresh size={16} /> Refresh
        </button>
      </div>

      <div className='border rounded-lg overflow-hidden bg-white'>
        <Table>
          <TableHeader>
            <TableRow className='bg-gray-50 border-b'>
              {columns.map((col) => (
                <th key={col.key} className={`px-4 py-3 text-left text-xs font-semibold ${col.className}`}>
                  <SortableTableHeader
                    label={col.label}
                    columnKey={col.key}
                    sortConfig={sortConfig}
                    requestSort={requestSort}
                  />
                </th>
              ))}
              <th className='px-4 py-3 text-left text-xs font-semibold w-20'>Actions</th>
            </TableRow>
          </TableHeader>

          <TableBody>
            {currentItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + 1} className='px-4 py-6 text-center text-gray-500'>
                  No notifications found
                </TableCell>
              </TableRow>
            ) : (
              (currentItems as NotificationItem[]).map((n) => (
                <TableRow key={n.id} className='border-b hover:bg-gray-50'>
                  <TableCell className='px-4 py-3 text-sm font-mono text-gray-700'>{n.notification_key || '-'}</TableCell>
                  <TableCell className='px-4 py-3 text-sm'>
                    <Badge variant='light' color='info' size='sm'>
                      {n.channel.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell className='px-4 py-3 text-sm text-gray-700'>{n.template_key}</TableCell>
                  <TableCell className='px-4 py-3 text-sm'>
                    <Badge variant='light' color={getStatusColor(n.status)} size='sm'>
                      {n.status.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell className='px-4 py-3 text-sm text-gray-700'>{n.email || n.phone || n.notification_key || '-'}</TableCell>
                  <TableCell className='px-4 py-3 text-xs text-gray-600'>{formatDate(n.scheduled_at)}</TableCell>
                  <TableCell className='px-4 py-3 text-sm text-center'>
                    {n.status === 'failed' ? <span className='text-red-600 font-semibold'>{n.retry_count || 0}</span> : <span className='text-gray-400'>{n.retry_count || 0}</span>}
                  </TableCell>
                  <TableCell className='px-4 py-3 text-sm'>
                    <button
                      onClick={() => handleResend(n.id)}
                      disabled={isLoadingData}
                      title='Resend notification'
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs ${
                        n.status === 'pending' || n.status === 'failed'
                          ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      <MdRefresh size={14} />
                    </button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Pagination
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={setItemsPerPage}
      />
    </div>
  );
}
