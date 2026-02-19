import { MdEdit, MdDelete } from 'react-icons/md';
import { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from '../../ui/table';
import Badge from '../../ui/badge/Badge';
import Checkbox from '../../form/input/Checkbox';
import PermissionForm from '../../../adminPages/Forms/PermissionForms/PermissionForm';
import Pagination from '../tableComponents/Pagination';
import useSort from '../../../hooks/useSort';
import SortableTableHeader from '../tableComponents/SortableTableHeader';
import { TableToolbar } from '../tableComponents/TableToolbar';
import DeleteDialog from '../tableComponents/DeleteDailog';
import { API_ENDPOINTS } from '../../../constants/api';

export interface Permission {
  id: string;
  name: string;
  action: string | null;
  resource: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export default function PermissionsTable() {
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editPermission, setEditPermission] = useState<Permission | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [permissionToDelete, setPermissionToDelete] = useState<string | null>(
    null,
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resourceFilter, setResourceFilter] = useState('');
  const [resources, setResources] = useState<string[]>([]);

  const columns = [
    {
      key: 'name',
      label: 'Name',
      className: 'min-w-[200px] text-gray-700 font-semibold max-w-[300px]',
    },
    {
      key: 'action',
      label: 'Action',
      className: 'min-w-[100px] text-gray-700 max-w-[150px]',
    },
    {
      key: 'resource',
      label: 'Resource',
      className: 'min-w-[120px] text-gray-700 max-w-[150px]',
    },
    {
      key: 'description',
      label: 'Description',
      className: 'min-w-[200px] text-gray-700 max-w-[400px]',
    },
  ] as const;

  // Fetch resources for filter dropdown
  const fetchResources = async () => {
    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch(API_ENDPOINTS.PERMISSIONS.RESOURCES, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      if (data.status === 'success') {
        setResources(data.data.resources);
      }
    } catch (err) {
      console.error('Error fetching resources:', err);
    }
  };

  // Fetch permissions from API
  const fetchPermissions = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = sessionStorage.getItem('token');
      let url = `${API_ENDPOINTS.PERMISSIONS.BASE}?page=${currentPage}&limit=${itemsPerPage}`;
      if (searchQuery) url += `&search=${searchQuery}`;
      if (resourceFilter) url += `&resource=${resourceFilter}`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      if (data.status === 'success') {
        setPermissions(data.data.permissions);
        setTotalItems(data.data.meta.total);
      } else {
        setError(data.message || 'Failed to fetch permissions');
      }
    } catch (err) {
      console.error('Error fetching permissions:', err);
      setError('Failed to fetch permissions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  useEffect(() => {
    fetchPermissions();
  }, [currentPage, itemsPerPage, searchQuery, resourceFilter]);

  const filteredData = permissions;

  const { sortedData, requestSort, sortConfig } = useSort(filteredData, {
    key: 'name',
    direction: 'asc',
  });

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  const toggleSelectRow = (id: string) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id],
    );
  };

  const toggleSelectAll = () => {
    setSelectedRows(
      selectedRows.length === permissions.length
        ? []
        : permissions.map((row) => row.id),
    );
  };

  const handleDelete = async () => {
    if (!permissionToDelete) return;

    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch(
        API_ENDPOINTS.PERMISSIONS.DETAIL(permissionToDelete),
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      if (response.ok) {
        fetchPermissions();
        fetchResources();
        setIsDeleteDialogOpen(false);
        setPermissionToDelete(null);
      }
    } catch (err) {
      console.error('Error deleting permission:', err);
    }
  };

  const handleBulkDelete = async () => {
    try {
      const token = sessionStorage.getItem('token');
      for (const id of selectedRows) {
        await fetch(API_ENDPOINTS.PERMISSIONS.DETAIL(id), {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      }
      fetchPermissions();
      fetchResources();
      setSelectedRows([]);
      setIsDeleteDialogOpen(false);
    } catch (err) {
      console.error('Error deleting permissions:', err);
    }
  };

  const handleFormSuccess = () => {
    setIsAddDialogOpen(false);
    setEditPermission(null);
    fetchPermissions();
    fetchResources();
  };

  return (
    <div className='overflow-hidden rounded-xl border border-gray-200 bg-white p-4'>
      <TableToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder='Search permissions...'
        onAddNew={() => setIsAddDialogOpen(true)}
        addButtonLabel='Add Permission'
        selectedRowsCount={selectedRows.length}
        onBulkActionChange={() => {}}
        onFilterChange={setResourceFilter}
        onApplyAction={() => {
          setPermissionToDelete(null);
          setIsDeleteDialogOpen(true);
        }}
      >
        {/* Resource Filter Dropdown */}
        <select
          value={resourceFilter}
          onChange={(e) => {
            setResourceFilter(e.target.value);
            setCurrentPage(1);
          }}
          className='px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white'
        >
          <option value=''>All Resources</option>
          {resources.map((resource) => (
            <option key={resource} value={resource}>
              {resource}
            </option>
          ))}
        </select>
      </TableToolbar>

      <div className='max-w-full overflow-x-auto'>
        <Table>
          <TableHeader className='border-b border-gray-100 dark:border-white/[0.05]'>
            <TableRow>
              <TableCell
                isHeader
                className='py-3 font-semibold text-start text-theme-xs text-gray-500'
              >
                <Checkbox
                  checked={
                    selectedRows.length === permissions.length &&
                    permissions.length > 0
                  }
                  onChange={toggleSelectAll}
                />
              </TableCell>
              {columns.map((column) => (
                <SortableTableHeader<Permission>
                  key={column.key}
                  columnKey={column.key}
                  label={column.label}
                  className={column.className}
                  sortConfig={sortConfig}
                  requestSort={requestSort}
                />
              ))}
              <TableCell
                isHeader
                className='py-3 font-semibold text-start text-theme-xs text-gray-500 min-w-[100px]'
              >
                Actions
              </TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className='divide-y divide-gray-100 dark:divide-white/[0.05]'>
            {loading ? (
              <TableRow>
                <TableCell
                  className='py-8 text-center text-gray-500'
                  colSpan={6}
                >
                  Loading...
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell
                  className='py-8 text-center text-red-500'
                  colSpan={6}
                >
                  {error}
                </TableCell>
              </TableRow>
            ) : sortedData.length === 0 ? (
              <TableRow>
                <TableCell
                  className='py-8 text-center text-gray-500'
                  colSpan={6}
                >
                  No permissions found
                </TableCell>
              </TableRow>
            ) : (
              sortedData.map((permission) => (
                <TableRow key={permission.id}>
                  <TableCell className='py-3 text-gray-500 text-theme-sm'>
                    <Checkbox
                      checked={selectedRows.includes(permission.id)}
                      onChange={() => toggleSelectRow(permission.id)}
                    />
                  </TableCell>
                  <TableCell className='py-3 text-gray-800 text-theme-sm font-medium'>
                    {permission.name}
                  </TableCell>
                  <TableCell className='py-3'>
                    {permission.action ? (
                      <Badge variant='light' color='info' size='sm'>
                        {permission.action}
                      </Badge>
                    ) : (
                      <span className='text-gray-400'>—</span>
                    )}
                  </TableCell>
                  <TableCell className='py-3'>
                    {permission.resource ? (
                      <Badge variant='light' color='primary' size='sm'>
                        {permission.resource}
                      </Badge>
                    ) : (
                      <span className='text-gray-400'>General</span>
                    )}
                  </TableCell>
                  <TableCell className='py-3 text-gray-600 text-theme-sm'>
                    {permission.description || (
                      <span className='text-gray-400'>—</span>
                    )}
                  </TableCell>
                  <TableCell className='py-3'>
                    <div className='flex items-center gap-2'>
                      <button
                        onClick={() => setEditPermission(permission)}
                        className='p-1.5 text-gray-500 hover:text-brand-500 hover:bg-gray-100 rounded-lg transition-colors'
                        title='Edit'
                      >
                        <MdEdit size={18} />
                      </button>
                      <button
                        onClick={() => {
                          setPermissionToDelete(permission.id);
                          setIsDeleteDialogOpen(true);
                        }}
                        className='p-1.5 text-gray-500 hover:text-red-500 hover:bg-gray-100 rounded-lg transition-colors'
                        title='Delete'
                      >
                        <MdDelete size={18} />
                      </button>
                    </div>
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
        onPageChange={handlePageChange}
        onItemsPerPageChange={handleItemsPerPageChange}
      />

      {/* Add/Edit Permission Form */}
      {(isAddDialogOpen || editPermission) && (
        <PermissionForm
          permission={editPermission}
          resources={resources}
          onSuccess={handleFormSuccess}
          onCancel={() => {
            setIsAddDialogOpen(false);
            setEditPermission(null);
          }}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setPermissionToDelete(null);
        }}
        onConfirm={permissionToDelete ? handleDelete : handleBulkDelete}
        multipleCount={permissionToDelete ? 1 : selectedRows.length}
        itemLabel='permission'
      />
    </div>
  );
}
