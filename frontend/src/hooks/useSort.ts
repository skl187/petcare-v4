// hooks/useSort.ts
import { useState } from "react";

type SortDirection = "asc" | "desc";

// Simplified path type that works with TypeScript's limitations
type Path<T, K extends keyof T = keyof T> = 
  K extends string
    ? T[K] extends Record<string, any>
      ? `${K}.${Path<T[K]>}` | K
      : K
    : never;

export type SortConfig<T> = {
  key: Path<T>;
  direction: SortDirection;
};

const getNestedValue = <T,>(obj: T, path: string): any => {
  return path.split('.').reduce((acc: any, part) => acc?.[part], obj);
};

export default function useSort<T>(
  data: T[],
  initialConfig: SortConfig<T> | null = null
) {
  const [sortConfig, setSortConfig] = useState<SortConfig<T> | null>(initialConfig);

  const sortedData = [...data];
  if (sortConfig) {
    sortedData.sort((a, b) => {
      const valueA = getNestedValue(a, sortConfig.key);
      const valueB = getNestedValue(b, sortConfig.key);

      // Handle null/undefined values
      if (valueA == null) return valueB == null ? 0 : 1;
      if (valueB == null) return -1;
      
      // Compare values
      if (valueA < valueB) return sortConfig.direction === "asc" ? -1 : 1;
      if (valueA > valueB) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }

  const requestSort = (key: Path<T>) => {
    const direction: SortDirection = 
      sortConfig?.key === key && sortConfig.direction === "asc" 
        ? "desc" 
        : "asc";
    setSortConfig({ key, direction });
  };

  return { 
    sortedData, 
    requestSort, 
    sortConfig,
    resetSort: () => setSortConfig(null)
  };
}