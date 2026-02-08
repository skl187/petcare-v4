import { ReactNode } from 'react';

interface TableToolbarProps {
  // Button props
  onAddNew?: () => void;
  addButtonLabel?: string;
  addButtonIcon?: ReactNode;
  showAddButton?: boolean;

  // Bulk actions props
  selectedRowsCount: number;
  bulkActionsOptions?: ReactNode;
  statusUpdateOptions?: ReactNode;
  showStatusDropdown?: boolean;
  onBulkActionChange: (value: string) => void;
  onStatusUpdateChange?: (value: string) => void;
  onApplyAction: () => void;
  bulkActionValue?: string;
  statusUpdateValue?: string;

  // Search/filter props
  searchQuery: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  filterOptions?: ReactNode;
  onFilterChange: (value: string) => void;
  filterValue?: string;

  // Children for additional custom elements
  children?: ReactNode;
}

export const TableToolbar = ({
  onAddNew,
  addButtonLabel,
  addButtonIcon,
  showAddButton = true,

  selectedRowsCount,
  bulkActionsOptions,
  statusUpdateOptions,
  showStatusDropdown = false,
  onBulkActionChange,
  onStatusUpdateChange,
  onApplyAction,
  bulkActionValue,
  statusUpdateValue,

  searchQuery,
  onSearchChange,
  searchPlaceholder = 'Search...',
  filterOptions,
  onFilterChange,
  filterValue,

  children,
}: TableToolbarProps) => {
  return (
    <div className='flex flex-wrap items-center gap-3 mb-4'>
      {/* 1. Add Button (Only shown if showAddButton is true) */}
      {showAddButton && (
        <button
          className='flex items-center gap-1.5 px-3 py-1.5 text-sm bg-green-500 text-white rounded hover:bg-green-600 transition-colors'
          onClick={onAddNew}
        >
          {addButtonIcon}
          <span>{addButtonLabel}</span>
        </button>
      )}

      {/* 2. Bulk Actions (Only shown when rows are selected) */}
      {selectedRowsCount > 0 && (
        <div className='flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded'>
          <span className='text-sm text-gray-700'>
            {selectedRowsCount} selected
          </span>

          {bulkActionsOptions && (
            <select
              className='text-sm px-2 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-blue-300'
              value={bulkActionValue}
              onChange={(e) => onBulkActionChange(e.target.value)}
            >
              {bulkActionsOptions}
            </select>
          )}

          {showStatusDropdown &&
            statusUpdateOptions &&
            onStatusUpdateChange && (
              <select
                className='text-sm px-2 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-blue-300'
                value={statusUpdateValue}
                onChange={(e) => onStatusUpdateChange(e.target.value)}
              >
                {statusUpdateOptions}
              </select>
            )}

          <button
            className='text-sm px-3 py-1 text-white bg-blue-500 rounded hover:bg-blue-600 whitespace-nowrap'
            onClick={onApplyAction}
          >
            Apply
          </button>
        </div>
      )}

      {/* 3. Search (Takes remaining space) */}
      <div className='flex-grow min-w-[200px]'>
        <div className='relative'>
          <input
            type='text'
            placeholder={searchPlaceholder}
            className='text-sm w-full px-3 py-1.5 border rounded focus:outline-none focus:ring-1 focus:ring-blue-300'
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          <svg
            xmlns='http://www.w3.org/2000/svg'
            className='h-4 w-4 absolute right-3 top-2 text-gray-400'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
            />
          </svg>
        </div>
      </div>

      {/* 4. Status Filter (Right side) */}
      {filterOptions && (
        <select
          className='text-sm px-3 py-1.5 border rounded focus:outline-none focus:ring-1 focus:ring-blue-300'
          value={filterValue}
          onChange={(e) => onFilterChange(e.target.value)}
        >
          {filterOptions}
        </select>
      )}

      {/* Children content */}
      {children && <div className='w-full mt-2'>{children}</div>}
    </div>
  );
};
