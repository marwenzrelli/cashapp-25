
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

// Add the missing exported functions
export const getOperationTypeIcon = (type: Operation["type"]) => {
  switch (type) {
    case "deposit":
      return <ArrowUpCircle className="h-4 w-4" />;
    case "withdrawal":
      return <ArrowDownCircle className="h-4 w-4" />;
    case "transfer":
      return <RefreshCw className="h-4 w-4" />;
  }
};

export const formatOperationAmount = (operation: Operation, currency: string) => {
  const amountClass = 
    operation.type === "deposit" ? "text-success" : 
    operation.type === "withdrawal" ? "text-destructive" : 
    "text-primary";
  
  return (
    <div className={`flex items-center justify-end gap-2 ${amountClass}`}>
      {operation.type === "deposit" && <ArrowUpCircle className="h-4 w-4" />}
      {operation.type === "withdrawal" && <ArrowDownCircle className="h-4 w-4" />}
      {operation.type === "transfer" && <RefreshCw className="h-4 w-4" />}
      <span className="font-medium">
        {operation.type === "withdrawal" ? "-" : "+"}
        {Math.abs(operation.amount).toLocaleString()} {currency}
      </span>
    </div>
  );
};
