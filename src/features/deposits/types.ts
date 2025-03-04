
import { type Deposit } from "@/components/deposits/types";

export type { Deposit } from "@/components/deposits/types";
export type { EditFormData } from "@/components/deposits/types";

export interface DepositDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (deposit: Deposit) => Promise<void>;
}

export interface DeleteDepositDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDeposit: Deposit | null;
  onConfirm: () => void;
}

export interface StatsCardProps {
  deposits: Deposit[];
}

export interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  itemsPerPage: string;
  onItemsPerPageChange: (value: string) => void;
  totalDeposits: number;
}

// Extend EditFormData to include additional fields needed for the enhanced dialog
export interface ExtendedEditFormData {
  id?: number;
  clientName: string;
  amount: string;
  notes: string;
  date?: string;
  time?: string;
  clientBalance?: string;
}
