
export interface Deposit {
  id: string;
  client: string;
  amount: number;
  date: string;
  description: string;
  client_name: string;
}

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
  onNewDeposit: () => void;
  totalDeposits: number;
}
