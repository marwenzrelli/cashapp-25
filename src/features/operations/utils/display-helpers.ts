
import { Operation } from "@/features/operations/types";

// Format transaction ID to 6 digits
export const formatOperationId = (id: string) => {
  // If the ID is numeric or can be converted to a number
  if (!isNaN(Number(id))) {
    // Pad with leading zeros to get 6 digits
    return id.padStart(6, '0');
  }
  
  // For UUID format, take first 6 characters
  return id.slice(0, 6);
};

export const getAmountColor = (type: Operation["type"]) => {
  switch (type) {
    case "deposit":
      return "text-green-600 dark:text-green-400";
    case "withdrawal":
      return "text-red-600 dark:text-red-400";
    case "transfer":
      return "text-purple-600 dark:text-purple-400";
  }
};
