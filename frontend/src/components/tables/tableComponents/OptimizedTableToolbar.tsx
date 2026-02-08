import { ReactNode } from "react";

interface TableToolbarProps {
  // Button props (optional)
  addButton?: {
    onClick: () => void;
    label: string;
    icon?: ReactNode;
  };
  
  // Bulk actions props (optional)
  bulkActions?: {
    selectedCount: number;
    options?: ReactNode;
    onActionChange: (value: string) => void;
    actionValue?: string;
    statusOptions?: {
      options: ReactNode;
      onChange: (value: string) => void;
      value?: string;
    };
    onApply: () => void;
  };
  
  // Search props (required)
  search: {
    query: string;
    onChange: (value: string) => void;
    placeholder?: string;
  };
  
  // Filter props (optional)
  filter?: {
    options: ReactNode;
    onChange: (value: string) => void;
    value?: string;
    placeholder?: string;
  };
  
  // Custom content
  children?: ReactNode;
  
  // Layout customization
  className?: string;
}

export const OptimizedTableToolbar = ({
  addButton,
  bulkActions,
  search,
  filter,
  children,
  className = "",
}: TableToolbarProps) => {
  return (
    <div className={`flex flex-wrap items-center justify-between gap-3 ${className}`}>

      <div className="flex flex-wrap items-center gap-3">

        {addButton && (
          <button
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
            onClick={addButton.onClick}
          >
            {addButton.icon}
            <span>{addButton.label}</span>
          </button>
        )}

        {/* Bulk Actions - only shown if provided and items are selected */}
        {bulkActions && bulkActions.selectedCount > 0 && (
          <div className="flex flex-wrap items-center gap-3 bg-gray-50 px-3 py-1.5 rounded">
            <span className="text-sm text-gray-700">
              {bulkActions.selectedCount} selected
            </span>
            
            {bulkActions.options && (
              <select
                className="text-sm px-2 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-blue-300"
                value={bulkActions.actionValue}
                onChange={(e) => bulkActions.onActionChange(e.target.value)}
              >
                {bulkActions.options}
              </select>
            )}

            {bulkActions.statusOptions && (
              <select
                className="text-sm px-2 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-blue-300"
                value={bulkActions.statusOptions.value}
                onChange={(e) => bulkActions.statusOptions?.onChange(e.target.value)}
              >
                {bulkActions.statusOptions.options}
              </select>
            )}

            <button
              className="text-sm px-3 py-1 text-white bg-blue-600 rounded hover:bg-blue-700 whitespace-nowrap"
              onClick={bulkActions.onApply}
            >
              Apply
            </button>
          </div>
        )}
      </div>

    
      <div className="flex flex-wrap items-center gap-3 mb-2">
       
        <div className="relative min-w-[200px] flex-1">
          <input
            type="text"
            placeholder={search.placeholder || "Search..."}
            className="text-sm w-full px-3 py-1.5 border rounded focus:outline-none focus:ring-1 focus:ring-blue-300"
            value={search.query}
            onChange={(e) => search.onChange(e.target.value)}
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 absolute right-3 top-2 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Filter - only shown if provided */}
        {filter && (
          <select
            className="text-sm px-3 py-1.5 border rounded focus:outline-none focus:ring-1 focus:ring-blue-300"
            value={filter.value}
            onChange={(e) => filter.onChange(e.target.value)}
          >
            {filter.placeholder && (
              <option value="">{filter.placeholder}</option>
            )}
            {filter.options}
          </select>
        )}
      </div>

     
      {children && <div className="w-full mt-2">{children}</div>}
    </div>
  );
};