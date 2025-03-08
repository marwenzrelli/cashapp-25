
import { type Deposit, type EditFormData } from "@/components/deposits/types";

export type { Deposit } from "@/components/deposits/types";
export type { EditFormData } from "@/components/deposits/types";

export interface DepositDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (deposit: Deposit) => Promise<boolean>;
}

export interface DeleteDepositDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDeposit: Deposit | null;
  onConfirm: () => Promise<boolean | void>;
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

// This interface is now redundant as EditFormData already includes all these fields
export interface ExtendedEditFormData extends EditFormData {
  id?: number;
}
