import {
  MdEdit,
  MdDelete,
  MdLock,
  MdNotifications,
  MdAdd,
} from 'react-icons/md';
import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from '../../ui/table';
import Badge from '../../ui/badge/Badge';
import Checkbox from '../../form/input/Checkbox';
import EmpReqListForm from '../../../pages/Forms/UserForms/EmpReqListForm';
import { EmpReqListFormData } from '../../../pages/Forms/UserForms/EmpReqListForm';
import Pagination from '../tableComponents/Pagination';
import ChangePasswordForm from '../../../pages/Forms/VetForms/vetformComponents/ChangePasswordForm';
import { ChangePasswordFormData } from '../../../pages/Forms/VetForms/vetformComponents/ChangePasswordForm';
import { PushNotificationFormData } from '../../../pages/Forms/VetForms/vetformComponents/PushNotificationForm';
import PushNotificationForm from '../../../pages/Forms/VetForms/vetformComponents/PushNotificationForm';
import useSort from '../../../hooks/useSort';
import SortableTableHeader from '../tableComponents/SortableTableHeader';
import { TableToolbar } from '../tableComponents/TableToolbar';
import Switch from '../../form/switch/Switch';
import { IoIosCloseCircle, IoIosCheckmarkCircle } from 'react-icons/io';
import ImageHoverPreview from '../tableComponents/ImageHoverPreview';
import DeleteDialog from '../tableComponents/DeleteDailog';

export interface EmpReq {
  id: number;
  name: string;
  email: string;
  image: string;
  contactNumber: string;
  verificationStatus: 'Verified' | 'Pending' | 'Rejected';
  blocked: boolean;
  status: 'Active' | 'Inactive';
  requestDate: string;
}

// Mock data for employee requests
const mockEmpReqs: EmpReq[] = Array.from({ length: 50 }, (_, i) => ({
  id: i + 1,
  name: `Employee ${i + 1}`,
  email: `employee${i + 1}@example.com`,
  image: `/images/employees/employee-${(i % 5) + 1}.jpg`,
  contactNumber: `+1${Math.floor(1000000000 + Math.random() * 9000000000)}`,
  verificationStatus: ['Verified', 'Pending', 'Rejected'][i % 3] as
    | 'Verified'
    | 'Pending'
    | 'Rejected',
  blocked: i % 4 === 0,
  status: i % 3 !== 0 ? 'Active' : 'Inactive',
  requestDate: new Date(
    Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000,
  ).toISOString(),
}));

export default function EmpReqListTable() {
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isPushNotificationDialogOpen, setIsPushNotificationDialogOpen] =
    useState(false);
  const [isChangePasswordDialogOpen, setIsChangePasswordDialogOpen] =
    useState(false);
  const [actionDropdown, setActionDropdown] = useState<string>('No actions');
  const [statusUpdate, setStatusUpdate] = useState<string>('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editEmpReq, setEditEmpReq] = useState<EmpReq | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [empReqs, setEmpReqs] = useState<EmpReq[]>(mockEmpReqs);
  const [empReqToDelete, setEmpReqToDelete] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const columns = [
    {
      key: 'name',
      label: 'Name',
      className: 'min-w-[200px] text-gray-700 font-semibold max-w-[250px]',
    },
    {
      key: 'contactNumber',
      label: 'Contact Number',
      className: 'min-w-[120px] text-gray-700 max-w-[180px]',
    },
    {
      key: 'verificationStatus',
      label: 'Verification',
      className: 'min-w-[120px] text-gray-700 max-w-[180px]',
    },
    {
      key: 'blocked',
      label: 'Blocked',
      className: 'min-w-[100px] max-w-[150px] text-gray-700 font-semibold',
    },
    {
      key: 'status',
      label: 'Status',
      className: 'min-w-[100px] max-w-[150px] text-gray-700 font-semibold',
    },
    {
      key: 'requestDate',
      label: 'Request Date',
      className: 'min-w-[120px] text-gray-700 max-w-[180px]',
    },
  ] as const;

  // Filtered data based on search and filters
  const filteredData = empReqs
    .filter(
      (empReq) =>
        empReq.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        empReq.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        empReq.contactNumber.includes(searchQuery),
    )
    .filter((empReq) => (statusFilter ? empReq.status === statusFilter : true));

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
      selectedRows.length === empReqs.length
        ? []
        : empReqs.map((row) => row.id),
    );
  };

  const handleApplyAction = () => {
    if (actionDropdown === 'Delete') {
      handleDelete();
    } else if (actionDropdown === 'Status' && statusUpdate) {
      const updatedEmpReqs = empReqs.map((empReq) =>
        selectedRows.includes(empReq.id)
          ? { ...empReq, status: statusUpdate as 'Active' | 'Inactive' }
          : empReq,
      );
      setEmpReqs(updatedEmpReqs);
      setSelectedRows([]);
    }
  };

  const handleDelete = (id?: number) => {
    if (id) {
      setEmpReqToDelete(id);
    } else {
      setEmpReqToDelete(null);
    }
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    let updatedEmpReqs: EmpReq[];

    if (empReqToDelete) {
      updatedEmpReqs = empReqs.filter((empReq) => empReq.id !== empReqToDelete);
    } else {
      updatedEmpReqs = empReqs.filter(
        (empReq) => !selectedRows.includes(empReq.id),
      );
    }

    setEmpReqs(updatedEmpReqs);
    setIsDeleteDialogOpen(false);
    setSelectedRows([]);
    setEmpReqToDelete(null);
  };

  const handleEdit = (empReq: EmpReq) => {
    setEditEmpReq(empReq);
  };

  const handleAddNew = () => {
    setIsAddDialogOpen(true);
  };

  const toggleBlocked = (id: number) => {
    setEmpReqs((prev) =>
      prev.map((empReq) =>
        empReq.id === id ? { ...empReq, blocked: !empReq.blocked } : empReq,
      ),
    );
  };

  const toggleStatus = (id: number) => {
    setEmpReqs((prev) =>
      prev.map((empReq) =>
        empReq.id === id
          ? {
              ...empReq,
              status: empReq.status === 'Active' ? 'Inactive' : 'Active',
            }
          : empReq,
      ),
    );
  };

  const handlePushNotification = () => {
    setIsPushNotificationDialogOpen(true);
  };

  const handleChangePassword = () => {
    setIsChangePasswordDialogOpen(true);
  };

  const handlePushNotificationSubmit = (data: PushNotificationFormData) => {
    console.log('Push Notification Sent:', data);
    setIsPushNotificationDialogOpen(false);
  };

  const handleChangePasswordSubmit = (data: ChangePasswordFormData) => {
    console.log('Password Changed:', data);
    setIsChangePasswordDialogOpen(false);
  };

  const confirmAddNew = (data: EmpReqListFormData) => {
    const newEmpReq: EmpReq = {
      id: empReqs.length + 1,
      name: data.name,
      email: data.email,
      image:
        data.image instanceof File
          ? URL.createObjectURL(data.image)
          : `/images/employees/employee-${(empReqs.length % 5) + 1}.jpg`,
      contactNumber: data.contactNumber,
      verificationStatus: data.verificationStatus,
      blocked: data.blocked,
      status: data.status,
      requestDate: new Date().toISOString(),
    };
    setEmpReqs([...empReqs, newEmpReq]);
    setIsAddDialogOpen(false);
  };

  const confirmEdit = (data: EmpReqListFormData) => {
    const updatedEmpReqs = empReqs.map((empReq) =>
      empReq.id === editEmpReq?.id
        ? {
            ...empReq,
            name: data.name,
            email: data.email,
            image:
              data.image instanceof File
                ? URL.createObjectURL(data.image)
                : empReq.image,
            contactNumber: data.contactNumber,
            verificationStatus: data.verificationStatus,
            blocked: data.blocked,
            status: data.status,
          }
        : empReq,
    );
    setEmpReqs(updatedEmpReqs);
    setEditEmpReq(null);
  };

  return (
    <div className='p-4 bg-white rounded-xl shadow-md'>
      {/* Header Section */}
      <TableToolbar
        onAddNew={handleAddNew}
        addButtonLabel='Add Request'
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
        <div className='min-w-[1100px]'>
          <Table className='w-full'>
            <TableHeader className='bg-gray-50'>
              <TableRow>
                <TableCell className='w-10 p-2 py-3'>
                  <Checkbox
                    checked={selectedRows.length === empReqs.length}
                    onChange={toggleSelectAll}
                  />
                </TableCell>
                {columns.map((column) => (
                  <SortableTableHeader<EmpReq>
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
              {currentItems.map((empReq) => (
                <TableRow key={empReq.id} className='hover:bg-gray-50'>
                  <TableCell className='p-2 py-4'>
                    <Checkbox
                      checked={selectedRows.includes(empReq.id)}
                      onChange={() => toggleSelectRow(empReq.id)}
                    />
                  </TableCell>
                  <TableCell className='p-2 py-4'>
                    <div className='flex items-center gap-3'>
                      <ImageHoverPreview
                        src={empReq.image}
                        alt={empReq.name}
                        className='w-8 h-8 rounded-full object-cover'
                      />
                      <div>
                        <div className='text-sm font-medium text-gray-900'>
                          {empReq.name}
                        </div>
                        <div className='text-xs text-gray-500'>
                          {empReq.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className='p-2 py-4 text-sm text-gray-500'>
                    {empReq.contactNumber}
                  </TableCell>
                  <TableCell className='p-2 py-4'>
                    <Badge
                      size='sm'
                      color={
                        empReq.verificationStatus === 'Verified'
                          ? 'success'
                          : empReq.verificationStatus === 'Pending'
                            ? 'warning'
                            : 'error'
                      }
                    >
                      {empReq.verificationStatus}
                    </Badge>
                  </TableCell>
                  <TableCell className='p-2 py-4'>
                    <div className='flex items-center gap-3'>
                      <Badge
                        size='sm'
                        color={empReq.blocked === true ? 'success' : 'error'}
                      >
                        {empReq.blocked === true ? (
                          <IoIosCheckmarkCircle />
                        ) : (
                          <IoIosCloseCircle />
                        )}
                      </Badge>
                      <Switch
                        label=''
                        checked={empReq.blocked === true}
                        onChange={() => toggleBlocked(empReq.id)}
                      />
                    </div>
                  </TableCell>
                  <TableCell className='p-2 py-4'>
                    <div className='flex items-center gap-3'>
                      <Badge
                        size='sm'
                        color={empReq.status === 'Active' ? 'success' : 'error'}
                      >
                        {empReq.status === 'Active' ? (
                          <IoIosCheckmarkCircle />
                        ) : (
                          <IoIosCloseCircle />
                        )}
                      </Badge>
                      <Switch
                        label=''
                        checked={empReq.status === 'Active'}
                        onChange={() => toggleStatus(empReq.id)}
                      />
                    </div>
                  </TableCell>
                  <TableCell className='p-2 py-4 text-sm text-gray-500'>
                    {new Date(empReq.requestDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell className='p-2 py-4'>
                    <div className='flex gap-2'>
                      <button
                        onClick={handlePushNotification}
                        className='text-blue-500 hover:text-blue-700 p-1 rounded hover:bg-blue-50'
                        title='Send Notification'
                      >
                        <MdNotifications className='w-5 h-5' />
                      </button>
                      <button
                        onClick={handleChangePassword}
                        className='text-blue-500 hover:text-blue-700 p-1 rounded hover:bg-blue-50'
                        title='Change Password'
                      >
                        <MdLock className='w-5 h-5' />
                      </button>
                      <button
                        onClick={() => handleEdit(empReq)}
                        className='text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50'
                        title='Edit'
                      >
                        <MdEdit className='w-5 h-5' />
                      </button>
                      <button
                        onClick={() => handleDelete(empReq.id)}
                        className='text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50'
                        title='Delete'
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
      {isAddDialogOpen || editEmpReq ? (
        <EmpReqListForm
          empReq={editEmpReq}
          onSubmit={editEmpReq ? confirmEdit : confirmAddNew}
          onCancel={() => {
            setIsAddDialogOpen(false);
            setEditEmpReq(null);
          }}
        />
      ) : null}

      {/* Push Notification Dialog */}
      {isPushNotificationDialogOpen && (
        <PushNotificationForm
          onSubmit={handlePushNotificationSubmit}
          onCancel={() => setIsPushNotificationDialogOpen(false)}
        />
      )}

      {/* Change Password Dialog */}
      {isChangePasswordDialogOpen && (
        <ChangePasswordForm
          onSubmit={handleChangePasswordSubmit}
          onCancel={() => setIsChangePasswordDialogOpen(false)}
        />
      )}

      {/* Delete Dialog */}
      <DeleteDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        itemLabel='Employee Request'
        description={
          selectedRows.length > 1
            ? `Are you sure you want to delete ${selectedRows.length} selected requests?`
            : 'Are you sure you want to delete this request?'
        }
      />
    </div>
  );
}
