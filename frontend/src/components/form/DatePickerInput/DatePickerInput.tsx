import React, { useRef, useEffect } from 'react';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.css';
import { MdCalendarToday } from 'react-icons/md';

interface DatePickerInputProps {
  label?: string;
  value?: string | Date | null;
  onChange?: (date: Date | null) => void;
  onBlur?: () => void;
  required?: boolean;
  error?: string;
  disabled?: boolean;
  minDate?: Date;
  maxDate?: Date;
  className?: string;
  id?: string;
}

const DatePickerInput = React.forwardRef<HTMLDivElement, DatePickerInputProps>(
  (
    {
      label,
      value,
      onChange,
      onBlur,
      required = false,
      error,
      disabled = false,
      minDate,
      maxDate,
      className = '',
      id = `date-picker-${Math.random().toString(36).substr(2, 9)}`,
    },
    ref,
  ) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const fpRef = useRef<flatpickr.Instance | null>(null);

    useEffect(() => {
      if (!inputRef.current) return;

      // Destroy previous instance if exists
      if (fpRef.current) {
        fpRef.current.destroy();
      }

      // Create flatpickr instance
      fpRef.current = flatpickr(inputRef.current, {
        mode: 'single',
        static: true,
        monthSelectorType: 'static',
        dateFormat: 'Y-m-d',
        defaultDate: value
          ? typeof value === 'string'
            ? new Date(value)
            : value
          : null,
        minDate: minDate,
        maxDate: maxDate,
        onChange: (selectedDates) => {
          onChange?.(selectedDates.length > 0 ? selectedDates[0] : null);
        },
        onClose: () => {
          onBlur?.();
        },
        clickOpens: true,
      });

      return () => {
        if (fpRef.current) {
          fpRef.current.destroy();
        }
      };
    }, [id]);

    const handleIconClick = () => {
      if (fpRef.current && !fpRef.current.isOpen) {
        fpRef.current.open();
      }
    };

    return (
      <div ref={ref} className={`w-full ${className}`}>
        {label && (
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            {label}
            {required && <span className='text-red-500'>*</span>}
          </label>
        )}
        <div className='relative'>
          <input
            ref={inputRef}
            id={id}
            type='text'
            disabled={disabled}
            placeholder='YYYY-MM-DD'
            className={`w-full px-3 py-2 pl-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
              disabled
                ? 'bg-gray-100 cursor-not-allowed opacity-50'
                : 'bg-white'
            } ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'}`}
            readOnly
          />
          <button
            type='button'
            onClick={handleIconClick}
            disabled={disabled}
            className='absolute left-3 top-2.5 text-gray-400 hover:text-gray-600 disabled:cursor-not-allowed'
            title='Open date picker'
          >
            <MdCalendarToday className='w-5 h-5' />
          </button>
        </div>
        {error && <p className='text-red-500 text-sm mt-1'>{error}</p>}
      </div>
    );
  },
);

DatePickerInput.displayName = 'DatePickerInput';

export default DatePickerInput;
