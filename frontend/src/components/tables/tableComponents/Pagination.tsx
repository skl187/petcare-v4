import { useState } from "react";
import { GrCaretPrevious, GrCaretNext } from "react-icons/gr";
interface PaginationProps {
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (itemsPerPage: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    onPageChange(page);
  };

  const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    const newItemsPerPage = value === "all" ? totalItems : parseInt(value, 10);
    onItemsPerPageChange(newItemsPerPage);
    setCurrentPage(1); // Reset to the first page when changing items per page
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between mt-4 gap-4">
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-700">
          Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
          {itemsPerPage === totalItems
            ? totalItems // Show "All" if "All" is selected
            : Math.min(currentPage * itemsPerPage, totalItems)}{" "}
          of {totalItems} entries
        </span>
      </div>

      <div className="flex items-center gap-4">
        <select
          className="px-2 py-1 border rounded-md text-sm"
          value={itemsPerPage === totalItems ? "all" : itemsPerPage} // Set value to "all" if "All" is selected
          onChange={handleItemsPerPageChange}
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value="all">All</option> {/* Add "All" option */}
        </select>

        <div className="flex gap-2">
          <button
            className="px-3 py-1 text-sm bg-gray-200 rounded-md disabled:opacity-50"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1 || itemsPerPage === totalItems} // Disable if "All" is selected
          >
           <GrCaretPrevious />
          </button>
          <span className="px-3 py-1 text-sm text-gray-700">
            Page {currentPage} of {itemsPerPage === totalItems ? 1 : totalPages} {/* Show 1 page if "All" is selected */}
          </span>
          <button
            className="px-3 py-1 text-sm bg-gray-200 rounded-md disabled:opacity-50"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages || itemsPerPage === totalItems} // Disable if "All" is selected
          >
           <GrCaretNext/>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Pagination;