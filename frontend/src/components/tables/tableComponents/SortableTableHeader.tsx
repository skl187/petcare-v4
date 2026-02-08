// components/tableComponents/SortableTableHeader.tsx
import { FaSort, FaSortUp, FaSortDown } from "react-icons/fa";
import { SortConfig } from "../../../hooks/useSort";

interface SortableTableHeaderProps<T> {
  columnKey: string;
  label: string;
  sortConfig: SortConfig<T> | null;
  requestSort: (key: string) => void;
  className?: string;
  align?: "left" | "center" | "right";
}

export default function SortableTableHeader<T>({
  columnKey,
  label,
  sortConfig,
  requestSort,
  className = "",
  align = "left",
}: SortableTableHeaderProps<T>) {
  const isActive = sortConfig?.key === columnKey;
  
  return (
    <th
      className={`${className} ${
        align === "left" ? "text-left" : 
        align === "center" ? "text-center" : "text-right"
      } cursor-pointer hover:bg-gray-50 select-none`}
      onClick={() => requestSort(columnKey)}
    >
      <div className="flex items-center gap-1">
        <span>{label}</span>
        {isActive ? (
          sortConfig.direction === "asc" ? (
            <FaSortUp className="inline" />
          ) : (
            <FaSortDown className="inline" />
          )
        ) : (
          <FaSort className="inline opacity-30" />
        )}
      </div>
    </th>
  );
}