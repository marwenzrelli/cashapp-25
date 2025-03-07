
import { Operation } from "@/features/operations/types";
import { ArrowDownCircle, ArrowUpCircle, RefreshCw } from "lucide-react";
import React from "react";

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

// Return the appropriate icon component based on operation type
export const getOperationTypeIcon = (type: Operation["type"]) => {
  switch (type) {
    case "deposit":
      return React.createElement(ArrowUpCircle, { className: "h-4 w-4" });
    case "withdrawal":
      return React.createElement(ArrowDownCircle, { className: "h-4 w-4" });
    case "transfer":
      return React.createElement(RefreshCw, { className: "h-4 w-4" });
    default:
      return null;
  }
};

export const formatOperationAmount = (operation: Operation, currency: string) => {
  const amountClass = 
    operation.type === "deposit" ? "text-success" : 
    operation.type === "withdrawal" ? "text-destructive" : 
    "text-primary";
  
  // Create a formatted amount with the correct icon
  // We're returning a React element structure, not JSX directly
  return React.createElement(
    "div", 
    { className: `flex items-center justify-end gap-2 ${amountClass}` },
    getOperationTypeIcon(operation.type),
    React.createElement(
      "span", 
      { className: "font-medium" },
      `${operation.type === "withdrawal" ? "-" : "+"}${Math.abs(operation.amount).toLocaleString()} ${currency}`
    )
  );
};
