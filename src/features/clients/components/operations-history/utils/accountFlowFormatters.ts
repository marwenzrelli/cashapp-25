
import { format, parseISO } from "date-fns";

export const formatDateTime = (dateString: string) => {
  try {
    return format(parseISO(dateString), "dd/MM/yyyy HH:mm");
  } catch (e) {
    return "Date invalide";
  }
};

export const formatAmount = (amount: number): string => {
  return new Intl.NumberFormat('fr-TN', {
    style: 'currency',
    currency: 'TND',
    minimumFractionDigits: 3,
    maximumFractionDigits: 3
  }).format(amount);
};

export const getAmountClass = (type: string, clientFullName: string, operation: any) => {
  if (type === "deposit") return "text-green-600";
  if (type === "withdrawal") return "text-red-600";
  if (type === "transfer") {
    if (operation.toClient === clientFullName) return "text-green-600";
    if (operation.fromClient === clientFullName) return "text-red-600";
  }
  if (type === "direct_transfer") {
    if (operation.toClient === clientFullName) return "text-green-600";
    if (operation.fromClient === clientFullName) return "text-red-600";
  }
  return "text-blue-600";
};

export const getAmountPrefix = (type: string, clientFullName: string, operation: any) => {
  if (type === "withdrawal") return "- ";
  if (type === "transfer" && operation.fromClient === clientFullName) return "- ";
  if (type === "direct_transfer" && operation.fromClient === clientFullName) return "- ";
  return "+ ";
};

export const getBalanceClass = (balance: number) => {
  return balance >= 0 
    ? "text-green-600 dark:text-green-400" 
    : "text-red-600 dark:text-red-400";
};
