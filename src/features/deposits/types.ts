
import { type Deposit } from "@/components/deposits/types";

export type { Deposit };

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
