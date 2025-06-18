import { Operation } from "@/features/operations/types";
import { ArrowUpRight, ArrowDownRight, ArrowLeftRight } from "lucide-react";
import React from "react";

// Determine color based on operation type
export const getOperationTypeColor = (type: string): string => {
  switch (type) {
    case "deposit":
      return "text-green-600 dark:text-green-400";
    case "withdrawal":
      return "text-red-600 dark:text-red-400";
    case "transfer":
      return "text-blue-600 dark:text-blue-400";
    case "direct_transfer":
      return "text-purple-600 dark:text-purple-400";
    default:
      return "";
  }
};

// Get type-specific display text
export const getOperationTypeDisplay = (type: string): string => {
  switch (type) {
    case "deposit":
      return "Dépôt";
    case "withdrawal":
      return "Retrait";
    case "transfer":
      return "Transfert";
    case "direct_transfer":
      return "Opération Directe";
    default:
      return "Inconnu";
  }
};

// Get icon based on operation type
export const getOperationTypeIcon = (type: string) => {
  switch (type) {
    case "deposit":
      return ArrowUpRight;
    case "withdrawal":
      return ArrowDownRight;
    case "transfer":
      return ArrowLeftRight;
    default:
      return ArrowUpRight;
  }
};

// Format number with 2 decimal places and comma separator
export const formatNumber = (num: number): string => {
  return num.toLocaleString('fr-FR', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  });
};
