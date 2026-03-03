import React from 'react';

interface FormCardProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  showFooter?: boolean;
}

const FormCard: React.FC<FormCardProps> = ({
  title,
  onClose,
  children,
  showFooter = false,
}) => {
  // Assuming your header height is 64px (h-16), adjust if different
  const headerHeight = '64px';

  return (
    <div className='fixed inset-0 z-[100000] flex justify-end'>
      {/* Semi-transparent overlay — covers header too */}
      <div className='fixed inset-0 bg-black/40' onClick={onClose} />

      {/* Form container - positioned below header */}
      <div
        className='bg-white w-full lg:w-4/5 xl:w-4/5 h-full overflow-y-auto transform transition-all duration-300 border-l border-gray-200 relative'
        style={{ top: headerHeight, height: `calc(100% - ${headerHeight})` }}
      >
        {/* Header */}
        <div className='p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10'>
          <button
            onClick={onClose}
            className='text-gray-600 hover:text-gray-800 focus:outline-none flex items-center gap-2'
            aria-label='Go back'
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              className='h-6 w-6'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M15 19l-7-7 7-7'
              />
            </svg>
            <span className='text-sm font-medium'>Back</span>
          </button>
          <h2 className='text-2xl font-semibold text-gray-800 flex-1 text-center'>
            {title}
          </h2>
          <div className='w-20'></div>
        </div>

        {/* Body */}
        <div className='p-6 pb-20'>{children}</div>

        {/* Footer */}
        {showFooter && (
          <div className='p-4 border-t border-gray-200 flex justify-end gap-4 sticky bottom-0 bg-white'>
            <button
              onClick={onClose}
              className='px-4 py-2 text-gray-600 rounded-md hover:bg-gray-100 transition duration-200'
            >
              Cancel
            </button>
            <button
              type='submit'
              form='form'
              className='px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition duration-200'
            >
              Save
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FormCard;
