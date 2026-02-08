interface ComponentCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  desc?: string;
}

const ComponentCard: React.FC<ComponentCardProps> = ({
  title,
  children,
  className = '',
  desc = '',
}) => {
  return (
    <div
      className={` rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800/50 ${className}`}
    >
      {/* w-[100%] max-w-screen-xl mx-auto  */}
      {/* Card Header */}
      <div className='px-4 py-4 sm:px-6 bg-gray-100/100 dark:bg-gray-800 sm:py-5'>
        <h3 className='text-base font-medium text-gray-800 dark:text-white/90'>
          {title}
        </h3>
        {desc && (
          <p className='mt-1 text-sm text-gray-500 dark:text-gray-400'>
            {desc}
          </p>
        )}
      </div>

      {/* Card Body */}
      <div className='p-3 border-t border-gray-100 dark:border-gray-700 sm:p-6'>
        {/* Table Wrapper - Ensures only table scrolls */}
        <div className='w-full overflow-x-auto'>
          <div className='w-full min-w-0 max-w-full'>{children}</div>
        </div>
      </div>
    </div>
  );
};

export default ComponentCard;
