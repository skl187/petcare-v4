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
import RoleForm from '../../../pages/Forms/RoleForms/RoleForm';
import Pagination from '../tableComponents/Pagination';
import useSort from '../../../hooks/useSort';
import SortableTableHeader from '../tableComponents/SortableTableHeader';
import { TableToolbar } from '../tableComponents/TableToolbar';
import DeleteDialog from '../tableComponents/DeleteDailog';
import { API_ENDPOINTS } from '../../../constants/api';

export interface RoleUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  display_name: string;
}

export interface Role {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  permission_count: number;
  user_count: number;
  users: RoleUser[];
  created_at: string;
  updated_at: string;
}

export default function RolesTable() {
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editRole, setEditRole] = useState<Role | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [roles, setRoles] = useState<Role[]>([]);
  const [roleToDelete, setRoleToDelete] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const columns = [
    {
      key: 'slug',
      label: 'Name',
      className: 'min-w-[120px] text-gray-700 font-semibold max-w-[150px]',
    },
    {
      key: 'name',
      label: 'Label',
      className: 'min-w-[120px] text-gray-700 font-semibold max-w-[150px]',
    },
    {
      key: 'permission_count',
      label: 'Permissions',
      className: 'min-w-[100px] text-gray-700 max-w-[120px]',
    },
    {
      key: 'users',
      label: 'Users',
      className: 'min-w-[300px] text-gray-700 max-w-[500px]',
    },
  ] as const;

  // Fetch roles from API
  const fetchRoles = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch(
        `${API_ENDPOINTS.ROLES.BASE}?page=${currentPage}&limit=${itemsPerPage}&search=${searchQuery}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );
      const data = await response.json();
      if (data.status === 'success') {
        setRoles(data.data.roles);
        setTotalItems(data.data.meta.total);
      } else {
        setError(data.message || 'Failed to fetch roles');
      }
    } catch (err) {
      console.error('Error fetching roles:', err);
      setError('Failed to fetch roles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, [currentPage, itemsPerPage, searchQuery]);

  // Filtered data based on search (client-side additional filtering if needed)
  const filteredData = roles;

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
      selectedRows.length === roles.length ? [] : roles.map((row) => row.id),
    );
  };

  const handleDelete = async () => {
    if (!roleToDelete) return;

    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch(API_ENDPOINTS.ROLES.DETAIL(roleToDelete), {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        fetchRoles();
        setIsDeleteDialogOpen(false);
        setRoleToDelete(null);
      }
    } catch (err) {
      console.error('Error deleting role:', err);
    }
  };

  const handleBulkDelete = async () => {
    try {
      const token = sessionStorage.getItem('token');
      for (const id of selectedRows) {
        await fetch(API_ENDPOINTS.ROLES.DETAIL(id), {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      }
      fetchRoles();
      setSelectedRows([]);
      setIsDeleteDialogOpen(false);
    } catch (err) {
      console.error('Error deleting roles:', err);
    }
  };

  const handleFormSuccess = () => {
    setIsAddDialogOpen(false);
    setEditRole(null);
    fetchRoles();
  };

  return (
    <div className='overflow-hidden rounded-xl border border-gray-200 bg-white p-4'>
      <TableToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder='Search roles...'
        onAddNew={() => setIsAddDialogOpen(true)}
        addButtonLabel='Add Role'
        selectedRowsCount={selectedRows.length}
        onBulkActionChange={() => {}}
        onFilterChange={() => {}}
        onApplyAction={() => {
          setRoleToDelete(null);
          setIsDeleteDialogOpen(true);
        }}
      />

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
                    selectedRows.length === roles.length && roles.length > 0
                  }
                  onChange={toggleSelectAll}
                />
              </TableCell>
              {columns.map((column) => (
                <SortableTableHeader<Role>
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
                  No roles found
                </TableCell>
              </TableRow>
            ) : (
              sortedData.map((role) => (
                <TableRow key={role.id}>
                  <TableCell className='py-3 text-gray-500 text-theme-sm'>
                    <Checkbox
                      checked={selectedRows.includes(role.id)}
                      onChange={() => toggleSelectRow(role.id)}
                    />
                  </TableCell>
                  <TableCell className='py-3 text-gray-800 text-theme-sm font-medium'>
                    {role.slug}
                  </TableCell>
                  <TableCell className='py-3 text-gray-800 text-theme-sm'>
                    {role.name}
                  </TableCell>
                  <TableCell className='py-3'>
                    <Badge variant='light' color='success' size='sm'>
                      {role.permission_count}
                    </Badge>
                  </TableCell>
                  <TableCell className='py-3'>
                    <div className='flex flex-wrap gap-1'>
                      {role.users.length === 0 ? (
                        <span className='text-gray-400 text-sm'>No users</span>
                      ) : (
                        <>
                          {role.users.slice(0, 5).map((user) => (
                            <Badge
                              key={user.id}
                              variant='light'
                              color='primary'
                              size='sm'
                            >
                              {user.display_name}
                            </Badge>
                          ))}
                          {role.users.length > 5 && (
                            <Badge variant='light' color='warning' size='sm'>
                              +{role.users.length - 5} more
                            </Badge>
                          )}
                        </>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className='py-3'>
                    <div className='flex items-center gap-2'>
                      <button
                        onClick={() => setEditRole(role)}
                        className='p-1.5 text-gray-500 hover:text-brand-500 hover:bg-gray-100 rounded-lg transition-colors'
                        title='Edit'
                      >
                        <MdEdit size={18} />
                      </button>
                      <button
                        onClick={() => {
                          setRoleToDelete(role.id);
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

      {/* Add/Edit Role Form */}
      {(isAddDialogOpen || editRole) && (
        <RoleForm
          role={editRole}
          onSuccess={handleFormSuccess}
          onCancel={() => {
            setIsAddDialogOpen(false);
            setEditRole(null);
          }}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setRoleToDelete(null);
        }}
        onConfirm={roleToDelete ? handleDelete : handleBulkDelete}
        multipleCount={roleToDelete ? 1 : selectedRows.length}
        itemLabel='role'
      />
    </div>
  );
}
