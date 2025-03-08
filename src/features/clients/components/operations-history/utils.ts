
import { Operation } from "@/features/operations/types";

export const getAmountColor = (type: Operation["type"]) => {
  switch (type) {
    case "deposit":
      return "text-green-600 dark:text-green-400";
    case "withdrawal":
      return "text-red-600 dark:text-red-400";
    case "transfer":
      return "text-green-600 dark:text-green-400";
    default:
      return "";
  }
};
