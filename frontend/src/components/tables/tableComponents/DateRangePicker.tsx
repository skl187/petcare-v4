import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FiRefreshCw } from "react-icons/fi";

interface DateRangeFilterProps {
  startDate: Date | null;
  endDate: Date | null;
  onChange: (start: Date | null, end: Date | null) => void;
  placeholder?: string;
  className?: string;
}

export const DateRangeFilter = ({
  startDate,
  endDate,
  onChange,
  placeholder = "Select date range",
  className = "",
}: DateRangeFilterProps) => {
  const handleChange = (dates: [Date | null, Date | null]) => {
    const [start, end] = dates;
    onChange(start, end);
  };

  const resetFilter = () => {
    onChange(null, null);
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <DatePicker
        selectsRange
        startDate={startDate}
        endDate={endDate}
        onChange={handleChange}
        placeholderText={placeholder}
        className={`px-3 py-2 border rounded-md text-sm w-64 ${className}`}
        dateFormat="MMM d, yyyy"
        isClearable
        showMonthDropdown
        showYearDropdown
        dropdownMode="select"
      />
      <button
        onClick={resetFilter}
        className="flex items-center gap-1 px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded transition-colors"
        title="Reset filter"
      >
        <FiRefreshCw className="w-4 h-4" />
      </button>
    </div>
  );
};