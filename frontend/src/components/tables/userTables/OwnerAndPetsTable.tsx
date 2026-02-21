import { MdEdit, MdPets } from 'react-icons/md';
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
import OwnerAndPetsForm from '../../../adminPages/Forms/UserForms/OwnerAndPetsForm';
import { OwnerAndPetsFormData } from '../../../adminPages/Forms/UserForms/OwnerAndPetsForm';
import Pagination from '../tableComponents/Pagination';
import useSort from '../../../hooks/useSort';
import SortableTableHeader from '../tableComponents/SortableTableHeader';
import ImageHoverPreview from '../tableComponents/ImageHoverPreview';
import { TableToolbar } from '../tableComponents/TableToolbar';
import Switch from '../../form/switch/Switch';
import { IoIosCloseCircle, IoIosCheckmarkCircle } from 'react-icons/io';
import { API_ENDPOINTS } from '../../../constants/api';

export interface OwnerAndPet {
  id: string;
  first_name: string;
  last_name: string;
  display_name?: string;
  email: string;
  profile_image_url?: string;
  phone?: string;
  pets_count?: string;
  created_at: string;
  updated_at?: string;
  gender?: 'male' | 'female' | 'other' | string;
  status: 'active' | 'inactive' | 'pending' | 'suspended';
}

export default function OwnerAndPetsTable() {
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [actionDropdown, setActionDropdown] = useState<string>('No actions');
  const [statusUpdate, setStatusUpdate] = useState<string>('');
  const [editOwner, setEditOwner] = useState<OwnerAndPet | null>(null);
  const [owners, setOwners] = useState<OwnerAndPet[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [totalItems, setTotalItems] = useState(0);

  // Fetch owners from API with pagination
  useEffect(() => {
    fetchOwners();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, itemsPerPage]);

  // Reset to page 1 and fetch when search or filter changes
  useEffect(() => {
    if (currentPage === 1) {
      fetchOwners();
    } else {
      setCurrentPage(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, statusFilter]);

  const fetchOwners = async () => {
    try {
      setLoading(true);
      const token = sessionStorage.getItem('token');

      const params = new URLSearchParams({
        include: 'pets_count',
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
      });

      if (searchQuery) params.append('search', searchQuery);
      if (statusFilter) params.append('status', statusFilter.toLowerCase());

      const response = await fetch(`${API_ENDPOINTS.USERS.BASE}?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch owners');
      }

      const result = await response.json();
      const apiData = result.data || result;
      setOwners(apiData.data || []);
      setTotalItems(apiData.pagination?.total || 0);
    } catch (error) {
      console.error('Error fetching owners:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      key: 'first_name' as keyof OwnerAndPet,
      label: 'Name',
      className: 'min-w-[200px] text-gray-700 font-semibold max-w-[250px]',
    },
    {
      key: 'phone' as keyof OwnerAndPet,
      label: 'Contact Number',
      className: 'min-w-[120px] text-gray-700 max-w-[180px]',
    },
    {
      key: 'pets_count' as keyof OwnerAndPet,
      label: 'Pet Count',
      className: 'min-w-[100px] text-gray-700 max-w-[150px]',
    },
    {
      key: 'created_at' as keyof OwnerAndPet,
      label: 'Created At',
      className: 'min-w-[150px] text-gray-700 max-w-[200px]',
    },
    {
      key: 'gender' as keyof OwnerAndPet,
      label: 'Gender',
      className: 'min-w-[100px] text-gray-700 max-w-[150px]',
    },
    {
      key: 'status' as keyof OwnerAndPet,
      label: 'Status',
      className: 'min-w-[100px] max-w-[150px] text-gray-700 font-semibold',
    },
  ] as const;

  const { sortedData, requestSort, sortConfig } = useSort(owners, {
    key: 'id',
    direction: 'asc',
  });

  const currentItems = sortedData;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
      selectedRows.length === owners.length ? [] : owners.map((row) => row.id),
    );
  };

  const handleApplyAction = () => {
    if (actionDropdown === 'Status' && statusUpdate) {
      // Update status via API
      updateStatusBulk();
    }
  };

  const updateStatusBulk = async () => {
    try {
      // TODO: Call API to update status for selected rows
      // const token = sessionStorage.getItem('token');
      // Refresh data after update
      await fetchOwners();
      setSelectedRows([]);
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleEdit = (owner: OwnerAndPet) => {
    setEditOwner(owner);
  };

  const toggleStatus = async (id: string) => {
    try {
      const token = sessionStorage.getItem('token');
      const owner = owners.find((o) => o.id === id);
      if (!owner) return;

      const newStatus = owner.status === 'active' ? 'inactive' : 'active';

      // Use dedicated activate endpoint for activation
      if (newStatus === 'active') {
        const response = await fetch(`${API_ENDPOINTS.USERS.BASE}/${id}/activate`, {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          await fetchOwners();
        }
      } else {
        // Use PUT for deactivation
        const response = await fetch(`${API_ENDPOINTS.USERS.BASE}/${id}/activate`, {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: newStatus }),
        });

        if (response.ok) {
          await fetchOwners();
        }
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const confirmEdit = async (data: OwnerAndPetsFormData) => {
    try {
      const token = sessionStorage.getItem('token');

      const updateData = {
        first_name: data.name.split(' ')[0] || data.name,
        last_name: data.name.split(' ').slice(1).join(' ') || '',
        email: data.email,
        phone: data.contactNumber,
        gender: data.gender.toLowerCase(),
        status: data.status.toLowerCase(),
      };

      const response = await fetch(
        `${API_ENDPOINTS.USERS.BASE}/${editOwner?.id}`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updateData),
        },
      );

      if (response.ok) {
        await fetchOwners();
        setEditOwner(null);
      }
    } catch (error) {
      console.error('Error updating owner:', error);
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

  const getDisplayName = (owner: OwnerAndPet) => {
    if (owner.display_name) return owner.display_name;
    return `${owner.first_name} ${owner.last_name}`.trim();
  };

  const capitalizeFirst = (str?: string) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  return (
    <div className='bg-white rounded-xl shadow-md'>
      {loading && <div className='text-center py-4'>Loading...</div>}

      {/* Header Section */}
      <TableToolbar
        showAddButton={false}
        selectedRowsCount={selectedRows.length}
        bulkActionsOptions={
          <>
            <option value='No actions'>No actions</option>
            <option value='Status'>Status</option>
          </>
        }
        statusUpdateOptions={
          <>
            <option value=''>Select Status</option>
            <option value='active'>Active</option>
            <option value='inactive'>Inactive</option>
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
        filterOptions={
          <>
            <option value=''>All Status</option>
            <option value='active'>Active</option>
            <option value='inactive'>Inactive</option>
          </>
        }
        onFilterChange={setStatusFilter}
        filterValue={statusFilter}
      />

      {/* Table */}
      <div className='w-full overflow-x-auto rounded-lg border border-gray-200'>
        <div className='min-w-[1100px]'>
          <Table className='w-full'>
            <TableHeader className='bg-gray-50'>
              <TableRow>
                <TableCell className='w-10 p-2 py-3'>
                  <Checkbox
                    checked={selectedRows.length === owners.length}
                    onChange={toggleSelectAll}
                  />
                </TableCell>
                {columns.map((column) => (
                  <SortableTableHeader<OwnerAndPet>
                    key={column.key}
                    columnKey={column.key}
                    label={column.label}
                    sortConfig={sortConfig}
                    requestSort={requestSort}
                    className={`p-2 py-4 text-left text-sm text-gray-100 font-medium ${column.className}`}
                  />
                ))}
                <TableCell className='w-32 p-2 py-4 text-sm font-medium'>
                  Actions
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody>
              {currentItems.map((owner) => (
                <TableRow key={owner.id} className='hover:bg-gray-50'>
                  <TableCell className='p-2 py-4'>
                    <Checkbox
                      checked={selectedRows.includes(owner.id)}
                      onChange={() => toggleSelectRow(owner.id)}
                    />
                  </TableCell>
                  <TableCell className='p-2 py-4'>
                    <div className='flex items-center gap-3'>
                      {owner.profile_image_url ? (
                        <ImageHoverPreview
                          src={owner.profile_image_url}
                          alt={getDisplayName(owner)}
                          className='w-8 h-8 rounded-full object-cover'
                        />
                      ) : (
                        <div className='w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-xs font-medium'>
                          {owner.first_name?.charAt(0)}
                          {owner.last_name?.charAt(0)}
                        </div>
                      )}
                      <div>
                        <div className='text-sm font-medium text-gray-900'>
                          {getDisplayName(owner)}
                        </div>
                        <div className='text-xs text-gray-500'>
                          {owner.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className='p-2 py-4 text-sm text-gray-500'>
                    {owner.phone || 'N/A'}
                  </TableCell>
                  <TableCell className='p-2 py-4'>
                    <div className='flex items-center gap-2'>
                      <span className='px-2 py-1 bg-gray-100 rounded'>
                        {owner.pets_count || '0'}
                      </span>
                      <MdPets className='text-gray-400' />
                    </div>
                  </TableCell>
                  <TableCell className='p-2 py-4 text-sm text-gray-500'>
                    {formatDate(owner.created_at)}
                  </TableCell>
                  <TableCell className='p-2 py-4'>
                    <Badge size='sm' color='success'>
                      {owner.gender ? capitalizeFirst(owner.gender) : 'N/A'}
                    </Badge>
                  </TableCell>
                  <TableCell className='p-2 py-4'>
                    <div className='flex items-center gap-3'>
                      <Badge
                        size='sm'
                        color={owner.status === 'active' ? 'success' : 'error'}
                      >
                        {owner.status === 'active' ? (
                          <IoIosCheckmarkCircle />
                        ) : (
                          <IoIosCloseCircle />
                        )}
                      </Badge>
                      <Switch
                        label=''
                        checked={owner.status === 'active'}
                        onChange={() => toggleStatus(owner.id)}
                      />
                    </div>
                  </TableCell>
                  <TableCell className='p-2 py-4'>
                    <div className='flex gap-2'>
                      <button
                        onClick={() => handleEdit(owner)}
                        className='text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50'
                        title='Edit'
                      >
                        <MdEdit className='w-5 h-5' />
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
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        onPageChange={handlePageChange}
        onItemsPerPageChange={handleItemsPerPageChange}
      />

      {/* Edit Dialog */}
      {editOwner ? (
        <OwnerAndPetsForm
          owner={{
            id: parseInt(editOwner.id) || 0,
            name: getDisplayName(editOwner),
            email: editOwner.email,
            image: editOwner.profile_image_url || '',
            contactNumber: editOwner.phone || '',
            petCount: parseInt(editOwner.pets_count || '0'),
            updatedAt: editOwner.updated_at || editOwner.created_at,
            gender: editOwner.gender
              ? (capitalizeFirst(editOwner.gender) as
                  | 'Male'
                  | 'Female'
                  | 'Other')
              : 'Male',
            status: capitalizeFirst(editOwner.status) as 'Active' | 'Inactive',
          }}
          onSubmit={confirmEdit}
          onCancel={() => {
            setEditOwner(null);
          }}
        />
      ) : null}
    </div>
  );
}
