import { MdEdit, MdDelete, MdContentCopy, MdAdd } from 'react-icons/md';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from '../../ui/table';
import Badge from '../../ui/badge/Badge';
import Checkbox from '../../form/input/Checkbox';
import AppPageForm from '../../../pages/Forms/PageForm/AppPageForm';
import { AppPageFormData } from '../../../pages/Forms/PageForm/AppPageForm';
import Pagination from '../tableComponents/Pagination';
import useSort from '../../../hooks/useSort';
import SortableTableHeader from '../tableComponents/SortableTableHeader';
import { TableToolbar } from '../tableComponents/TableToolbar';
import Switch from '../../form/switch/Switch';
import { IoIosCloseCircle, IoIosCheckmarkCircle } from 'react-icons/io';
import DeleteDialog from '../tableComponents/DeleteDailog';

export interface AppPage {
  id: number;
  title: string;
  slug: string;
  content: string;
  status: 'Active' | 'Inactive';
}

// Mock data for app pages
const mockAppPages: AppPage[] = [
  {
    id: 1,
    title: 'Privacy Policy',
    slug: 'privacy-policy',
    content:
      '<h1>Privacy Policy</h1><p>This is our privacy policy content...</p>',
    status: 'Active',
  },
  {
    id: 2,
    title: 'Terms and Conditions',
    slug: 'terms-conditions',
    content: '<h1>Terms and Conditions</h1><p>This is our terms content...</p>',
    status: 'Active',
  },
];

export default function AppPageTable() {
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [actionDropdown, setActionDropdown] = useState<string>('No actions');
  const [statusUpdate, setStatusUpdate] = useState<string>('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editPage, setEditPage] = useState<AppPage | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [pages, setPages] = useState<AppPage[]>(mockAppPages);
  const [pageToDelete, setPageToDelete] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const columns = [
    {
      key: 'title',
      label: 'Title',
      className: 'min-w-[150px] text-gray-700 font-semibold max-w-[200px]',
    },
    {
      key: 'status',
      label: 'Status',
      className: 'min-w-[100px] max-w-[200px] text-gray-700 font-semibold',
    },
  ] as const;

  // Filtered data based on search and status
  const filteredData = pages
    .filter((page) =>
      page.title.toLowerCase().includes(searchQuery.toLowerCase()),
    )
    .filter((page) => (statusFilter ? page.status === statusFilter : true));

  const { sortedData, requestSort, sortConfig } = useSort(filteredData, {
    key: 'id',
    direction: 'asc',
  });

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedData.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  const toggleSelectRow = (id: number) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id],
    );
  };

  const toggleSelectAll = () => {
    setSelectedRows(
      selectedRows.length === pages.length ? [] : pages.map((row) => row.id),
    );
  };

  const handleApplyAction = () => {
    if (actionDropdown === 'Delete') {
      handleDelete();
    } else if (actionDropdown === 'Status' && statusUpdate) {
      const updatedPages = pages.map((page) =>
        selectedRows.includes(page.id)
          ? { ...page, status: statusUpdate as 'Active' | 'Inactive' }
          : page,
      );
      setPages(updatedPages);
      setSelectedRows([]);
    }
  };

  const handleDelete = (id?: number) => {
    if (id) {
      setPageToDelete(id);
    } else {
      setPageToDelete(null);
    }
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    let updatedPages: AppPage[];

    if (pageToDelete) {
      updatedPages = pages.filter((page) => page.id !== pageToDelete);
    } else {
      updatedPages = pages.filter((page) => !selectedRows.includes(page.id));
    }

    setPages(updatedPages);
    setIsDeleteDialogOpen(false);
    setSelectedRows([]);
    setPageToDelete(null);
  };

  const handleEdit = (page: AppPage) => {
    setEditPage(page);
  };

  const handleAddNew = () => {
    setIsAddDialogOpen(true);
  };

  const toggleStatus = (id: number) => {
    setPages((prev) =>
      prev.map((page) =>
        page.id === id
          ? {
              ...page,
              status: page.status === 'Active' ? 'Inactive' : 'Active',
            }
          : page,
      ),
    );
  };

  const confirmAddNew = (data: AppPageFormData) => {
    const newPage: AppPage = {
      id: pages.length + 1,
      title: data.title,
      slug: data.title.toLowerCase().replace(/\s+/g, '-'),
      content: data.content,
      status: data.status,
    };
    setPages([...pages, newPage]);
    setIsAddDialogOpen(false);
  };

  const confirmEdit = (data: AppPageFormData) => {
    const updatedPages = pages.map((page) =>
      page.id === editPage?.id
        ? {
            ...page,
            title: data.title,
            content: data.content,
            status: data.status,
          }
        : page,
    );
    setPages(updatedPages);
    setEditPage(null);
  };

  const copyUrlToClipboard = (slug: string) => {
    const url = `${window.location.origin}/app-pages/${slug}`;
    navigator.clipboard.writeText(url);
    // You might want to add a toast notification here
  };

  return (
    <div className='p-4 bg-white rounded-xl shadow-md'>
      {/* Header Section */}
      <TableToolbar
        onAddNew={handleAddNew}
        addButtonLabel='Add Page'
        addButtonIcon={<MdAdd className='w-5 h-5' />}
        selectedRowsCount={selectedRows.length}
        bulkActionsOptions={
          <>
            <option value='No actions'>No actions</option>
            <option value='Delete'>Delete</option>
            <option value='Status'>Status</option>
          </>
        }
        statusUpdateOptions={
          <>
            <option value=''>Select Status</option>
            <option value='Active'>Active</option>
            <option value='Inactive'>Inactive</option>
          </>
        }
        showStatusDropdown={actionDropdown === 'Status'}
        onBulkActionChange={setActionDropdown}
        onStatusUpdateChange={setStatusUpdate}
        onApplyAction={handleApplyAction}
        bulkActionValue={actionDropdown}
        statusUpdateValue={statusUpdate}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder='Search pages...'
        filterOptions={
          <>
            <option value=''>All Status</option>
            <option value='Active'>Active</option>
            <option value='Inactive'>Inactive</option>
          </>
        }
        onFilterChange={setStatusFilter}
        filterValue={statusFilter}
      />

      {/* Table */}
      <div className='w-full overflow-x-auto rounded-lg border border-gray-200'>
        <div className='min-w-[800px]'>
          <Table className='w-full'>
            <TableHeader className='bg-gray-50'>
              <TableRow>
                <TableCell className='w-10 p-2 py-3'>
                  <Checkbox
                    checked={selectedRows.length === pages.length}
                    onChange={toggleSelectAll}
                  />
                </TableCell>
                {columns.map((column) => (
                  <SortableTableHeader<AppPage>
                    key={column.key}
                    columnKey={column.key}
                    label={column.label}
                    sortConfig={sortConfig}
                    requestSort={requestSort}
                    className={`p-2 py-4 text-left text-sm text-gray-100 font-medium ${column.className}`}
                  />
                ))}
                <TableCell className='w-24 p-2 py-4 text-sm font-medium'>
                  Actions
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody>
              {currentItems.map((page) => (
                <TableRow key={page.id} className='hover:bg-gray-50'>
                  <TableCell className='p-2 py-4'>
                    <Checkbox
                      checked={selectedRows.includes(page.id)}
                      onChange={() => toggleSelectRow(page.id)}
                    />
                  </TableCell>
                  <TableCell className='p-2 py-4'>
                    <Link
                      to={`/app-pages/${page.slug}`}
                      className='text-blue-600 hover:text-blue-800 font-medium'
                    >
                      {page.title}
                    </Link>
                  </TableCell>
                  <TableCell className='p-2 py-4'>
                    <div className='flex items-center gap-3'>
                      <Badge
                        size='sm'
                        color={page.status === 'Active' ? 'success' : 'error'}
                      >
                        {page.status === 'Active' ? (
                          <IoIosCheckmarkCircle />
                        ) : (
                          <IoIosCloseCircle />
                        )}
                      </Badge>
                      <Switch
                        label=''
                        checked={page.status === 'Active'}
                        onChange={() => toggleStatus(page.id)}
                      />
                    </div>
                  </TableCell>
                  <TableCell className='p-2 py-4'>
                    <div className='flex gap-2'>
                      <button
                        onClick={() => copyUrlToClipboard(page.slug)}
                        className='text-gray-600 hover:text-gray-800 p-1 rounded hover:bg-gray-50'
                        title='Copy URL'
                      >
                        <MdContentCopy className='w-5 h-5' />
                      </button>
                      <button
                        onClick={() => handleEdit(page)}
                        className='text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50'
                      >
                        <MdEdit className='w-5 h-5' />
                      </button>
                      <button
                        onClick={() => handleDelete(page.id)}
                        className='text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50'
                      >
                        <MdDelete className='w-5 h-5' />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      <Pagination
        totalItems={filteredData.length}
        itemsPerPage={itemsPerPage}
        onPageChange={handlePageChange}
        onItemsPerPageChange={handleItemsPerPageChange}
      />

      {/* Add/Edit Dialog */}
      {isAddDialogOpen || editPage ? (
        <AppPageForm
          page={editPage}
          onSubmit={editPage ? confirmEdit : confirmAddNew}
          onCancel={() => {
            setIsAddDialogOpen(false);
            setEditPage(null);
          }}
        />
      ) : null}

      {/* Delete Dialog */}
      <DeleteDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        itemLabel='App Page'
        description={
          selectedRows.length > 1
            ? `Are you sure you want to delete ${selectedRows.length} selected pages?`
            : 'Are you sure you want to delete this page?'
        }
      />
    </div>
  );
}
