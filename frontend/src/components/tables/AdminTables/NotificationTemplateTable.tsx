import { MdEdit, MdDelete, MdAdd } from 'react-icons/md';
import { useState, useEffect, useCallback } from 'react';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '../../ui/table';
import Badge from '../../ui/badge/Badge';
import Checkbox from '../../form/input/Checkbox';
import Pagination from '../tableComponents/Pagination';
import useSort from '../../../hooks/useSort';
import SortableTableHeader from '../tableComponents/SortableTableHeader';
import { TableToolbar } from '../tableComponents/TableToolbar';
import DeleteDialog from '../tableComponents/DeleteDailog';
import Switch from '../../form/switch/Switch';
import { IoIosCloseCircle, IoIosCheckmarkCircle } from 'react-icons/io';
import NotificationTemplateForm from '../../../adminPages/Forms/NotificationForms/TemplateNotificationForm';
import { listTemplates, deleteTemplate, updateTemplate } from '../../../services/notificationService';

export interface NotificationTemplateItem {
  id?: string;
  template_key: string;
  name?: string;
  channel?: string;
  description?: string;
  subject?: string;
  body?: string;
  body_html?: string;
  locale?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export default function NotificationTemplateTable() {
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editKey, setEditKey] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const [templates, setTemplates] = useState<NotificationTemplateItem[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  const [templateToDelete, setTemplateToDelete] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);

  const columns = [
    { key: 'template_key', label: 'Key', className: 'min-w-[160px] text-gray-700 font-semibold' },
    { key: 'name', label: 'Name', className: 'min-w-[160px] text-gray-700' },
    { key: 'channel', label: 'Channel', className: 'min-w-[100px] text-gray-700' },
    { key: 'description', label: 'Description', className: 'min-w-[220px] text-gray-700' },
    { key: 'locale', label: 'Locale', className: 'min-w-[80px] text-gray-700' },
    { key: 'is_active', label: 'Status', className: 'min-w-[100px] text-gray-700' },
  ] as const;

  const fetchData = useCallback(async () => {
    setIsLoadingData(true);
    setFetchError(null);
    try {
      const data = await listTemplates(1, 200);
      const list = Array.isArray((data as any).data) ? (data as any).data : [];
      setTemplates(list);
    } catch (err: any) {
      console.error('Error fetching templates:', err);
      setFetchError(err.message || 'Failed to load templates');
    } finally {
      setIsLoadingData(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filtered = templates.filter((t) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (t.template_key || '').toLowerCase().includes(q) ||
      (t.name || '').toLowerCase().includes(q) ||
      (t.channel || '').toLowerCase().includes(q) ||
      (t.description || '').toLowerCase().includes(q)
    );
  });

  const { sortedData, requestSort, sortConfig } = useSort(filtered, { key: 'template_key', direction: 'asc' });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedData.slice(indexOfFirstItem, indexOfLastItem);

  const toggleSelectRow = (id: string) => {
    setSelectedRows((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const toggleSelectAll = () => {
    setSelectedRows(selectedRows.length === templates.length && templates.length > 0 ? [] : templates.map((t) => t.template_key));
  };

  const handleDelete = (key?: string) => {
    setTemplateToDelete(key || null);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    setIsDeleteDialogOpen(false);
    setIsLoadingData(true);
    try {
      if (templateToDelete) {
        await deleteTemplate(templateToDelete);
        setSuccessBanner('Template deleted');
        setTimeout(() => setSuccessBanner(null), 3000);
      } else if (selectedRows.length > 0) {
        await Promise.all(selectedRows.map((k) => deleteTemplate(k)));
        setSuccessBanner(`${selectedRows.length} templates deleted`);
        setTimeout(() => setSuccessBanner(null), 3000);
        setSelectedRows([]);
      }
      await fetchData();
    } catch (err: any) {
      setFetchError(err.message || 'Failed to delete');
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleEdit = (key: string) => {
    setEditKey(key);
    setIsAddDialogOpen(true);
  };

  const handleFormClose = () => {
    setEditKey(null);
    setIsAddDialogOpen(false);
  };

  const handleFormSaved = async () => {
    await fetchData();
    handleFormClose();
  };

  const toggleActive = async (key: string, current: boolean | undefined) => {
    try {
      await updateTemplate(key, { is_active: !current });
      await fetchData();
    } catch (err: any) {
      setFetchError(err.message || 'Failed to update');
    }
  };

  return (
    <div className='space-y-6'>
      {fetchError && (
        <div className='rounded-lg bg-red-50 p-4 text-red-800 border border-red-200'>
          <p className='font-semibold'>{fetchError}</p>
        </div>
      )}

      {successBanner && (
        <div className='rounded-lg bg-green-50 p-4 text-green-800 border border-green-200'>
          <p className='font-semibold'>{successBanner}</p>
        </div>
      )}

      <TableToolbar
        onAddNew={() => setIsAddDialogOpen(true)}
        addButtonLabel='Add Template'
        addButtonIcon={<MdAdd className='w-5 h-5' />}
        selectedRowsCount={selectedRows.length}
        bulkActionsOptions={<><option value='No actions'>No actions</option><option value='Delete'>Delete</option></>}
        showStatusDropdown={false}
        onBulkActionChange={() => {}}
        onStatusUpdateChange={() => {}}
        onApplyAction={() => {}}
        bulkActionValue={'No actions'}
        statusUpdateValue={''}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder='Search templates by key, name or subject...'
        onFilterChange={() => {}}
        filterValue={''}
      />

      <div className='w-full overflow-x-auto rounded-lg border border-gray-200'>
        <div className='min-w-[800px]'>
          <Table className='w-full'>
            <TableHeader className='bg-gray-50'>
              <TableRow>
                <TableCell className='w-10 p-2 py-3'>
                  <Checkbox checked={selectedRows.length === templates.length && templates.length > 0} onChange={toggleSelectAll} />
                </TableCell>
                {columns.map((column) => (
                  <SortableTableHeader key={column.key} columnKey={column.key} label={column.label} sortConfig={sortConfig} requestSort={requestSort} className={`p-2 py-3 text-left text-sm text-gray-900 font-medium ${column.className}`} />
                ))}
                <TableCell className='w-24 p-2 py-3 text-sm font-medium'>Actions</TableCell>
              </TableRow>
            </TableHeader>

            <TableBody>
              {isLoadingData ? (
                <TableRow><td className='p-4 text-center' colSpan={columns.length + 2}>Loading templates...</td></TableRow>
              ) : templates.length === 0 ? (
                <TableRow><td className='p-4 text-center' colSpan={columns.length + 2}>No templates found.</td></TableRow>
              ) : (
                currentItems.map((t) => (
                  <TableRow key={t.template_key} className='hover:bg-gray-50'>
                    <TableCell className='p-2 py-4'><Checkbox checked={selectedRows.includes(t.template_key)} onChange={() => toggleSelectRow(t.template_key)} /></TableCell>
                    <TableCell className='p-2 py-4'><span className='text-sm text-gray-900'>{t.template_key}</span></TableCell>
                    <TableCell className='p-2 py-4'><span className='text-sm text-gray-700'>{t.name}</span></TableCell>
                    <TableCell className='p-2 py-4'><span className='text-sm text-gray-600 break-words'>{t.subject}</span></TableCell>
                    <TableCell className='p-2 py-4'><span className='text-sm text-gray-600'>{t.locale || 'en'}</span></TableCell>
                    <TableCell className='p-2 py-4'>
                      <div className='flex items-center gap-3'>
                        <Badge color={t.is_active ? 'success' : 'error'} size='sm'>
                          <div className='flex items-center gap-2'>
                            {t.is_active ? <IoIosCheckmarkCircle className='text-lg' /> : <IoIosCloseCircle className='text-lg' />}
                            {t.is_active ? 'Active' : 'Inactive'}
                          </div>
                        </Badge>
                        <Switch label='' checked={!!t.is_active} onChange={() => toggleActive(t.template_key, t.is_active)} />
                      </div>
                    </TableCell>
                    <TableCell className='p-2 py-4'>
                      <div className='flex gap-3'>
                        <button onClick={() => handleEdit(t.template_key)} className='text-blue-600 hover:text-blue-800 p-2 rounded hover:bg-blue-50' title='Edit'><MdEdit size={20} /></button>
                        <button onClick={() => handleDelete(t.template_key)} className='text-red-600 hover:text-red-800 p-2 rounded hover:bg-red-50' title='Delete'><MdDelete size={20} /></button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {currentItems.length === 0 && (<div className='text-center py-8 text-gray-500'>{isLoadingData ? 'Loading templates...' : 'No templates found'}</div>)}
        </div>
      </div>

      <Pagination totalItems={filtered.length} itemsPerPage={itemsPerPage} onPageChange={setCurrentPage} onItemsPerPageChange={setItemsPerPage} />

      <DeleteDialog isOpen={isDeleteDialogOpen} onClose={() => setIsDeleteDialogOpen(false)} onConfirm={confirmDelete} itemLabel='template' description={selectedRows.length > 1 ? `Are you sure you want to delete ${selectedRows.length} selected templates?` : 'Are you sure you want to delete this template?'} />

      {isAddDialogOpen && (
        <NotificationTemplateForm templateKey={editKey} onCancel={handleFormClose} onSaved={handleFormSaved} />
      )}
    </div>
  );
}
