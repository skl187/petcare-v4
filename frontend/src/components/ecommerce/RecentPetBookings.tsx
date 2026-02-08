import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from '../ui/table';
import Badge from '../ui/badge/Badge';
import { useNavigate } from 'react-router-dom';
import { AdminDashboardData } from '../../services/dashboardService';

interface Props {
  data: AdminDashboardData | null;
}

export default function RecentPetBookings({ data }: Props) {
  const navigate = useNavigate();
  const bookings = data?.appointments?.recent || [];

  const onButtonClick = () => {
    navigate('/overallBookings');
  };

  const getStatusColor = (status: string): 'success' | 'warning' | 'error' | 'primary' => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'success';
      case 'confirmed':
        return 'primary';
      case 'scheduled':
        return 'warning';
      case 'cancelled':
      case 'no_show':
        return 'error';
      default:
        return 'warning';
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatStatus = (status: string) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  };

  return (
    <div className='overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-7 pt-8 dark:border-gray-700 dark:bg-gray-800/50 sm:px-6'>
      <div className='flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h3 className='text-lg font-semibold text-gray-800 dark:text-white/90'>
            Recent Pet Bookings
          </h3>
        </div>

        <div className='flex items-center gap-3'>
          <button
            className='inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-theme-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200'
            onClick={onButtonClick}
          >
            See all
          </button>
        </div>
      </div>

      <div className='max-w-full overflow-x-auto'>
        <Table>
          <TableHeader className='border-gray-100 dark:border-gray-700 border-y'>
            <TableRow>
              <TableCell
                isHeader
                className='py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400'
              >
                Pet
              </TableCell>
              <TableCell
                isHeader
                className='py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400'
              >
                Owner
              </TableCell>
              <TableCell
                isHeader
                className='py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400'
              >
                Veterinarian
              </TableCell>
              <TableCell
                isHeader
                className='py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400'
              >
                Date
              </TableCell>
              <TableCell
                isHeader
                className='py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400'
              >
                Status
              </TableCell>
            </TableRow>
          </TableHeader>

          <TableBody className='divide-y divide-gray-100 dark:divide-gray-800'>
            {bookings.length > 0 ? (
              bookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell className='py-3'>
                    <div className='flex items-center gap-3'>
                      <div className='h-[40px] w-[40px] overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center'>
                        <span className='text-sm font-medium text-gray-600 dark:text-gray-300'>
                          {booking.pet_name?.charAt(0) || 'P'}
                        </span>
                      </div>
                      <div>
                        <p className='font-medium text-gray-800 text-theme-sm dark:text-white/90'>
                          {booking.pet_name || 'Unknown Pet'}
                        </p>
                        <p className='text-xs text-gray-500 dark:text-gray-400'>
                          {booking.appointment_type}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className='py-3 text-gray-500 text-theme-sm dark:text-gray-400'>
                    {booking.user_first_name} {booking.user_last_name}
                  </TableCell>
                  <TableCell className='py-3 text-gray-500 text-theme-sm dark:text-gray-400'>
                    Dr. {booking.vet_first_name} {booking.vet_last_name}
                  </TableCell>
                  <TableCell className='py-3 text-gray-500 text-theme-sm dark:text-gray-400'>
                    {formatDate(booking.appointment_date)}
                  </TableCell>
                  <TableCell className='py-3 text-gray-500 text-theme-sm dark:text-gray-400'>
                    <Badge size='sm' color={getStatusColor(booking.status)}>
                      {formatStatus(booking.status)}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell className='py-8 text-center text-gray-500 dark:text-gray-400' colSpan={5}>
                  No recent bookings found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
