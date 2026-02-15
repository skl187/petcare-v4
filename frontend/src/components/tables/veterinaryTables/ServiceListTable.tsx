import { MdEdit, MdDelete, MdAdd } from 'react-icons/md';
import { useState, useEffect, useCallback } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from '../../ui/table';
import Badge from '../../ui/badge/Badge';
import Checkbox from '../../form/input/Checkbox';
import ServiceListForm from '../../../pages/VetPageForms/ServiceListForm/ServiceListForm';
import Pagination from '../tableComponents/Pagination';
import { IoIosCloseCircle, IoIosCheckmarkCircle } from 'react-icons/io';
import Switch from '../../form/switch/Switch';
import { API_ENDPOINTS } from '../../../constants/api';

const API_BASE = API_ENDPOINTS.VET_SERVICES.BASE;

export interface VetService {
  id: string;
  code: string;
  name: string;
  slug: string;
  default_duration_minutes: number;
  default_fee: number;
  status: number;
}

const ServiceListTable = () => {
  // State
  const [services, setServices] = useState<VetService[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 0 | 1>('all');
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editService, setEditService] = useState<VetService | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<VetService | null>(
    null,
  );
  const [fetchError, setFetchError] = useState('');
  const [successBanner, setSuccessBanner] = useState('');

  // Get auth token
  const getAuthToken = () => sessionStorage.getItem('token') || '';

  // Fetch Services
  const fetchServices = useCallback(async () => {
    setIsLoadingData(true);
    setFetchError('');
    try {
      const response = await fetch(API_BASE, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok)
        throw new Error(`Failed to fetch services: ${response.status}`);
      const result = await response.json();
      const list = Array.isArray(result.data?.data)
        ? result.data.data
        : Array.isArray(result.data)
          ? result.data
          : [];

      const items: VetService[] = list.map((it: any) => ({
        id: String(it.id),
        code: it.code ?? '',
        name: it.name ?? '',
        slug: it.slug ?? '',
        default_duration_minutes: Number(it.default_duration_minutes) || 0,
        default_fee: Number(it.default_fee) || 0,
        status: Number(it.status) ?? 1,
      }));

      setServices(items);
    } catch (error: any) {
      console.error('Error fetching services:', error);
      setFetchError(error.message || 'Failed to load services');
    } finally {
      setIsLoadingData(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  // Filter and Sort
  const filtered = services.filter((s) => {
    const matchesSearch =
      s.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const sorted = [...filtered];

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const paginatedServices = sorted.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  // Handle Edit
  const handleEdit = (service: VetService) => {
    setEditService(service);
    setShowForm(true);
  };

  // Bulk Delete
  const confirmDelete = async () => {
    if (!serviceToDelete && selectedRows.length === 0) return;
    try {
      if (selectedRows.length > 0) {
        // Bulk delete
        for (const id of selectedRows) {
          await fetch(`${API_BASE}/${id}`, {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${getAuthToken()}`,
              'Content-Type': 'application/json',
            },
          });
        }
        setServices((prev) => prev.filter((s) => !selectedRows.includes(s.id)));
        setSelectedRows([]);
      } else if (serviceToDelete) {
        // Single delete
        const response = await fetch(`${API_BASE}/${serviceToDelete.id}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
            'Content-Type': 'application/json',
          },
        });
        if (!response.ok)
          throw new Error(`Failed to delete: ${response.status}`);
        setServices((prev) => prev.filter((s) => s.id !== serviceToDelete.id));
      }
      setSuccessBanner('Service(s) deleted successfully');
      setTimeout(() => setSuccessBanner(''), 5000);
    } catch (error: any) {
      setFetchError(error.message || 'Failed to delete');
    } finally {
      setShowDeleteDialog(false);
      setServiceToDelete(null);
    }
  };

  // Toggle Row Select
  const toggleRowSelect = (id: string) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  // Toggle Select All
  const toggleSelectAll = () => {
    if (selectedRows.length === paginatedServices.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(paginatedServices.map((s) => s.id));
    }
  };

  // Handle Form Submit
  const handleFormSubmit = async () => {
    await fetchServices();
  };

  const handleAddNew = () => {
    setShowForm(true);
    setEditService(null);
  };

  // Handle Bulk Status Update
  const handleBulkStatusUpdate = async (newStatus: 0 | 1) => {
    try {
      for (const id of selectedRows) {
        const response = await fetch(`${API_BASE}/${id}`, {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: newStatus }),
        });
        if (!response.ok)
          throw new Error(`Failed to update service: ${response.status}`);
      }
      setServices((prev) =>
        prev.map((s) =>
          selectedRows.includes(s.id) ? { ...s, status: newStatus } : s,
        ),
      );
      setSelectedRows([]);
      setSuccessBanner(
        `${selectedRows.length} service(s) status updated successfully`,
      );
      setTimeout(() => setSuccessBanner(''), 4000);
    } catch (error: any) {
      setFetchError(error.message || 'Failed to update service status');
    }
  };

  // Toggle Status (inline)
  const handleToggleStatus = async (id: string) => {
    const service = services.find((s) => s.id === id);
    if (!service) return;

    const newStatus = service.status === 1 ? 0 : 1;

    // Optimistic update
    setServices((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: newStatus } : s)),
    );

    try {
      const response = await fetch(`${API_BASE}/${id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!response.ok) throw new Error(`Failed to update: ${response.status}`);
      setSuccessBanner(
        `Status updated to ${newStatus === 1 ? 'Active' : 'Inactive'}`,
      );
      setTimeout(() => setSuccessBanner(''), 4000);
    } catch (error: any) {
      setFetchError(error.message || 'Failed to update status');
      // Revert optimistic update
      await fetchServices();
    }
  };

  return (
    <div className='p-4 bg-white rounded-xl shadow-md'>
      {/* Toolbar */}
      <div className='flex items-center gap-3 mb-4 flex-wrap'>
        <button
          onClick={handleAddNew}
          className='px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-sm flex items-center gap-2'
        >
          <MdAdd size={18} />
          Add Service
        </button>
        <div className='flex-1 min-w-[250px]'>
          <input
            type='text'
            placeholder='Search services by code or name...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className='w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className='px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
        >
          <option value='all'>All Status</option>
          <option value={1}>Active</option>
          <option value={0}>Inactive</option>
        </select>
      </div>

      {/* Bulk Actions */}
      {selectedRows.length > 0 && (
        <div className='mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-3'>
          <span className='text-sm font-medium text-blue-900'>
            {selectedRows.length} service(s) selected
          </span>
          <div className='flex gap-2'>
            <button
              onClick={() => handleBulkStatusUpdate(1)}
              className='px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700'
            >
              Mark Active
            </button>
            <button
              onClick={() => handleBulkStatusUpdate(0)}
              className='px-3 py-1 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700'
            >
              Mark Inactive
            </button>
            <button
              onClick={() => {
                setServiceToDelete(null);
                setShowDeleteDialog(true);
              }}
              className='px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700'
            >
              Delete
            </button>
          </div>
        </div>
      )}

      {/* Error Banner */}
      {fetchError && (
        <div className='mt-3 mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200'>
          <div className='flex items-start gap-3'>
            <div className='flex-shrink-0 pt-0.5'>
              <IoIosCloseCircle className='w-5 h-5 text-red-600' />
            </div>
            <div className='flex-1'>
              <p className='text-red-700 text-sm font-medium'>{fetchError}</p>
              <div className='flex gap-2 mt-2'>
                <button
                  onClick={() => fetchServices()}
                  className='text-sm font-medium text-red-700 hover:text-red-800 underline'
                >
                  Retry
                </button>
                <button
                  onClick={() => setFetchError('')}
                  className='text-sm font-medium text-red-700 hover:text-red-800 underline'
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Banner */}
      {successBanner && (
        <div className='mt-3 mb-4 px-4 py-3 rounded-lg bg-green-50 border border-green-200'>
          <div className='flex items-start gap-3'>
            <div className='flex-shrink-0 pt-0.5'>
              <IoIosCheckmarkCircle className='w-5 h-5 text-green-600' />
            </div>
            <div className='flex-1'>
              <p className='text-green-700 text-sm font-medium'>
                {successBanner}
              </p>
            </div>
            <button
              onClick={() => setSuccessBanner('')}
              className='flex-shrink-0 text-green-700 hover:text-green-800'
            >
              <svg className='w-5 h-5' viewBox='0 0 20 20' fill='currentColor'>
                <path
                  fillRule='evenodd'
                  d='M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z'
                  clipRule='evenodd'
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className='w-full overflow-x-auto rounded-lg border border-gray-200'>
        <div className='min-w-[900px]'>
          <Table className='w-full'>
            <TableHeader className='bg-gray-50'>
              <TableRow>
                <TableCell className='w-10 p-2 py-3'>
                  <Checkbox
                    checked={
                      selectedRows.length === paginatedServices.length &&
                      paginatedServices.length > 0
                    }
                    onChange={toggleSelectAll}
                  />
                </TableCell>
                <TableCell className='p-2 py-3 text-left text-sm text-gray-700 font-medium min-w-[100px]'>
                  Code
                </TableCell>
                <TableCell className='p-2 py-3 text-left text-sm text-gray-700 font-medium min-w-[150px]'>
                  Service Name
                </TableCell>
                <TableCell className='p-2 py-3 text-left text-sm text-gray-700 font-medium min-w-[140px]'>
                  Duration (min)
                </TableCell>
                <TableCell className='p-2 py-3 text-left text-sm text-gray-700 font-medium min-w-[100px]'>
                  Fee
                </TableCell>
                <TableCell className='p-2 py-3 text-left text-sm text-gray-700 font-medium min-w-[120px]'>
                  Status
                </TableCell>
                <TableCell className='p-2 py-3 text-right text-sm font-medium min-w-[100px]'>
                  Actions
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody>
              {isLoadingData ? (
                <TableRow>
                  <td className='p-4 text-center' colSpan={9}>
                    Loading services...
                  </td>
                </TableRow>
              ) : paginatedServices.length === 0 ? (
                <TableRow>
                  <td className='p-4 text-center' colSpan={9}>
                    No services found.
                  </td>
                </TableRow>
              ) : (
                paginatedServices.map((service) => (
                  <TableRow key={service.id} className='hover:bg-gray-50'>
                    <TableCell className='p-2 py-4'>
                      <Checkbox
                        checked={selectedRows.includes(service.id)}
                        onChange={() => toggleRowSelect(service.id)}
                      />
                    </TableCell>
                    <TableCell className='p-2 py-4 text-sm text-gray-900 font-medium'>
                      {service.code}
                    </TableCell>
                    <TableCell className='p-2 py-4 text-sm text-gray-900 font-medium'>
                      {service.name}
                    </TableCell>
                    <TableCell className='p-2 py-4 text-sm text-gray-700'>
                      {service.default_duration_minutes}
                    </TableCell>
                    <TableCell className='p-2 py-4 text-sm text-gray-700'>
                      ${service.default_fee.toFixed(2)}
                    </TableCell>
                    <TableCell className='p-2 py-4'>
                      <div className='flex items-center gap-3'>
                        <Badge
                          size='sm'
                          color={service.status === 1 ? 'success' : 'error'}
                        >
                          {service.status === 1 ? (
                            <IoIosCheckmarkCircle />
                          ) : (
                            <IoIosCloseCircle />
                          )}
                        </Badge>
                        <Switch
                          label=''
                          checked={service.status === 1}
                          onChange={() => handleToggleStatus(service.id)}
                        />
                      </div>
                    </TableCell>
                    <TableCell className='p-2 py-4'>
                      <div className='flex gap-2 justify-end'>
                        <button
                          onClick={() => handleEdit(service)}
                          className='text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50'
                          title='Edit'
                        >
                          <MdEdit className='w-5 h-5' />
                        </button>
                        <button
                          onClick={() => {
                            setServiceToDelete(service);
                            setShowDeleteDialog(true);
                          }}
                          className='text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50'
                          title='Delete'
                        >
                          <MdDelete className='w-5 h-5' />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      <Pagination
        totalItems={sorted.length}
        itemsPerPage={itemsPerPage}
        onPageChange={handlePageChange}
        onItemsPerPageChange={handleItemsPerPageChange}
      />

      {/* Form Modal */}
      {showForm && (
        <ServiceListForm
          service={editService}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditService(null);
          }}
        />
      )}

      {/* Delete Dialog */}
      {showDeleteDialog && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'>
          <div className='bg-white rounded-lg p-6 max-w-sm w-full mx-4 shadow-lg'>
            <h3 className='text-lg font-semibold text-gray-900 mb-2'>
              {selectedRows.length > 0
                ? `Delete ${selectedRows.length} service(s)?`
                : 'Delete service?'}
            </h3>
            <p className='text-gray-600 text-sm mb-6'>
              This action cannot be undone.
            </p>
            <div className='flex justify-end gap-3'>
              <button
                onClick={() => {
                  setShowDeleteDialog(false);
                  setServiceToDelete(null);
                }}
                className='px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium'
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className='px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium'
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceListTable;
