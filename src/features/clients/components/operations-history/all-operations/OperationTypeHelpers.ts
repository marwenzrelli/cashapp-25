
import { Operation } from "@/features/operations/types";

// Determine color based on operation type
export const getOperationTypeColor = (type: string): string => {
  switch (type) {
    case "deposit":
      return "text-green-600 dark:text-green-400";
    case "withdrawal":
      return "text-red-600 dark:text-red-400";
    case "transfer":
      return "text-blue-600 dark:text-blue-400";
    default:
      return "";
  }
};

// Format number with 2 decimal places and comma separator
export const formatNumber = (num: number): string => {
  return num.toLocaleString('fr-FR', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  });
};
