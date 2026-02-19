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
import EmployeeForm from '../../../adminPages/Forms/UserForms/EmployeeForm';
import { EmployeeFormData } from '../../../adminPages/Forms/UserForms/EmployeeForm';
import Pagination from '../tableComponents/Pagination';
import ChangePasswordForm from '../../../adminPages/Forms/VetForms/vetformComponents/ChangePasswordForm';
import { ChangePasswordFormData } from '../../../adminPages/Forms/VetForms/vetformComponents/ChangePasswordForm';
import { PushNotificationFormData } from '../../../adminPages/Forms/VetForms/vetformComponents/PushNotificationForm';
import PushNotificationForm from '../../../adminPages/Forms/VetForms/vetformComponents/PushNotificationForm';
import useSort from '../../../hooks/useSort';
import SortableTableHeader from '../tableComponents/SortableTableHeader';
import { TableToolbar } from '../tableComponents/TableToolbar';
import Switch from '../../form/switch/Switch';
import { IoIosCloseCircle, IoIosCheckmarkCircle } from 'react-icons/io';
import ImageHoverPreview from '../tableComponents/ImageHoverPreview';
import DeleteDialog from '../tableComponents/DeleteDailog';

export interface Employee {
  id: number;
  name: string;
  email: string;
  image: string;
  contactNumber: string;
  role: 'Boarder' | 'Walker' | 'Petsitter' | 'Groomer' | 'Trainer' | 'Admin';
  verificationStatus: 'Verified' | 'Unverified';
  blocked: boolean;
  status: 'Active' | 'Inactive';
}

// Mock data for employees
const mockEmployees: Employee[] = Array.from({ length: 50 }, (_, i) => ({
  id: i + 1,
  name: `Employee ${i + 1}`,
  email: `employee${i + 1}@example.com`,
  image: `/images/employees/employee-${(i % 5) + 1}.jpg`,
  contactNumber: `+1${Math.floor(1000000000 + Math.random() * 9000000000)}`,
  role: ['Boarder', 'Walker', 'Petsitter', 'Groomer', 'Trainer', 'Admin'][
    i % 6
  ] as 'Boarder' | 'Walker' | 'Petsitter' | 'Groomer' | 'Trainer' | 'Admin',
  verificationStatus: i % 3 === 0 ? 'Verified' : 'Unverified',
  blocked: i % 4 === 0,
  status: i % 3 !== 0 ? 'Active' : 'Inactive',
}));

export default function EmployeeTable() {
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
  const [editEmployee, setEditEmployee] = useState<Employee | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>(mockEmployees);
  const [employeeToDelete, setEmployeeToDelete] = useState<number | null>(null);
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
      key: 'role',
      label: 'Role',
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
  ] as const;

  // Filtered data based on search and filters
  const filteredData = employees
    .filter(
      (employee) =>
        employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        employee.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        employee.contactNumber.includes(searchQuery),
    )
    .filter((employee) =>
      statusFilter ? employee.status === statusFilter : true,
    );

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
      selectedRows.length === employees.length
        ? []
        : employees.map((row) => row.id),
    );
  };

  const handleApplyAction = () => {
    if (actionDropdown === 'Delete') {
      handleDelete();
    } else if (actionDropdown === 'Status' && statusUpdate) {
      const updatedEmployees = employees.map((employee) =>
        selectedRows.includes(employee.id)
          ? { ...employee, status: statusUpdate as 'Active' | 'Inactive' }
          : employee,
      );
      setEmployees(updatedEmployees);
      setSelectedRows([]);
    }
  };

  const handleDelete = (id?: number) => {
    if (id) {
      setEmployeeToDelete(id);
    } else {
      setEmployeeToDelete(null);
    }
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    let updatedEmployees: Employee[];

    if (employeeToDelete) {
      updatedEmployees = employees.filter(
        (employee) => employee.id !== employeeToDelete,
      );
    } else {
      updatedEmployees = employees.filter(
        (employee) => !selectedRows.includes(employee.id),
      );
    }

    setEmployees(updatedEmployees);
    setIsDeleteDialogOpen(false);
    setSelectedRows([]);
    setEmployeeToDelete(null);
  };

  const handleEdit = (employee: Employee) => {
    setEditEmployee(employee);
  };

  const handleAddNew = () => {
    setIsAddDialogOpen(true);
  };

  const toggleBlocked = (id: number) => {
    setEmployees((prev) =>
      prev.map((employee) =>
        employee.id === id
          ? { ...employee, blocked: !employee.blocked }
          : employee,
      ),
    );
  };

  const toggleStatus = (id: number) => {
    setEmployees((prev) =>
      prev.map((employee) =>
        employee.id === id
          ? {
              ...employee,
              status: employee.status === 'Active' ? 'Inactive' : 'Active',
            }
          : employee,
      ),
    );
  };
  // Additional actions
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

  const confirmAddNew = (data: EmployeeFormData) => {
    const newEmployee: Employee = {
      id: employees.length + 1,
      name: data.name,
      email: data.email,
      image:
        data.image instanceof File
          ? URL.createObjectURL(data.image)
          : `/images/employees/employee-${(employees.length % 5) + 1}.jpg`,
      contactNumber: data.contactNumber,
      role: data.role,
      verificationStatus: data.verificationStatus,
      blocked: data.blocked,
      status: data.status,
    };
    setEmployees([...employees, newEmployee]);
    setIsAddDialogOpen(false);
  };

  const confirmEdit = (data: EmployeeFormData) => {
    const updatedEmployees = employees.map((employee) =>
      employee.id === editEmployee?.id
        ? {
            ...employee,
            name: data.name,
            email: data.email,
            image:
              data.image instanceof File
                ? URL.createObjectURL(data.image)
                : employee.image,
            contactNumber: data.contactNumber,
            role: data.role,
            verificationStatus: data.verificationStatus,
            blocked: data.blocked,
            status: data.status,
          }
        : employee,
    );
    setEmployees(updatedEmployees);
    setEditEmployee(null);
  };

  return (
    <div className='p-4 bg-white rounded-xl shadow-md'>
      {/* Header Section */}
      <TableToolbar
        onAddNew={handleAddNew}
        addButtonLabel='Add Employee'
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
                    checked={selectedRows.length === employees.length}
                    onChange={toggleSelectAll}
                  />
                </TableCell>
                {columns.map((column) => (
                  <SortableTableHeader<Employee>
                    key={column.key}
                    columnKey={column.key}
                    label={column.label}
                    sortConfig={sortConfig}
                    requestSort={requestSort}
                    className={`p-2 py-4 text-left text-table-header ${column.className}`}
                  />
                ))}
                <TableCell className='w-32 p-2 py-4 text-table-header'>
                  Actions
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody>
              {currentItems.map((employee) => (
                <TableRow key={employee.id} className='hover:bg-gray-50'>
                  <TableCell className='p-2 py-4'>
                    <Checkbox
                      checked={selectedRows.includes(employee.id)}
                      onChange={() => toggleSelectRow(employee.id)}
                    />
                  </TableCell>
                  <TableCell className='p-2 py-4'>
                    <div className='flex items-center gap-3'>
                      <ImageHoverPreview
                        src={employee.image}
                        alt={employee.name}
                        className='w-8 h-8 rounded-full object-cover'
                      />
                      <div>
                        <div className='text-table-body font-medium'>
                          {employee.name}
                        </div>
                        <div className='text-table-body-secondary'>
                          {employee.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className='p-2 py-4 text-table-body-secondary'>
                    {employee.contactNumber}
                  </TableCell>
                  <TableCell className='p-2 py-4'>
                    <Badge size='sm' color='success'>
                      {employee.role}
                    </Badge>
                  </TableCell>
                  <TableCell className='p-2 py-4'>
                    <Badge
                      size='sm'
                      color={
                        employee.verificationStatus === 'Verified'
                          ? 'success'
                          : 'warning'
                      }
                    >
                      {employee.verificationStatus}
                    </Badge>
                  </TableCell>
                  <TableCell className='p-2 py-4'>
                    <div className='flex items-center gap-3'>
                      <Badge
                        size='sm'
                        color={employee.blocked === true ? 'success' : 'error'}
                      >
                        {employee.blocked === true ? (
                          <IoIosCheckmarkCircle />
                        ) : (
                          <IoIosCloseCircle />
                        )}
                      </Badge>
                      <Switch
                        label=''
                        checked={employee.blocked === true}
                        onChange={() => toggleBlocked(employee.id)}
                      />
                    </div>
                  </TableCell>
                  <TableCell className='p-2 py-4'>
                    <div className='flex items-center gap-3'>
                      <Badge
                        size='sm'
                        color={
                          employee.status === 'Active' ? 'success' : 'error'
                        }
                      >
                        {employee.status === 'Active' ? (
                          <IoIosCheckmarkCircle />
                        ) : (
                          <IoIosCloseCircle />
                        )}
                      </Badge>
                      <Switch
                        label=''
                        checked={employee.status === 'Active'}
                        onChange={() => toggleStatus(employee.id)}
                      />
                    </div>
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
                        onClick={() => handleEdit(employee)}
                        className='text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50'
                        title='Edit'
                      >
                        <MdEdit className='w-5 h-5' />
                      </button>
                      <button
                        onClick={() => handleDelete(employee.id)}
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
      {isAddDialogOpen || editEmployee ? (
        <EmployeeForm
          employee={editEmployee}
          onSubmit={editEmployee ? confirmEdit : confirmAddNew}
          onCancel={() => {
            setIsAddDialogOpen(false);
            setEditEmployee(null);
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
        itemLabel='Employee'
        description={
          selectedRows.length > 1
            ? `Are you sure you want to delete ${selectedRows.length} selected employees?`
            : 'Are you sure you want to delete this employee?'
        }
      />
    </div>
  );
}
