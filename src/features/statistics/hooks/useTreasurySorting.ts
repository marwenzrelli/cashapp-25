
import { useState, useMemo } from "react";
import { Operation } from "@/features/operations/types";

export type SortField = "date" | "id" | "nature" | "client";
export type SortDirection = "asc" | "desc";

export interface SortConfig {
  field: SortField;
  direction: SortDirection;
}

export const useTreasurySorting = (operations: Operation[]) => {
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    field: "date",
    direction: "asc"
  });

  const sortedOperations = useMemo(() => {
    return [...operations].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortConfig.field) {
        case "date":
          aValue = new Date(a.operation_date || a.date);
          bValue = new Date(b.operation_date || b.date);
          break;
        case "id":
          aValue = a.id;
          bValue = b.id;
          break;
        case "nature":
          aValue = a.type;
          bValue = b.type;
          break;
        case "client":
          aValue = a.type === "transfer" ? `${a.fromClient} → ${a.toClient}` : a.fromClient;
          bValue = b.type === "transfer" ? `${b.fromClient} → ${b.toClient}` : b.fromClient;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) {
        return sortConfig.direction === "asc" ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === "asc" ? 1 : -1;
      }
      return 0;
    });
  }, [operations, sortConfig]);

  const handleSort = (field: SortField) => {
    setSortConfig(prev => ({
      field,
      direction: prev.field === field && prev.direction === "asc" ? "desc" : "asc"
    }));
  };

  return {
    sortedOperations,
    sortConfig,
    handleSort
  };
};
